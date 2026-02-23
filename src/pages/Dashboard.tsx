import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Clock, TrendingUp, Award, ChevronRight, FileText, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { courses, announcements, deadlines } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

import { RecommendationSection } from "@/components/dashboard/RecommendationSection";
import { RoadmapProgress } from "@/components/dashboard/RoadmapProgress";

const Dashboard = () => {
  const { user } = useAuth();
  const overallProgress = Math.round(courses.reduce((a, c) => a + c.progress, 0) / courses.length);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your courses today.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", value: courses.length, icon: BookOpen, color: "text-primary bg-primary/10" },
          { label: "In Progress", value: courses.filter(c => c.progress < 100).length, icon: Clock, color: "text-accent bg-accent/10" },
          { label: "Overall Progress", value: `${overallProgress}%`, icon: TrendingUp, color: "text-success bg-success/10" },
          { label: "Certificates", value: 2, icon: Award, color: "text-warning bg-warning/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5 shadow-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendations */}
          <RecommendationSection user={user} />

          {/* Courses */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">My Courses</h2>
              <Link to="/courses" className="text-sm text-accent hover:underline font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.slice(0, 4).map((course) => (
                <Link key={course.id} to={`/course/${course.id}`} className="group">
                  <div className="bg-card rounded-xl overflow-hidden border border-border shadow-card hover:shadow-elevated transition-all duration-300">
                    <div className="h-32 overflow-hidden">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <span className="text-xs font-medium text-accent">{course.category}</span>
                      <h3 className="font-semibold text-foreground mt-1 text-sm line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{course.instructor}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span className="font-medium text-foreground">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <motion.div variants={fadeUp} className="space-y-6">
          {/* Roadmap Progress */}
          <RoadmapProgress user={user} />

          {/* Progress Ring */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-card text-center">
            <h3 className="text-sm font-semibold text-foreground mb-4">Overall Completion</h3>
            <div className="relative w-28 h-28 mx-auto">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="8"
                  strokeDasharray={`${overallProgress * 2.64} ${264 - overallProgress * 2.64}`}
                  strokeLinecap="round" className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{overallProgress}%</span>
              </div>
            </div>
          </div>

          {/* Deadlines */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {deadlines.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{d.task}</p>
                    <p className="text-xs text-muted-foreground">{d.course} · {new Date(d.due).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-card rounded-xl p-5 border border-border shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">Announcements</h3>
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${a.type === "warning" ? "bg-warning/10" : a.type === "success" ? "bg-success/10" : "bg-info/10"
                    }`}>
                    {a.type === "warning" ? <AlertTriangle className="w-4 h-4 text-warning" /> :
                      a.type === "success" ? <CheckCircle className="w-4 h-4 text-success" /> :
                        <Info className="w-4 h-4 text-info" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{a.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
