import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Wand2, Upload, FileText, Loader2, CheckCircle, Trash2, PlusCircle,
    Edit, Save, RotateCcw, Sparkles, Copy, ListChecks, Type
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedQuestion {
    id: string;
    type: "mcq" | "short-answer";
    text: string;
    options?: string[];
    correctOption?: number;
    points: number;
    editing?: boolean;
}

// Simulated AI quiz generation based on content analysis
const generateQuizFromContent = (content: string): GeneratedQuestion[] => {
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const keywords = words.filter(w => w.length > 5 && w[0] === w[0].toUpperCase()).slice(0, 8);

    const questions: GeneratedQuestion[] = [];

    // Generate MCQs from key concepts
    if (sentences.length >= 1) {
        questions.push({
            id: `q${Date.now()}_1`,
            type: "mcq",
            text: `Which of the following best describes the main concept discussed in this lesson?`,
            options: [
                sentences[0]?.trim().slice(0, 80) || "The primary concept of the topic",
                "An unrelated historical event",
                "A mathematical theorem",
                "A purely theoretical framework with no applications",
            ],
            correctOption: 0,
            points: 10,
        });
    }

    if (keywords.length >= 2) {
        questions.push({
            id: `q${Date.now()}_2`,
            type: "mcq",
            text: `What is the relationship between ${keywords[0] || "the first concept"} and ${keywords[1] || "the second concept"} in this context?`,
            options: [
                "They are completely unrelated",
                `${keywords[0] || "The first"} builds upon ${keywords[1] || "the second"} as a foundational concept`,
                "They are opposing theories",
                "One is a subset of the other with no overlap",
            ],
            correctOption: 1,
            points: 10,
        });
    }

    questions.push({
        id: `q${Date.now()}_3`,
        type: "mcq",
        text: "According to the lesson content, what is the most important takeaway?",
        options: [
            "Understanding the theoretical foundations is essential for practical application",
            "Memorization alone is sufficient for mastery",
            "The topic has no real-world applications",
            "Only experts can understand this material",
        ],
        correctOption: 0,
        points: 10,
    });

    // Generate short-answer questions
    if (sentences.length >= 2) {
        questions.push({
            id: `q${Date.now()}_4`,
            type: "short-answer",
            text: `In your own words, explain the key concept from: "${sentences[Math.min(1, sentences.length - 1)]?.trim().slice(0, 100)}..."`,
            points: 15,
        });
    }

    questions.push({
        id: `q${Date.now()}_5`,
        type: "short-answer",
        text: `What are the practical applications of the concepts covered in this lesson?`,
        points: 15,
    });

    if (keywords.length >= 3) {
        questions.push({
            id: `q${Date.now()}_6`,
            type: "mcq",
            text: `Which term best relates to ${keywords[2] || "the core topic"} as discussed in the material?`,
            options: [
                keywords[0] || "Foundation",
                keywords[1] || "Structure",
                keywords[2] || "Core concept",
                "None of the above",
            ],
            correctOption: 2,
            points: 10,
        });
    }

    questions.push({
        id: `q${Date.now()}_7`,
        type: "short-answer",
        text: "Describe one challenge that might arise when applying these concepts in practice and suggest a solution.",
        points: 20,
    });

    return questions;
};

const AIQuizGenerator = () => {
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [quizTitle, setQuizTitle] = useState("");
    const [generating, setGenerating] = useState(false);
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [pdfName, setPdfName] = useState("");

    const handleGenerate = () => {
        if (!content.trim()) {
            toast({ title: "No content", description: "Please paste lesson content or upload a PDF.", variant: "destructive" });
            return;
        }
        setGenerating(true);
        // Simulate AI processing
        setTimeout(() => {
            const generated = generateQuizFromContent(content);
            setQuestions(generated);
            if (!quizTitle) setQuizTitle("AI-Generated Quiz");
            setGenerating(false);
            toast({ title: "Quiz generated!", description: `${generated.length} questions created by AI.` });
        }, 2000 + Math.random() * 1000);
    };

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPdfName(file.name);
            // Simulate extracting text from PDF
            setContent(`[Content extracted from ${file.name}]\n\nThis lesson covers fundamental concepts in the field of study including theoretical frameworks, practical applications, and advanced methodologies. Students will learn about core principles and their real-world implementations.\n\nKey topics include: Data Structures, Algorithms, System Design, and Software Engineering best practices. Each topic builds upon the previous one to create a comprehensive understanding of the subject matter.\n\nThe practical component involves hands-on exercises where students apply theoretical knowledge to solve real-world problems. This approach ensures deep understanding and retention of the material.`);
            toast({ title: "PDF loaded", description: `Content extracted from ${file.name}` });
        }
    };

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
        );
    };

    const updateOption = (qId: string, optIndex: number, value: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qId && q.options
                    ? { ...q, options: q.options.map((o, i) => (i === optIndex ? value : o)) }
                    : q
            )
        );
    };

    const deleteQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const handleSave = () => {
        toast({
            title: "Quiz saved!",
            description: `"${quizTitle}" with ${questions.length} questions has been saved to your course.`,
        });
    };

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">AI Quiz Generator</h1>
                    <p className="text-sm text-muted-foreground">Paste lesson content or upload a PDF — AI creates quiz questions automatically</p>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Quiz Title</Label>
                    <Input
                        placeholder="e.g. Chapter 3: Data Structures Quiz"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Lesson Content</Label>
                    <Textarea
                        placeholder="Paste your lesson text, notes, or lecture content here... The AI will analyze the content and generate relevant quiz questions."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="bg-muted/50"
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {content.split(/\s+/).filter(Boolean).length} words
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handlePdfUpload} className="hidden" id="pdf-upload-gen" />
                            <label
                                htmlFor="pdf-upload-gen"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {pdfName || "Upload PDF"}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={handleGenerate} disabled={generating || !content.trim()} className="gap-1.5">
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" /> Generate Quiz
                            </>
                        )}
                    </Button>
                    {questions.length > 0 && (
                        <Button variant="outline" onClick={() => { setQuestions([]); }} className="gap-1.5">
                            <RotateCcw className="w-4 h-4" /> Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Generated Questions */}
            {generating && (
                <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <p className="text-foreground font-medium">AI is analyzing your content...</p>
                    <p className="text-sm text-muted-foreground mt-1">Generating questions, options, and correct answers</p>
                </div>
            )}

            {!generating && questions.length > 0 && (
                <div className="space-y-4">
                    {/* Stats Bar */}
                    <div className="flex items-center justify-between bg-card rounded-xl border border-border p-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                <span className="font-bold text-foreground">{questions.length}</span> questions
                            </span>
                            <span className="text-sm text-muted-foreground">
                                <span className="font-bold text-foreground">{totalPoints}</span> total points
                            </span>
                            <span className="text-sm text-muted-foreground">
                                MCQ: <span className="font-bold text-foreground">{questions.filter(q => q.type === "mcq").length}</span>
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Short Answer: <span className="font-bold text-foreground">{questions.filter(q => q.type === "short-answer").length}</span>
                            </span>
                        </div>
                        <Button onClick={handleSave} className="gap-1.5">
                            <Save className="w-4 h-4" /> Save Quiz
                        </Button>
                    </div>

                    {/* Question Cards */}
                    {questions.map((q, qi) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qi * 0.05 }}
                            className="bg-card rounded-xl border border-border shadow-card p-5"
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                        {qi + 1}
                                    </span>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                        {q.type === "mcq" ? <ListChecks className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                                        {q.type === "mcq" ? "MCQ" : "Short Answer"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{q.points} pts</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => updateQuestion(q.id, "editing", !q.editing)}
                                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => deleteQuestion(q.id)}
                                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {q.editing ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={q.text}
                                        onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                                        rows={2}
                                        className="text-sm"
                                    />
                                    {q.type === "mcq" && q.options && (
                                        <div className="space-y-2 pl-2">
                                            {q.options.map((opt, oi) => (
                                                <div key={oi} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${q.id}`}
                                                        checked={q.correctOption === oi}
                                                        onChange={() => updateQuestion(q.id, "correctOption", oi)}
                                                        className="accent-primary"
                                                    />
                                                    <Input
                                                        value={opt}
                                                        onChange={(e) => updateOption(q.id, oi, e.target.value)}
                                                        className="text-sm flex-1"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={q.points}
                                            onChange={(e) => updateQuestion(q.id, "points", parseInt(e.target.value) || 5)}
                                            className="w-20 text-sm"
                                        />
                                        <span className="text-xs text-muted-foreground">points</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-2">{q.text}</p>
                                    {q.type === "mcq" && q.options && (
                                        <div className="space-y-1.5 pl-2">
                                            {q.options.map((opt, oi) => (
                                                <div
                                                    key={oi}
                                                    className={`flex items-center gap-2 text-sm p-2 rounded-lg ${oi === q.correctOption
                                                        ? "bg-success/10 text-success font-medium"
                                                        : "text-foreground"
                                                        }`}
                                                >
                                                    {oi === q.correctOption ? (
                                                        <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-border flex-shrink-0" />
                                                    )}
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default AIQuizGenerator;
