import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Clock, Loader2, Search, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { courseAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    DEFAULT_COURSE_THUMBNAIL,
    mapApiToCourse,
    filterRecommendableCatalog,
    type RoadmapCourse,
} from "@/utils/roadmapAi";

const CareerRoadmap = () => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [courseSearch, setCourseSearch] = useState("");
    const [allCourses, setAllCourses] = useState<RoadmapCourse[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                setCoursesLoading(true);
                const res = await courseAPI.getAllCourses({ limit: 100 });
                const raw = Array.isArray(res?.data) ? res.data : [];
                const list = filterRecommendableCatalog(raw);
                setAllCourses(list.map((c) => mapApiToCourse(c)));
            } catch {
                setAllCourses([]);
            } finally {
                setCoursesLoading(false);
            }
        };
        loadCourses();
    }, []);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            </div>
        );
    }
    if (!user) return null;

    const completedIds = user.completedCourseIds || [];

    const filteredCourses = allCourses.filter((c) => {
        const q = courseSearch.trim().toLowerCase();
        if (!q) return true;
        return (
            (c.title || "").toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q) ||
            (c.category || "").toLowerCase().includes(q) ||
            (c.instructor || "").toLowerCase().includes(q)
        );
    });

    const toggleCourse = (id: string) => {
        setSelectedCourseIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const openAIHelp = () => {
        if (selectedCourseIds.length === 0) {
            toast({
                title: "Select courses first",
                description: "Choose one or more courses, then open the AI learning guide.",
                variant: "destructive",
            });
            return;
        }
        navigate(`/roadmap/ai-help?courses=${selectedCourseIds.join(",")}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto space-y-8 pb-28 px-4 sm:px-6"
        >
            <section className="relative overflow-hidden rounded-[2rem] bg-[#0A0A0B] text-white p-8 lg:p-12 shadow-2xl border border-white/5">
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                        <Zap className="w-3 h-3" />
                        Career Roadmap
                    </span>
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                        Choose courses, get{" "}
                        <span className="text-gradient-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            AI guidance
                        </span>
                    </h1>
                    <p className="text-lg text-white/60 leading-relaxed">
                        Browse all <strong className="text-white">{allCourses.length} courses</strong>.
                        Select the ones you care about, then open the AI page for the best study order and related picks.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span className="text-sm text-white/70">{allCourses.length} courses available</span>
                    </div>
                </div>
            </section>

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <BookOpen className="w-7 h-7 text-primary" />
                            All Courses
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select multiple courses, then use AI to find the most related one and a study order.
                        </p>
                    </div>
                    {selectedCourseIds.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setSelectedCourseIds([])}
                            className="text-xs font-semibold text-muted-foreground hover:text-primary"
                        >
                            Clear selection ({selectedCourseIds.length})
                        </button>
                    )}
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="h-11 pl-10"
                    />
                </div>

                {coursesLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No courses found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCourses.map((course) => {
                            const checked = selectedCourseIds.includes(course.id);
                            const isCompleted = completedIds.includes(course.id);
                            return (
                                <div
                                    key={course.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleCourse(course.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleCourse(course.id);
                                        }
                                    }}
                                    className={[
                                        "text-left bg-card rounded-2xl border overflow-hidden transition-all cursor-pointer",
                                        checked ? "border-primary ring-2 ring-primary/25" : "border-border hover:border-primary/30",
                                    ].join(" ")}
                                >
                                    <div className="relative h-32">
                                        <img
                                            src={course.thumbnail || DEFAULT_COURSE_THUMBNAIL}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div
                                            className="absolute top-3 right-3 p-1 rounded-md bg-card/90 backdrop-blur"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() => toggleCourse(course.id)}
                                            />
                                        </div>
                                        {isCompleted && (
                                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-success text-success-foreground">
                                                Done
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <span className="text-[10px] font-semibold text-accent uppercase">
                                            {course.category}
                                        </span>
                                        <h3 className="font-bold text-foreground line-clamp-1">{course.title}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {course.duration}
                                            </span>
                                            <Link
                                                to={`/course/${course.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Open
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sticky bar: open AI help page */}
            {selectedCourseIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl">
                    <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card shadow-elevated p-3 pl-5">
                        <p className="text-sm font-medium text-foreground flex-1">
                            {selectedCourseIds.length} course{selectedCourseIds.length > 1 ? "s" : ""} selected
                        </p>
                        <Button onClick={openAIHelp} className="gap-2 shrink-0">
                            <Sparkles className="w-4 h-4" />
                            AI Learning Guide
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CareerRoadmap;
