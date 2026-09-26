import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Globe, Heart, Atom, Zap, Mountain, Dna, Gem, Search, Filter, Clock, Sparkles, GraduationCap, FlaskConical, Droplets, Flame, Lock, Brain, Trees } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePaywall } from "@/hooks/usePaywall";
import UpgradeModal from "@/components/UpgradeModal";

type Category = "all" | "biology" | "astronomy" | "chemistry" | "physics" | "geology";
type Difficulty = "beginner" | "intermediate" | "advanced";

const models = [
  { title: "Solar System", description: "Explore planets, orbits, moons, and asteroid belts in immersive 3D.", icon: Globe, link: "/3d/solar-system", color: "text-primary", badge: "Popular", category: "astronomy" as Category, difficulty: "beginner" as Difficulty, duration: "15 min", concepts: ["Orbits", "Gravity", "Planets"], gradient: "from-blue-600/20 to-indigo-600/20" },
  { title: "Human Anatomy", description: "Examine 5 layers of the human body — skin, muscles, skeleton, organs & cells.", icon: Heart, link: "/3d/anatomy", color: "text-destructive", badge: "Interactive", category: "biology" as Category, difficulty: "intermediate" as Difficulty, duration: "25 min", concepts: ["Organs", "Cells", "Systems"], gradient: "from-red-600/20 to-pink-600/20" },
  { title: "Human Heart", description: "Explore heart chambers, valves, blood flow, and the cardiac cycle with beating animation.", icon: Heart, link: "/3d/heart", color: "text-destructive", badge: "New", category: "biology" as Category, difficulty: "advanced" as Difficulty, duration: "20 min", concepts: ["Chambers", "Valves", "Blood Flow"], gradient: "from-red-700/20 to-rose-600/20" },
  { title: "Cell Division", description: "Watch mitosis unfold — from interphase through telophase with chromosome separation.", icon: FlaskConical, link: "/3d/cell-division", color: "text-green-500", badge: "New", category: "biology" as Category, difficulty: "intermediate" as Difficulty, duration: "20 min", concepts: ["Mitosis", "Chromosomes", "Phases"], gradient: "from-green-600/20 to-emerald-600/20" },
  { title: "Molecular Chemistry", description: "Visualize molecular structures — Water, CO₂, Methane, and Ammonia with bonds.", icon: Atom, link: "/3d/molecules", color: "text-accent", badge: null, category: "chemistry" as Category, difficulty: "intermediate" as Difficulty, duration: "20 min", concepts: ["Bonds", "Geometry", "Elements"], gradient: "from-emerald-600/20 to-teal-600/20" },
  { title: "Periodic Table", description: "Interactive 3D periodic table with atom models showing electron shells and properties.", icon: Atom, link: "/3d/periodic-table", color: "text-cyan-500", badge: "New", category: "chemistry" as Category, difficulty: "beginner" as Difficulty, duration: "25 min", concepts: ["Elements", "Electrons", "Properties"], gradient: "from-cyan-600/20 to-blue-600/20" },
  { title: "Crystal Structures", description: "Atomic lattice visualizations — NaCl, Diamond, and Ice crystal formations.", icon: Gem, link: "/3d/crystals", color: "text-amber-500", badge: null, category: "chemistry" as Category, difficulty: "intermediate" as Difficulty, duration: "15 min", concepts: ["Lattice", "Bonds", "Symmetry"], gradient: "from-amber-600/20 to-orange-600/20" },
  { title: "Physics Simulations", description: "Real-time pendulums, gravity, and wave mechanics with live equations.", icon: Zap, link: "/3d/physics", color: "text-purple-500", badge: "Advanced", category: "physics" as Category, difficulty: "advanced" as Difficulty, duration: "30 min", concepts: ["Motion", "Energy", "Waves"], gradient: "from-purple-600/20 to-violet-600/20" },
  { title: "Planet Earth", description: "Explore Earth's internal layers, tectonic plates, and geology with cutaway views.", icon: Globe, link: "/3d/earth", color: "text-green-500", badge: null, category: "geology" as Category, difficulty: "beginner" as Difficulty, duration: "15 min", concepts: ["Layers", "Tectonics", "Core"], gradient: "from-green-600/20 to-emerald-600/20" },
  { title: "Volcano Structure", description: "Cross-section of a volcano — magma chamber, conduit, crater, and lava flows.", icon: Flame, link: "/3d/volcano", color: "text-orange-500", badge: "New", category: "geology" as Category, difficulty: "intermediate" as Difficulty, duration: "15 min", concepts: ["Magma", "Eruption", "Layers"], gradient: "from-orange-600/20 to-red-600/20" },
  { title: "Water Cycle", description: "Evaporation, condensation, precipitation, and collection in an interactive 3D scene.", icon: Droplets, link: "/3d/water-cycle", color: "text-blue-400", badge: "New", category: "geology" as Category, difficulty: "beginner" as Difficulty, duration: "15 min", concepts: ["Evaporation", "Rain", "Cycle"], gradient: "from-sky-600/20 to-blue-600/20" },
  { title: "DNA & Genetics", description: "Interactive double helix with base-pair bonding and genetic code visualization.", icon: Dna, link: "/3d/dna", color: "text-blue-400", badge: null, category: "biology" as Category, difficulty: "advanced" as Difficulty, duration: "20 min", concepts: ["Helix", "Base Pairs", "Genetics"], gradient: "from-sky-600/20 to-blue-600/20" },
  { title: "Human Brain", description: "Explore brain lobes, regions, and neural pathways with interactive labels.", icon: Brain, link: "/3d/brain", color: "text-pink-400", badge: "New", category: "biology" as Category, difficulty: "advanced" as Difficulty, duration: "25 min", concepts: ["Lobes", "Neurons", "Cortex"], gradient: "from-pink-600/20 to-purple-600/20" },
  { title: "Forest Ecosystem", description: "Living ecosystem — trees, animals, food chain & climate cycles in 3D.", icon: Trees, link: "/3d/ecosystem", color: "text-green-500", badge: "New", category: "biology" as Category, difficulty: "beginner" as Difficulty, duration: "15 min", concepts: ["Food Chain", "Biodiversity", "Cycles"], gradient: "from-green-600/20 to-teal-600/20" },
];

const categories: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "biology", label: "Biology", icon: Heart },
  { id: "astronomy", label: "Astronomy", icon: Globe },
  { id: "chemistry", label: "Chemistry", icon: Atom },
  { id: "physics", label: "Physics", icon: Zap },
  { id: "geology", label: "Geology", icon: Mountain },
];

const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string }> = {
  beginner: { label: "Beginner", color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
  intermediate: { label: "Intermediate", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  advanced: { label: "Advanced", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
};

const Learning3D = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { can3D, register3DVisit, isPro, visited3D, limit3D } = usePaywall();

  const filtered = useMemo(() => {
    return models.filter((m) => {
      const matchesSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()) || m.concepts.some(c => c.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === "all" || m.category === activeCategory;
      const matchesDifficulty = !activeDifficulty || m.difficulty === activeDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [search, activeCategory, activeDifficulty]);

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border/50 flex items-center px-4 sm:px-6 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-[10px]"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex items-center gap-2 ml-3">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-sm font-bold">3D Lab</h1>
        </div>
        <Badge variant="secondary" className="ml-auto text-[10px]">{filtered.length} of {models.length} models</Badge>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Hero */}
        <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold tracking-tighter">Interactive 3D Lab</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">Explore scientific concepts through immersive 3D models. Each model includes AI-powered explanations.</p>
            </div>
            {!isPro && (
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Free Plan</div>
                <div className="text-sm font-bold">{visited3D.size} / {limit3D} labs unlocked</div>
                <Link to="/pricing" className="text-[11px] text-primary hover:underline">Upgrade for unlimited →</Link>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative mt-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models, concepts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl bg-background/80 border-border/50"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <cat.icon className="h-3 w-3" />
              {cat.label}
            </button>
          ))}
          <div className="h-4 w-px bg-border mx-1" />
          {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                activeDifficulty === d
                  ? difficultyConfig[d].bg + " " + difficultyConfig[d].color + " border-current"
                  : "bg-secondary text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {difficultyConfig[d].label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((m, i) => {
              const slug = m.link.replace("/3d/", "");
              const unlocked = can3D(slug);
              const cardInner = (
                <div className={`glass-card-hover overflow-hidden h-full ${!unlocked ? "opacity-60" : ""}`}>
                  <div className={`relative h-32 bg-gradient-to-br ${m.gradient} flex items-center justify-center overflow-hidden`}>
                    <m.icon className={`h-12 w-12 ${m.color} opacity-80 group-hover:scale-110 transition-transform duration-500`} />
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                      backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }} />
                    {m.badge && (
                      <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground border-0 text-[10px]">{m.badge}</Badge>
                    )}
                    <div className={`absolute top-2 left-2 ${difficultyConfig[m.difficulty].bg} border rounded-md px-1.5 py-0.5`}>
                      <span className={`text-[9px] font-semibold ${difficultyConfig[m.difficulty].color}`}>{difficultyConfig[m.difficulty].label}</span>
                    </div>
                    {!unlocked && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
                        <Lock className="h-6 w-6 text-primary" />
                        <span className="text-[10px] font-semibold text-foreground">Pro Lab</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <m.icon className={`h-4 w-4 ${m.color} shrink-0`} />
                      <h3 className="text-sm font-bold">{m.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{m.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {m.concepts.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-secondary text-[9px] font-medium text-muted-foreground">{c}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {m.duration}
                      </div>
                      <span className="text-xs font-semibold text-primary group-hover:underline">
                        {unlocked ? "Open Lab →" : "Upgrade →"}
                      </span>
                    </div>
                  </div>
                </div>
              );
              return (
                <motion.div
                  key={m.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  {unlocked ? (
                    <Link to={m.link} onClick={() => register3DVisit(slug)} className="block group">{cardInner}</Link>
                  ) : (
                    <button onClick={() => setShowUpgrade(true)} className="block group text-left w-full">
                      {cardInner}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No models found matching your search.</p>
            <button onClick={() => { setSearch(""); setActiveCategory("all"); setActiveDifficulty(null); }} className="text-xs text-primary mt-2 hover:underline">Clear filters</button>
          </div>
        )}
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} feature="3d" />
    </div>
  );
};

export default Learning3D;
