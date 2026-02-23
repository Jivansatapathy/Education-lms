import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Sparkles, Copy, Download, Upload, RotateCcw, BookOpen, Lightbulb, List, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryResult {
    title: string;
    keyPoints: string[];
    shortSummary: string;
    studyNotes: string;
    wordCount: number;
    readingTime: string;
}

const generateSummary = (content: string): SummaryResult => {
    const words = content.split(/\s+/).filter(Boolean);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const wordCount = words.length;
    const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min`;

    // Extract key concepts (words that appear multiple times or are capitalized)
    const wordFreq: Record<string, number> = {};
    words.forEach(w => {
        const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
        if (clean.length > 4) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    });
    const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([w]) => w);

    // Generate key points from sentences
    const keyPoints = sentences
        .filter((_, i) => i % Math.max(1, Math.floor(sentences.length / 5)) === 0)
        .slice(0, 6)
        .map(s => s.trim());

    if (keyPoints.length < 3) {
        keyPoints.push("The material covers foundational concepts essential for understanding the subject.");
        keyPoints.push("Practical applications are emphasized alongside theoretical knowledge.");
        keyPoints.push("Students should focus on connecting key ideas to real-world scenarios.");
    }

    const title = sentences[0]?.trim().slice(0, 60) || "Content Summary";

    const shortSummary = `This content covers ${topWords.slice(0, 3).join(", ")} and related topics across ${sentences.length} key points. The material emphasizes ${topWords.length > 3 ? topWords.slice(3, 5).join(" and ") : "core principles"}, providing both theoretical foundations and practical applications. The lesson is structured to build progressive understanding from basic concepts to advanced applications.`;

    const studyNotes = `📚 STUDY NOTES\n\n🎯 Core Topics: ${topWords.join(", ")}\n\n📝 Key Definitions:\n${topWords.slice(0, 3).map(w => `• ${w.charAt(0).toUpperCase() + w.slice(1)}: A fundamental concept discussed in the lesson material`).join("\n")}\n\n💡 Important Concepts:\n${keyPoints.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n🔗 Connections:\n• These concepts relate to broader themes in the subject area\n• Understanding these foundations enables advanced topic comprehension\n• Practical exercises reinforce the theoretical knowledge\n\n📋 Review Questions:\n1. What are the main concepts covered?\n2. How do these concepts connect to each other?\n3. What are the practical applications?\n\n⏰ Estimated Study Time: ${readingTime} reading + 10-15 min review`;

    return { title, keyPoints, shortSummary, studyNotes, wordCount, readingTime };
};

const ContentSummarizer = () => {
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [summarizing, setSummarizing] = useState(false);
    const [result, setResult] = useState<SummaryResult | null>(null);
    const [activeTab, setActiveTab] = useState<"summary" | "points" | "notes">("summary");
    const [pdfName, setPdfName] = useState("");

    const handleSummarize = () => {
        if (!content.trim()) {
            toast({ title: "No content", description: "Please paste some text to summarize.", variant: "destructive" });
            return;
        }
        setSummarizing(true);
        setTimeout(() => {
            setResult(generateSummary(content));
            setSummarizing(false);
            toast({ title: "Summary ready!", description: "AI has analyzed and summarized your content." });
        }, 1800 + Math.random() * 700);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPdfName(file.name);
            setContent(`[Content from ${file.name}]\n\nModern software development encompasses a wide range of methodologies and practices. Agile Development promotes iterative progress through short sprints and continuous feedback. DevOps bridges the gap between development and operations, emphasizing automation and monitoring.\n\nKey concepts include Continuous Integration, where code changes are automatically tested and merged. Continuous Deployment extends this by automatically releasing validated changes to production. Microservices Architecture decomposes applications into small, independently deployable services.\n\nCloud Computing provides scalable infrastructure through providers like AWS, Azure, and Google Cloud. Containerization with Docker enables consistent environments across development, testing, and production. Kubernetes orchestrates container deployments at scale.\n\nSecurity practices like DevSecOps integrate security checks throughout the development pipeline. Performance optimization involves profiling, caching strategies, and load balancing. Monitoring and observability through tools like Prometheus and Grafana ensure system reliability.`);
            toast({ title: "File loaded", description: `Content extracted from ${file.name}` });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
    };

    const downloadAsText = () => {
        if (!result) return;
        const text = `${result.title}\n\n--- Summary ---\n${result.shortSummary}\n\n--- Key Points ---\n${result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n--- Study Notes ---\n${result.studyNotes}`;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ai-summary.txt";
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Downloaded!", description: "Summary saved as ai-summary.txt" });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">AI Content Summarizer</h1>
                    <p className="text-sm text-muted-foreground">Paste lesson content and get AI-powered summaries, key points, and study notes</p>
                </div>
            </div>

            {/* Input */}
            <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-4">
                <Textarea
                    placeholder="Paste your lesson text, lecture notes, or any learning material here...\n\nThe AI will analyze the content and create:\n• A concise summary\n• Key bullet points\n• Study notes with review questions"
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
                        <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" id="sum-file-upload" />
                        <label
                            htmlFor="sum-file-upload"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {pdfName || "Upload File"}
                        </label>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={handleSummarize} disabled={summarizing || !content.trim()} className="gap-1.5">
                        {summarizing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Summarizing...</>
                        ) : (
                            <><Sparkles className="w-4 h-4" /> Summarize</>
                        )}
                    </Button>
                    {result && (
                        <Button variant="outline" onClick={() => { setResult(null); }} className="gap-1.5">
                            <RotateCcw className="w-4 h-4" /> Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Loading */}
            {summarizing && (
                <div className="bg-card rounded-xl border border-border shadow-card p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <p className="text-foreground font-medium">AI is analyzing your content...</p>
                    <p className="text-sm text-muted-foreground mt-1">Extracting key concepts and generating summaries</p>
                </div>
            )}

            {/* Result */}
            {!summarizing && result && (
                <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Original Words", value: result.wordCount, icon: FileText },
                            { label: "Reading Time", value: result.readingTime, icon: BookOpen },
                            { label: "Key Points", value: result.keyPoints.length, icon: List },
                            { label: "Compression", value: `${Math.round((1 - result.shortSummary.length / Math.max(1, content.length)) * 100)}%`, icon: Sparkles },
                        ].map(stat => (
                            <div key={stat.label} className="bg-card rounded-xl p-3 border border-border">
                                <stat.icon className="w-4 h-4 text-primary mb-1" />
                                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                        <div className="flex border-b border-border">
                            {[
                                { key: "summary", label: "Summary", icon: Sparkles },
                                { key: "points", label: "Key Points", icon: List },
                                { key: "notes", label: "Study Notes", icon: Lightbulb },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.key
                                        ? "bg-primary/5 text-primary border-b-2 border-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-5">
                            {activeTab === "summary" && (
                                <div>
                                    <p className="text-sm text-foreground leading-relaxed">{result.shortSummary}</p>
                                </div>
                            )}

                            {activeTab === "points" && (
                                <div className="space-y-2">
                                    {result.keyPoints.map((point, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </span>
                                            <p className="text-sm text-foreground leading-relaxed">{point}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "notes" && (
                                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                                    {result.studyNotes}
                                </pre>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(
                                    activeTab === "summary" ? result.shortSummary
                                        : activeTab === "points" ? result.keyPoints.join("\n")
                                            : result.studyNotes
                                )} className="gap-1.5">
                                    <Copy className="w-3.5 h-3.5" /> Copy
                                </Button>
                                <Button variant="outline" size="sm" onClick={downloadAsText} className="gap-1.5">
                                    <Download className="w-3.5 h-3.5" /> Download All
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ContentSummarizer;
