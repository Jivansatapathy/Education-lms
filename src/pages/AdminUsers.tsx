import { useState } from "react";
import { motion } from "framer-motion";
import { users as mockUsers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, UserCheck, UserX, Search, Shield, GraduationCap, BookOpen } from "lucide-react";

const roleIcons: Record<string, typeof Shield> = { admin: Shield, instructor: GraduationCap, student: BookOpen };

const AdminUsersPage = () => {
    const [usersData, setUsersData] = useState(mockUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const filtered = usersData.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const toggleStatus = (id: string) => {
        setUsersData(usersData.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" as const : "active" as const } : u));
    };

    const changeRole = (id: string, role: "student" | "instructor" | "admin") => {
        setUsersData(usersData.map(u => u.id === id ? { ...u, role } : u));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
                <p className="text-muted-foreground mt-1">{usersData.length} registered users</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: usersData.length, icon: Users, color: "text-primary bg-primary/10" },
                    { label: "Students", value: usersData.filter(u => u.role === "student").length, icon: BookOpen, color: "text-accent bg-accent/10" },
                    { label: "Instructors", value: usersData.filter(u => u.role === "instructor").length, icon: GraduationCap, color: "text-warning bg-warning/10" },
                    { label: "Active", value: usersData.filter(u => u.status === "active").length, icon: UserCheck, color: "text-success bg-success/10" },
                ].map(s => (
                    <div key={s.label} className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-5 h-5" /></div>
                        <div>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-xl font-bold text-foreground">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="instructor">Instructors</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Enrolled</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map(u => {
                                const RIcon = roleIcons[u.role] || BookOpen;
                                return (
                                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">{u.name.charAt(0)}</div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                                                    <p className="text-xs text-muted-foreground">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Select value={u.role} onValueChange={(v) => changeRole(u.id, v as "student" | "instructor" | "admin")}>
                                                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="student">Student</SelectItem>
                                                    <SelectItem value="instructor">Instructor</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-foreground">{u.enrolled} courses</td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{u.status}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Switch checked={u.status === "active"} onCheckedChange={() => toggleStatus(u.id)} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminUsersPage;
