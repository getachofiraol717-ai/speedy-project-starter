import { motion } from "framer-motion";
import { ArrowLeft, Check, GraduationCap, User, School } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const plans = [
  {
    id: "individual",
    name: "Individual",
    price: "120",
    period: "per month",
    icon: User,
    badge: "Popular",
    description: "Perfect for self-learners and students preparing for entrance exams.",
    features: [
      "All 3D interactive models",
      "AI Tutor access",
      "Unlimited quizzes",
      "Video lessons library",
      "Progress tracking",
      "Downloadable certificates",
    ],
  },
  {
    id: "school",
    name: "School License",
    price: "10,000",
    period: "one-time",
    icon: School,
    badge: "Best Value",
    description: "Full access for your entire school. Unlimited students and teachers.",
    features: [
      "Everything in Individual",
      "Unlimited student accounts",
      "Teacher admin dashboard",
      "Class progress analytics",
      "Priority support",
      "Custom branding option",
      "1 year full access",
    ],
  },
];

const PricingPage = () => {
  const handlePayment = async (planId: string) => {
    try {
      toast.loading("Redirecting to Chapa...");

      const amount = planId === "individual" ? 120 : 10000;
      const txRef = `TX-${planId}-${Date.now()}`;

      // Chapa checkout URL
      const chapaUrl = `https://checkout.chapa.co/checkout/payment/${txRef}`;

      // For now, show transfer instructions since we need API key for full integration
      toast.dismiss();
      toast.success("Payment Instructions", {
        description: `Transfer ${amount} ETB to 0930164845 via Chapa/TeleBirr. Reference: ${txRef}`,
        duration: 15000,
      });
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border/50 flex items-center px-6 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-sm font-semibold ml-3">Pricing</h1>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">💰 Simple Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Start Learning Today
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Choose the plan that works for you. Pay easily with Chapa or TeleBirr.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className={`relative overflow-hidden h-full ${plan.id === "school" ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
                {plan.badge && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground border-0 text-[10px]">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <plan.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">ETB</span>
                    <span className="text-xs text-muted-foreground ml-1">/ {plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full rounded-xl"
                    variant={plan.id === "school" ? "default" : "outline"}
                    onClick={() => handlePayment(plan.id)}
                  >
                    Pay with Chapa
                  </Button>
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">
                      Or transfer to <span className="font-bold text-foreground">0930164845</span> via TeleBirr/Chapa
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-6 bg-card/50 rounded-2xl border border-border"
        >
          <GraduationCap className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-sm mb-1">Need Help?</h3>
          <p className="text-xs text-muted-foreground">
            Contact us on Telegram or call <span className="font-semibold text-foreground">0930164845</span> for payment assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
