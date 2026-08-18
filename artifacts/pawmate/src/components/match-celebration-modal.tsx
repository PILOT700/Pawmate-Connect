import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Heart, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

interface Profile {
  id: string;
  name: string;
  image: string;
  pet: { name: string };
}

interface MatchCelebrationModalProps {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
}

const COLORS = ["#b5c9a8", "#d4a96a", "#e8c5b0", "#a8c5b8", "#f0d9c8", "#c5b8d4", "#f5e6d0", "#8fad80"];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotate: number;
  scale: number;
  shape: "rect" | "circle" | "star";
  dx: number;
  dy: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: -(10 + Math.random() * 20),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotate: Math.random() * 360,
    scale: 0.4 + Math.random() * 0.8,
    shape: (["rect", "circle", "star"] as const)[Math.floor(Math.random() * 3)],
    dx: (Math.random() - 0.5) * 40,
    dy: 80 + Math.random() * 60,
    delay: Math.random() * 0.5,
  }));
}

function Confetti({ active }: { active: boolean }) {
  const [particles] = useState(() => generateParticles(60));

  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: `${p.y}vh`, rotate: 0, opacity: 1 }}
          animate={{
            x: `calc(${p.x}vw + ${p.dx}px)`,
            y: `calc(${p.y}vh + ${p.dy}vh)`,
            rotate: p.rotate + 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.8 + Math.random() * 0.8, delay: p.delay, ease: "easeOut" }}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {p.shape === "rect" && (
            <div
              style={{
                width: 10 * p.scale,
                height: 14 * p.scale,
                backgroundColor: p.color,
                borderRadius: 2,
              }}
            />
          )}
          {p.shape === "circle" && (
            <div
              style={{
                width: 10 * p.scale,
                height: 10 * p.scale,
                backgroundColor: p.color,
                borderRadius: "50%",
              }}
            />
          )}
          {p.shape === "star" && (
            <div style={{ fontSize: 14 * p.scale, lineHeight: 1, color: p.color }}>★</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function MatchCelebrationModal({ open, profile, onClose }: MatchCelebrationModalProps) {
  const t = useT();
  const [, navigate] = useLocation();
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    if (open) setConfettiKey(k => k + 1);
  }, [open]);

  const handleMessage = () => {
    onClose();
    navigate("/messages");
  };

  return (
    <AnimatePresence>
      {open && profile && (
        <motion.div
          key="match-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          data-testid="match-celebration-modal"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Confetti layer */}
          <Confetti key={confettiKey} active={open} />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 340, damping: 28, delay: 0.08 }}
            className="relative z-10 mx-4 w-full max-w-sm bg-card rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
              data-testid="btn-close-match-modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warm gradient header */}
            <div className="relative bg-gradient-to-br from-rose-50 via-amber-50 to-primary/10 pt-10 pb-6 px-6 flex flex-col items-center">

              {/* Avatar pair */}
              <div className="flex items-center justify-center mb-6">
                {/* Your avatar (placeholder) */}
                <motion.div
                  initial={{ x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
                  className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-secondary z-10"
                >
                  <img src="/profile1.png" alt="You" className="w-full h-full object-cover" />
                </motion.div>

                {/* Heart burst */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: [0, 1.3, 1], rotate: [0, -10, 0] }}
                  transition={{ delay: 0.35, duration: 0.55, ease: "easeOut" }}
                  className="relative z-20 -mx-3"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                  </div>
                </motion.div>

                {/* Their avatar */}
                <motion.div
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 24 }}
                  className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-secondary z-10"
                >
                  <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                </motion.div>
              </div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="text-center"
              >
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">{t("home.itsAMatch")}</p>
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  You & {profile.name} liked each other
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  You both have great taste. Say hello and see where it goes 🐾
                </p>
              </motion.div>
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="p-6 space-y-3"
            >
              <Button
                onClick={handleMessage}
                className="w-full h-12 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm"
                data-testid="btn-send-first-message"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send {profile.name} a message
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full h-12 rounded-full text-muted-foreground text-sm"
                data-testid="btn-keep-discovering"
              >
                Keep discovering
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
