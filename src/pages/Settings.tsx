import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [language, setLanguage] = useState("en");

  // Notification toggles
  const [notifs, setNotifs] = useState({
    email: true, push: true, courseUpdates: true, assignmentReminders: true, discussionReplies: true,
  });

  // Password
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Settings saved", description: "Your profile has been updated successfully." });
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordUpdate = () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast({ title: "Missing fields", description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "destructive" });
      return;
    }
    if (newPwd.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    toast({ title: "Password updated", description: "Your password has been changed successfully." });
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
  };

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs({ ...notifs, [key]: !notifs[key] });
    toast({ title: `${notifs[key] ? "Disabled" : "Enabled"}`, description: `${key.replace(/([A-Z])/g, " $1")} notifications ${notifs[key] ? "turned off" : "turned on"}.` });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Profile */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card space-y-4">
        <h2 className="font-semibold text-foreground">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleSave} className="gap-1.5">
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : "Save Changes"}
        </Button>
      </div>

      {/* Password */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card space-y-4">
        <h2 className="font-semibold text-foreground">Change Password</h2>
        <div className="space-y-3">
          <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} /></div>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} /></div>
          <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} /></div>
        </div>
        <Button variant="outline" onClick={handlePasswordUpdate}>Update Password</Button>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card space-y-4">
        <h2 className="font-semibold text-foreground">Notifications</h2>
        {[
          { key: "email" as const, label: "Email notifications" },
          { key: "push" as const, label: "Push notifications" },
          { key: "courseUpdates" as const, label: "Course updates" },
          { key: "assignmentReminders" as const, label: "Assignment reminders" },
          { key: "discussionReplies" as const, label: "Discussion replies" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-1">
            <span className="text-sm text-foreground">{item.label}</span>
            <Switch checked={notifs[item.key]} onCheckedChange={() => toggleNotif(item.key)} />
          </div>
        ))}
      </div>

      {/* Language */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card space-y-4">
        <h2 className="font-semibold text-foreground">Preferences</h2>
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={(v) => { setLanguage(v); toast({ title: "Language updated", description: `Language set to ${v === "en" ? "English" : v === "es" ? "Spanish" : v === "fr" ? "French" : "German"}.` }); }}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
