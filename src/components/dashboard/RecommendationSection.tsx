import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ChevronRight, BookOpen } from "lucide-react";
import { courses } from "@/data/mockData";
import { User } from "@/contexts/AuthContext";

interface RecommendationSectionProps {
    user: User | null;
}

const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export const RecommendationSection = ({ user }: RecommendationSectionProps) => {
    if (!user) return null;

    // Simple recommendation logic
    const getRecommendations = () => {
        const completedIds = user.completedCourseIds || [];
        const preferredCats = user.preferredCategories || [];

        // Filter out completed courses
        let recommended = courses.filter(c => !completedIds.includes(c.id));

        // Prioritize preferred categories
        recommended.sort((a, b) => {
            const aPref = preferredCats.includes(a.category) ? 1 : 0;
            const bPref = preferredCats.includes(b.category) ? 1 : 0;
            return bPref - aPref;
        });

        return recommended.slice(0, 2);
    };

    const recommendedCourses = getRecommendations();

    if (recommendedCourses.length === 0) return null;

    return (
        <motion.div variants={fadeUp} className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-warning" />
                    <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
                </div>
                <Link to="/courses" className="text-sm text-accent hover:underline font-medium flex items-center gap-1">
                    Explore all <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendedCourses.map((course) => (
                    <Link key={course.id} to={`/course/${course.id}`} className="group">
                        <div className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-elevated transition-all duration-300 flex gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{course.category}</span>
                                <h3 className="font-semibold text-foreground text-sm line-clamp-1 mt-0.5">{course.title}</h3>
                                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                    <BookOpen className="w-3 h-3" />
                                    <span className="text-xs">{course.duration}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
};
