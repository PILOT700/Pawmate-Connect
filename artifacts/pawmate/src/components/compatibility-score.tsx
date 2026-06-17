import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PawPrint, Heart, Sun, Sparkles } from "lucide-react";

export interface CompatibilityInput {
  theirPetSpecies: string;
  theirLifestyle: string[];
  theirLookingFor: string;
  theirTraits: string[];
}

const YOUR_PET = "Cat";
const YOUR_LIFESTYLE = ["Morning person", "Homebody", "Coffee enthusiast", "Creative", "Outdoorsy"];
const YOUR_LOOKING_FOR = "Friendship";

const PET_COMPAT: Record<string, Record<string, number>> = {
  Cat: { Cat: 95, Dog: 72, Rabbit: 80, Bird: 68, Fish: 60, Other: 70 },
  Dog: { Dog: 92, Cat: 72, Rabbit: 75, Bird: 65, Fish: 58, Other: 68 },
  Rabbit: { Rabbit: 90, Cat: 80, Dog: 75, Bird: 70, Fish: 62, Other: 72 },
  Bird: { Bird: 88, Cat: 68, Dog: 65, Rabbit: 70, Fish: 64, Other: 66 },
  Fish: { Fish: 85, Cat: 60, Dog: 58, Rabbit: 62, Bird: 64, Other: 60 },
  Other: { Other: 80, Cat: 70, Dog: 68, Rabbit: 72, Bird: 66, Fish: 60 },
};

const INTENT_COMPAT: Record<string, Record<string, number>> = {
  Friendship: { Friendship: 100, Relationship: 65, "Pet playdates": 85, "Casual meetups": 90, "Open to anything": 88 },
  Relationship: { Relationship: 100, Friendship: 65, "Pet playdates": 70, "Casual meetups": 75, "Open to anything": 90 },
  "Pet playdates": { "Pet playdates": 100, Friendship: 85, Relationship: 70, "Casual meetups": 80, "Open to anything": 85 },
  "Casual meetups": { "Casual meetups": 100, Friendship: 90, Relationship: 75, "Pet playdates": 80, "Open to anything": 88 },
  "Open to anything": { "Open to anything": 100, Friendship: 88, Relationship: 90, "Pet playdates": 85, "Casual meetups": 88 },
};

function calcLifestyleScore(theirLifestyle: string[]): number {
  if (!theirLifestyle.length) return 60;
  const common = theirLifestyle.filter(t => YOUR_LIFESTYLE.includes(t)).length;
  const ratio = common / Math.max(YOUR_LIFESTYLE.length, theirLifestyle.length);
  return Math.round(50 + ratio * 50);
}

function calcScore(input: CompatibilityInput) {
  const petScore = PET_COMPAT[YOUR_PET]?.[input.theirPetSpecies] ?? 65;
  const lifestyleScore = calcLifestyleScore(input.theirLifestyle);
  const intentScore = INTENT_COMPAT[YOUR_LOOKING_FOR]?.[input.theirLookingFor] ?? 70;
  const traitBonus = input.theirTraits.length >= 2 ? 5 : 0;
  const total = Math.round(petScore * 0.35 + lifestyleScore * 0.35 + intentScore * 0.25 + traitBonus * 0.05);
  return { total: Math.min(total, 99), petScore, lifestyleScore, intentScore };
}

function label(score: number) {
  if (score >= 90) return { text: "Paw-fect match!", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
  if (score >= 78) return { text: "Great companions", color: "text-primary", bg: "bg-primary/10 border-primary/25" };
  if (score >= 65) return { text: "Worth exploring", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
  return { text: "Different worlds", color: "text-muted-foreground", bg: "bg-secondary border-border" };
}

function Arc({ score, size = 120 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const startAngle = -210;
  const sweepAngle = 240;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const describeArc = (pct: number) => {
    const sweep = (sweepAngle * pct) / 100;
    const start = toRad(startAngle);
    const end = toRad(startAngle + sweep);
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 1100;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setAnimated(Math.round(eased * score));
      if (pct < 1) frame = requestAnimationFrame(animate);
    };
    const t = setTimeout(() => { frame = requestAnimationFrame(animate); }, 320);
    return () => { clearTimeout(t); cancelAnimationFrame(frame); };
  }, [score]);

  const strokeColor = score >= 90 ? "#4ade80" : score >= 78 ? "#8fad80" : score >= 65 ? "#d97706" : "#94a3b8";

  return (
    <svg width={size} height={size} className="drop-shadow-sm">
      <path d={describeArc(100)} fill="none" stroke="#e8e2d9" strokeWidth={size * 0.072} strokeLinecap="round" />
      <path d={describeArc(animated)} fill="none" stroke={strokeColor} strokeWidth={size * 0.072} strokeLinecap="round" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill={strokeColor} fontFamily="serif">
        {animated}
      </text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fontSize={size * 0.1} fill="#94a3b8" fontFamily="sans-serif">
        / 100
      </text>
    </svg>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

export function CompatibilityScore({ input }: { input: CompatibilityInput }) {
  const { total, petScore, lifestyleScore, intentScore } = calcScore(input);
  const badge = label(total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={`rounded-[1.75rem] border p-6 ${badge.bg}`}
      data-testid="compatibility-score"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">Pet Compatibility</p>
      </div>

      {/* Arc + label */}
      <div className="flex flex-col items-center mb-6">
        <Arc score={total} size={130} />
        <span className={`mt-2 text-sm font-semibold ${badge.color}`}>{badge.text}</span>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PawPrint className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Pet compatibility</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{petScore}%</span>
          </div>
          <Bar value={petScore} color="bg-primary" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Lifestyle match</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{lifestyleScore}%</span>
          </div>
          <Bar value={lifestyleScore} color="bg-amber-400" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">What you seek</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{intentScore}%</span>
          </div>
          <Bar value={intentScore} color="bg-rose-400" />
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/70 text-center mt-5 leading-relaxed">
        Score based on pet type, lifestyle, and what you're both looking for
      </p>
    </motion.div>
  );
}
