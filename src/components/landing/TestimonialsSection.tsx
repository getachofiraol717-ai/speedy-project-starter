import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    text: "The 3D anatomy models completely changed how I study. Being able to rotate and explore structures in real-time is a game-changer.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Physics Teacher",
    text: "I use SmartStudy3D to create interactive lessons for my students. The AI quiz generator saves me hours of prep time every week.",
    rating: 5,
  },
  {
    name: "Anika Patel",
    role: "High School Student",
    text: "The AI Tutor explains things in a way that actually makes sense. It's like having a personal teacher available 24/7.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-medium text-primary mb-3">Testimonials</p>
          <h2 className="text-4xl font-bold tracking-tighter mb-4">
            Trusted by <span className="text-gradient-primary">learners worldwide.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
