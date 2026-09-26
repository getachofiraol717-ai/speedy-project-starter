import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Clock, Flame, Trophy, BookOpen,
  ArrowLeft, Target, Star, CheckCircle, Calendar, Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DayData {
  day: string;
  minutes: number;
}

interface CourseProgress {
  name: string;
  progress: number;
  completed: number;
  total: number;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const achievements = [
  { title: "First Steps", desc: "Complete your first lesson", key: "first_lesson", icon: CheckCircle },
  { title: "Streak Master", desc: "Maintain a 5-day streak", key: "streak_5", icon: Flame },
  { title: "Quiz Whiz", desc: "Score 100% on any quiz", key: "perfect_quiz", icon: Trophy },
  { title: "Night Owl", desc: "Study past midnight", key: "night_owl", icon: Star },
  { title: "Explorer", desc: "Try all 3D learning modules", key: "explorer", icon: Target },
  { title: "Bookworm", desc: "Complete 50 lessons", key: "bookworm", icon: BookOpen },
];

const ProgressPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [quizStats, setQuizStats] = useState({ total: 0, perfect: 0 });
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch study sessions
      const { data: sessions } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false });

      // Fetch quiz scores
      const { data: quizzes } = await supabase
        .from("quiz_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      // Fetch video progress
      const { data: videos } = await supabase
        .from("video_progress")
        .select("*")
        .eq("user_id", user.id);

      // --- Weekly activity ---
      const now = new Date();
      const mondayOffset = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset);
      monday.setHours(0, 0, 0, 0);

      const weekly: DayData[] = dayLabels.map((day, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const dayMinutes = (sessions || [])
          .filter((s) => s.session_date === dateStr)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        return { day, minutes: dayMinutes };
      });
      setWeeklyData(weekly);

      // --- Totals ---
      const allMinutes = (sessions || []).reduce((s, d) => s + (d.duration_minutes || 0), 0);
      setTotalMinutes(allMinutes);

      // XP: 10 XP per minute studied + 50 XP per quiz attempt + bonus for scores
      const quizXP = (quizzes || []).reduce((s, q) => s + 50 + q.score * 10, 0);
      setTotalXP(allMinutes * 10 + quizXP);

      // --- Streak calculation ---
      const sessionDates = new Set((sessions || []).map((s) => s.session_date));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        if (sessionDates.has(ds)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      setStreakDays(streak);

      // --- Quiz stats ---
      const perfectCount = (quizzes || []).filter((q) => q.score === q.total).length;
      setQuizStats({ total: (quizzes || []).length, perfect: perfectCount });

      // --- Course progress from quiz categories ---
      const categories = new Map<string, { scores: number[]; totals: number[] }>();
      (quizzes || []).forEach((q) => {
        if (!categories.has(q.category)) {
          categories.set(q.category, { scores: [], totals: [] });
        }
        const cat = categories.get(q.category)!;
        cat.scores.push(q.score);
        cat.totals.push(q.total);
      });

      const cp: CourseProgress[] = Array.from(categories.entries()).map(([name, data]) => {
        const totalAnswered = data.scores.reduce((a, b) => a + b, 0);
        const totalPossible = data.totals.reduce((a, b) => a + b, 0);
        const pct = totalPossible > 0 ? Math.round((totalAnswered / totalPossible) * 100) : 0;
        return { name, progress: pct, completed: totalAnswered, total: totalPossible };
      });
      setCourseProgress(cp);

      // --- Achievements ---
      const earned = new Set<string>();
      if ((videos || []).filter((v) => v.watched).length > 0 || (sessions || []).length > 0) earned.add("first_lesson");
      if (streak >= 5) earned.add("streak_5");
      if (perfectCount > 0) earned.add("perfect_quiz");
      if ((sessions || []).some((s) => {
        const h = new Date(s.created_at).getHours();
        return h >= 0 && h < 5;
      })) earned.add("night_owl");
      if ((videos || []).filter((v) => v.watched).length >= 50 || (sessions || []).length >= 50) earned.add("bookworm");
      setEarnedAchievements(earned);
    } catch (err) {
      console.error("Error fetching progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);
  const earnedCount = earnedAchievements.size;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-lg font-bold">My Progress</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Clock, label: "Total Study Time", value: formatTime(totalMinutes), color: "text-primary" },
            { icon: TrendingUp, label: "Total XP", value: totalXP.toLocaleString(), color: "text-accent" },
            { icon: Flame, label: "Current Streak", value: `${streakDays} day${streakDays !== 1 ? "s" : ""}`, color: "text-orange-500" },
            { icon: Trophy, label: "Achievements", value: `${earnedCount} / ${achievements.length}`, color: "text-primary" },
          ].map((s) => (
            <motion.div key={s.label} whileHover={{ y: -2 }} className="glass-card p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-[10px] bg-secondary flex items-center justify-center">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold font-mono-data">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" /> Weekly Activity
            </h3>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{formatTime(weeklyData.reduce((s, d) => s + d.minutes, 0))} this week</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {weeklyData.map((d, i) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.minutes / maxMinutes) * 100}%` }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className={`w-full rounded-t-[8px] min-h-[4px] ${
                    d.minutes > 0 ? "bg-primary glow-primary" : "bg-secondary"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground font-mono-data">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Course Progress */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" /> Quiz Performance by Category
            </h3>
            {courseProgress.length === 0 ? (
              <div className="glass-card p-6 text-center text-sm text-muted-foreground">
                No quiz data yet. Take some quizzes to see your progress!
              </div>
            ) : (
              <div className="space-y-3">
                {courseProgress.map((c) => (
                  <div key={c.name} className="glass-card p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold capitalize">{c.name}</h4>
                        <p className="text-xs text-muted-foreground">{c.completed}/{c.total} correct answers</p>
                      </div>
                      <Badge variant="secondary" className="font-mono-data text-xs">{c.progress}%</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={c.progress} className="flex-1 h-2" />
                      <span className="font-mono-data text-xs text-muted-foreground">{c.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" /> Achievements
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((a) => {
                const earned = earnedAchievements.has(a.key);
                return (
                  <motion.div
                    key={a.title}
                    whileHover={{ scale: 1.02 }}
                    className={`glass-card p-4 text-center space-y-2 ${!earned ? "opacity-40" : ""}`}
                  >
                    <div className={`h-10 w-10 rounded-full mx-auto flex items-center justify-center ${
                      earned ? "bg-primary/10" : "bg-secondary"
                    }`}>
                      <a.icon className={`h-5 w-5 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <h4 className="text-xs font-semibold">{a.title}</h4>
                    <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
