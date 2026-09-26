import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play, Clock, BookOpen, Search, Star, CheckCircle, Lock, ArrowLeft, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import courseAnatomy from "@/assets/course-anatomy.jpg";
import courseSolar from "@/assets/course-solar.jpg";
import courseChemistry from "@/assets/course-chemistry.jpg";
import coursePhysics from "@/assets/course-physics.jpg";

const categories = ["All", "Biology", "Astronomy", "Chemistry", "Physics"];

const lessons = [
  {
    id: 1, title: "Introduction to Cell Biology", category: "Biology", duration: "12:34",
    thumbnail: courseAnatomy, instructor: "Amoeba Sisters", rating: 4.9, views: "12.4K",
    completed: true, locked: false, youtubeId: "URUJD5NEXC8",
    description: "Learn the fundamental building blocks of life — cell structure, organelles, and cellular processes.",
  },
  {
    id: 2, title: "The Solar System Explained", category: "Astronomy", duration: "18:20",
    thumbnail: courseSolar, instructor: "Kurzgesagt", rating: 4.8, views: "9.8K",
    completed: true, locked: false, youtubeId: "libKVRa01L8",
    description: "A comprehensive tour of our solar system — planets, moons, asteroids, and the Sun.",
  },
  {
    id: 3, title: "Chemical Bonds & Reactions", category: "Chemistry", duration: "15:45",
    thumbnail: courseChemistry, instructor: "Professor Dave Explains", rating: 4.7, views: "8.2K",
    completed: false, locked: false, youtubeId: "CGA8sRwqIFg",
    description: "Understand ionic, covalent, and metallic bonds. Explore reaction types and balancing equations.",
  },
  {
    id: 4, title: "Quantum Mechanics Basics", category: "Physics", duration: "22:10",
    thumbnail: coursePhysics, instructor: "3Blue1Brown", rating: 4.9, views: "15.1K",
    completed: false, locked: false, youtubeId: "MzRCDLre1b4",
    description: "Dive into wave-particle duality, uncertainty principle, and quantum states.",
  },
  {
    id: 5, title: "DNA Structure & Replication", category: "Biology", duration: "16:55",
    thumbnail: courseAnatomy, instructor: "Amoeba Sisters", rating: 4.8, views: "7.6K",
    completed: false, locked: false, youtubeId: "TNKWgcFPHqw",
    description: "How DNA replicates and how the genetic code is transcribed into RNA.",
  },
  {
    id: 6, title: "Life & Death of Stars", category: "Astronomy", duration: "20:30",
    thumbnail: courseSolar, instructor: "Kurzgesagt", rating: 4.9, views: "11.3K",
    completed: false, locked: false, youtubeId: "HS0rlEr3Eqo",
    description: "The life cycle of stars — from nebula to supernova, neutron stars, and black holes.",
  },
  {
    id: 7, title: "Newton's Laws of Motion", category: "Physics", duration: "14:12",
    thumbnail: coursePhysics, instructor: "Veritasium", rating: 4.8, views: "18.7K",
    completed: false, locked: false, youtubeId: "kKKM8Y-u7ds",
    description: "Understand the three laws that govern all motion — from falling apples to rocket launches.",
  },
  {
    id: 9, title: "Photosynthesis Explained", category: "Biology", duration: "13:25",
    thumbnail: courseAnatomy, instructor: "CrashCourse", rating: 4.8, views: "9.1K",
    completed: false, locked: false, youtubeId: "sQK3Yr4Sc_k",
    description: "How plants convert sunlight, water, and CO₂ into glucose and oxygen.",
  },
  {
    id: 10, title: "The Human Heart & Circulation", category: "Biology", duration: "17:08",
    thumbnail: courseAnatomy, instructor: "Khan Academy", rating: 4.7, views: "8.4K",
    completed: false, locked: false, youtubeId: "CWFyxn0qDEU",
    description: "Anatomy of the heart, blood flow through chambers, and the cardiac cycle.",
  },
  {
    id: 11, title: "Black Holes Demystified", category: "Astronomy", duration: "19:45",
    thumbnail: courseSolar, instructor: "Kurzgesagt", rating: 4.9, views: "22.5K",
    completed: false, locked: false, youtubeId: "e-P5IFTqB98",
    description: "Event horizons, singularities, Hawking radiation, and supermassive black holes.",
  },
  {
    id: 12, title: "How Galaxies Form", category: "Astronomy", duration: "16:30",
    thumbnail: courseSolar, instructor: "PBS Space Time", rating: 4.8, views: "10.2K",
    completed: false, locked: false, youtubeId: "kybPmYjOMa4",
    description: "From dark matter halos to spiral arms — the cosmic story of galaxy formation.",
  },
  {
    id: 13, title: "Acids, Bases & pH", category: "Chemistry", duration: "12:50",
    thumbnail: courseChemistry, instructor: "TED-Ed", rating: 4.7, views: "7.3K",
    completed: false, locked: false, youtubeId: "vt8fB3MFzLk",
    description: "Understanding acidity, basicity, the pH scale, and neutralization reactions.",
  },
  {
    id: 14, title: "Organic Chemistry Basics", category: "Chemistry", duration: "21:15",
    thumbnail: courseChemistry, instructor: "Professor Dave Explains", rating: 4.8, views: "13.6K",
    completed: false, locked: false, youtubeId: "bSMx0NS0XfY",
    description: "Hydrocarbons, functional groups, and the chemistry of carbon compounds.",
  },
  {
    id: 15, title: "Electromagnetism Fundamentals", category: "Physics", duration: "18:55",
    thumbnail: coursePhysics, instructor: "Veritasium", rating: 4.9, views: "16.8K",
    completed: false, locked: false, youtubeId: "x1-SibwIPM4",
    description: "Electric fields, magnetic forces, and Maxwell's equations explained.",
  },
  {
    id: 16, title: "Special Relativity Simplified", category: "Physics", duration: "23:40",
    thumbnail: coursePhysics, instructor: "MinutePhysics", rating: 4.8, views: "12.1K",
    completed: false, locked: false, youtubeId: "ev9zrt__lec",
    description: "Time dilation, length contraction, and Einstein's famous E=mc².",
  },
  {
    id: 17, title: "Mitosis & Meiosis Compared", category: "Biology", duration: "14:20",
    thumbnail: courseAnatomy, instructor: "Amoeba Sisters", rating: 4.9, views: "11.7K",
    completed: false, locked: false, youtubeId: "f-ldPgEfAHI",
    description: "Side-by-side comparison of cell division for growth vs reproduction.",
  },
  {
    id: 18, title: "The Big Bang Theory", category: "Astronomy", duration: "17:55",
    thumbnail: courseSolar, instructor: "Kurzgesagt", rating: 4.8, views: "19.4K",
    completed: false, locked: false, youtubeId: "wNDGgL73ihY",
    description: "Origin of the universe — from singularity to cosmic microwave background.",
  },
  {
    id: 19, title: "States of Matter & Phase Changes", category: "Chemistry", duration: "10:30",
    thumbnail: courseChemistry, instructor: "CrashCourse", rating: 4.6, views: "5.8K",
    completed: false, locked: false, youtubeId: "pKvo0XWZtjo",
    description: "Solid, liquid, gas, plasma — and the energy involved in transitions.",
  },
  {
    id: 20, title: "Waves & Sound", category: "Physics", duration: "15:10",
    thumbnail: coursePhysics, instructor: "Khan Academy", rating: 4.7, views: "9.5K",
    completed: false, locked: false, youtubeId: "TfYCnOvNnFU",
    description: "Frequency, wavelength, amplitude, and the Doppler effect.",
  },
  {
    id: 21, title: "Genetics & Heredity", category: "Biology", duration: "16:42",
    thumbnail: courseAnatomy, instructor: "Bozeman Science", rating: 4.7, views: "8.9K",
    completed: false, locked: false, youtubeId: "Mehz7tCxjSE",
    description: "Mendelian inheritance, Punnett squares, dominant and recessive traits.",
  },
  {
    id: 22, title: "Mars: The Red Planet", category: "Astronomy", duration: "13:18",
    thumbnail: courseSolar, instructor: "NASA", rating: 4.8, views: "14.2K",
    completed: false, locked: false, youtubeId: "ZEyAs3NWH4A",
    description: "Geology, atmosphere, and the search for past life on Mars.",
  },
  {
    id: 23, title: "Stoichiometry Made Easy", category: "Chemistry", duration: "19:25",
    thumbnail: courseChemistry, instructor: "Tyler DeWitt", rating: 4.9, views: "21.3K",
    completed: false, locked: false, youtubeId: "WQDJOqddPI0",
    description: "Mole ratios, limiting reagents, and balancing chemical equations.",
  },
  {
    id: 24, title: "Thermodynamics: Heat & Energy", category: "Physics", duration: "20:48",
    thumbnail: coursePhysics, instructor: "CrashCourse", rating: 4.8, views: "10.7K",
    completed: false, locked: false, youtubeId: "8N1BxHgsoOw",
    description: "The four laws of thermodynamics and why entropy always increases.",
  },
];

const VideoLessons = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);

  const filtered = lessons.filter((l) => {
    const matchCat = activeCategory === "All" || l.category === activeCategory;
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const currentLesson = lessons.find((l) => l.id === playing);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="text-lg font-bold">Video Lessons</h1>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{lessons.length} lessons</Badge>
          </div>
          <div className="relative w-48 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lessons..."
              className="pl-9 rounded-[10px] bg-secondary/50 border-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* YouTube Player */}
        {playing !== null && currentLesson && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
            <div className="relative">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${currentLesson.youtubeId}?autoplay=1&rel=0`}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-3 right-3 rounded-full h-8 w-8 bg-card/80 backdrop-blur-sm"
                onClick={() => setPlaying(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{currentLesson.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                By {currentLesson.instructor} · {currentLesson.duration} · {currentLesson.views} views
              </p>
            </div>
          </motion.div>
        )}

        {/* Lessons Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((lesson, i) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className={`glass-card-hover overflow-hidden group ${lesson.locked ? "opacity-70" : "cursor-pointer"}`}
              onClick={() => !lesson.locked && setPlaying(lesson.id)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {lesson.locked ? (
                    <Lock className="h-8 w-8 text-primary-foreground" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                    </div>
                  )}
                </div>
                <Badge className="absolute top-2 left-2 bg-card/80 backdrop-blur-sm text-foreground border-0 text-[10px]">
                  {lesson.category}
                </Badge>
                <span className="absolute bottom-2 right-2 bg-foreground/80 text-background text-[10px] font-mono-data px-1.5 py-0.5 rounded">
                  {lesson.duration}
                </span>
                {lesson.completed && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-500 fill-green-500/20" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-semibold line-clamp-1">{lesson.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{lesson.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground">{lesson.instructor}</span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-primary text-primary" />{lesson.rating}
                    </span>
                    <span>{lesson.views} views</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No lessons found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLessons;
