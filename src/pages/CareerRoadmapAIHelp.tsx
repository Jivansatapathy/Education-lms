import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Bot,
    BrainCircuit,
    ChevronRight,
    Clock,
    Loader2,
    Sparkles,
    Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseAPI, aiAPI } from "@/services/api";
import {
    DEFAULT_COURSE_THUMBNAIL,
    buildStudyOrderFromIds,
    buildStudyPlanSummary,
    filterRecommendableCatalog,
    mapApiToCourse,
    rankSelectedCourses,
    type RoadmapCourse,
    type RankedCourse,
} from "@/utils/roadmapAi";

type ApiRankedItem = {
    courseId: number;
    title?: string;
    category?: string;
    score?: number;
    reason?: string;
};

type ApiRelatedItem = ApiRankedItem & {
    thumbnail?: string | null;
    duration?: string | null;
};

const CareerRoadmapAIHelp = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseIds = useMemo(
        () =>
            (searchParams.get("courses") || "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean),
        [searchParams]
    );

    const [allCourses, setAllCourses] = useState<RoadmapCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [apiRanked, setApiRanked] = useState<RankedCourse[] | null>(null);
    const [topPickCourse, setTopPickCourse] = useState<RoadmapCourse | null>(null);
    const [topPickReason, setTopPickReason] = useState<string>("");
    const [studyPlan, setStudyPlan] = useState<string>("");
    const [relatedCourses, setRelatedCourses] = useState<ApiRelatedItem[]>([]);

    const selectedCourses = useMemo(
        () => courseIds.map((id) => allCourses.find((c) => c.id === id)).filter((c): c is RoadmapCourse => Boolean(c)),
        [courseIds, allCourses]
    );

    const localRanked = useMemo(() => rankSelectedCourses(selectedCourses), [selectedCourses]);
    const ranked = apiRanked ?? localRanked;
    const topPick = topPickCourse ?? ranked[0]?.course ?? null;

    useEffect(() => {
        const load = async () => {
            try {
                const res = await courseAPI.getAllCourses({ limit: 100 });
                const raw = Array.isArray(res?.data) ? res.data : [];
                const list = filterRecommendableCatalog(raw);
                setAllCourses(list.map((c) => mapApiToCourse(c)));
            } catch {
                setAllCourses([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!loading && courseIds.length === 0) {
            navigate("/roadmap", { replace: true });
        }
    }, [loading, courseIds.length, navigate]);

    useEffect(() => {
        if (loading || selectedCourses.length === 0) return;

        const runAI = async () => {
            setAiLoading(true);
            setAiError(null);
            setApiRanked(null);
            setTopPickCourse(null);
            setTopPickReason("");
            setStudyPlan("");
            setRelatedCourses([]);

            const rankedLocal = rankSelectedCourses(selectedCourses);
            const best = rankedLocal[0];
            const plan = buildStudyPlanSummary(rankedLocal);
            const catalogIdSet = new Set(allCourses.map((c) => String(c.id)));
            const numericIds = selectedCourses
                .map((c) => parseInt(String(c.id), 10))
                .filter((n) => Number.isFinite(n) && n > 0 && catalogIdSet.has(String(n)));

            if (numericIds.length === 0) {
                throw new Error(
                    "Selected courses are not available for AI recommendations. Pick active, approved courses from the catalog."
                );
            }

            try {
                const data = await aiAPI.recommendRoadmap(numericIds);

                const recommendedId =
                    data?.recommendedCourseId ?? data?.topPick?.courseId ?? rankedLocal[0]?.course.id;
                const recommended = selectedCourses.find((c) => String(c.id) === String(recommendedId));

                if (data?.answer) {
                    setAiAnswer(data.answer);
                } else if (recommended) {
                    setAiAnswer(`Start with "${recommended.title}" to build the strongest foundation for your selected path.`);
                } else {
                    throw new Error("Invalid recommend response");
                }

                const rankedItems = Array.isArray(data?.ranked) ? (data.ranked as ApiRankedItem[]) : [];
                const byId = new Map(selectedCourses.map((c) => [String(c.id), c]));
                let mapped: RankedCourse[] = [];

                if (rankedItems.length > 0) {
                    mapped = rankedItems
                        .map((item) => {
                            const course = byId.get(String(item.courseId));
                            if (!course) return null;
                            return {
                                course,
                                score: Number(item.score ?? 0),
                                reason: item.reason || "Recommended for your roadmap.",
                            };
                        })
                        .filter((item): item is RankedCourse => Boolean(item));
                    if (mapped.length > 0) {
                        setApiRanked(mapped);
                    }
                }

                const pick =
                    recommended ??
                    mapped[0]?.course ??
                    rankedLocal[0]?.course ??
                    selectedCourses[0];
                const pickReason =
                    mapped.find((r) => String(r.course.id) === String(pick?.id))?.reason ??
                    data?.topPick?.reason ??
                    rankedLocal.find((r) => String(r.course.id) === String(pick?.id))?.reason ??
                    "Best starting point among your selected courses.";

                setTopPickCourse(pick ?? null);
                setTopPickReason(pickReason);

                const studyOrderIds = Array.isArray(data?.studyOrder)
                    ? (data.studyOrder as number[]).filter((id) => Number.isFinite(id))
                    : [];
                const orderText =
                    buildStudyOrderFromIds(studyOrderIds, selectedCourses) ||
                    (mapped.length > 0 ? buildStudyPlanSummary(mapped) : plan);
                setStudyPlan(orderText);

                const related = Array.isArray(data?.relatedCourses)
                    ? (data.relatedCourses as ApiRelatedItem[])
                    : [];
                setRelatedCourses(related);

                if (data?.source === "offline") {
                    setAiError(
                        related.length > 0
                            ? "Using offline ranking for order; related catalog picks use keyword matching."
                            : "Using offline ranking — OpenAI unavailable; showing study order from your selected courses."
                    );
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Request failed";
                setTopPickCourse(best?.course ?? selectedCourses[0] ?? null);
                setTopPickReason(best?.reason ?? "");
                setStudyPlan(plan);
                setAiAnswer(
                    best
                        ? `Based on your selection, begin with "${best.course.title}". ${best.reason}\n\n${plan}`
                        : plan
                );
                setAiError(
                    `Using offline ranking — POST /ai/roadmap/recommend failed (${msg}). Showing a local study order from your selected courses.`
                );
            } finally {
                setAiLoading(false);
            }
        };

        runAI();
    }, [loading, courseIds.join(","), allCourses.length, selectedCourses.length]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (courseIds.length > 0 && selectedCourses.length === 0) {
        return (
            <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-4">
                <p className="text-muted-foreground">Selected courses not found.</p>
                <p className="text-sm text-muted-foreground">
                    Those courses may have been removed or are not in your catalog. Go back and pick courses from the
                    list.
                </p>
                <Button asChild>
                    <Link to="/roadmap">Back to Career Roadmap</Link>
                </Button>
            </div>
        );
    }

    if (selectedCourses.length === 0) {
        return (
            <div className="max-w-lg mx-auto text-center py-16 px-4">
                <p className="text-muted-foreground mb-4">No courses selected.</p>
                <Button asChild>
                    <Link to="/roadmap">Back to Career Roadmap</Link>
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8 pb-12 px-4 sm:px-6"
        >
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="gap-2">
                    <Link to="/roadmap">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Learning Guide</h1>
                        <p className="text-sm text-muted-foreground">{selectedCourses.length} courses selected</p>
                    </div>
                </div>
            </div>

            <section className="rounded-2xl bg-[#121214] border border-white/10 p-6 text-white">
                <div className="flex items-center gap-2 text-primary mb-4">
                    <Bot className="w-5 h-5" />
                    <h2 className="font-semibold">AI recommendation</h2>
                </div>
                {aiLoading ? (
                    <div className="flex items-center gap-3 py-8 justify-center text-white/60">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-sm">Analyzing your course selection…</span>
                    </div>
                ) : (
                    <p className="text-white/85 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                )}
                {aiError && <p className="text-xs text-amber-400/90 mt-3">{aiError}</p>}
            </section>

            {topPick && (
                <section className="rounded-2xl border-2 border-primary bg-primary/5 p-6">
                    <div className="flex items-center gap-2 text-primary mb-3">
                        <Star className="w-5 h-5 fill-primary" />
                        <h2 className="font-bold text-lg">Best course to start</h2>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{topPick.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {topPick.category} · {topPick.instructor}
                    </p>
                    <p className="text-muted-foreground mt-3">{topPickReason || ranked[0]?.reason}</p>
                    <Button asChild className="mt-4 gap-2">
                        <Link to={`/course/${topPick.id}`}>
                            Start this course
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </section>
            )}

            {!aiLoading && studyPlan && (
                <section className="rounded-xl border border-border bg-muted/30 p-4">
                    <h2 className="text-sm font-semibold text-foreground mb-2">Suggested study order</h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{studyPlan}</p>
                </section>
            )}

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    All selected courses (ranked by relevance)
                </h2>
                {ranked.map((item: RankedCourse, index) => (
                    <div
                        key={item.course.id}
                        className="flex flex-col sm:flex-row gap-4 rounded-xl border border-border bg-card p-4"
                    >
                        <img
                            src={item.course.thumbnail || DEFAULT_COURSE_THUMBNAIL}
                            alt={item.course.title}
                            className="w-full sm:w-32 h-24 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-primary">#{index + 1}</span>
                                {topPick && String(item.course.id) === String(topPick.id) && (
                                    <span className="text-[10px] font-bold uppercase bg-accent/10 text-accent px-2 py-0.5 rounded">
                                        Best to start
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-foreground mt-1">{item.course.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.reason}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.course.duration}
                                </span>
                                <Link
                                    to={`/course/${item.course.id}`}
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    Open course →
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {!aiLoading && relatedCourses.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        More courses you may like
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Based on your selection, these courses from your catalog are a strong next step.
                    </p>
                    {relatedCourses.map((item, index) => {
                        const fromCatalog = allCourses.find((c) => String(c.id) === String(item.courseId));
                        const title = item.title || fromCatalog?.title || "Course";
                        const category = item.category || fromCatalog?.category || "General";
                        const thumbnail =
                            item.thumbnail || fromCatalog?.thumbnail || DEFAULT_COURSE_THUMBNAIL;
                        const duration = item.duration || fromCatalog?.duration || "—";
                        return (
                            <div
                                key={`related-${item.courseId}`}
                                className="flex flex-col sm:flex-row gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4"
                            >
                                <img
                                    src={thumbnail}
                                    alt={title}
                                    className="w-full sm:w-32 h-24 object-cover rounded-lg shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold uppercase bg-primary/15 text-primary px-2 py-0.5 rounded">
                                            Suggested for you
                                        </span>
                                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                    </div>
                                    <h3 className="font-semibold text-foreground mt-1">{title}</h3>
                                    <p className="text-xs text-muted-foreground">{category}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {duration}
                                        </span>
                                        <Link
                                            to={`/course/${item.courseId}`}
                                            className="text-xs font-medium text-primary hover:underline"
                                        >
                                            View course →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}

            <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                    <Link to="/roadmap">Change selection</Link>
                </Button>
                {topPick && (
                    <Button asChild>
                        <Link to={`/course/${topPick.id}`}>Begin recommended course</Link>
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default CareerRoadmapAIHelp;
