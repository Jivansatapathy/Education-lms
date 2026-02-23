import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle, MessageSquare, FileText, ChevronDown, Send, CheckCircle, BookOpen, Shield, CreditCard, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const faqs = [
    { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot Password'. Enter your email and we'll send you a reset link.", icon: Shield },
    { q: "How do I enroll in a new course?", a: "Navigate to the Courses page, browse available courses, and click 'Enroll' on the course you want to join.", icon: BookOpen },
    { q: "Where can I view my grades?", a: "Your grades are available on the Grades page accessible from the sidebar navigation.", icon: FileText },
    { q: "How do I submit an assignment?", a: "Open the Assignments page, click on the assignment, fill in your answers, and click 'Submit Assignment'.", icon: Monitor },
    { q: "Is my data secure?", a: "Yes, we use industry-standard encryption and security practices to protect your data.", icon: Shield },
    { q: "How do I contact my instructor?", a: "Use the Messages page to send a direct message to your instructor.", icon: MessageSquare },
];

const SupportPage = () => {
    const { toast } = useToast();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!subject || !category || !message) {
            toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
            return;
        }
        setSubmitted(true);
        setSubject("");
        setCategory("");
        setMessage("");
        setTimeout(() => setSubmitted(false), 4000);
        toast({ title: "Ticket submitted", description: "We'll get back to you within 24 hours." });
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
                <p className="text-muted-foreground mt-1">Find answers or submit a support ticket</p>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Knowledge Base", desc: "Browse articles and tutorials", icon: BookOpen, color: "bg-primary/10 text-primary" },
                    { label: "Live Chat", desc: "Chat with support (9 AM - 6 PM)", icon: MessageSquare, color: "bg-accent/10 text-accent" },
                    { label: "Email Support", desc: "support@lmspro.com", icon: Send, color: "bg-success/10 text-success" },
                ].map(item => (
                    <div key={item.label} className="bg-card rounded-xl p-5 border border-border shadow-card text-center hover:shadow-elevated transition-shadow cursor-pointer">
                        <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* FAQ */}
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Questions
                    </h2>
                </div>
                <div className="divide-y divide-border">
                    {faqs.map((faq, i) => (
                        <div key={i}>
                            <button
                                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                className="w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                            >
                                <faq.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm font-medium text-foreground flex-1">{faq.q}</span>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {expandedFaq === i && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <p className="px-6 pb-4 pl-[52px] text-sm text-muted-foreground">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Ticket */}
            <div className="bg-card rounded-xl border border-border shadow-card p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Submit a Support Ticket
                </h2>
                {submitted ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-7 h-7 text-success" />
                        </div>
                        <p className="font-medium text-foreground">Ticket Submitted!</p>
                        <p className="text-sm text-muted-foreground mt-1">We'll respond within 24 hours.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input placeholder="Brief description..." value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technical">Technical Issue</SelectItem>
                                        <SelectItem value="billing">Billing</SelectItem>
                                        <SelectItem value="course">Course Content</SelectItem>
                                        <SelectItem value="account">Account</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea placeholder="Describe your issue in detail..." value={message} onChange={e => setMessage(e.target.value)} rows={4} className="bg-muted/50" />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSubmit} className="gap-1.5"><Send className="w-4 h-4" /> Submit Ticket</Button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SupportPage;
