import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, Circle } from "lucide-react";

const initialConversations = [
    {
        id: "1", name: "Dr. Sarah Chen", role: "Instructor", avatar: "S", lastMsg: "Great work on the assignment!", time: "10:30 AM", unread: 2, online: true,
        messages: [
            { id: "m1", from: "them", text: "Hi! I wanted to discuss your last assignment.", time: "Yesterday 3:00 PM" },
            { id: "m2", from: "me", text: "Sure! Which part would you like to discuss?", time: "Yesterday 3:15 PM" },
            { id: "m3", from: "them", text: "Your use of custom hooks was excellent. Could you elaborate on your design choices?", time: "Yesterday 3:20 PM" },
            { id: "m4", from: "me", text: "I chose to separate the data fetching logic to keep components focused on rendering.", time: "Yesterday 3:45 PM" },
            { id: "m5", from: "them", text: "Great work on the assignment!", time: "Today 10:30 AM" },
        ]
    },
    {
        id: "2", name: "Prof. Michael Torres", role: "Instructor", avatar: "M", lastMsg: "The quiz deadline is tomorrow.", time: "9:15 AM", unread: 1, online: false,
        messages: [
            { id: "m1", from: "them", text: "Reminder: the quiz deadline is tomorrow.", time: "Today 9:15 AM" },
        ]
    },
    {
        id: "3", name: "Emily Davis", role: "Student", avatar: "E", lastMsg: "Want to form a study group?", time: "Yesterday", unread: 0, online: true,
        messages: [
            { id: "m1", from: "them", text: "Hey! Want to form a study group for the React course?", time: "Yesterday 2:00 PM" },
            { id: "m2", from: "me", text: "Sounds great! When works for you?", time: "Yesterday 2:30 PM" },
            { id: "m3", from: "them", text: "Want to form a study group?", time: "Yesterday 5:00 PM" },
        ]
    },
    {
        id: "4", name: "James Wilson", role: "Student", avatar: "J", lastMsg: "Thanks for the notes!", time: "Feb 20", unread: 0, online: false,
        messages: [
            { id: "m1", from: "me", text: "Here are my notes from today's lecture.", time: "Feb 20 1:00 PM" },
            { id: "m2", from: "them", text: "Thanks for the notes!", time: "Feb 20 1:30 PM" },
        ]
    },
];

const MessagesPage = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState(initialConversations);
    const [activeId, setActiveId] = useState<string | null>("1");
    const [newMsg, setNewMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const activeConv = conversations.find(c => c.id === activeId);
    const filtered = conversations.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const sendMessage = () => {
        if (!newMsg.trim() || !activeId) return;
        setConversations(conversations.map(c =>
            c.id === activeId ? {
                ...c,
                messages: [...c.messages, { id: `m-${Date.now()}`, from: "me", text: newMsg, time: "Just now" }],
                lastMsg: newMsg,
                time: "Just now",
            } : c
        ));
        setNewMsg("");
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-7rem)] flex rounded-xl border border-border overflow-hidden bg-card shadow-card">
            {/* Sidebar */}
            <div className="w-80 border-r border-border flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-border">
                    <h2 className="font-semibold text-foreground mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 text-sm" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filtered.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => { setActiveId(conv.id); setConversations(conversations.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)); }}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${activeId === conv.id ? "bg-muted/70" : ""}`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                                    {conv.avatar}
                                </div>
                                {conv.online && <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-success fill-success stroke-card" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-foreground truncate">{conv.name}</p>
                                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{conv.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{conv.lastMsg}</p>
                            </div>
                            {conv.unread > 0 && (
                                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            {activeConv ? (
                <div className="flex-1 flex flex-col">
                    <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">{activeConv.avatar}</div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">{activeConv.name}</p>
                            <p className="text-xs text-muted-foreground">{activeConv.role} {activeConv.online ? "· Online" : ""}</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {activeConv.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.from === "me"
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : "bg-muted text-foreground rounded-bl-md"
                                    }`}>
                                    <p>{msg.text}</p>
                                    <p className={`text-[10px] mt-1 ${msg.from === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-border flex gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={newMsg}
                            onChange={e => setNewMsg(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                            className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={!newMsg.trim()} size="sm" className="gap-1.5">
                            <Send className="w-4 h-4" /> Send
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a conversation to start chatting
                </div>
            )}
        </motion.div>
    );
};

export default MessagesPage;
