import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { instructorCourses } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, PlusCircle, Users, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
    active: "bg-success/10 text-success",
    draft: "bg-warning/10 text-warning",
    archived: "bg-muted text-muted-foreground",
};

type CourseStatus = "active" | "draft" | "archived";

interface NewCourse {
    title: string;
    category: string;
    description: string;
}

const InstructorCourses = () => {
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [courses, setCourses] = useState(instructorCourses);
    const [newCourse, setNewCourse] = useState<NewCourse>({ title: "", category: "Development", description: "" });

    const filtered = courses.filter(c =>
        (statusFilter === "all" || c.status === statusFilter) &&
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateCourse = (status: CourseStatus) => {
        if (!newCourse.title.trim()) {
            toast({ title: "Title required", description: "Please enter a course title.", variant: "destructive" });
            return;
        }
        const created = {
            id: `ic${Date.now()}`,
            title: newCourse.title,
            category: newCourse.category,
            description: newCourse.description,
            thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
            studentCount: 0,
            avgProgress: 0,
            avgGrade: 0,
            status,
            modules: [],
            students: [],
            announcements: [],
        };
        setCourses([created, ...courses]);
        setNewCourse({ title: "", category: "Development", description: "" });
        setShowCreateForm(false);
        toast({ title: `Course ${status === "draft" ? "saved as draft" : "published"}!`, description: `"${created.title}" has been created.` });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
                    <p className="text-muted-foreground mt-1">Manage your courses and content</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-1.5">
                    {showCreateForm ? <><X className="w-4 h-4" /> Cancel</> : <><PlusCircle className="w-4 h-4" /> Create Course</>}
                </Button>
            </div>

            {/* Create Course Form */}
            {showCreateForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card rounded-xl p-6 border border-border shadow-card space-y-4">
                    <h2 className="font-semibold text-foreground">New Course</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Course Title</Label>
                            <Input
                                placeholder="e.g. Advanced Node.js"
                                value={newCourse.title}
                                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={newCourse.category} onValueChange={(v) => setNewCourse({ ...newCourse, category: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Development">Development</SelectItem>
                                    <SelectItem value="Design">Design</SelectItem>
                                    <SelectItem value="Data Science">Data Science</SelectItem>
                                    <SelectItem value="Architecture">Architecture</SelectItem>
                                    <SelectItem value="Cloud">Cloud</SelectItem>
                                    <SelectItem value="Security">Security</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe what students will learn..."
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            rows={3}
                            className="bg-muted/50"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => handleCreateCourse("draft")} className="gap-1.5">Save as Draft</Button>
                        <Button onClick={() => handleCreateCourse("active")} className="gap-1.5">
                            <CheckCircle className="w-4 h-4" /> Publish
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "active", "draft", "archived"].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Cards */}
            {filtered.length === 0 ? (
                <div className="bg-card rounded-xl p-12 border border-border shadow-card text-center">
                    <p className="text-muted-foreground">No courses found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((course, i) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link to={`/instructor/course/${course.id}`} className="group block">
                                <div className="bg-card rounded-xl overflow-hidden border border-border shadow-card hover:shadow-elevated transition-all duration-300">
                                    <div className="h-40 overflow-hidden relative">
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${statusColors[course.status]}`}>
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <span className="text-xs font-semibold text-accent uppercase tracking-wide">{course.category}</span>
                                        <h3 className="text-base font-semibold text-foreground mt-1.5">{course.title}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{course.studentCount.toLocaleString()} students</span>
                                            <span>·</span>
                                            <span>{course.modules.length} modules</span>
                                        </div>
                                        {course.status === "active" && (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">Avg. Progress</span>
                                                    <span className="font-semibold text-foreground">{course.avgProgress}%</span>
                                                </div>
                                                <Progress value={course.avgProgress} className="h-2" />
                                            </div>
                                        )}
                                        <Button className="w-full mt-4" size="sm" variant={course.status === "draft" ? "outline" : "default"}>
                                            {course.status === "draft" ? "Edit Draft" : "Manage Course"}
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default InstructorCourses;
