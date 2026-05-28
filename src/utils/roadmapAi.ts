import { courses as mockCourses } from "@/data/mockData";

export type RoadmapCourse = (typeof mockCourses)[number];

export const DEFAULT_COURSE_THUMBNAIL =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop";

export const mapApiToCourse = (c: Record<string, unknown>): RoadmapCourse =>
    ({
        id: String(c.id),
        title: (c.title as string) || "Untitled",
        description: (c.description as string) || "",
        duration: (c.duration as string) || "12 weeks",
        category: (c.category as string) || "General",
        instructor: (c.instructor_name as string) || (c.instructor as string) || "—",
        thumbnail: (c.thumbnail as string) || DEFAULT_COURSE_THUMBNAIL,
        progress: Number(c.progress_percentage ?? c.progress ?? 0),
        students: Number(c.students ?? c.enrolledCount ?? 0),
        modules: [],
    }) as RoadmapCourse;

const STOPWORDS = new Set([
    "the", "and", "for", "with", "to", "of", "in", "on", "at", "by", "an", "or",
    "is", "are", "your", "you", "will", "from", "into", "that", "this", "as", "be", "it", "master", "learn",
]);

const normalizeForKeywords = (text: string): string =>
    text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const extractKeywords = (text: string): string[] => {
    const normalized = normalizeForKeywords(text);
    if (!normalized) return [];
    return normalized.split(" ").map((t) => t.trim()).filter((t) => t.length >= 3 && !STOPWORDS.has(t));
};

export interface RankedCourse {
    course: RoadmapCourse;
    score: number;
    reason: string;
}

/** Rank selected courses by how related they are to each other (shared topics). */
export function rankSelectedCourses(courses: RoadmapCourse[]): RankedCourse[] {
    if (courses.length === 0) return [];

    const poolKeywords = extractKeywords(
        courses.map((c) => `${c.title} ${c.description} ${c.category}`).join(" ")
    );
    const poolSet = new Set(poolKeywords);

    const scored = courses.map((course) => {
        const courseKeywords = extractKeywords(
            [course.title, course.description, course.category, course.instructor].join(" ")
        );
        let overlap = 0;
        for (const kw of courseKeywords) {
            if (poolSet.has(kw)) overlap += 1;
        }
        const categoryBoost = courses.filter((c) => c.category === course.category && c.id !== course.id).length;
        const score = overlap + categoryBoost * 1.5;

        const sharedCategory = categoryBoost > 0 ? ` Fits well with other ${course.category} courses you picked.` : "";
        const reason =
            score > 2
                ? `Strong topical overlap with your selection.${sharedCategory}`
                : score > 0
                  ? `Related themes in your selected set.${sharedCategory}`
                  : "Distinct focus — good for broadening your skill set.";

        return { course, score, reason };
    });

    return scored.sort((a, b) => b.score - a.score);
}

export function buildStudyPlanSummary(ranked: RankedCourse[]): string {
    if (ranked.length === 0) return "No courses selected.";
    const order = ranked.map((r, i) => `${i + 1}. ${r.course.title}`).join("\n");
    return `Suggested study order based on how your picks connect:\n\n${order}`;
}

/** Same approval filter as the /courses page. */
export function filterApprovedCatalog(raw: unknown[]): Record<string, unknown>[] {
    return raw.filter(
        (c): c is Record<string, unknown> =>
            typeof c === "object" &&
            c !== null &&
            ((c as Record<string, unknown>).approval_status === "approved" ||
                !(c as Record<string, unknown>).approval_status)
    );
}

/** Published + active only — must match POST /ai/roadmap/recommend validation. */
export function filterRecommendableCatalog(raw: unknown[]): Record<string, unknown>[] {
    return filterApprovedCatalog(raw).filter(
        (c) => c.is_active !== false && c.is_active !== 0
    );
}

export function buildStudyOrderFromIds(studyOrder: number[], courses: RoadmapCourse[]): string {
    if (!studyOrder.length) return "";
    const byId = new Map(courses.map((c) => [String(c.id), c]));
    const lines = studyOrder
        .map((id, i) => {
            const course = byId.get(String(id));
            return course ? `${i + 1}. ${course.title}` : null;
        })
        .filter((line): line is string => Boolean(line));
    if (!lines.length) return "";
    return `Suggested study order:\n\n${lines.join("\n")}`;
}
