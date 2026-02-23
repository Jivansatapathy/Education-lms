import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { courses } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

const Courses = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const categories = ["all", ...new Set(courses.map(c => c.category))];
  const filtered = courses.filter(c =>
    (category === "all" || c.category === category) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground mt-1">Continue learning where you left off</p>
      </div>

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
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                category === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/course/${course.id}`} className="group block">
              <div className="bg-card rounded-xl overflow-hidden border border-border shadow-card hover:shadow-elevated transition-all duration-300">
                <div className="h-40 overflow-hidden relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-card/90 backdrop-blur text-xs font-medium text-foreground">
                    {course.duration}
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wide">{course.category}</span>
                  <h3 className="text-base font-semibold text-foreground mt-1.5">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{course.students.toLocaleString()} students</span>
                    <span>·</span>
                    <span>{course.modules.length} modules</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    Continue Learning
                  </Button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Courses;
