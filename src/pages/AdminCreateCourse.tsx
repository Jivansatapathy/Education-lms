import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, CheckCircle, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminCreateCoursePage = () => {
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [instructor, setInstructor] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [modules, setModules] = useState([{ title: "", lessons: 0 }]);
    const [submitted, setSubmitted] = useState(false);

    const addModule = () => setModules([...modules, { title: "", lessons: 0 }]);
    const removeModule = (i: number) => setModules(modules.filter((_, idx) => idx !== i));
    const updateModule = (i: number, field: string, value: string | number) => {
        setModules(modules.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
    };

    const handleSubmit = () => {
        if (!title || !category || !instructor) {
            toast({ title: "Missing fields", description: "Please fill in title, category, and instructor.", variant: "destructive" });
            return;
        }
        setSubmitted(true);
        toast({ title: "Course created!", description: `"${title}" has been published.` });
        setTimeout(() => {
            setSubmitted(false);
            setTitle(""); setDescription(""); setCategory(""); setInstructor(""); setThumbnail("");
            setModules([{ title: "", lessons: 0 }]);
        }, 3000);
    };

    if (submitted) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center py-20">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Course Created!</h2>
                <p className="text-muted-foreground mt-2">"{title}" has been published and is now available for enrollment.</p>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Create New Course</h1>
                <p className="text-muted-foreground mt-1">Set up a new course for students</p>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Course Title *</Label>
                        <Input placeholder="e.g. Introduction to Machine Learning" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Development">Development</SelectItem>
                                <SelectItem value="Data Science">Data Science</SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Security">Security</SelectItem>
                                <SelectItem value="Cloud">Cloud & DevOps</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Course description..." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="bg-muted/50" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Instructor *</Label>
                        <Select value={instructor} onValueChange={setInstructor}>
                            <SelectTrigger><SelectValue placeholder="Select instructor" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Dr. Sarah Chen">Dr. Sarah Chen</SelectItem>
                                <SelectItem value="Prof. Michael Torres">Prof. Michael Torres</SelectItem>
                                <SelectItem value="Lisa Park">Lisa Park</SelectItem>
                                <SelectItem value="Maria Garcia">Maria Garcia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Thumbnail URL</Label>
                        <Input placeholder="https://..." value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Modules */}
            <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Modules</h2>
                    <Button variant="outline" size="sm" onClick={addModule} className="gap-1.5"><PlusCircle className="w-4 h-4" /> Add Module</Button>
                </div>
                <div className="space-y-3">
                    {modules.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                            <span className="text-xs font-bold text-muted-foreground w-6">{i + 1}.</span>
                            <Input placeholder="Module title" value={m.title} onChange={e => updateModule(i, "title", e.target.value)} className="flex-1" />
                            <Input type="number" placeholder="Lessons" value={m.lessons || ""} onChange={e => updateModule(i, "lessons", parseInt(e.target.value) || 0)} className="w-24" />
                            {modules.length > 1 && (
                                <button onClick={() => removeModule(i)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSubmit} className="gap-1.5 px-8"><PlusCircle className="w-4 h-4" /> Create Course</Button>
            </div>
        </motion.div>
    );
};

export default AdminCreateCoursePage;
