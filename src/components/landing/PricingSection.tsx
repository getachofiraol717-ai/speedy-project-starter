import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free Trial",
    price: "0",
    currency: "ETB",
    period: "7 days",
    description: "Try the basics for free",
    features: ["3 free courses", "Basic AI Tutor", "Community access", "Progress tracking"],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Individual",
    price: "120",
    currency: "ETB",
    period: "/month",
    description: "Full access for students",
    features: ["All 3D models", "Advanced AI Tutor", "Unlimited quizzes", "Certificates", "Video lessons", "Study planner"],
    cta: "Get Started",
    featured: true,
  },
  {
    name: "School",
    price: "10,000",
    currency: "ETB",
    period: "one-time",
    description: "For schools and institutions",
    features: ["Everything in Individual", "Unlimited students", "Admin dashboard", "Analytics", "Teacher tools", "Priority support"],
    cta: "Contact Us",
    featured: false,
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-20 px-4 sm:px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter">Simple, Affordable Pricing</h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Pay with Chapa or TeleBirr. Start learning today.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <div className={`glass-card p-6 h-full flex flex-col ${p.featured ? "ring-2 ring-primary relative" : ""}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">Most Popular</span>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.currency}</span>
                <span className="text-xs text-muted-foreground ml-1">{p.period}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{p.description}</p>
              <ul className="mt-5 space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="mt-6 block">
                <Button className="w-full rounded-xl" variant={p.featured ? "default" : "outline"}>{p.cta}</Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
