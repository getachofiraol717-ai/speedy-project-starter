import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import courseSolar from "@/assets/course-solar.jpg";
import courseChemistry from "@/assets/course-chemistry.jpg";
import coursePhysics from "@/assets/course-physics.jpg";

const courses = [
  {
    title: "Solar System Explorer",
    category: "Astronomy",
    rating: "4.9",
    students: "12.4K",
    image: courseSolar,
    tag: "3D Interactive",
  },
  {
    title: "Molecular Chemistry",
    category: "Chemistry",
    rating: "4.8",
    students: "8.2K",
    image: courseChemistry,
    tag: "AI Tutor",
  },
  {
    title: "Quantum Physics Lab",
    category: "Physics",
    rating: "4.7",
    students: "6.1K",
    image: coursePhysics,
    tag: "Video + 3D",
  },
];

const CoursesPreview = () => {
  return (
    <section id="courses" className="py-24 bg-secondary/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-medium text-primary mb-3">Popular Courses</p>
          <h2 className="text-4xl font-bold tracking-tighter mb-4">
            Explore the <span className="text-gradient-primary">deep dive.</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            From the cosmos to the quantum realm — immersive courses built for spatial understanding.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card-hover overflow-hidden cursor-pointer group"
            >
              <div className="relative aspect-video overflow-hidden">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 rounded-[10px] text-xs">
                  {c.tag}
                </Badge>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-1">{c.category}</p>
                <h3 className="font-semibold tracking-tight mb-3">{c.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="font-mono-data text-xs">{c.rating}</span>
                  </div>
                  <span className="font-mono-data text-xs text-muted-foreground">{c.students} students</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesPreview;
