import { useState } from "react";
import { motion } from "framer-motion";
import { instructorCourses } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, ChevronDown, ChevronRight, Users, Send, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
    id: string;
    name: string;
    email: string;
    progress: number;
    grade: number;
    status: "active" | "inactive";
    courseName: string;
    courseId: string;
}

const InstructorStudents = () => {
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [messageId, setMessageId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState("");

    // Flatten all students from all courses, aggregating per student
    const studentMap = new Map<string, { name: string; email: string; courses: { courseId: string; courseName: string; progress: number; grade: number; status: string }[] }>();

    instructorCourses.forEach(course => {
        course.students.forEach(s => {
            if (!studentMap.has(s.email)) {
                studentMap.set(s.email, { name: s.name, email: s.email, courses: [] });
            }
            studentMap.get(s.email)!.courses.push({
                courseId: course.id,
                courseName: course.title,
                progress: s.progress,
                grade: s.grade,
                status: s.status,
            });
        });
    });

    const allStudents = Array.from(studentMap.values());
    const filtered = allStudents.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSendMessage = (studentName: string) => {
        if (!messageText.trim()) return;
        toast({ title: "Message sent", description: `Your message to ${studentName} has been sent.` });
        setMessageText("");
        setMessageId(null);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold text-foreground">My Students</h1>
                <p className="text-muted-foreground mt-1">View and manage students across all your courses</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                        <p className="text-lg font-bold text-foreground">{allStudents.length}</p>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-success" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Active</p>
                        <p className="text-lg font-bold text-foreground">{allStudents.filter(s => s.courses.some(c => c.status === "active")).length}</p>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Avg. Grade</p>
                        <p className="text-lg font-bold text-foreground">
                            {Math.round(allStudents.flatMap(s => s.courses.map(c => c.grade)).reduce((a, b) => a + b, 0) / Math.max(allStudents.flatMap(s => s.courses).length, 1))}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Student List */}
            {filtered.length === 0 ? (
                <div className="bg-card rounded-xl p-12 border border-border shadow-card text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No students found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(student => {
                        const avgGrade = Math.round(student.courses.reduce((a, c) => a + c.grade, 0) / student.courses.length);
                        const avgProgress = Math.round(student.courses.reduce((a, c) => a + c.progress, 0) / student.courses.length);
                        const isExpanded = expandedId === student.email;
                        const isMessaging = messageId === student.email;

                        return (
                            <div key={student.email} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                                {/* Main Row */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : student.email)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-foreground">{student.name}</p>
                                            <p className="text-xs text-muted-foreground">{student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:block text-right">
                                            <p className="text-xs text-muted-foreground">Courses</p>
                                            <p className="text-sm font-medium text-foreground">{student.courses.length}</p>
                                        </div>
                                        <div className="hidden sm:block text-right">
                                            <p className="text-xs text-muted-foreground">Avg. Grade</p>
                                            <p className={`text-sm font-semibold ${avgGrade >= 80 ? "text-success" : avgGrade >= 60 ? "text-warning" : "text-destructive"}`}>{avgGrade}%</p>
                                        </div>
                                        <div className="hidden md:flex items-center gap-2 w-32">
                                            <Progress value={avgProgress} className="h-2" />
                                            <span className="text-xs text-foreground font-medium">{avgProgress}%</span>
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                </button>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-border">
                                        <div className="p-4 space-y-3">
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enrolled Courses</h4>
                                            {student.courses.map(c => (
                                                <div key={c.courseId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{c.courseName}</p>
                                                        <span className={`text-xs capitalize ${c.status === "active" ? "text-success" : "text-muted-foreground"}`}>{c.status}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={c.progress} className="h-2 w-20" />
                                                            <span className="text-xs text-foreground font-medium">{c.progress}%</span>
                                                        </div>
                                                        <span className={`text-sm font-semibold ${c.grade >= 80 ? "text-success" : c.grade >= 60 ? "text-warning" : "text-destructive"}`}>
                                                            {c.grade}/100
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Message Section */}
                                            <div className="pt-2">
                                                {isMessaging ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            placeholder={`Write a message to ${student.name}...`}
                                                            value={messageText}
                                                            onChange={(e) => setMessageText(e.target.value)}
                                                            rows={3}
                                                            className="bg-muted/50"
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <Button variant="outline" size="sm" onClick={() => { setMessageId(null); setMessageText(""); }}>Cancel</Button>
                                                            <Button size="sm" onClick={() => handleSendMessage(student.name)} disabled={!messageText.trim()} className="gap-1.5">
                                                                <Send className="w-4 h-4" /> Send
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button variant="outline" size="sm" onClick={() => setMessageId(student.email)} className="gap-1.5">
                                                        <Mail className="w-4 h-4" /> Message Student
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default InstructorStudents;
