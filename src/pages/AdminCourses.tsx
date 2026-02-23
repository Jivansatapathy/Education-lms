import { useState } from "react";
import { motion } from "framer-motion";
import { courses as mockCourses, instructorCourses } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Users, TrendingUp, MoreHorizontal, Eye, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const allCourses = [
    ...mockCourses.map(c => ({ ...c, status: "active" as const, revenue: Math.floor(Math.random() * 20000) + 5000 })),
    ...instructorCourses.map(c => ({ id: c.id, title: c.title, category: c.category, instructor: "Dr. Sarah Chen", students: c.studentCount, progress: c.avgProgress, status: "active" as const, revenue: Math.floor(Math.random() * 20000) + 5000, thumbnail: c.thumbnail })),
];

const AdminCoursesPage = () => {
    const [coursesData, setCoursesData] = useState(allCourses);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const filtered = coursesData.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || c.status === filter;
        return matchesSearch && matchesFilter;
    });

    const toggleCourse = (id: string) => {
        setCoursesData(coursesData.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" as const : "active" as const } : c));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Manage Courses</h1>
                    <p className="text-muted-foreground mt-1">{coursesData.length} total courses</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Active Courses", value: coursesData.filter(c => c.status === "active").length, icon: BookOpen, color: "text-primary bg-primary/10" },
                    { label: "Total Students", value: coursesData.reduce((s, c) => s + (c.students || 0), 0).toLocaleString(), icon: Users, color: "text-accent bg-accent/10" },
                    { label: "Total Revenue", value: `$${coursesData.reduce((s, c) => s + (c.revenue || 0), 0).toLocaleString()}`, icon: TrendingUp, color: "text-success bg-success/10" },
                ].map(s => (
                    <div key={s.label} className="bg-card rounded-xl p-5 border border-border shadow-card flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">{s.label}</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5" /></div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Course table */}
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Course</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Students</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={c.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="text-sm font-medium text-foreground">{c.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-muted-foreground">{c.category}</td>
                                    <td className="px-5 py-3 text-sm text-foreground">{c.students?.toLocaleString()}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button onClick={() => toggleCourse(c.id)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors" title="Toggle status">
                                            {c.status === "active" ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminCoursesPage;
