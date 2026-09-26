import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, X, LogOut, LayoutDashboard, Sparkles, BookOpen, Trophy, Settings, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import logo from "/favicon.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const marketingLinks = [
    { label: "Features", href: "#features" },
    { label: "Courses", href: "#courses" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  const appLinks = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "3D Labs", to: "/3d", icon: Sparkles },
    { label: "Videos", to: "/videos", icon: BookOpen },
    { label: "Quizzes", to: "/quizzes", icon: Trophy },
    { label: "Settings", to: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Signed out", description: "See you soon!" });
    setOpen(false);
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img src={logo} alt="SmartStudy3D logo" width={32} height={32} className="h-8 w-8 rounded-[10px] glow-primary" />
          <span className="text-lg font-semibold tracking-tight">SmartStudy3D</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {marketingLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button onClick={handleLogout} size="sm" variant="outline" className="rounded-[10px]">
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/signup"><Button size="sm" className="rounded-[10px] glow-primary">Get Started</Button></Link>
            </>
          )}
        </div>

        {/* Mobile actions (no 3-dot — simpler buttons) */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <Button onClick={handleLogout} size="sm" variant="outline" className="rounded-[10px] h-8 px-2.5">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs">Log in</Button></Link>
              <Link to="/signup"><Button size="sm" className="rounded-[10px] h-8 px-3 text-xs">Start</Button></Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
