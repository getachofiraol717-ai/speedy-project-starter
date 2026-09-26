import { motion } from "framer-motion";
import { Brain, Box, MessageSquare, Trophy, Video, Shield } from "lucide-react";

const features = [
  {
    icon: Box,
    title: "Interactive 3D Models",
    description: "Explore anatomy, solar systems, molecules, and more with fully interactive 3D visualizations you can rotate, zoom, and annotate.",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    description: "Get personalized explanations, study plans, and instant answers from an AI that adapts to your learning style.",
  },
  {
    icon: MessageSquare,
    title: "Adaptive Quizzes",
    description: "AI-generated quizzes that adjust difficulty based on your performance, with instant feedback and detailed explanations.",
  },
  {
    icon: Video,
    title: "Video Integration",
    description: "Curated YouTube content with timestamped notes, playlists, and smart recommendations tied to your curriculum.",
  },
  {
    icon: Trophy,
    title: "Gamification & XP",
    description: "Earn experience points, maintain streaks, unlock badges, and climb leaderboards as you master new subjects.",
  },
  {
    icon: Shield,
    title: "Verified Certificates",
    description: "Receive auto-generated, shareable certificates upon course completion with a unique verification system.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-medium text-primary mb-3">Platform Features</p>
          <h2 className="text-4xl font-bold tracking-tighter mb-4">
            Everything you need to learn,{" "}
            <span className="text-gradient-primary">reimagined.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A unified platform combining spatial learning, AI tutoring, and gamification into one seamless experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card-hover p-6 group"
            >
              <div className="h-10 w-10 rounded-[10px] bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
