import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowLeft,
    FileText,
    Calendar,
    Trophy,
    ListChecks,
    Type,
    AlignLeft,
    Award,
    BarChart3,
    Clock
} from "lucide-react";
import { useAssignments, Question } from "@/contexts/AssignmentContext";
import { ProctoringOverlay } from "@/components/proctoring/ProctoringOverlay";

interface GradeResult {
    totalScore: number;
    maxScore: number;
    percentage: number;
    questionResults: {
        questionId: string;
        earned: number;
        maxPoints: number;
        isCorrect: boolean;
        correctAnswer: string;
        userAnswer: string;
    }[];
}

const AssignmentDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { assignments } = useAssignments();

    const assignment = assignments.find(a => a.id === id);

    const [submitted, setSubmitted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [grade, setGrade] = useState<GradeResult | null>(null);
    const [violationReason, setViolationReason] = useState<string | null>(null);
    const [aiDetected, setAiDetected] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!submitted && !violationReason) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [submitted, violationReason]);

    if (!assignment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-2xl font-bold">Assignment Not Found</h2>
                <p className="text-muted-foreground mt-2">The assignment you are looking for does not exist.</p>
                <Link to="/assignments" className="mt-6 text-primary hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Assignments
                </Link>
            </div>
        );
    }

    const updateAnswer = (questionId: string, value: string) => {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const detectAI = (text: string): boolean => {
        const aiPatterns = [
            /as an ai language model/i,
            /certainly!/i,
            /i don't have personal opinions/i,
            /in conclusion, it is important to remember/i,
            /let's delve into/i,
            /moreover, it is noteworthy/i,
            /comprehensive understanding/i,
            /in summary/i
        ];
        return aiPatterns.some(pattern => pattern.test(text));
    };

    const calculateGrade = (isViolation = false): GradeResult => {
        let hasAi = false;

        const questionResults = assignment.questions.map((q) => {
            const userAnswer = answers[q.id] || "";
            let isCorrect = false;
            let earned = 0;
            let correctAnswer = "";

            if (!isViolation && detectAI(userAnswer)) {
                hasAi = true;
            }

            if (isViolation || hasAi) {
                earned = 0;
                isCorrect = false;
            } else if (q.type === "mcq") {
                correctAnswer = q.options[q.correctOption];
                isCorrect = userAnswer === String(q.correctOption);
                earned = isCorrect ? q.points : 0;
            } else if (q.type === "short-answer") {
                correctAnswer = "Evaluated by instructor";
                const hasContent = userAnswer.trim().length > 0;
                const lengthScore = Math.min(userAnswer.trim().length / 20, 1);
                earned = hasContent ? Math.round(q.points * (0.6 + lengthScore * 0.4)) : 0;
                isCorrect = earned >= q.points * 0.7;
            } else {
                correctAnswer = "Evaluated by instructor";
                const hasContent = userAnswer.trim().length > 0;
                const lengthScore = Math.min(userAnswer.trim().length / 50, 1);
                earned = hasContent ? Math.round(q.points * (0.5 + lengthScore * 0.5)) : 0;
                isCorrect = earned >= q.points * 0.7;
            }

            return {
                questionId: q.id,
                earned,
                maxPoints: q.points,
                isCorrect,
                correctAnswer,
                userAnswer,
            };
        });

        if (hasAi) setAiDetected(true);

        const totalScore = isViolation || hasAi ? 0 : questionResults.reduce((sum, r) => sum + r.earned, 0);
        const maxScore = questionResults.reduce((sum, r) => sum + r.maxPoints, 0);

        return {
            totalScore,
            maxScore,
            percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
            questionResults,
        };
    };

    const handleSubmit = () => {
        const result = calculateGrade();
        setGrade(result);
        setSubmitted(true);
    };

    const handleViolation = (reason: string) => {
        setViolationReason(reason);
        const result = calculateGrade(true);
        setGrade(result);
        setSubmitted(true);
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }
    };

    const getGradeColor = (pct: number) => {
        if (pct >= 80) return "text-success";
        if (pct >= 60) return "text-warning";
        return "text-destructive";
    };

    const getGradeBg = (pct: number) => {
        if (pct >= 80) return "bg-success/10";
        if (pct >= 60) return "bg-warning/10";
        return "bg-destructive/10";
    };

    const getGradeLabel = (pct: number) => {
        if (pct >= 90) return "Excellent";
        if (pct >= 80) return "Great";
        if (pct >= 70) return "Good";
        if (pct >= 60) return "Satisfactory";
        return "Needs Improvement";
    };

    if (submitted) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
                <div className="bg-card rounded-xl p-8 border border-border shadow-card text-center">
                    {violationReason || aiDetected ? (
                        <>
                            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-destructive/10">
                                <AlertTriangle className="w-10 h-10 text-destructive" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mt-4">
                                {violationReason ? "Session Terminated" : "AI Content Detected"}
                            </h2>
                            <p className="text-destructive font-semibold mt-2">
                                {violationReason ? "Violation Detected" : "Integrity Violation"}
                            </p>
                            <p className="text-muted-foreground mt-1">
                                {violationReason || "Our analysis engine detected AI-generated patterns in your response."}
                            </p>
                            <p className="text-xs text-muted-foreground mt-4 italic">Your assignment has been automatically submitted. Score: 0</p>
                        </>
                    ) : grade ? (
                        <>
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${getGradeBg(grade.percentage)}`}>
                                {grade.percentage >= 70 ? <CheckCircle className="w-10 h-10 text-success" /> : <AlertTriangle className="w-10 h-10 text-warning" />}
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mt-4">Assignment Submitted!</h2>
                            <p className={`text-4xl font-bold mt-2 ${getGradeColor(grade.percentage)}`}>{grade.totalScore}/{grade.maxScore}</p>
                            <p className="text-muted-foreground mt-1">{getGradeLabel(grade.percentage)}</p>
                        </>
                    ) : null}
                </div>
                <Link to="/assignments">
                    <Button className="w-full">Back to Assignments</Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
            <ProctoringOverlay isActive={!submitted} onViolation={handleViolation} />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleViolation("Student attempted to leave the assignment page.");
                        }}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Exit Assignment
                    </Link>
                    <h1 className="text-xl font-bold text-foreground">{assignment.title}</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{assignment.points} Points</span>
                </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-card space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Instructions
                    </h3>
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-t pt-6">
                        <ListChecks className="w-4 h-4 text-primary" />
                        Questions
                    </h3>
                    {assignment.questions.map((q, i) => (
                        <div key={q.id} className="space-y-4 p-4 rounded-lg bg-muted/20 border border-border/50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">Question {i + 1}</span>
                                <span className="text-xs text-muted-foreground">{q.points} pts</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{q.text}</p>

                            {q.type === "mcq" && (
                                <div className="grid grid-cols-1 gap-2">
                                    {q.options.map((opt, oi) => (
                                        <button
                                            key={oi}
                                            onClick={() => updateAnswer(q.id, String(oi))}
                                            className={`p-3 text-left text-sm rounded-lg border transition-all ${answers[q.id] === String(oi) ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {q.type === "short-answer" && (
                                <Input
                                    placeholder="Your answer..."
                                    value={answers[q.id] || ""}
                                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                                />
                            )}

                            {q.type === "long-answer" && (
                                <Textarea
                                    placeholder="Type your detailed response here..."
                                    value={answers[q.id] || ""}
                                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                                    rows={6}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t">
                    <Button onClick={handleSubmit} className="w-full h-12 text-lg font-bold">
                        Submit Assignment
                    </Button>
                    <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-bold animate-pulse">
                        Proctored Session · Do not exit fullscreen
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default AssignmentDetail;
