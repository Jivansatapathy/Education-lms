import { useState } from "react";
import { motion } from "framer-motion";
import { discussions } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare, Pin, Send, ChevronDown, ChevronUp } from "lucide-react";

interface Reply {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  replies: Reply[];
  replyCount: number;
  likes: number;
  pinned: boolean;
  time: string;
}

const Discussions = () => {
  const [posts, setPosts] = useState<Post[]>(
    discussions.map(d => ({
      ...d,
      replyCount: d.replies,
      replies: d.replies > 0 ? [
        { id: `r-${d.id}-1`, author: "Emily Davis", text: "Great point! I had a similar experience.", time: "1 day ago" },
        ...(d.replies > 1 ? [{ id: `r-${d.id}-2`, author: "James Wilson", text: "Thanks for sharing, this is really helpful.", time: "2 days ago" }] : []),
      ] : [],
    }))
  );
  const [newPost, setNewPost] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const handlePost = () => {
    if (!newPost.trim()) return;
    setPosts([{
      id: String(Date.now()), author: "Alex Johnson", avatar: "", title: newPost, content: newPost,
      replies: [], replyCount: 0, likes: 0, pinned: false, time: "Just now"
    }, ...posts]);
    setNewPost("");
  };

  const toggleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const submitReply = (postId: string) => {
    if (!replyText.trim()) return;
    setPosts(posts.map(p => p.id === postId ? {
      ...p,
      replies: [...p.replies, { id: `r-${Date.now()}`, author: "You", text: replyText, time: "Just now" }],
      replyCount: p.replyCount + 1,
    } : p));
    setReplyTo(null);
    setReplyText("");
    setExpandedReplies(prev => new Set(prev).add(postId));
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Discussion Forum</h1>
        <p className="text-muted-foreground mt-1">Engage with your peers and instructors</p>
      </div>

      {/* New Post */}
      <div className="bg-card rounded-xl p-5 border border-border shadow-card">
        <Textarea placeholder="Start a new discussion..." value={newPost} onChange={(e) => setNewPost(e.target.value)} rows={3} className="bg-muted/50" />
        <div className="flex justify-end mt-3">
          <Button onClick={handlePost} disabled={!newPost.trim()} size="sm" className="gap-1.5">
            <Send className="w-4 h-4" /> Post
          </Button>
        </div>
      </div>

      {/* Threads */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className={`bg-card rounded-xl p-5 border shadow-card ${post.pinned ? "border-accent/30 bg-accent/5" : "border-border"}`}>
            {post.pinned && (
              <div className="flex items-center gap-1 text-xs text-accent font-medium mb-2">
                <Pin className="w-3 h-3" /> Pinned by Instructor
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{post.author}</p>
                <p className="text-xs text-muted-foreground">{post.time}</p>
              </div>
            </div>
            <h3 className="font-medium text-foreground text-sm">{post.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{post.content}</p>
            <div className="flex items-center gap-4 mt-4">
              <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors">
                <ThumbsUp className="w-4 h-4" /> {post.likes}
              </button>
              <button onClick={() => setReplyTo(replyTo === post.id ? null : post.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4" /> {post.replyCount} replies
              </button>
              {post.replies.length > 0 && (
                <button onClick={() => toggleReplies(post.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  {expandedReplies.has(post.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {expandedReplies.has(post.id) ? "Hide" : "Show"} replies
                </button>
              )}
            </div>

            {/* Replies list */}
            {expandedReplies.has(post.id) && post.replies.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border space-y-3 pl-4">
                {post.replies.map(r => (
                  <div key={r.id} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-[10px] font-semibold flex-shrink-0 mt-0.5">
                      {r.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{r.author} <span className="font-normal text-muted-foreground">· {r.time}</span></p>
                      <p className="text-sm text-muted-foreground mt-0.5">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply input */}
            {replyTo === post.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 pt-3 border-t border-border">
                <Textarea placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} className="bg-muted/50" />
                <div className="flex justify-end mt-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setReplyTo(null); setReplyText(""); }}>Cancel</Button>
                  <Button size="sm" onClick={() => submitReply(post.id)} disabled={!replyText.trim()}>Reply</Button>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Discussions;
