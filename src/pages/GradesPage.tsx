import { motion } from "framer-motion";
import { courses } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, TrendingUp, Award, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const mockGrades = [
    {
        courseId: "1", course: "Advanced React Patterns", assignments: [
            { name: "Custom Hooks Project", score: 92, total: 100, date: "2026-02-10" },
            { name: "Context API Workshop", score: 85, total: 100, date: "2026-02-05" },
            { name: "Module 1 Quiz", score: 18, total: 20, date: "2026-01-28" },
        ]
    },
    {
        courseId: "2", course: "Data Science Fundamentals", assignments: [
            { name: "Python Data Analysis", score: 88, total: 100, date: "2026-02-12" },
            { name: "Statistics Exercise", score: 76, total: 100, date: "2026-02-01" },
        ]
    },
    {
        courseId: "3", course: "UX Design Masterclass", assignments: [
            { name: "Wireframe Project", score: 95, total: 100, date: "2026-02-15" },
            { name: "User Research Report", score: 90, total: 100, date: "2026-02-08" },
            { name: "Usability Testing", score: 88, total: 100, date: "2026-01-25" },
        ]
    },
];

const GradesPage = () => {
    const { user } = useAuth();
    const overallGrades = mockGrades.map(c => {
        const avg = Math.round(c.assignments.reduce((s, a) => s + (a.score / a.total) * 100, 0) / c.assignments.length);
        return { ...c, average: avg };
    });
    const gpa = Math.round(overallGrades.reduce((s, c) => s + c.average, 0) / overallGrades.length);

    const getGradeColor = (pct: number) => pct >= 90 ? "text-success" : pct >= 75 ? "text-accent" : pct >= 60 ? "text-warning" : "text-destructive";
    const getGradeLetter = (pct: number) => pct >= 93 ? "A" : pct >= 90 ? "A-" : pct >= 87 ? "B+" : pct >= 83 ? "B" : pct >= 80 ? "B-" : pct >= 77 ? "C+" : pct >= 73 ? "C" : "D";

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">My Grades</h1>
                <p className="text-muted-foreground mt-1">Track your academic performance across all courses</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Overall Average</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{gpa}%</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">GPA Letter</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{getGradeLetter(gpa)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Award className="w-5 h-5 text-accent" />
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Assignments Graded</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{mockGrades.reduce((s, c) => s + c.assignments.length, 0)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-success" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Per-course grades */}
            <div className="space-y-4">
                {overallGrades.map(cg => (
                    <div key={cg.courseId} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-sm">{cg.course}</h3>
                                    <p className="text-xs text-muted-foreground">{cg.assignments.length} graded assignments</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl font-bold ${getGradeColor(cg.average)}`}>{cg.average}%</span>
                                <p className="text-xs text-muted-foreground">{getGradeLetter(cg.average)}</p>
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {cg.assignments.map((a, i) => {
                                const pct = Math.round((a.score / a.total) * 100);
                                return (
                                    <div key={i} className="px-5 py-3 flex items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{a.name}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="w-32">
                                            <Progress value={pct} className="h-1.5" />
                                        </div>
                                        <span className={`text-sm font-semibold min-w-[60px] text-right ${getGradeColor(pct)}`}>{a.score}/{a.total}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default GradesPage;
