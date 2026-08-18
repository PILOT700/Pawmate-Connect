import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Dog, Cat, Rabbit, Bird, Fish, Heart, Users, Coffee, Sparkles, MapPin, ChevronRight, Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useUpdateMyPreferences,
  useGetMyPreferences,
  useListMyPets,
  getGetMyPreferencesQueryKey,
  getListMyPetsQueryKey,
  type Species,
  type LookingFor,
  type UserPreferences,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";
import { rememberOnboardingPetSpecies } from "@/lib/onboarding-pet";
import { useT, type TranslationKey } from "@/lib/i18n";

const TOTAL_STEPS = 4;

const PET_OPTIONS = [
  { id: "dog", labelKey: "species.dog" as const, emoji: "🐕", icon: Dog, color: "bg-amber-50 border-amber-200 text-amber-700", activeColor: "bg-amber-100 border-amber-500 text-amber-800" },
  { id: "cat", labelKey: "species.cat" as const, emoji: "🐈", icon: Cat, color: "bg-rose-50 border-rose-200 text-rose-700", activeColor: "bg-rose-100 border-rose-500 text-rose-800" },
  { id: "rabbit", labelKey: "species.rabbit" as const, emoji: "🐇", icon: Rabbit, color: "bg-violet-50 border-violet-200 text-violet-700", activeColor: "bg-violet-100 border-violet-500 text-violet-800" },
  { id: "bird", labelKey: "species.bird" as const, emoji: "🐦", icon: Bird, color: "bg-sky-50 border-sky-200 text-sky-700", activeColor: "bg-sky-100 border-sky-500 text-sky-800" },
  { id: "fish", labelKey: "species.fish" as const, emoji: "🐠", icon: Fish, color: "bg-teal-50 border-teal-200 text-teal-700", activeColor: "bg-teal-100 border-teal-500 text-teal-800" },
  { id: "other", labelKey: "species.other" as const, emoji: "🐾", icon: PawPrint, color: "bg-secondary border-border text-foreground", activeColor: "bg-primary/10 border-primary text-primary" },
];

const LOOKING_FOR_OPTIONS = [
  { id: "relationship", labelKey: "intent.relationship" as const, bodyKey: "intent.relationshipBody" as const, icon: Heart, color: "rose" },
  { id: "friendship", labelKey: "intent.friendship" as const, bodyKey: "intent.friendshipBody" as const, icon: Users, color: "primary" },
  { id: "playdates", labelKey: "intent.playdates" as const, bodyKey: "intent.playdatesBody" as const, icon: PawPrint, color: "amber" },
  { id: "casual", labelKey: "intent.casual" as const, bodyKey: "intent.casualBody" as const, icon: Coffee, color: "teal" },
  { id: "open", labelKey: "intent.open" as const, bodyKey: "intent.openBody" as const, icon: Sparkles, color: "violet" },
];

const DISTANCES = [10, 25, 50, 100, 200];

/** Shared by the two species questions: the pet you have, the pets you want. */
function PetGrid({
  selected,
  onToggle,
  testIdPrefix,
  t,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  testIdPrefix: string;
  t: (k: TranslationKey) => string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {PET_OPTIONS.map((pet, i) => {
        const isSelected = selected.includes(pet.id);
        return (
          <motion.button
            key={pet.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            onClick={() => onToggle(pet.id)}
            data-testid={`${testIdPrefix}-${pet.id}`}
            className={`relative border-2 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-150 ${
              isSelected ? pet.activeColor + " shadow-sm scale-[1.02]" : pet.color + " hover:opacity-80"
            }`}
          >
            <span className="text-3xl">{pet.emoji}</span>
            <span className="text-sm font-medium">{t(pet.labelKey)}</span>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 24 : 8, opacity: i <= current ? 1 : 0.3 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`h-2 rounded-full ${i <= current ? "bg-primary" : "bg-border"}`}
        />
      ))}
    </div>
  );
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

/**
 * Mounted only once preferences are loaded, so the pickers can start on the
 * saved values instead of being filled in after the first paint.
 */
function OnboardingSteps({
  preferences,
  myPetSpecies,
  isEditing,
}: {
  preferences: UserPreferences;
  myPetSpecies: Species[];
  isEditing: boolean;
}) {
  const [, navigate] = useLocation();
  const { refreshSession } = useAuth();
  const { toast } = useToast();
  const t = useT();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // "What's your pet?" is answered about the pets you own, so it restores from
  // the pet records themselves rather than from discovery preferences.
  const [pets, setPets] = useState<string[]>(myPetSpecies);
  // Distinct from the above: owning a cat says nothing about who you'd date.
  const [meetPets, setMeetPets] = useState<string[]>(preferences.petTypePrefs ?? []);
  const [lookingFor, setLookingFor] = useState<string[]>(preferences.lookingForPrefs ?? []);
  const [distance, setDistance] = useState(preferences.maxDistanceKm ?? 50);
  const [ageRange, setAgeRange] = useState([
    preferences.ageRangeMin ?? 25,
    preferences.ageRangeMax ?? 55,
  ]);

  const savePreferences = useUpdateMyPreferences();

  // PET_OPTIONS / LOOKING_FOR_OPTIONS ids are already the API enum values.
  const handleFinish = async () => {
    try {
      await savePreferences.mutateAsync({
        data: {
          petTypePrefs: meetPets as Species[],
          lookingForPrefs: lookingFor as LookingFor[],
          maxDistanceKm: distance,
          ageRangeMin: ageRange[0]!,
          ageRangeMax: ageRange[1]!,
        },
      });
      // The pet itself is created a screen later, in the profile wizard; hand
      // the answer over so nobody is asked the same question twice.
      rememberOnboardingPetSpecies(pets[0] as Species | undefined);
      // The server stamps onboardingCompletedAt on this call, so the cached
      // session must be refreshed before we route off it.
      await refreshSession();
      navigate(isEditing ? "/settings" : "/create-profile");
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("onboarding.couldNotSave"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const togglePet = (id: string) =>
    setPets(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const toggleMeetPet = (id: string) =>
    setMeetPets(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const toggleLooking = (id: string) =>
    setLookingFor(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const canNext = [
    pets.length > 0,
    meetPets.length > 0,
    lookingFor.length > 0,
    true,
  ][step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-10"
      >
        <PawPrint className="w-6 h-6 text-primary" />
        <span className="font-serif text-xl font-semibold text-foreground">Pawmate</span>
      </motion.div>

      {/* Card */}
      <div className="w-full max-w-lg">
        <ProgressDots current={step} />

        <div className="mt-8 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >

              {/* ── Step 1: Pet type ── */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-5xl block mb-4"
                    >🐾</motion.span>
                    <h2 className="font-serif text-3xl font-semibold text-foreground">{t("onboarding.yourPet")}</h2>
                    <p className="text-muted-foreground text-sm mt-2">{t("onboarding.yourPetHint")}</p>
                  </div>
                  <PetGrid selected={pets} onToggle={togglePet} testIdPrefix="pet-option" t={t} />
                </div>
              )}

              {/* ── Step 2: Which pets you want to be shown ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-5xl block mb-4"
                    >💞</motion.span>
                    <h2 className="font-serif text-3xl font-semibold text-foreground">{t("onboarding.whoToMeet")}</h2>
                    <p className="text-muted-foreground text-sm mt-2">{t("onboarding.whoToMeetHint")}</p>
                  </div>
                  <PetGrid selected={meetPets} onToggle={toggleMeetPet} testIdPrefix="meet-option" t={t} />
                </div>
              )}

              {/* ── Step 3: What are you looking for ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-5xl block mb-4"
                    >💫</motion.span>
                    <h2 className="font-serif text-3xl font-semibold text-foreground">{t("onboarding.lookingFor")}</h2>
                    <p className="text-muted-foreground text-sm mt-2">{t("onboarding.lookingForHint")}</p>
                  </div>
                  <div className="space-y-3">
                    {LOOKING_FOR_OPTIONS.map((opt, i) => {
                      const selected = lookingFor.includes(opt.id);
                      const Icon = opt.icon;
                      const colorMap: Record<string, string> = {
                        rose: "bg-rose-50 border-rose-200",
                        primary: "bg-primary/5 border-primary/30",
                        amber: "bg-amber-50 border-amber-200",
                        teal: "bg-teal-50 border-teal-200",
                        violet: "bg-violet-50 border-violet-200",
                      };
                      const iconColorMap: Record<string, string> = {
                        rose: "text-rose-500 bg-rose-100",
                        primary: "text-primary bg-primary/10",
                        amber: "text-amber-600 bg-amber-100",
                        teal: "text-teal-600 bg-teal-100",
                        violet: "text-violet-500 bg-violet-100",
                      };
                      return (
                        <motion.button
                          key={opt.id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.06 * i }}
                          onClick={() => toggleLooking(opt.id)}
                          data-testid={`looking-option-${opt.id}`}
                          className={`w-full border-2 rounded-2xl p-4 flex items-center gap-4 text-left transition-all duration-150 ${
                            selected
                              ? colorMap[opt.color] + " shadow-sm"
                              : "bg-card border-border hover:border-primary/30"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            selected ? iconColorMap[opt.color] : "bg-secondary text-muted-foreground"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{t(opt.labelKey)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t(opt.bodyKey)}</p>
                          </div>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Step 4: Discovery preferences ── */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-5xl block mb-4"
                    >🗺️</motion.span>
                    <h2 className="font-serif text-3xl font-semibold text-foreground">{t("onboarding.preferences")}</h2>
                    <p className="text-muted-foreground text-sm mt-2">{t("onboarding.preferencesHint")}</p>
                  </div>

                  {/* Distance */}
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">{t("onboarding.maxDistance")}</p>
                      <span className="ml-auto text-sm font-semibold text-primary">{distance} km</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {DISTANCES.map(d => (
                        <button
                          key={d}
                          onClick={() => setDistance(d)}
                          data-testid={`distance-${d}`}
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                            distance === d
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40"
                          }`}
                        >{d} km</button>
                      ))}
                    </div>
                  </div>

                  {/* Age range */}
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">{t("onboarding.ageRange")}</p>
                      <span className="ml-auto text-sm font-semibold text-primary">{ageRange[0]}–{ageRange[1]}</span>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{t("onboarding.from")}</span>
                          <span>{ageRange[0]} {t("onboarding.years")}</span>
                        </div>
                        <input
                          type="range"
                          min={18} max={ageRange[1] - 1} value={ageRange[0]}
                          onChange={e => setAgeRange([Number(e.target.value), ageRange[1]])}
                          data-testid="age-min-slider"
                          className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{t("onboarding.to")}</span>
                          <span>{ageRange[1]} {t("onboarding.years")}</span>
                        </div>
                        <input
                          type="range"
                          min={ageRange[0] + 1} max={80} value={ageRange[1]}
                          onChange={e => setAgeRange([ageRange[0], Number(e.target.value)])}
                          data-testid="age-max-slider"
                          className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary of selections */}
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">{t("onboarding.yourSetup")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {/* Two species lists sit side by side here, so each is
                          prefixed — otherwise "🐈 Cat" reads both ways. */}
                      {pets.map(p => {
                        const opt = PET_OPTIONS.find(o => o.id === p);
                        return opt ? <span key={`mine-${p}`} className="text-xs bg-white border border-border rounded-full px-2.5 py-1">{t("onboarding.yours")}: {opt.emoji} {t(opt.labelKey)}</span> : null;
                      })}
                      {meetPets.map(p => {
                        const opt = PET_OPTIONS.find(o => o.id === p);
                        return opt ? <span key={`meet-${p}`} className="text-xs bg-white border border-border rounded-full px-2.5 py-1">{t("onboarding.meeting")}: {opt.emoji} {t(opt.labelKey)}</span> : null;
                      })}
                      {lookingFor.map(l => {
                        const opt = LOOKING_FOR_OPTIONS.find(o => o.id === l);
                        return opt ? <span key={l} className="text-xs bg-white border border-border rounded-full px-2.5 py-1">{t(opt.labelKey)}</span> : null;
                      })}
                      <span className="text-xs bg-white border border-border rounded-full px-2.5 py-1">
                        📍 {distance} km · {ageRange[0]}–{ageRange[1]} {t("onboarding.years")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => go(step - 1)}
              className="flex-1 h-12 rounded-full"
              data-testid="btn-back"
            >
              {t("onboarding.back")}
            </Button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <Button
              onClick={() => go(step + 1)}
              disabled={!canNext}
              className="flex-1 h-12 rounded-full bg-primary text-primary-foreground shadow-sm"
              data-testid="btn-next"
            >
              {t("onboarding.continue")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={savePreferences.isPending}
              className="flex-1 h-12 rounded-full bg-primary text-primary-foreground shadow-sm"
              data-testid="btn-finish"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {savePreferences.isPending ? t("onboarding.saving") : t("onboarding.finish")}
            </Button>
          )}
        </div>

        {step === 0 && (
          <p className="text-center text-xs text-muted-foreground/60 mt-4">
            {t("onboarding.underAMinute")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { user } = useAuth();
  const { data: preferences, isLoading } = useGetMyPreferences({
    query: { queryKey: getGetMyPreferencesQueryKey() },
  });
  const { data: myPets, isLoading: petsLoading } = useListMyPets({
    query: { queryKey: getListMyPetsQueryKey() },
  });

  if (isLoading || petsLoading || !preferences) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <OnboardingSteps
      preferences={preferences}
      myPetSpecies={[...new Set((myPets ?? []).map(p => p.species))]}
      // Reached from Settings rather than as a first-run step.
      isEditing={Boolean(user?.onboardingCompletedAt)}
    />
  );
}
