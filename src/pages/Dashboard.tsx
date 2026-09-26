import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Brain, Box, Trophy, Video, BarChart3, Settings,
  ChevronLeft, ChevronRight, Sparkles, Search, Bell, TrendingUp,
  Clock, Flame, Star, LogOut, Shield, Sun, Moon, MoreVertical,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import courseAnatomy from "@/assets/course-anatomy.jpg";
import courseSolar from "@/assets/course-solar.jpg";
import courseChemistry from "@/assets/course-chemistry.jpg";
import coursePhysics from "@/assets/course-physics.jpg";

const baseNavItems = [
  { icon: BookOpen, label: "My Courses", path: "/dashboard" },
  { icon: Brain, label: "AI Tutor", path: "/ai-tutor" },
  { icon: Box, label: "3D Learning", path: "/3d" },
  { icon: Video, label: "Video Lessons", path: "/video-lessons" },
  { icon: Trophy, label: "Quizzes", path: "/quizzes" },
  { icon: BarChart3, label: "Progress", path: "/progress" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const courses = [
  { title: "Cell Biology", image: courseAnatomy, progress: 72, category: "Biology", rating: "4.9" },
  { title: "Solar System", image: courseSolar, progress: 45, category: "Astronomy", rating: "4.8" },
  { title: "Molecular Chemistry", image: courseChemistry, progress: 30, category: "Chemistry", rating: "4.7" },
  { title: "Quantum Physics", image: coursePhysics, progress: 15, category: "Physics", rating: "4.9" },
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { dark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [streakCount, setStreakCount] = useState(0);
  const [weeklyXP, setWeeklyXP] = useState(0);
  const [studyTime, setStudyTime] = useState("0h 0m");
  const [streakDays, setStreakDays] = useState<boolean[]>([false, false, false, false, false, false, false]);

  useEffect(() => {
    if (!user) return;
    fetchRealStats();
  }, [user]);

  const fetchRealStats = async () => {
    if (!user) return;
    const now = new Date();
    const mondayOffset = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const mondayStr = monday.toISOString().split("T")[0];

    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id);

    const { data: quizzes } = await supabase
      .from("quiz_scores")
      .select("*")
      .eq("user_id", user.id);

    // Total study time
    const totalMins = (sessions || []).reduce((s, d) => s + (d.duration_minutes || 0), 0);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    setStudyTime(`${h}h ${m}m`);

    // Weekly XP
    const weekSessions = (sessions || []).filter((s) => s.session_date >= mondayStr);
    const weekQuizzes = (quizzes || []).filter((q) => q.completed_at >= monday.toISOString());
    const wMins = weekSessions.reduce((s, d) => s + (d.duration_minutes || 0), 0);
    const wQuizXP = weekQuizzes.reduce((s, q) => s + 50 + q.score * 10, 0);
    setWeeklyXP(wMins * 10 + wQuizXP);

    // Streak
    const sessionDates = new Set((sessions || []).map((s) => s.session_date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (sessionDates.has(ds)) streak++;
      else if (i > 0) break;
    }
    setStreakCount(streak);

    // Weekly streak visual
    const wd = dayLabels.map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return sessionDates.has(date.toISOString().split("T")[0]);
    });
    setStreakDays(wd);
  };

  const navItems = isAdmin
    ? [...baseNavItems, { icon: Shield, label: "Admin Panel", path: "/admin" }]
    : baseNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";
  const initials = displayName.slice(0, 2).toUpperCase();
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col shrink-0 hidden md:flex"
      >
        <div className="flex items-center gap-2 p-4 h-16 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary glow-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && <span className="text-sm font-semibold tracking-tight truncate">SmartStudy3D</span>}
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setActiveNav(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors duration-200 ${
                activeNav === i
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-border/50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border/50 flex items-center justify-between gap-2 px-3 sm:px-6 shrink-0">
          {/* Mobile 3-dot menu (top-left) */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="p-2 rounded-[10px] hover:bg-secondary transition-colors flex items-center gap-1"
                >
                  <MoreVertical className="h-5 w-5" />
                  <span className="text-sm font-semibold">SmartStudy3D</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60 rounded-[12px]">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{displayName}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                      <item.icon className="h-4 w-4" /> {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {dark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {dark ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative w-48 sm:w-80 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses, topics..." className="pl-9 rounded-[10px] bg-secondary/50 border-0" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-[10px] hover:bg-secondary transition-colors hidden md:inline-flex"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-8 max-w-7xl">
            <div>
              <h1 className="text-2xl font-bold tracking-tighter">Welcome back, {displayName}</h1>
              <p className="text-sm text-muted-foreground mt-1">Continue where you left off or explore something new.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Flame, label: "Day Streak", value: String(streakCount), color: "text-orange-500" },
                { icon: TrendingUp, label: "XP This Week", value: weeklyXP.toLocaleString(), color: "text-primary" },
                { icon: Clock, label: "Study Time", value: studyTime, color: "text-accent" },
                { icon: Star, label: "Quizzes Done", value: "—", color: "text-primary" },
              ].map((s) => (
                <div key={s.label} className="glass-card p-3 sm:p-4 flex items-center gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-[10px] bg-secondary flex items-center justify-center">
                    <s.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-base sm:text-lg font-bold font-mono-data">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Weekly Streak</h3>
              <div className="flex gap-2">
                {streakDays.map((active, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className={`h-10 rounded-[10px] w-full transition-all ${active ? "bg-primary glow-primary" : "bg-secondary"}`} />
                    <span className="text-[10px] text-muted-foreground font-mono-data">{dayLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-semibold">My Courses</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {courses.map((c) => (
                    <motion.div key={c.title} whileHover={{ y: -2 }} className="glass-card-hover overflow-hidden cursor-pointer group">
                      <div className="relative aspect-video overflow-hidden">
                        <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <Badge className="absolute top-2 left-2 bg-card/80 backdrop-blur-sm text-foreground border-0 text-[10px]">{c.category}</Badge>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-semibold">{c.title}</h4>
                          <span className="font-mono-data text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-primary text-primary" />{c.rating}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={c.progress} className="flex-1 h-1.5" />
                          <span className="font-mono-data text-[10px] text-muted-foreground">{c.progress}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Link to="/ai-tutor" className="block">
                <div className="glass-card-hover flex flex-col h-full min-h-[300px] lg:h-[500px] p-6 items-center justify-center text-center cursor-pointer group">
                  <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-sm font-bold">AI Tutor</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Get real-time help from your AI-powered tutor. Ask questions, get explanations, and generate quizzes.
                  </p>
                  <span className="text-xs font-semibold text-primary mt-4 group-hover:underline">Open AI Tutor →</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
