import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PawPrint, Heart, Sun, Sparkles } from "lucide-react";
import {
  useGetMyProfile,
  useListMyPets,
  getGetMyProfileQueryKey,
  getListMyPetsQueryKey,
  type LookingFor,
  type Species,
} from "@workspace/api-client-react";
import { useT } from "@/lib/i18n";

export interface CompatibilityInput {
  theirPetSpecies?: Species;
  theirLifestyle: string[];
  theirLookingFor: LookingFor[];
  theirTraits: string[];
}

export interface CompatibilityScores {
  total: number;
  petScore: number;
  lifestyleScore: number;
  intentScore: number;
}

// Keyed by the API's Species values, which are lowercase.
const PET_COMPAT: Record<string, Record<string, number>> = {
  dog: { dog: 92, cat: 72, rabbit: 75, bird: 65, fish: 58, other: 68 },
  cat: { cat: 95, dog: 72, rabbit: 80, bird: 68, fish: 60, other: 70 },
  rabbit: { rabbit: 90, cat: 80, dog: 75, bird: 70, fish: 62, other: 72 },
  bird: { bird: 88, cat: 68, dog: 65, rabbit: 70, fish: 64, other: 66 },
  fish: { fish: 85, cat: 60, dog: 58, rabbit: 62, bird: 64, other: 60 },
  other: { other: 80, cat: 70, dog: 68, rabbit: 72, bird: 66, fish: 60 },
};

/**
 * Scores how well two members line up. Both sides come from real profile
 * data — there is no assumed baseline for the viewer.
 */
export function calcCompatScore(opts: {
  myPetSpecies?: Species;
  myLifestyle: string[];
  myLookingFor: LookingFor[];
  theirPetSpecies?: Species;
  theirLifestyle: string[];
  theirLookingFor: LookingFor[];
  theirTraits?: string[];
}): CompatibilityScores {
  const petScore =
    opts.myPetSpecies && opts.theirPetSpecies
      ? (PET_COMPAT[opts.myPetSpecies]?.[opts.theirPetSpecies] ?? 65)
      : 65;

  const common = opts.theirLifestyle.filter((t) => opts.myLifestyle.includes(t)).length;
  const lifestyleScore = opts.theirLifestyle.length
    ? Math.round(50 + (common / Math.max(opts.myLifestyle.length, opts.theirLifestyle.length, 1)) * 50)
    : 60;

  const sharedIntent = opts.theirLookingFor.some((v) => opts.myLookingFor.includes(v));
  const intentScore = sharedIntent ? 92 : 70;

  const traitBonus = (opts.theirTraits?.length ?? 0) >= 2 ? 5 : 0;
  const total = Math.round(
    petScore * 0.35 + lifestyleScore * 0.35 + intentScore * 0.25 + traitBonus * 0.05,
  );

  return { total: Math.min(total, 99), petScore, lifestyleScore, intentScore };
}

function label(score: number) {
  if (score >= 90) return { key: "compat.perfect" as const, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
  if (score >= 78) return { key: "compat.great" as const, color: "text-primary", bg: "bg-primary/10 border-primary/25" };
  if (score >= 65) return { key: "compat.worth" as const, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
  return { key: "compat.different" as const, color: "text-muted-foreground", bg: "bg-secondary border-border" };
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
  const t = useT();
  const { data: me } = useGetMyProfile({ query: { queryKey: getGetMyProfileQueryKey() } });
  const { data: myPets } = useListMyPets({ query: { queryKey: getListMyPetsQueryKey() } });

  const { total, petScore, lifestyleScore, intentScore } = calcCompatScore({
    myPetSpecies: myPets?.[0]?.species,
    myLifestyle: me?.lifestyleTags ?? [],
    myLookingFor: me?.lookingFor ?? [],
    theirPetSpecies: input.theirPetSpecies,
    theirLifestyle: input.theirLifestyle,
    theirLookingFor: input.theirLookingFor,
    theirTraits: input.theirTraits,
  });
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
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">{t("compat.heading")}</p>
      </div>

      {/* Arc + label */}
      <div className="flex flex-col items-center mb-6">
        <Arc score={total} size={130} />
        <span className={`mt-2 text-sm font-semibold ${badge.color}`}>{t(badge.key)}</span>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PawPrint className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">{t("compat.petCompat")}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{petScore}%</span>
          </div>
          <Bar value={petScore} color="bg-primary" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">{t("compat.lifestyle")}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{lifestyleScore}%</span>
          </div>
          <Bar value={lifestyleScore} color="bg-amber-400" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">{t("compat.seeking")}</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{intentScore}%</span>
          </div>
          <Bar value={intentScore} color="bg-rose-400" />
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/70 text-center mt-5 leading-relaxed">
        {t("compat.basis")}
      </p>
    </motion.div>
  );
}
