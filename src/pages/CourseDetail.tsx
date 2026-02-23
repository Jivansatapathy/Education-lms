import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { courses } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Play, FileText, Download, CheckCircle, Circle, ArrowLeft, Clock, Users } from "lucide-react";

const tabs = ["Overview", "Modules", "Assignments", "Quizzes", "Discussions", "Resources"];

const CourseDetail = () => {
  const { id } = useParams();
  const course = courses.find(c => c.id === id) || courses[0];
  const [activeTab, setActiveTab] = useState("Modules");
  const [expandedModule, setExpandedModule] = useState<string | null>(course.modules[0]?.id || null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(course.modules.filter(m => m.completed).map(m => m.id))
  );

  const toggleComplete = (moduleId: string) => {
    const updated = new Set(completedLessons);
    if (updated.has(moduleId)) updated.delete(moduleId);
    else updated.add(moduleId);
    setCompletedLessons(updated);
  };

  const progress = Math.round((completedLessons.size / course.modules.length) * 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden h-48 md:h-56">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <span className="text-xs font-semibold text-accent uppercase tracking-wide">{course.category}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-card mt-1">{course.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-card/80">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.students.toLocaleString()} students</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Course Progress</span>
          <span className="text-sm font-bold text-accent">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-0">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "Overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-3">About This Course</h2>
          <p className="text-muted-foreground leading-relaxed">{course.description}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Instructor</p><p className="text-sm font-medium text-foreground mt-0.5">{course.instructor}</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Duration</p><p className="text-sm font-medium text-foreground mt-0.5">{course.duration}</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Modules</p><p className="text-sm font-medium text-foreground mt-0.5">{course.modules.length}</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Students</p><p className="text-sm font-medium text-foreground mt-0.5">{course.students.toLocaleString()}</p></div>
          </div>
        </motion.div>
      )}

      {activeTab === "Modules" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {course.modules.map((mod, idx) => (
            <div key={mod.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <button
                onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    completedLessons.has(mod.id) ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {completedLessons.has(mod.id) ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">{mod.title}</p>
                    <p className="text-xs text-muted-foreground">{mod.lessons} lessons</p>
                  </div>
                </div>
                {expandedModule === mod.id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedModule === mod.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-border">
                  <div className="p-4 space-y-3">
                    {/* Mock video player */}
                    <div className="rounded-lg bg-foreground/5 aspect-video flex items-center justify-center cursor-pointer hover:bg-foreground/10 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Download className="w-4 h-4" /> Download PDF
                      </Button>
                      <Button
                        size="sm"
                        variant={completedLessons.has(mod.id) ? "outline" : "default"}
                        onClick={() => toggleComplete(mod.id)}
                        className="gap-1.5"
                      >
                        {completedLessons.has(mod.id) ? <><CheckCircle className="w-4 h-4" /> Completed</> : <><Circle className="w-4 h-4" /> Mark Complete</>}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === "Assignments" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/assignments" className="block">
            <div className="bg-card rounded-xl p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground">Custom Hooks Assignment</h3>
              <p className="text-sm text-muted-foreground mt-1">Create 3 custom hooks demonstrating different patterns.</p>
              <p className="text-xs text-accent mt-2 font-medium">Due: Feb 26, 2026</p>
              <Button className="mt-4" size="sm">View Assignment</Button>
            </div>
          </Link>
        </motion.div>
      )}

      {activeTab === "Quizzes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/quiz" className="block">
            <div className="bg-card rounded-xl p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground">Module 2 Quiz</h3>
              <p className="text-sm text-muted-foreground mt-1">5 multiple choice questions · 15 minutes</p>
              <Button className="mt-4" size="sm">Start Quiz</Button>
            </div>
          </Link>
        </motion.div>
      )}

      {activeTab === "Discussions" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/discussions" className="block">
            <div className="bg-card rounded-xl p-6 border border-border shadow-card">
              <p className="text-muted-foreground">View course discussions →</p>
            </div>
          </Link>
        </motion.div>
      )}

      {activeTab === "Resources" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {["Course Syllabus.pdf", "Reference Materials.pdf", "Additional Reading.pdf"].map(file => (
            <div key={file} className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{file}</span>
              </div>
              <Button variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CourseDetail;
