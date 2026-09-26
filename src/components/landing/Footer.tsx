import { Link } from "react-router-dom";
import logo from "/favicon.png";

const Footer = () => {
  const columns = [
    {
      title: "Platform",
      links: ["Courses", "AI Tutor", "3D Models", "Quizzes", "Pricing"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Press", "Contact"],
    },
    {
      title: "Support",
      links: ["Help Center", "Community", "Status", "Privacy", "Terms"],
    },
  ];

  return (
    <footer className="border-t border-border/50 bg-secondary/20">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="SmartStudy3D logo" width={32} height={32} loading="lazy" className="h-8 w-8 rounded-[10px]" />
              <span className="text-lg font-semibold tracking-tight">SmartStudy3D</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Master the complex, in three dimensions. AI-powered learning for the next generation.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2026 SmartStudy3D. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Discord</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
