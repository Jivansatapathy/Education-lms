import { motion } from "framer-motion";
import { adminStats } from "@/data/mockData";
import { BarChart3, Users, BookOpen, DollarSign, TrendingUp, Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const topCourses = [
    { name: "Advanced React Patterns", students: 1284, revenue: 18200, completion: 72 },
    { name: "Data Science Fundamentals", students: 2341, revenue: 24500, completion: 45 },
    { name: "UX Design Masterclass", students: 987, revenue: 12800, completion: 90 },
    { name: "Cloud Architecture", students: 1567, revenue: 19400, completion: 38 },
    { name: "Project Management Professional", students: 3201, revenue: 32100, completion: 60 },
];

const monthlyMetrics = [
    { month: "Sep", students: 8200, revenue: 38000, courses: 140 },
    { month: "Oct", students: 9100, revenue: 42000, courses: 144 },
    { month: "Nov", students: 9800, revenue: 45000, courses: 148 },
    { month: "Dec", students: 10400, revenue: 48000, courses: 150 },
    { month: "Jan", students: 11500, revenue: 52000, courses: 153 },
    { month: "Feb", students: 12847, revenue: 59650, courses: 156 },
];

const AdminReportsPage = () => {
    const [period, setPeriod] = useState("6months");
    const maxRevenue = Math.max(...monthlyMetrics.map(m => m.revenue));

    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">Platform performance overview</p>
                </div>
                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="6months">Last 6 Months</SelectItem>
                            <SelectItem value="1year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="gap-1.5"><Download className="w-4 h-4" /> Export</Button>
                </div>
            </motion.div>

            {/* KPIs */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: adminStats.totalUsers.toLocaleString(), change: "+12%", icon: Users, color: "text-primary bg-primary/10" },
                    { label: "Active Courses", value: adminStats.activeCourses, change: "+8", icon: BookOpen, color: "text-accent bg-accent/10" },
                    { label: "Revenue", value: `$${adminStats.revenue.toLocaleString()}`, change: "+18%", icon: DollarSign, color: "text-success bg-success/10" },
                    { label: "Completion Rate", value: `${adminStats.completionRate}%`, change: "+3%", icon: Award, color: "text-warning bg-warning/10" },
                ].map(s => (
                    <div key={s.label} className="bg-card rounded-xl p-5 border border-border shadow-card">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5" /></div>
                            <span className="text-xs font-medium text-success flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{s.change}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Revenue Chart (bar) */}
            <motion.div variants={fadeUp} className="bg-card rounded-xl border border-border shadow-card p-6">
                <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" /> Monthly Revenue
                </h2>
                <div className="flex items-end gap-3 h-48">
                    {monthlyMetrics.map(m => (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground font-medium">${(m.revenue / 1000).toFixed(0)}K</span>
                            <div className="w-full rounded-t-lg bg-primary/80 transition-all duration-500" style={{ height: `${(m.revenue / maxRevenue) * 100}%` }} />
                            <span className="text-xs text-muted-foreground">{m.month}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <motion.div variants={fadeUp} className="bg-card rounded-xl border border-border shadow-card p-6">
                    <h2 className="font-semibold text-foreground mb-4">User Growth</h2>
                    <div className="space-y-3">
                        {monthlyMetrics.map(m => (
                            <div key={m.month} className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-8">{m.month}</span>
                                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(m.students / 15000) * 100}%` }} />
                                </div>
                                <span className="text-xs font-medium text-foreground w-12 text-right">{(m.students / 1000).toFixed(1)}K</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Courses */}
                <motion.div variants={fadeUp} className="bg-card rounded-xl border border-border shadow-card p-6">
                    <h2 className="font-semibold text-foreground mb-4">Top Courses by Revenue</h2>
                    <div className="space-y-3">
                        {topCourses.sort((a, b) => b.revenue - a.revenue).map((c, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">{c.students.toLocaleString()} students · {c.completion}% completion</p>
                                </div>
                                <span className="text-sm font-semibold text-success">${c.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminReportsPage;
