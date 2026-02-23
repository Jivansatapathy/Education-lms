import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Sparkles, BookOpen, Lightbulb, MessageCircle, Loader2, X, GraduationCap, ArrowLeft } from "lucide-react";
import { courses } from "@/data/mockData";

interface ChatMessage {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

const suggestedQuestions = [
    "Explain the concept of React hooks",
    "What is the difference between SQL and NoSQL?",
    "Summarize the key points of machine learning",
    "How does responsive web design work?",
    "What are design patterns in software engineering?",
];

// Simulated AI response generator based on keywords
const generateAIResponse = (question: string, courseName: string): string => {
    const q = question.toLowerCase();

    if (q.includes("react") && q.includes("hook")) {
        return `Great question about React Hooks! 🎯\n\nReact Hooks are functions that let you "hook into" React state and lifecycle features from function components.\n\n**Key Hooks:**\n• **useState** — Manages local state in a component\n• **useEffect** — Handles side effects (API calls, subscriptions)\n• **useContext** — Accesses context without prop drilling\n• **useRef** — Persists values across renders without causing re-renders\n• **useMemo / useCallback** — Optimize performance by memoizing values\n\n**Rules of Hooks:**\n1. Only call hooks at the top level (not inside loops or conditions)\n2. Only call hooks from React function components or custom hooks\n\nWould you like me to explain any specific hook in more detail?`;
    }

    if (q.includes("sql") && q.includes("nosql")) {
        return `Here's a clear comparison of SQL vs NoSQL databases:\n\n**SQL (Relational):**\n• Structured data with fixed schemas\n• Tables with rows and columns\n• ACID transactions (reliable)\n• Examples: PostgreSQL, MySQL, SQLite\n• Best for: Complex queries, financial data\n\n**NoSQL (Non-Relational):**\n• Flexible, dynamic schemas\n• Document, key-value, graph, or column stores\n• Horizontal scaling (distributed)\n• Examples: MongoDB, Redis, Cassandra\n• Best for: Real-time apps, big data, rapid prototyping\n\n**When to choose which?**\n→ Need strict data integrity? → SQL\n→ Need flexibility and scale? → NoSQL\n→ Many modern apps use both! (Polyglot persistence)`;
    }

    if (q.includes("machine learning") || q.includes("ml") || q.includes("ai")) {
        return `Here's a summary of Machine Learning fundamentals:\n\n**What is ML?**\nMachine Learning is a subset of AI where systems learn patterns from data without being explicitly programmed.\n\n**3 Types of Learning:**\n1. **Supervised** — Labeled data (classification, regression)\n2. **Unsupervised** — No labels (clustering, dimensionality reduction)\n3. **Reinforcement** — Trial and error with rewards\n\n**Common Algorithms:**\n• Linear/Logistic Regression\n• Decision Trees & Random Forests\n• Neural Networks (Deep Learning)\n• K-Means Clustering\n• Support Vector Machines\n\n**ML Pipeline:**\nData Collection → Preprocessing → Feature Engineering → Model Training → Evaluation → Deployment\n\nWant me to dive deeper into any specific area?`;
    }

    if (q.includes("responsive") || q.includes("design")) {
        return `Responsive Web Design (RWD) ensures websites work well on all screen sizes. Here's how it works:\n\n**Core Techniques:**\n\n1. **Fluid Grids** — Use percentages instead of fixed pixels\n2. **Flexible Images** — \`max-width: 100%\` so images scale\n3. **Media Queries** — Apply different CSS at different breakpoints\n\n\`\`\`css\n@media (max-width: 768px) {\n  .sidebar { display: none; }\n  .content { width: 100%; }\n}\n\`\`\`\n\n**Modern Approaches:**\n• CSS Grid & Flexbox for layouts\n• Mobile-first design philosophy\n• CSS Container Queries (newer)\n• Viewport units (vw, vh, dvh)\n\n**Testing:** Use browser DevTools to simulate devices!`;
    }

    if (q.includes("pattern") || q.includes("design pattern")) {
        return `Software Design Patterns are reusable solutions to common problems:\n\n**Creational Patterns:**\n• **Singleton** — One instance only\n• **Factory** — Create objects without specifying class\n• **Builder** — Construct complex objects step by step\n\n**Structural Patterns:**\n• **Adapter** — Make incompatible interfaces work together\n• **Decorator** — Add behavior dynamically\n• **Observer** — Notify dependents of changes\n\n**Behavioral Patterns:**\n• **Strategy** — Swap algorithms at runtime\n• **Command** — Encapsulate actions as objects\n• **State** — Object behavior changes with state\n\nDesign patterns help you write maintainable, scalable code!`;
    }

    if (q.includes("summarize") || q.includes("summary") || q.includes("explain")) {
        return `I'd be happy to help summarize or explain concepts from **${courseName}**! 📚\n\nHere are some things I can do:\n• Break down complex topics into simple explanations\n• Create bullet-point summaries of lessons\n• Provide real-world examples and analogies\n• Generate study notes for exam preparation\n\nCould you be more specific about which topic or lesson you'd like me to cover?`;
    }

    // Default response
    return `That's a great question about "${question}"! 🤔\n\nBased on the content in **${courseName}**, here are the key points:\n\n1. This topic is fundamental to understanding the broader subject\n2. The core concept involves applying theoretical knowledge to practical scenarios\n3. Key terminology to remember includes the foundational principles covered in your course materials\n\n**Recommended next steps:**\n• Review the related module materials in your course\n• Practice with hands-on exercises\n• Try explaining the concept in your own words\n\nWould you like me to elaborate on any specific aspect, or would you like me to generate practice questions on this topic?`;
};

const AITutor = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectCourse = (course: typeof courses[0]) => {
        setSelectedCourse(course);
        setMessages([
            {
                id: "welcome",
                role: "ai",
                content: `Hello! 👋 I'm your AI Tutor for **${course.title}**.\n\nI can help you with:\n• Understanding course concepts\n• Summarizing lessons and modules\n• Answering questions about ${course.category || "the subject"}\n• Creating study notes for exams\n\nWhat would you like to learn about?`,
                timestamp: new Date(),
            },
        ]);
    };

    const handleChangeCourse = () => {
        setSelectedCourse(null);
        setMessages([]);
    };

    const handleSend = async () => {
        if (!input.trim() || isTyping || !selectedCourse) return;
        const userMsg: ChatMessage = {
            id: `u${Date.now()}`,
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const aiResponse = generateAIResponse(userMsg.content, selectedCourse.title);
            const aiMsg: ChatMessage = {
                id: `ai${Date.now()}`,
                role: "ai",
                content: aiResponse,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1200 + Math.random() * 800);
    };

    // ─── Course Selection Screen ──────────────────────────────
    if (!selectedCourse) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto py-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">AI Tutor</h1>
                    <p className="text-muted-foreground text-lg">Choose a course to start learning with your personal AI tutor</p>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course, index) => (
                        <motion.button
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            onClick={() => handleSelectCourse(course)}
                            className="group text-left bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                        >
                            {/* Course Thumbnail */}
                            <div className="relative h-36 overflow-hidden">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-3 left-3 right-3">
                                    <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                        {course.category}
                                    </span>
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="p-4">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        <span>{course.students?.toLocaleString() || "—"} students</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>{course.modules?.length || 0} modules</span>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                        <span>Progress</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        );
    }

    // ─── Chat Screen ──────────────────────────────────────────
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
            {/* Header with selected course */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">AI Tutor</h1>
                        <p className="text-xs text-muted-foreground">Powered by AI · Ask anything about your courses</p>
                    </div>
                </div>
                {/* Selected Course Badge */}
                <button
                    onClick={handleChangeCourse}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group"
                >
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary max-w-[200px] truncate">{selectedCourse.title}</span>
                    <X className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary transition-colors" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-card rounded-xl border border-border shadow-card p-4 space-y-4 mb-4">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {msg.role === "ai" && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[75%] rounded-xl p-4 ${msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 border border-border text-foreground"
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                        </div>
                        {msg.role === "user" && (
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="w-4 h-4 text-accent" />
                            </div>
                        )}
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
                <div className="flex-shrink-0 mb-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" /> Try asking:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((sq, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(sq)}
                                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors text-foreground"
                            >
                                {sq}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="flex-shrink-0 flex gap-2">
                <div className="flex-1 relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Ask your AI tutor anything..."
                        className="pl-10 h-11"
                        disabled={isTyping}
                    />
                </div>
                <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="h-11 px-4">
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
};

export default AITutor;
