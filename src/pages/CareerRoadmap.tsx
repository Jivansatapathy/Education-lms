import React from "react";
import { motion } from "framer-motion";
import {
    Target,
    Map as MapIcon,
    CheckCircle2,
    Circle,
    Lock,
    ArrowRight,
    Award,
    BookOpen,
    TrendingUp,
    Briefcase,
    ChevronRight,
    Info,
    Clock,
    Sparkles,
    Wand2
} from "lucide-react";
import { jobRoles, courses } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CareerRoadmap = () => {
    const { user } = useAuth();

    if (!user || !user.targetJobRoleId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <Target className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                <h2 className="text-2xl font-bold font-heading">Set Your Career Target</h2>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    You haven't selected a target career path yet. Head to your profile settings to choose a role and see your personalized roadmap.
                </p>
                <Link to="/settings" className="mt-6">
                    <Button>Go to Settings</Button>
                </Link>
            </div>
        );
    }

    const jobRole = jobRoles.find(jr => jr.id === user.targetJobRoleId);
    if (!jobRole) return null;

    const completedIds = user.completedCourseIds || [];
    const roadmapCourses = jobRole.roadmap.map(id => {
        return courses.find(c => c.id === id) || { id, title: "Specialized Topic", description: "Coming soon to your roadmap." };
    });

    const completedCount = jobRole.roadmap.filter(id => completedIds.includes(id)).length;
    const progress = Math.round((completedCount / jobRole.roadmap.length) * 100);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="max-w-6xl mx-auto space-y-8 pb-12"
        >
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/5 border border-border p-8 lg:p-12">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                            <Target className="w-3 h-3" />
                            Active Path
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold font-heading">Your Pathway to {jobRole.title}</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {jobRole.description} We've curated this sequence of courses to help you master the skills required for this role.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
                                <BookOpen className="w-5 h-5 text-primary" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Courses</p>
                                    <p className="text-sm font-bold">{jobRole.roadmap.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Role Demand</p>
                                    <p className="text-sm font-bold">High Growth</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
                                <Briefcase className="w-5 h-5 text-success" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Avg. Salary</p>
                                    <p className="text-sm font-bold">$115k - $160k</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-48 h-48 lg:w-64 lg:h-64 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="50%" cy="50%" r="45%"
                                className="stroke-muted/20 fill-none"
                                strokeWidth="8"
                            />
                            <motion.circle
                                cx="50%" cy="50%" r="45%"
                                className="stroke-primary fill-none"
                                strokeWidth="8"
                                strokeDasharray="100, 100"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: 100 - progress }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl lg:text-5xl font-black text-foreground">{progress}%</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase">Journey Complete</span>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </section>

            {/* Roadmap Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <MapIcon className="w-6 h-6 text-primary" />
                            Learning Timeline
                        </h2>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> Completed</span>
                            <span className="flex items-center gap-1.5"><Circle className="w-3.5 h-3.5 text-primary" /> Up Next</span>
                            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-muted-foreground" /> Locked</span>
                        </div>
                    </div>

                    <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-success before:via-primary before:to-border">
                        {roadmapCourses.map((course, index) => {
                            const isCompleted = completedIds.includes(course.id);
                            const isNext = !isCompleted && (index === 0 || completedIds.includes(roadmapCourses[index - 1].id));
                            const isLocked = !isCompleted && !isNext;

                            return (
                                <motion.div
                                    key={course.id}
                                    variants={item}
                                    className="relative"
                                >
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[30px] top-1 w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 
                    ${isCompleted ? "bg-success border-success" : isNext ? "bg-background border-primary animate-pulse" : "bg-muted border-border"}
                  `}>
                                        {isCompleted ? <CheckCircle2 className="w-3 h-3 text-success-foreground" /> : isNext ? <Circle className="w-2 h-2 text-primary" /> : <Lock className="w-2.5 h-2.5 text-muted-foreground" />}
                                    </div>

                                    <div className={`group rounded-2xl border transition-all duration-300 overflow-hidden
                    ${isCompleted ? "bg-card border-success/30 opacity-75" : isNext ? "bg-card border-primary shadow-elevated" : "bg-muted/30 border-border"}
                  `}>
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Step {index + 1}</span>
                                                        {isNext && (
                                                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black uppercase">Recommended Next</span>
                                                        )}
                                                    </div>
                                                    <h3 className={`text-xl font-bold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{(course as any).description}</p>
                                                </div>

                                                {!isLocked && (
                                                    <Link to={isCompleted ? `/course/${course.id}` : `/course/${course.id}`}>
                                                        <Button variant={isNext ? "default" : "outline"} size="sm" className="gap-2">
                                                            {isCompleted ? "Review Material" : "Start Now"}
                                                            <ChevronRight className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>

                                            {!isLocked && (
                                                <div className="mt-6 flex flex-wrap gap-4 border-t pt-4 border-border/50">
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{(course as any).duration || "10 weeks"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Award className="w-3.5 h-3.5" />
                                                        <span>Certificate Included</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <motion.div variants={item} className="bg-card rounded-2xl p-6 border border-border shadow-card space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Award className="w-5 h-5 text-accent" />
                            Career Badges
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="aspect-square rounded-xl bg-accent/5 flex items-center justify-center grayscale opacity-50 border border-dashed border-border group hover:opacity-100 hover:grayscale-0 hover:border-accent transition-all cursor-help">
                                <Sparkles className="w-8 h-8 text-accent" />
                            </div>
                            <div className="aspect-square rounded-xl bg-primary/5 flex items-center justify-center grayscale opacity-50 border border-dashed border-border">
                                <Wand2 className="w-8 h-8 text-primary" />
                            </div>
                            <div className="aspect-square rounded-xl bg-success/5 flex items-center justify-center grayscale opacity-50 border border-dashed border-border">
                                <Briefcase className="w-8 h-8 text-success" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Complete key milestones to unlock path badges.</p>
                    </motion.div>

                    <motion.div variants={item} className="bg-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Info className="w-5 h-5" />
                            <h3 className="font-bold">Next Milestone</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You are currently working towards the <span className="text-foreground font-bold">Front-end Expert</span> milestone. Complete 2 more courses to qualify for advanced roles.
                        </p>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Set New Milestone
                        </Button>
                    </motion.div>

                    <motion.div variants={item} className="bg-card rounded-2xl p-6 border border-border shadow-card space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-success" />
                            Skills Gap Analysis
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: "React System Design", progress: 85 },
                                { name: "Cloud Infrastructure", progress: 40 },
                                { name: "Team Leadership", progress: 25 },
                            ].map((skill) => (
                                <div key={skill.name} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>{skill.name}</span>
                                        <span>{skill.progress}%</span>
                                    </div>
                                    <Progress value={skill.progress} className="h-1.5" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default CareerRoadmap;
