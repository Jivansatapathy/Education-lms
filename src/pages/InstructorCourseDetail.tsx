import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { instructorCourses } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft, Users, TrendingUp, BarChart3, PlusCircle, Trash2, Send,
    CheckCircle, AlertTriangle, ChevronDown, Video, FileText, List, Upload, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const tabs = ["Overview", "Students", "Modules", "Announcements"];

interface Module {
    id: string;
    title: string;
    description: string;
    lessons: number;
    videoFileName: string;
    pdfFileName: string;
    summaryPoints: string[];
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
}

// Convert existing mock modules to the enhanced format
const convertMockModules = (mods: { id: string; title: string; lessons: number }[]): Module[] =>
    mods.map(m => ({
        ...m,
        description: `Comprehensive coverage of ${m.title} concepts and practical exercises.`,
        videoFileName: "",
        pdfFileName: "",
        summaryPoints: [
            `Introduction to ${m.title}`,
            `Core concepts and fundamentals`,
            `Hands-on practice exercises`
        ],
    }));

const InstructorCourseDetail = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const course = instructorCourses.find(c => c.id === id) || instructorCourses[0];

    const [activeTab, setActiveTab] = useState("Overview");
    const [description, setDescription] = useState(course.description);
    const [descEditing, setDescEditing] = useState(false);
    const [students] = useState(course.students);
    const [modules, setModules] = useState<Module[]>(convertMockModules(course.modules));
    const [announcements, setAnnouncements] = useState<Announcement[]>(course.announcements);
    const [expandedModId, setExpandedModId] = useState<string | null>(null);

    // New module form state
    const [showModForm, setShowModForm] = useState(false);
    const [newModTitle, setNewModTitle] = useState("");
    const [newModDesc, setNewModDesc] = useState("");
    const [newModLessons, setNewModLessons] = useState("3");
    const [newModVideo, setNewModVideo] = useState<File | null>(null);
    const [newModPdf, setNewModPdf] = useState<File | null>(null);
    const [newModSummary, setNewModSummary] = useState<string[]>([""]);

    // New announcement form
    const [annTitle, setAnnTitle] = useState("");
    const [annContent, setAnnContent] = useState("");

    // Module handlers
    const handleAddSummaryPoint = () => {
        setNewModSummary([...newModSummary, ""]);
    };

    const handleUpdateSummaryPoint = (index: number, value: string) => {
        const updated = [...newModSummary];
        updated[index] = value;
        setNewModSummary(updated);
    };

    const handleRemoveSummaryPoint = (index: number) => {
        if (newModSummary.length <= 1) return;
        setNewModSummary(newModSummary.filter((_, i) => i !== index));
    };

    const handleAddModule = () => {
        if (!newModTitle.trim()) return;
        const nonEmptySummary = newModSummary.filter(s => s.trim());
        const newModule: Module = {
            id: `im${Date.now()}`,
            title: newModTitle,
            description: newModDesc,
            lessons: parseInt(newModLessons) || 3,
            videoFileName: newModVideo?.name || "",
            pdfFileName: newModPdf?.name || "",
            summaryPoints: nonEmptySummary.length > 0 ? nonEmptySummary : [],
        };
        setModules([...modules, newModule]);
        resetModForm();
        toast({ title: "Module added", description: `"${newModTitle}" has been added to the course.` });
    };

    const resetModForm = () => {
        setNewModTitle("");
        setNewModDesc("");
        setNewModLessons("3");
        setNewModVideo(null);
        setNewModPdf(null);
        setNewModSummary([""]);
        setShowModForm(false);
    };

    const handleDeleteModule = (modId: string) => {
        setModules(modules.filter(m => m.id !== modId));
        toast({ title: "Module removed" });
    };

    const handlePostAnnouncement = () => {
        if (!annTitle.trim() || !annContent.trim()) {
            toast({ title: "Missing fields", description: "Please fill in both title and content.", variant: "destructive" });
            return;
        }
        setAnnouncements([{ id: `a${Date.now()}`, title: annTitle, content: annContent, date: new Date().toISOString().split("T")[0] }, ...announcements]);
        setAnnTitle("");
        setAnnContent("");
        toast({ title: "Announcement posted", description: "Students will be notified." });
    };

    const handleSaveDescription = () => {
        setDescEditing(false);
        toast({ title: "Course description updated" });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
            <Link to="/instructor/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to My Courses
            </Link>

            {/* Banner */}
            <div className="relative rounded-xl overflow-hidden h-48 md:h-56">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wide">{course.category}</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${course.status === "active" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                            }`}>{course.status}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-card">{course.title}</h1>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Students", value: course.studentCount.toLocaleString(), icon: Users, color: "text-primary bg-primary/10" },
                    { label: "Avg. Progress", value: `${course.avgProgress}%`, icon: TrendingUp, color: "text-accent bg-accent/10" },
                    { label: "Avg. Grade", value: `${course.avgGrade}%`, icon: BarChart3, color: "text-success bg-success/10" },
                    { label: "Modules", value: modules.length, icon: CheckCircle, color: "text-warning bg-warning/10" },
                ].map(stat => (
                    <div key={stat.label} className="bg-card rounded-xl p-4 border border-border shadow-card">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-border pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${activeTab === tab
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === "Overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-6 border border-border shadow-card space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Course Description</h2>
                        {!descEditing ? (
                            <Button variant="outline" size="sm" onClick={() => setDescEditing(true)}>Edit</Button>
                        ) : (
                            <Button size="sm" onClick={handleSaveDescription} className="gap-1.5"><CheckCircle className="w-4 h-4" /> Save</Button>
                        )}
                    </div>
                    {descEditing ? (
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="bg-muted/50" />
                    ) : (
                        <p className="text-muted-foreground leading-relaxed">{description}</p>
                    )}
                </motion.div>
            )}

            {/* Students */}
            {activeTab === "Students" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                    {students.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No students enrolled yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade</th>
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {students.map(student => (
                                        <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{student.name}</p>
                                                        <p className="text-xs text-muted-foreground">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Progress value={student.progress} className="h-2 w-24" />
                                                    <span className="text-sm text-foreground font-medium">{student.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-sm font-semibold ${student.grade >= 80 ? "text-success" : student.grade >= 60 ? "text-warning" : "text-destructive"}`}>
                                                    {student.grade}/100
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${student.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                                                    }`}>{student.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Modules — Enhanced */}
            {activeTab === "Modules" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                    {/* Add Module Button / Form */}
                    {!showModForm ? (
                        <Button onClick={() => setShowModForm(true)} className="gap-1.5">
                            <PlusCircle className="w-4 h-4" /> Add New Module
                        </Button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-xl p-6 border border-border shadow-card space-y-5"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-foreground">Create New Module</h3>
                                <button onClick={resetModForm} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Title & Lessons Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Module Title *</Label>
                                    <Input
                                        placeholder="e.g. Introduction to State Management"
                                        value={newModTitle}
                                        onChange={(e) => setNewModTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Lessons</Label>
                                    <Input
                                        type="number" min="1"
                                        value={newModLessons}
                                        onChange={(e) => setNewModLessons(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-sm">Module Description</Label>
                                <Textarea
                                    placeholder="Describe what students will learn in this module..."
                                    value={newModDesc}
                                    onChange={(e) => setNewModDesc(e.target.value)}
                                    rows={3}
                                    className="bg-muted/50"
                                />
                            </div>

                            {/* File Uploads Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Video Upload */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm flex items-center gap-1.5">
                                        <Video className="w-4 h-4 text-primary" /> Video Lecture
                                    </Label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => setNewModVideo(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label
                                            htmlFor="video-upload"
                                            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground truncate">
                                                {newModVideo ? newModVideo.name : "Upload video file..."}
                                            </span>
                                        </label>
                                        {newModVideo && (
                                            <button
                                                onClick={() => setNewModVideo(null)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {newModVideo && (
                                        <p className="text-xs text-success flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            {(newModVideo.size / (1024 * 1024)).toFixed(1)} MB selected
                                        </p>
                                    )}
                                </div>

                                {/* PDF Upload */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm flex items-center gap-1.5">
                                        <FileText className="w-4 h-4 text-accent" /> PDF Resource
                                    </Label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setNewModPdf(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="pdf-upload"
                                        />
                                        <label
                                            htmlFor="pdf-upload"
                                            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-accent/50 hover:bg-muted/30 transition-all cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground truncate">
                                                {newModPdf ? newModPdf.name : "Upload PDF file..."}
                                            </span>
                                        </label>
                                        {newModPdf && (
                                            <button
                                                onClick={() => setNewModPdf(null)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {newModPdf && (
                                        <p className="text-xs text-success flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            {(newModPdf.size / (1024 * 1024)).toFixed(2)} MB selected
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Summary Points */}
                            <div className="space-y-2">
                                <Label className="text-sm flex items-center gap-1.5">
                                    <List className="w-4 h-4 text-warning" /> Summary Points
                                </Label>
                                <p className="text-xs text-muted-foreground">Key takeaways students should learn from this module</p>
                                <div className="space-y-2">
                                    {newModSummary.map((point, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-warning/10 text-warning text-xs flex items-center justify-center flex-shrink-0 font-bold">
                                                {idx + 1}
                                            </span>
                                            <Input
                                                placeholder={`Summary point ${idx + 1}...`}
                                                value={point}
                                                onChange={(e) => handleUpdateSummaryPoint(idx, e.target.value)}
                                                className="flex-1"
                                            />
                                            {newModSummary.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveSummaryPoint(idx)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={handleAddSummaryPoint} className="gap-1.5 mt-1">
                                    <PlusCircle className="w-3.5 h-3.5" /> Add Point
                                </Button>
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                                <Button variant="outline" onClick={resetModForm}>Cancel</Button>
                                <Button onClick={handleAddModule} disabled={!newModTitle.trim()} className="gap-1.5">
                                    <PlusCircle className="w-4 h-4" /> Create Module
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Module List — Expandable Cards */}
                    {modules.length === 0 ? (
                        <div className="bg-card rounded-xl p-12 border border-border shadow-card text-center">
                            <p className="text-muted-foreground">No modules yet. Add your first module above.</p>
                        </div>
                    ) : (
                        modules.map((mod, idx) => {
                            const isExpanded = expandedModId === mod.id;
                            return (
                                <div key={mod.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                                    {/* Module Header */}
                                    <button
                                        onClick={() => setExpandedModId(isExpanded ? null : mod.id)}
                                        className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">{mod.title}</p>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                    <span className="text-xs text-muted-foreground">{mod.lessons} lessons</span>
                                                    {mod.videoFileName && (
                                                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1">
                                                            <Video className="w-3 h-3" /> Video
                                                        </span>
                                                    )}
                                                    {mod.pdfFileName && (
                                                        <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded flex items-center gap-1">
                                                            <FileText className="w-3 h-3" /> PDF
                                                        </span>
                                                    )}
                                                    {mod.summaryPoints.length > 0 && (
                                                        <span className="text-xs bg-warning/10 text-warning px-1.5 py-0.5 rounded flex items-center gap-1">
                                                            <List className="w-3 h-3" /> {mod.summaryPoints.length} points
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </div>
                                    </button>

                                    {/* Expandable Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                                                    {/* Description */}
                                                    {mod.description && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                                                            <p className="text-sm text-foreground leading-relaxed">{mod.description}</p>
                                                        </div>
                                                    )}

                                                    {/* Attached Files */}
                                                    {(mod.videoFileName || mod.pdfFileName) && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Attached Files</h4>
                                                            <div className="flex flex-wrap gap-3">
                                                                {mod.videoFileName && (
                                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                                                                        <Video className="w-4 h-4 text-primary" />
                                                                        <div>
                                                                            <p className="text-xs font-medium text-foreground">{mod.videoFileName}</p>
                                                                            <p className="text-[10px] text-muted-foreground">Video Lecture</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {mod.pdfFileName && (
                                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/20">
                                                                        <FileText className="w-4 h-4 text-accent" />
                                                                        <div>
                                                                            <p className="text-xs font-medium text-foreground">{mod.pdfFileName}</p>
                                                                            <p className="text-[10px] text-muted-foreground">PDF Resource</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Summary Points */}
                                                    {mod.summaryPoints.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Summary Points</h4>
                                                            <div className="space-y-2 bg-muted/20 rounded-lg p-4">
                                                                {mod.summaryPoints.map((point, pi) => (
                                                                    <div key={pi} className="flex items-start gap-2.5">
                                                                        <span className="w-5 h-5 rounded-full bg-warning/10 text-warning text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                                                                            {pi + 1}
                                                                        </span>
                                                                        <p className="text-sm text-foreground leading-relaxed">{point}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Delete Module */}
                                                    <div className="flex justify-end pt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteModule(mod.id)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Remove Module
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </motion.div>
            )}

            {/* Announcements */}
            {activeTab === "Announcements" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Post Form */}
                    <div className="bg-card rounded-xl p-5 border border-border shadow-card space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Post Announcement</h3>
                        <Input
                            placeholder="Announcement title"
                            value={annTitle}
                            onChange={(e) => setAnnTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Write your announcement..."
                            value={annContent}
                            onChange={(e) => setAnnContent(e.target.value)}
                            rows={3}
                            className="bg-muted/50"
                        />
                        <div className="flex justify-end">
                            <Button onClick={handlePostAnnouncement} disabled={!annTitle.trim() || !annContent.trim()} size="sm" className="gap-1.5">
                                <Send className="w-4 h-4" /> Post
                            </Button>
                        </div>
                    </div>

                    {/* Announcement List */}
                    {announcements.length === 0 ? (
                        <div className="bg-card rounded-xl p-12 border border-border shadow-card text-center">
                            <p className="text-muted-foreground">No announcements yet.</p>
                        </div>
                    ) : (
                        announcements.map(ann => (
                            <div key={ann.id} className="bg-card rounded-xl p-5 border border-border shadow-card">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-foreground">{ann.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{ann.content}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-4">{ann.date}</span>
                                </div>
                            </div>
                        ))
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default InstructorCourseDetail;
