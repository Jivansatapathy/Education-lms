import { useState } from "react";
import { motion } from "framer-motion";
import { deadlines, courses } from "@/data/mockData";
import { useAssignments } from "@/contexts/AssignmentContext";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarPage = () => {
    const { assignments } = useAssignments();
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 23)); // Feb 2026
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const allEvents = [
        ...assignments.map(a => ({ date: a.dueDate, title: a.title, type: "assignment" as const, course: a.courseTitle })),
        ...deadlines.map(d => ({ date: d.due, title: d.task, type: d.type as string, course: d.course })),
    ];

    const getEventsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return allEvents.filter(e => e.date === dateStr);
    };

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = new Date();
    const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    const typeColors: Record<string, string> = {
        assignment: "bg-primary/80",
        quiz: "bg-accent/80",
        lab: "bg-warning/80",
        project: "bg-success/80",
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
                <p className="text-muted-foreground mt-1">Track your deadlines and events</p>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                {/* Month navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                    <h2 className="text-lg font-semibold text-foreground">{MONTHS[month]} {year}</h2>
                    <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-border">
                    {DAYS.map(d => (
                        <div key={d} className="text-center py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{d}</div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-muted/20" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const events = getEventsForDay(day);
                        return (
                            <div key={day} className={`min-h-[100px] border-b border-r border-border p-1.5 ${isToday(day) ? "bg-primary/5" : "hover:bg-muted/30"} transition-colors`}>
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                                    {day}
                                </span>
                                <div className="mt-1 space-y-0.5">
                                    {events.slice(0, 2).map((e, ei) => (
                                        <div key={ei} className={`text-[10px] text-white px-1.5 py-0.5 rounded truncate ${typeColors[e.type] || "bg-muted-foreground/60"}`}>
                                            {e.title}
                                        </div>
                                    ))}
                                    {events.length > 2 && (
                                        <span className="text-[10px] text-muted-foreground">+{events.length - 2} more</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming events list */}
            <div className="bg-card rounded-xl border border-border shadow-card p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Upcoming Deadlines
                </h3>
                <div className="space-y-3">
                    {allEvents
                        .filter(e => new Date(e.date) >= today)
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 6)
                        .map((e, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${e.type === "assignment" ? "bg-primary/10" : "bg-accent/10"}`}>
                                    {e.type === "assignment" ? <FileText className="w-4 h-4 text-primary" /> : <BookOpen className="w-4 h-4 text-accent" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                                    <p className="text-xs text-muted-foreground">{e.course}</p>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">{new Date(e.date).toLocaleDateString()}</span>
                            </div>
                        ))}
                </div>
            </div>
        </motion.div>
    );
};

export default CalendarPage;
