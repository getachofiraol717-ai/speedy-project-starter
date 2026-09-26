import { useState, useEffect, useCallback } from "react";

import {
  Shield, Users, Video, Trophy, Settings, ArrowLeft, Search,
  Trash2, Edit, Eye, Plus, BarChart3, AlertTriangle, CheckCircle,
  User, Mail, Calendar, MoreHorizontal, Ban, ChevronDown, RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type Tab = "overview" | "users" | "quizzes" | "scores" | "settings";
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  role: AppRole; // primary role for legacy display
  roles: AppRole[]; // all roles
  premiumGrantedAt?: string | null;
  premiumExpiresAt?: string | null;
}

interface QuizScore {
  id: string;
  user_id: string;
  category: string;
  score: number;
  total: number;
  completed_at: string;
  display_name?: string | null;
}

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "scores", label: "Quiz Scores", icon: Trophy },
  { id: "settings", label: "System", icon: Settings },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [studySessions, setStudySessions] = useState<{ total: number; totalMinutes: number }>({ total: 0, totalMinutes: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string }>({ open: false, type: "", id: "", name: "" });
  const [editRoleDialog, setEditRoleDialog] = useState<{ open: boolean; userId: string; name: string }>({ open: false, userId: "", name: "" });
  const [selectedRoles, setSelectedRoles] = useState<Set<AppRole>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles) {
      const roleMap = new Map<string, AppRole[]>();
      const premiumGrantMap = new Map<string, string>();
      roles?.forEach((r: any) => {
        const arr = roleMap.get(r.user_id) || [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
        if (r.role === "premium" && r.granted_at) {
          premiumGrantMap.set(r.user_id, r.granted_at);
        }
      });

      setUsers(profiles.map((p) => {
        const userRoles = roleMap.get(p.user_id) || ["student" as AppRole];
        const priority: AppRole[] = ["admin" as AppRole, "teacher" as AppRole, "premium" as AppRole, "student" as AppRole];
        const primary = priority.find(r => userRoles.includes(r)) || userRoles[0];
        const grantedAt = premiumGrantMap.get(p.user_id) || null;
        const expiresAt = grantedAt ? new Date(new Date(grantedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
        return { ...p, role: primary, roles: userRoles, premiumGrantedAt: grantedAt, premiumExpiresAt: expiresAt };
      }));
    }
  }, []);

  const fetchQuizScores = useCallback(async () => {
    const { data } = await supabase
      .from("quiz_scores")
      .select("*")
      .order("completed_at", { ascending: false });

    if (data) {
      // Enrich with display names from users state
      setQuizScores(data);
    }
  }, []);

  const fetchStudySessions = useCallback(async () => {
    const { data } = await supabase.from("study_sessions").select("*");
    if (data) {
      setStudySessions({
        total: data.length,
        totalMinutes: data.reduce((sum, s) => sum + s.duration_minutes, 0),
      });
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchQuizScores(), fetchStudySessions()]);
    setLoading(false);
  }, [fetchUsers, fetchQuizScores, fetchStudySessions]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Real delete handler
  const handleDelete = async () => {
    const { type, id } = deleteDialog;
    try {
      if (type === "User") {
        // Find user_id from profile id
        const targetUser = users.find((u) => u.id === id);
        if (targetUser) {
          // Delete related data first, then profile and role
          await supabase.from("quiz_scores").delete().eq("user_id", targetUser.user_id);
          await supabase.from("video_progress").delete().eq("user_id", targetUser.user_id);
          await supabase.from("study_sessions").delete().eq("user_id", targetUser.user_id);
          await supabase.from("user_roles").delete().eq("user_id", targetUser.user_id);
          const { error } = await supabase.from("profiles").delete().eq("id", id);
          if (error) throw error;
          setUsers((prev) => prev.filter((u) => u.id !== id));
        }
      } else if (type === "Quiz Score") {
        const { error } = await supabase.from("quiz_scores").delete().eq("id", id);
        if (error) throw error;
        setQuizScores((prev) => prev.filter((q) => q.id !== id));
      }
      toast({ title: `${type} deleted`, description: `"${deleteDialog.name}" has been removed.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete", variant: "destructive" });
    }
    setDeleteDialog({ open: false, type: "", id: "", name: "" });
  };

  // Multi-role update: replace user's roles with the selected set
  const handleRoleUpdate = async () => {
    try {
      const userId = editRoleDialog.userId;
      const desired = Array.from(selectedRoles);
      if (desired.length === 0) {
        toast({ title: "Pick at least one role", variant: "destructive" });
        return;
      }
      // Get current roles
      const { data: existing } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const currentRoles = (existing || []).map((r) => r.role as AppRole);

      // Roles to add
      const toAdd = desired.filter((r) => !currentRoles.includes(r));
      // Roles to remove
      const toRemove = currentRoles.filter((r) => !desired.includes(r));

      if (toAdd.length > 0) {
        const rows = toAdd.map((role) => ({ user_id: userId, role, granted_at: new Date().toISOString() }));
        const { error } = await supabase.from("user_roles").insert(rows as any);
        if (error) throw error;
      }
      // Re-grant premium (refresh granted_at) if it was already there and is still selected
      if (desired.includes("premium" as AppRole) && currentRoles.includes("premium" as AppRole)) {
        await supabase.from("user_roles")
          .update({ granted_at: new Date().toISOString() } as any)
          .eq("user_id", userId)
          .eq("role", "premium" as AppRole);
      }
      for (const r of toRemove) {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", r);
        if (error) throw error;
      }

      await fetchUsers();
      const premiumNote = desired.includes("premium" as AppRole)
        ? ` Premium active until ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.`
        : "";
      toast({
        title: "✓ Roles saved",
        description: `${editRoleDialog.name} now has: ${desired.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")}.${premiumNote}`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update roles", variant: "destructive" });
    }
    setEditRoleDialog({ open: false, userId: "", name: "" });
  };

  // Enriched quiz scores with user names
  const enrichedScores = quizScores.map((qs) => {
    const u = users.find((u) => u.user_id === qs.user_id);
    return { ...qs, display_name: u?.display_name || "Unknown" };
  });

  const totalQuizAttempts = quizScores.length;
  const avgScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / quizScores.length)
    : 0;

  const stats = [
    { label: "Total Users", value: users.length.toString(), icon: Users, color: "text-primary" },
    { label: "Quiz Attempts", value: totalQuizAttempts.toString(), icon: Trophy, color: "text-accent" },
    { label: "Avg. Score", value: `${avgScore}%`, icon: BarChart3, color: "text-orange-500" },
    { label: "Study Minutes", value: studySessions.totalMinutes.toString(), icon: Calendar, color: "text-green-500" },
  ];

  const roleColor = (role: AppRole) => {
    if (role === "admin") return "destructive" as const;
    if ((role as string) === "premium") return "default" as const;
    if (role === "teacher") return "default" as const;
    return "secondary" as const;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-[10px]">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-[10px]" onClick={loadAll} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 rounded-[10px] bg-secondary/50 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm text-muted-foreground">Loading admin data...</span>
            </div>
          </div>
        ) : (
        <>
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold font-mono-data">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {(u.display_name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.display_name || "Unknown"}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={roleColor(u.role)} className="text-[10px] capitalize">{u.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-4">Recent Quiz Scores</h3>
                <div className="space-y-3">
                  {enrichedScores.slice(0, 5).map((qs) => (
                    <div key={qs.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{qs.display_name}</p>
                        <p className="text-[10px] text-muted-foreground">{qs.category}</p>
                      </div>
                      <Badge variant={qs.score / qs.total >= 0.7 ? "default" : "secondary"} className="text-[10px] font-mono-data">
                        {qs.score}/{qs.total}
                      </Badge>
                    </div>
                  ))}
                  {enrichedScores.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No quiz scores yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Manage Users ({users.length})</h2>
            </div>
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter((u) => !searchQuery || (u.display_name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                            {(u.display_name || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.display_name || "Unknown"}</p>
                            <p className="text-[10px] text-muted-foreground">{u.bio || "No bio"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r} variant={roleColor(r)} className="text-[10px] capitalize">{r}</Badge>
                          ))}
                        </div>
                        {u.premiumGrantedAt && (
                          <div className="mt-1 text-[9px] text-muted-foreground leading-tight">
                            <div>Premium since: <span className="font-mono-data">{new Date(u.premiumGrantedAt).toLocaleDateString()}</span></div>
                            <div>Expires: <span className={`font-mono-data ${new Date(u.premiumExpiresAt!) < new Date() ? "text-destructive" : "text-green-500"}`}>{new Date(u.premiumExpiresAt!).toLocaleDateString()}</span></div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedRoles(new Set(u.roles));
                              setEditRoleDialog({ open: true, userId: u.user_id, name: u.display_name || "Unknown" });
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteDialog({ open: true, type: "User", id: u.id, name: u.display_name || "Unknown" })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Quiz Scores Tab */}
        {activeTab === "scores" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Quiz Scores ({enrichedScores.length})</h2>
            </div>
            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedScores
                    .filter((q) => !searchQuery || q.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || q.category.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((qs) => (
                    <TableRow key={qs.id}>
                      <TableCell className="text-sm font-medium">{qs.display_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{qs.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-bold font-mono-data ${qs.score / qs.total >= 0.7 ? "text-green-500" : "text-destructive"}`}>
                          {qs.score}/{qs.total}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(qs.completed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog({ open: true, type: "Quiz Score", id: qs.id, name: `${qs.display_name} - ${qs.category}` })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {enrichedScores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                        No quiz scores recorded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">System Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Email Verification", desc: "Auto-confirm is enabled for new signups", status: true },
                { title: "3D Models", desc: "7 interactive 3D learning experiences available", status: true },
                { title: "AI Tutor", desc: "Powered by Gemini Flash model", status: true },
                { title: "Quiz System", desc: `${totalQuizAttempts} total attempts, ${avgScore}% avg score`, status: true },
              ].map((s) => (
                <div key={s.title} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">{s.title}</h3>
                    <Badge variant={s.status ? "default" : "secondary"} className="text-[10px]">
                      {s.status ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    These actions are irreversible. Proceed with caution.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 rounded-[10px] text-xs">
                      Reset All Progress
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 rounded-[10px] text-xs">
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog.type}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Roles Dialog (multi-select) */}
      <Dialog open={editRoleDialog.open} onOpenChange={(open) => setEditRoleDialog({ ...editRoleDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Roles</DialogTitle>
            <DialogDescription>
              Assign one or more roles to "{editRoleDialog.name}". A user can be both Admin and Premium. Premium grants full access for 30 days.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            {(["student", "premium", "teacher", "admin"] as AppRole[]).map((r) => {
              const checked = selectedRoles.has(r);
              return (
                <label key={r} className="flex items-center gap-3 p-3 rounded-[10px] border border-border/50 hover:bg-secondary/40 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={checked}
                    onChange={(e) => {
                      const next = new Set(selectedRoles);
                      if (e.target.checked) next.add(r); else next.delete(r);
                      setSelectedRoles(next);
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize">{r}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {r === "admin" && "Full admin panel access"}
                      {r === "premium" && "Unlimited 3D & AI Tutor for 30 days"}
                      {r === "teacher" && "Can create content"}
                      {r === "student" && "Default learner access"}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditRoleDialog({ ...editRoleDialog, open: false })}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
