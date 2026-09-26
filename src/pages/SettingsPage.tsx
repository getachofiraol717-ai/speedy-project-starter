import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, User, Bell, Palette, Shield, ArrowLeft, Save, Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [emailNotif, setEmailNotif] = useState(() => localStorage.getItem("pref_email_notif") !== "0");
  const [pushNotif, setPushNotif] = useState(() => localStorage.getItem("pref_push_notif") === "1");
  const [weeklyReport, setWeeklyReport] = useState(() => localStorage.getItem("pref_weekly_report") !== "0");
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.user_metadata?.display_name || user.email?.split("@")[0] || "");

    supabase.from("profiles").select("bio").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.bio) setBio(data.bio);
    });
  }, [user]);

  // Apply theme on mount/change
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Persist notif prefs
  useEffect(() => { localStorage.setItem("pref_email_notif", emailNotif ? "1" : "0"); }, [emailNotif]);
  useEffect(() => { localStorage.setItem("pref_push_notif", pushNotif ? "1" : "0"); }, [pushNotif]);
  useEffect(() => { localStorage.setItem("pref_weekly_report", weeklyReport ? "1" : "0"); }, [weeklyReport]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName } });
      await supabase.from("profiles").update({ display_name: displayName, bio }).eq("user_id", user.id);
      setSaved(true);
      toast({ title: "Settings saved", description: "Your preferences have been updated." });
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
    setSaving(false);
  };

  const sections = [
    {
      title: "Profile", icon: User, content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="max-w-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled className="max-w-sm opacity-60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="flex w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      ),
    },
    {
      title: "Notifications", icon: Bell, content: (
        <div className="space-y-4">
          {[
            { label: "Email notifications", desc: "Receive updates about your courses via email", state: emailNotif, set: setEmailNotif },
            { label: "Push notifications", desc: "Get notified in your browser", state: pushNotif, set: setPushNotif },
            { label: "Weekly report", desc: "Receive a weekly summary of your progress", state: weeklyReport, set: setWeeklyReport },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between max-w-sm">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={item.state} onCheckedChange={item.set} />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Appearance", icon: Palette, content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-sm">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Security", icon: Shield, content: (
        <div className="space-y-4 max-w-sm">
          <div>
            <p className="text-sm font-medium">Password</p>
            <p className="text-xs text-muted-foreground mb-2">Change your account password</p>
            <Link to="/forgot-password">
              <Button variant="outline" size="sm">Change Password</Button>
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium">Account Role</p>
            <Badge variant="secondary" className="mt-1">Student</Badge>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="text-lg font-bold">Settings</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saved ? <Check className="h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">{s.title}</h2>
            </div>
            {s.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
