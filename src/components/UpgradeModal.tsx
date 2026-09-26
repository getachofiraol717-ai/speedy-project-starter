import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, Check } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: "3d" | "ai";
}

const UpgradeModal = ({ open, onClose, feature }: UpgradeModalProps) => {
  const config = {
    "3d": {
      title: "3D Lab limit reached",
      desc: "Free accounts can explore 3 interactive 3D labs. Upgrade to Pro for unlimited access to all 14+ labs.",
      perks: ["Unlimited 3D labs", "Unlimited AI Tutor questions", "All future labs included", "Priority support"],
    },
    ai: {
      title: "AI Tutor limit reached",
      desc: "You've used your 5 free AI questions. Upgrade to Pro for unlimited AI tutoring.",
      perks: ["Unlimited AI questions", "All 3D labs unlocked", "Real-time streaming answers", "Priority support"],
    },
  }[feature];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription className="pt-1">{config.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {config.perks.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>{p}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Maybe later</Button>
          <Link to="/pricing" className="flex-1" onClick={onClose}>
            <Button className="w-full">View Pricing</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
