import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { quizQuestions } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

import { ProctoringOverlay } from "@/components/proctoring/ProctoringOverlay";

const Quiz = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [violationReason, setViolationReason] = useState<string | null>(null);

  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const handleViolation = (reason: string) => {
    setViolationReason(reason);
    setSubmitted(true);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
  };

  const q = quizQuestions[current];
  const score = submitted && !violationReason ? quizQuestions.filter((q) => answers[q.id] === q.correct).length : 0;

  const selectAnswer = (optIndex: number) => {
    if (!submitted) setAnswers({ ...answers, [q.id]: optIndex });
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card rounded-xl p-8 border border-border shadow-card text-center">
          {violationReason ? (
            <>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-destructive/10">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mt-4">Session Terminated</h2>
              <p className="text-destructive font-semibold mt-2">Violation Detected</p>
              <p className="text-muted-foreground mt-1">{violationReason}</p>
              <p className="text-xs text-muted-foreground mt-4 italic">Your quiz has been automatically submitted. Score: 0</p>
            </>
          ) : (
            <>
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${score >= 3 ? "bg-success/10" : "bg-warning/10"}`}>
                {score >= 3 ? <CheckCircle className="w-10 h-10 text-success" /> : <AlertTriangle className="w-10 h-10 text-warning" />}
              </div>
              <h2 className="text-2xl font-bold text-foreground mt-4">Quiz Complete!</h2>
              <p className="text-4xl font-bold text-accent mt-2">{score}/{quizQuestions.length}</p>
              <p className="text-muted-foreground mt-1">{score >= 3 ? "Great job! You passed." : "Keep studying and try again."}</p>
            </>
          )}
        </div>
        {!violationReason && (
          <div className="space-y-3">
            {quizQuestions.map((q) => (
              <div key={q.id} className="bg-card rounded-xl p-4 border border-border shadow-card">
                <p className="font-medium text-foreground text-sm">{q.question}</p>
                <div className="mt-2 space-y-1">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`px-3 py-2 rounded-lg text-sm ${i === q.correct ? "bg-success/10 text-success font-medium" :
                      i === answers[q.id] && i !== q.correct ? "bg-destructive/10 text-destructive" :
                        "text-muted-foreground"
                      }`}>
                      {opt} {i === q.correct && <CheckCircle className="inline w-4 h-4 ml-1" />}
                      {i === answers[q.id] && i !== q.correct && <XCircle className="inline w-4 h-4 ml-1" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/courses"><Button className="w-full">Back to Courses</Button></Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <ProctoringOverlay isActive={!submitted} onViolation={handleViolation} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              if (!submitted) {
                handleViolation("Student attempted to leave the quiz page.");
              } else {
                window.location.href = "/courses";
              }
            }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Exit to Courses
          </Link>
          <h1 className="text-xl font-bold text-foreground">Module 2 Quiz</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
          <Clock className="w-4 h-4" />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {quizQuestions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-2 flex-1 rounded-full transition-colors ${i === current ? "bg-primary" : answers[_.id] !== undefined ? "bg-accent" : "bg-muted"
              }`}
          />
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 border border-border shadow-card">
        <p className="text-xs text-muted-foreground mb-2">Question {current + 1} of {quizQuestions.length}</p>
        <h2 className="text-lg font-semibold text-foreground mb-5">{q.question}</h2>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${answers[q.id] === i
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                }`}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current mr-3 text-xs">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        {current < quizQuestions.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)}>
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setShowConfirm(true)}>Submit Quiz</Button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-xl p-6 border border-border shadow-elevated max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground">Submit Quiz?</h3>
            <p className="text-sm text-muted-foreground mt-2">
              You've answered {Object.keys(answers).length} of {quizQuestions.length} questions. This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => { setSubmitted(true); setShowConfirm(false); }}>Submit</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Quiz;
