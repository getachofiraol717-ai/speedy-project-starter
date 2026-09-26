import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-3d.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }} />

      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
            AI-Powered 3D Learning Platform
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
            Master the complex,{" "}
            <span className="text-gradient-primary">in three dimensions.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            An AI-powered educational ecosystem where interactive 3D models, personalized tutoring, and adaptive quizzes converge to transform how you learn.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/signup">
              <Button size="lg" className="rounded-[10px] glow-primary gap-2 text-base px-8">
                Start Learning Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-[10px] gap-2 text-base px-8">
              <Play className="h-4 w-4" /> Watch Demo
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-4">
            <div>
              <p className="text-2xl font-bold font-mono-data">50K+</p>
              <p className="text-xs text-muted-foreground">Active Students</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold font-mono-data">200+</p>
              <p className="text-xs text-muted-foreground">3D Models</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold font-mono-data">4.9</p>
              <p className="text-xs text-muted-foreground">User Rating</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden glow-primary">
            <img src={heroImg} alt="Interactive 3D learning visualization" className="w-full object-cover aspect-video" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="glass-card px-3 py-1.5 text-xs font-mono-data">
                Interactive 3D • Real-time
              </div>
            </div>
          </div>
          <div className="absolute -z-10 inset-0 blur-3xl opacity-20 bg-gradient-to-r from-primary to-accent rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
