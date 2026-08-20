import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MapPin, X, Bookmark, Sparkles, MessageCircle, RefreshCw, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MatchCelebrationModal } from "@/components/match-celebration-modal";
import { calcCompatScore } from "@/components/compatibility-score";
import {
  useListDiscoverProfiles,
  useListMyPets,
  useGetMyPreferences,
  getGetMyPreferencesQueryKey,
  useCreateLike,
  useCreatePass,
  type DiscoverProfile,
  type Species,
  type LookingFor,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";
import { useT, type TranslationKey } from "@/lib/i18n";

const FALLBACK_IMAGE = "/profile1.png";
const FALLBACK_PET_IMAGE = "/pet1.png";

const ICE_BREAKERS: TranslationKey[] = [
  "discover.prompt1",
  "discover.prompt2",
  "discover.prompt3",
];

type SparkState = "visible" | "liked" | "dismissed";

interface SparkView {
  id: string;
  name: string;
  age: number | null;
  city: string | null;
  image: string;
  bio: string | null;
  lifestyle: string[];
  lookingForLabel: string;
  pet?: { name: string; breed: string | null; image: string };
  prompt: string;
  compatScore: number;
}

function lookingForLabel(values: LookingFor[], t: (k: TranslationKey) => string): string {
  if (values.length === 0) return t("discover.openToConnecting");
  return values.map((v) => t(`intent.${v}`)).join(" & ");
}

function DailySparkCard({
  spark,
  t,
  state,
  onLike,
  onDismiss,
}: {
  spark: SparkView;
  state: SparkState;
  onLike: () => void;
  onDismiss: () => void;
  t: (k: TranslationKey, v?: Record<string, string | number>) => string;
}) {
  return (
    <AnimatePresence>
      {state === "visible" && (
        <motion.div
          key="spark-card"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24, scale: 0.97, transition: { duration: 0.3 } }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-10"
          data-testid="daily-spark-card"
        >
          {/* Label row */}
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </motion.div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-widest">{t("discover.dailySpark")}</span>
            <span className="text-xs text-muted-foreground/60 ml-1">{t("discover.refreshesDaily")}</span>
            <button
              onClick={onDismiss}
              className="ml-auto text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1"
              data-testid="btn-spark-dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card */}
          <div className="relative rounded-[2rem] overflow-hidden border border-amber-200/60 shadow-lg bg-card">
            {/* Warm ambient gradient overlay on the whole card */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-rose-50/40 pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col md:flex-row">
              {/* Photo */}
              <Link
                href={`/profile/${spark.id}`}
                className="md:w-[280px] lg:w-[320px] flex-shrink-0 block"
                data-testid="link-spark-profile"
              >
                <div className="relative h-64 md:h-full min-h-[260px] overflow-hidden group">
                  <img
                    src={spark.image}
                    alt={spark.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent md:bg-gradient-to-r md:from-transparent md:to-card/80" />

                  {/* Name overlay on mobile */}
                  <div className="md:hidden absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="font-serif text-2xl font-semibold">{spark.name}{spark.age ? `, ${spark.age}` : ""}</h3>
                    {spark.city && (
                      <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                        <MapPin className="w-3.5 h-3.5" /> {spark.city}
                      </div>
                    )}
                  </div>

                  {/* Pet badge */}
                  {spark.pet && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-md">
                      <img src={spark.pet.image} alt={spark.pet.name} className="w-6 h-6 rounded-full object-cover border border-border/30" />
                      <div>
                        <p className="text-[11px] font-semibold text-foreground leading-none">{spark.pet.name}</p>
                        {spark.pet.breed && <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{spark.pet.breed}</p>}
                      </div>
                    </div>
                  )}

                  {/* Compat badge */}
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-white" />
                    {t("discover.match", { percent: spark.compatScore })}
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
                {/* Name (desktop only) */}
                <div className="hidden md:block">
                  <h3 className="font-serif text-3xl font-semibold text-foreground">{spark.name}{spark.age ? `, ${spark.age}` : ""}</h3>
                  {spark.city && (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1.5">
                      <MapPin className="w-4 h-4" /> {spark.city}
                    </div>
                  )}
                </div>

                {/* Bio */}
                {spark.bio && (
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    "{spark.bio}"
                  </p>
                )}

                {/* Ice-breaker prompt */}
                <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {t("discover.iceBreaker")}
                  </p>
                  <p className="text-sm font-medium text-foreground leading-snug">
                    "{spark.prompt}"
                  </p>
                </div>

                {/* Lifestyle chips */}
                <div className="flex flex-wrap gap-1.5">
                  {spark.lifestyle.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-background border border-border rounded-full px-3 py-1 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                  <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.04 }} className="flex-1">
                    <Button
                      onClick={onLike}
                      className="w-full h-11 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 border border-accent-foreground/10 shadow-sm font-medium text-sm"
                      data-testid="btn-spark-like"
                    >
                      <Heart className="w-4 h-4 mr-2 fill-current" /> {t("discover.likeName", { name: spark.name })}
                    </Button>
                  </motion.div>
                  <Link href="/messages" className="flex-1" data-testid="btn-spark-message">
                    <Button variant="outline" className="w-full h-11 rounded-full border-border text-sm font-medium">
                      <MessageCircle className="w-4 h-4 mr-2" /> {t("discover.sendMessage")}
                    </Button>
                  </Link>
                  <Link href={`/profile/${spark.id}`} data-testid="link-spark-full-profile">
                    <Button variant="ghost" size="icon" className="w-11 h-11 rounded-full text-muted-foreground flex-shrink-0">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Liked state — compact confirmation strip */}
      {state === "liked" && (
        <motion.div
          key="spark-liked"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.28 }}
          className="mb-10 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 flex items-center gap-3"
          data-testid="daily-spark-liked"
        >
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
          <p className="text-sm text-rose-700 font-medium flex-1">
            {t("discover.youLiked", { name: spark.name })}
          </p>
          <button
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-600 transition-colors"
            data-testid="btn-spark-liked-dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Discover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useT();

  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("any");

  const { data: preferences } = useGetMyPreferences({
    query: { queryKey: getGetMyPreferencesQueryKey() },
  });
  // Once a filter has been set by hand, the stored preference stops reaching
  // in — otherwise a late-arriving query would undo the choice.
  const speciesFilterTouched = useRef(false);
  const intentFilterTouched = useRef(false);
  const distanceFilterTouched = useRef(false);

  // Open on what onboarding was told you wanted. Each filter holds one value,
  // so only an unambiguous preference can be honoured; anything broader keeps
  // the full feed, which is what "all" already means.
  useEffect(() => {
    if (!preferences) return;
    if (!speciesFilterTouched.current && preferences.petTypePrefs?.length === 1) {
      setSpeciesFilter(preferences.petTypePrefs[0]!);
    }
    if (!intentFilterTouched.current && preferences.lookingForPrefs?.length === 1) {
      setIntentFilter(preferences.lookingForPrefs[0]!);
    }
    // Distance is a single number, so unlike the other two it always applies.
    if (!distanceFilterTouched.current && preferences.maxDistanceKm != null) {
      setDistanceFilter(String(preferences.maxDistanceKm));
    }
  }, [preferences]);

  const changeSpeciesFilter = (value: string) => {
    speciesFilterTouched.current = true;
    setSpeciesFilter(value);
  };

  const changeIntentFilter = (value: string) => {
    intentFilterTouched.current = true;
    setIntentFilter(value);
  };

  const changeDistanceFilter = (value: string) => {
    distanceFilterTouched.current = true;
    setDistanceFilter(value);
  };

  // The age range has no control in the filter bar — it is set once during
  // onboarding and changed in Settings, so it applies straight from the
  // preference rather than being restated here.
  const { data, isLoading, isError, refetch } = useListDiscoverProfiles({
    pageSize: 50,
    ...(speciesFilter !== "all" ? { species: speciesFilter as Species } : {}),
    ...(intentFilter !== "all" ? { lookingFor: intentFilter as LookingFor } : {}),
    ...(preferences?.ageRangeMin != null ? { ageMin: preferences.ageRangeMin } : {}),
    ...(preferences?.ageRangeMax != null ? { ageMax: preferences.ageRangeMax } : {}),
    ...(distanceFilter !== "any" ? { maxDistanceKm: Number(distanceFilter) } : {}),
  });
  const { data: myPets } = useListMyPets();

  const [profiles, setProfiles] = useState<DiscoverProfile[] | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matchProfile, setMatchProfile] = useState<DiscoverProfile | null>(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [sparkState, setSparkState] = useState<SparkState>("visible");
  const [sparkPrompt] = useState(() => ICE_BREAKERS[Math.floor(Math.random() * ICE_BREAKERS.length)]!);

  const createLike = useCreateLike();
  const createPass = useCreatePass();

  // Re-syncs from the server on initial load and whenever the filters change
  // a new query resolves — local swipes (skip/like) filter this copy so the
  // card-removal animation still works without a refetch on every tap.
  useEffect(() => {
    if (data) setProfiles(data.items);
  }, [data]);

  const handleSkip = async (id: string) => {
    setProfiles((prev) => prev?.filter((p) => p.id !== id) ?? prev);
    try {
      await createPass.mutateAsync({ data: { passedUserId: id } });
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("discover.couldNotSkip"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

  const handleLike = async (profile: DiscoverProfile) => {
    setLikedIds((prev) => new Set([...prev, profile.id]));
    try {
      const result = await createLike.mutateAsync({ data: { likedUserId: profile.id } });
      if (result.isMatch) {
        setTimeout(() => {
          setMatchProfile(profile);
          setMatchOpen(true);
        }, 420);
      } else {
        setProfiles((prev) => prev?.filter((p) => p.id !== profile.id) ?? prev);
      }
    } catch (err) {
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(profile.id);
        return next;
      });
      toast({
        variant: "destructive",
        title: t("discover.couldNotLike"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

  const handleCloseMatch = () => {
    setMatchOpen(false);
    if (matchProfile) {
      setProfiles((prev) => prev?.filter((p) => p.id !== matchProfile.id) ?? prev);
      setMatchProfile(null);
    }
  };

  const [sparkCandidate, ...gridProfiles] = profiles ?? [];

  const sparkView: SparkView | null = sparkCandidate
    ? {
        id: sparkCandidate.id,
        name: sparkCandidate.firstName,
        age: sparkCandidate.age ?? null,
        city: sparkCandidate.city ?? null,
        image: sparkCandidate.avatarUrl || FALLBACK_IMAGE,
        bio: sparkCandidate.bio ?? null,
        lifestyle: sparkCandidate.lifestyleTags,
        lookingForLabel: lookingForLabel(sparkCandidate.lookingFor, t),
        pet: sparkCandidate.pets[0]
          ? {
              name: sparkCandidate.pets[0].name,
              breed: sparkCandidate.pets[0].breed ?? null,
              image: sparkCandidate.pets[0].photoUrl || FALLBACK_PET_IMAGE,
            }
          : undefined,
        prompt: sparkPrompt,
        compatScore: calcCompatScore({
          myPetSpecies: myPets?.[0]?.species,
          myLifestyle: user?.lifestyleTags ?? [],
          myLookingFor: user?.lookingFor ?? [],
          theirPetSpecies: sparkCandidate.pets[0]?.species,
          theirLifestyle: sparkCandidate.lifestyleTags,
          theirLookingFor: sparkCandidate.lookingFor,
          theirTraits: sparkCandidate.pets[0]?.traits,
        }).total,
      }
    : null;

  const handleSparkLike = () => {
    if (!sparkCandidate) return;
    setSparkState("liked");
    void handleLike(sparkCandidate);
  };

  const handleSparkDismiss = () => {
    setSparkState("dismissed");
  };

  const matchModalProfile = matchProfile
    ? {
        id: matchProfile.id,
        name: matchProfile.firstName,
        image: matchProfile.avatarUrl || FALLBACK_IMAGE,
        pet: { name: matchProfile.pets[0]?.name ?? "their pet" },
      }
    : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Filters Bar */}
      <div className="sticky top-[64px] z-40 bg-background/90 backdrop-blur-md border-b border-border py-4">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-row overflow-x-auto no-scrollbar pb-2 -mb-2 gap-4 items-center">
            <Select value={speciesFilter} onValueChange={changeSpeciesFilter}>
              <SelectTrigger className="w-[140px] shrink-0 rounded-full bg-card" data-testid="filter-species">
                <SelectValue placeholder={t("discover.filterSpecies")} />
              </SelectTrigger>
              {/* Covers every species onboarding can ask for, so a preference
                  carried in here always has an entry to show. */}
              <SelectContent>
                <SelectItem value="all">{t("discover.allPets")}</SelectItem>
                <SelectItem value="dog">{t("discover.dogs")}</SelectItem>
                <SelectItem value="cat">{t("discover.cats")}</SelectItem>
                <SelectItem value="rabbit">{t("discover.rabbits")}</SelectItem>
                <SelectItem value="bird">{t("discover.birds")}</SelectItem>
                <SelectItem value="fish">{t("discover.fishes")}</SelectItem>
                <SelectItem value="other">{t("discover.otherPets")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={distanceFilter} onValueChange={changeDistanceFilter}>
              <SelectTrigger className="w-[150px] shrink-0 rounded-full bg-card" data-testid="filter-distance">
                <SelectValue placeholder={t("discover.filterDistance")} />
              </SelectTrigger>
              {/* Matches the distances onboarding offers, plus a way out of the
                  filter entirely. */}
              <SelectContent>
                <SelectItem value="any">{t("discover.anyDistance")}</SelectItem>
                <SelectItem value="10">{t("discover.within", { km: 10 })}</SelectItem>
                <SelectItem value="25">{t("discover.within", { km: 25 })}</SelectItem>
                <SelectItem value="50">{t("discover.within", { km: 50 })}</SelectItem>
                <SelectItem value="100">{t("discover.within", { km: 100 })}</SelectItem>
                <SelectItem value="200">{t("discover.within", { km: 200 })}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={intentFilter} onValueChange={changeIntentFilter}>
              <SelectTrigger className="w-[160px] rounded-full bg-card" data-testid="filter-intent">
                <SelectValue placeholder={t("discover.filterIntent")} />
              </SelectTrigger>
              {/* Covers every intent onboarding offers. "Open to anything" is
                  one of those, so the no-filter option is named for people
                  rather than intents to keep the two apart. */}
              <SelectContent>
                <SelectItem value="all">{t("discover.everyone")}</SelectItem>
                <SelectItem value="friendship">{t("intent.friendship")}</SelectItem>
                <SelectItem value="relationship">{t("intent.relationship")}</SelectItem>
                <SelectItem value="playdates">{t("intent.playdates")}</SelectItem>
                <SelectItem value="casual">{t("intent.casual")}</SelectItem>
                <SelectItem value="open">{t("intent.open")}</SelectItem>
              </SelectContent>
            </Select>

            {/* The age range narrows the feed without a control of its own, so
                it says so — an invisible filter reads as an empty app. */}
            {(preferences?.ageRangeMin != null || preferences?.ageRangeMax != null) && (
              <Link
                href="/settings"
                className="shrink-0 rounded-full border border-border bg-card px-4 h-9 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                data-testid="filter-age-range"
                title={t("discover.agesHint")}
              >
                {t("discover.ages", { min: preferences.ageRangeMin ?? "", max: preferences.ageRangeMax ?? "" })}
              </Link>
            )}

            {sparkState === "dismissed" && (
              <button
                onClick={() => setSparkState("visible")}
                className="ml-auto flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap transition-colors"
                data-testid="btn-spark-restore"
              >
                <RefreshCw className="w-3 h-3" /> {t("discover.showSpark")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-8 mt-8">
        {isLoading && profiles === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-card-border bg-card overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-secondary" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-secondary rounded-full w-full" />
                  <div className="h-3 bg-secondary rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-4">{t("discover.couldNotLoad")}</p>
            <Button variant="outline" className="rounded-full" onClick={() => refetch()} data-testid="btn-retry-discover">
              {t("discover.retry")}
            </Button>
          </div>
        ) : (
          <>
            {/* Daily Spark */}
            {sparkView && sparkState !== "dismissed" && (
              <DailySparkCard
                t={t}
                spark={sparkView}
                state={sparkState}
                onLike={handleSparkLike}
                onDismiss={handleSparkDismiss}
              />
            )}

            {/* Section divider when both spark + grid are visible */}
            {sparkView && sparkState === "visible" && gridProfiles.length > 0 && (
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("discover.discoverMore")}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {/* Grid */}
            {gridProfiles.length === 0 && !sparkView ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="font-serif text-2xl text-foreground mb-2">{t("discover.allCaughtUp")}</h2>
                <p className="text-muted-foreground">{t("discover.checkBack")}</p>
                <Button
                  className="mt-6 rounded-full"
                  onClick={() => { setLikedIds(new Set()); refetch(); }}
                  data-testid="btn-refresh-profiles"
                >
                  {t("discover.refreshProfiles")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {gridProfiles.map((profile, idx) => {
                    const isLiked = likedIds.has(profile.id);
                    const pet = profile.pets[0];
                    return (
                      <motion.div
                        key={profile.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.25 } }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="group relative bg-card rounded-[2rem] border border-card-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                      >
                        <Link href={`/profile/${profile.id}`} className="block relative aspect-[4/5] overflow-hidden" data-testid={`link-profile-${profile.id}`}>
                          <img
                            src={profile.avatarUrl || FALLBACK_IMAGE}
                            alt={profile.firstName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="font-serif text-3xl font-medium mb-1">{profile.firstName}{profile.age ? `, ${profile.age}` : ""}</h3>
                            {profile.city && (
                              <div className="flex items-center text-white/90 text-sm gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{profile.city}</span>
                              </div>
                            )}
                          </div>

                          {/* Pet Badge */}
                          {pet && (
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-lg">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-border/50">
                                <img src={pet.photoUrl || FALLBACK_PET_IMAGE} alt={pet.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground leading-tight">{pet.name}</p>
                                {pet.breed && <p className="text-[10px] text-muted-foreground leading-tight">{pet.breed}</p>}
                              </div>
                            </div>
                          )}
                        </Link>

                        <div className="p-6 flex-grow flex flex-col justify-between">
                          {profile.bio && <p className="text-muted-foreground text-sm line-clamp-3 mb-6">"{profile.bio}"</p>}

                          <div className="flex items-center justify-between gap-4 mt-auto">
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-14 h-14 rounded-full border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                              onClick={() => handleSkip(profile.id)}
                              data-testid={`btn-skip-${profile.id}`}
                            >
                              <X className="w-6 h-6" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-12 h-12 rounded-full border-border hover:bg-secondary transition-colors"
                              data-testid={`btn-save-${profile.id}`}
                            >
                              <Bookmark className="w-5 h-5 text-foreground" />
                            </Button>
                            <motion.div whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.06 }}>
                              <Button
                                className={`w-14 h-14 rounded-full shadow-sm transition-colors ${
                                  isLiked
                                    ? "bg-rose-400 text-white hover:bg-rose-500 border border-rose-300"
                                    : "bg-accent text-accent-foreground hover:bg-accent/90 border border-accent-foreground/10"
                                }`}
                                onClick={() => handleLike(profile)}
                                data-testid={`btn-like-${profile.id}`}
                              >
                                <Heart className={`w-6 h-6 ${isLiked ? "fill-white" : "fill-current"}`} />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Match Celebration Modal */}
      <MatchCelebrationModal
        open={matchOpen}
        profile={matchModalProfile}
        onClose={handleCloseMatch}
      />
    </div>
  );
}
