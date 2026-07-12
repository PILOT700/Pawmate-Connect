import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MapPin, X, Bookmark, Sparkles, MessageCircle, RefreshCw, ChevronRight } from "lucide-react";
import { useState } from "react";
import { MatchCelebrationModal } from "@/components/match-celebration-modal";

const mockProfiles = [
  {
    id: "1",
    name: "Eleanor",
    age: 31,
    city: "San Francisco",
    image: "/profile1.png",
    pet: { name: "Oliver", species: "Cat", breed: "Orange Tabby", image: "/pet2.png" },
    bio: "Slow mornings, strong coffee, and finding the sunniest spot in the apartment. Looking for someone to share quiet Sundays with."
  },
  {
    id: "2",
    name: "James",
    age: 34,
    city: "Seattle",
    image: "/profile2.png",
    pet: { name: "Buster", species: "Dog", breed: "French Bulldog", image: "/pet1.png" },
    bio: "Architect by day, amateur chef by night. Buster comes everywhere with me. Hoping to find a hiking partner."
  },
  {
    id: "3",
    name: "Maya",
    age: 28,
    city: "Portland",
    image: "/profile3.png",
    pet: { name: "Luna", species: "Dog", breed: "Golden Retriever", image: "/pet1.png" },
    bio: "Always looking for the next adventure. Luna is the goodest girl and loves the beach."
  },
  {
    id: "4",
    name: "David",
    age: 36,
    city: "Austin",
    image: "/profile2.png",
    pet: { name: "Milo", species: "Dog", breed: "Mixed", image: "/pet1.png" },
    bio: "Tech worker who unplugs by running trails. Milo keeps my pace honest."
  },
  {
    id: "5",
    name: "Chloe",
    age: 29,
    city: "Denver",
    image: "/profile1.png",
    pet: { name: "Cleo", species: "Cat", breed: "Siamese", image: "/pet2.png" },
    bio: "Bookstore regular. Cleo thinks she runs the place. I just pay the rent."
  },
  {
    id: "6",
    name: "Marcus",
    age: 33,
    city: "Chicago",
    image: "/profile3.png",
    pet: { name: "Rex", species: "Dog", breed: "Labrador", image: "/pet1.png" },
    bio: "Just looking for someone who loves dogs as much as I do."
  }
];

const DAILY_SPARK = {
  id: "spark",
  name: "Sophia",
  age: 32,
  city: "New York",
  image: "/profile1.png",
  bio: "Yoga teacher, terrible cook, great at finding the best brunch spots in the city. Noodle and I have a morning ritual — she gets the sunny patch on the rug, I get the coffee.",
  lifestyle: ["Morning person", "Foodie", "Creative", "Outdoorsy"],
  lookingFor: "Friendship & connection",
  pet: { name: "Noodle", breed: "Scottish Fold", image: "/pet2.png" },
  prompt: "If your pet could plan your perfect first date, what would it look like?",
  compatScore: 88,
};

type Profile = typeof mockProfiles[number];

type SparkState = "visible" | "liked" | "dismissed";

function DailySparkCard({
  spark,
  state,
  onLike,
  onDismiss,
}: {
  spark: typeof DAILY_SPARK;
  state: SparkState;
  onLike: () => void;
  onDismiss: () => void;
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
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-widest">Daily Spark</span>
            <span className="text-xs text-muted-foreground/60 ml-1">· Refreshes daily</span>
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
                    <h3 className="font-serif text-2xl font-semibold">{spark.name}, {spark.age}</h3>
                    <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {spark.city}
                    </div>
                  </div>

                  {/* Pet badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-md">
                    <img src={spark.pet.image} alt={spark.pet.name} className="w-6 h-6 rounded-full object-cover border border-border/30" />
                    <div>
                      <p className="text-[11px] font-semibold text-foreground leading-none">{spark.pet.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{spark.pet.breed}</p>
                    </div>
                  </div>

                  {/* Compat badge */}
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-white" />
                    {spark.compatScore}% match
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
                {/* Name (desktop only) */}
                <div className="hidden md:block">
                  <h3 className="font-serif text-3xl font-semibold text-foreground">{spark.name}, {spark.age}</h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1.5">
                    <MapPin className="w-4 h-4" /> {spark.city}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  "{spark.bio}"
                </p>

                {/* Ice-breaker prompt */}
                <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Ice-breaker
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
                      <Heart className="w-4 h-4 mr-2 fill-current" /> Like Sophia
                    </Button>
                  </motion.div>
                  <Link href="/messages" className="flex-1" data-testid="btn-spark-message">
                    <Button variant="outline" className="w-full h-11 rounded-full border-border text-sm font-medium">
                      <MessageCircle className="w-4 h-4 mr-2" /> Send a message
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
            You liked <span className="font-semibold">Sophia</span> — fingers crossed for a mutual match! 🐾
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
  const [profiles, setProfiles] = useState(mockProfiles);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [sparkState, setSparkState] = useState<SparkState>("visible");

  const handleSkip = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const handleLike = (profile: Profile) => {
    setLikedIds(prev => new Set([...prev, profile.id]));
    const isMatch = Math.random() < 0.6;
    if (isMatch) {
      setTimeout(() => {
        setMatchProfile(profile);
        setMatchOpen(true);
      }, 420);
    } else {
      setProfiles(prev => prev.filter(p => p.id !== profile.id));
    }
  };

  const handleCloseMatch = () => {
    setMatchOpen(false);
    if (matchProfile) {
      setProfiles(prev => prev.filter(p => p.id !== matchProfile.id));
      setMatchProfile(null);
    }
  };

  const handleSparkLike = () => {
    setSparkState("liked");
  };

  const handleSparkDismiss = () => {
    setSparkState("dismissed");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Filters Bar */}
      <div className="sticky top-[64px] z-40 bg-background/90 backdrop-blur-md border-b border-border py-4">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-row overflow-x-auto no-scrollbar pb-2 -mb-2 gap-4 items-center">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] shrink-0 rounded-full bg-card" data-testid="filter-species">
                <SelectValue placeholder="Species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pets</SelectItem>
                <SelectItem value="dog">Dogs</SelectItem>
                <SelectItem value="cat">Cats</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="25">
              <SelectTrigger className="w-[140px] rounded-full bg-card" data-testid="filter-distance">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Within 5 miles</SelectItem>
                <SelectItem value="10">Within 10 miles</SelectItem>
                <SelectItem value="25">Within 25 miles</SelectItem>
                <SelectItem value="50">Within 50 miles</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="both">
              <SelectTrigger className="w-[160px] rounded-full bg-card" data-testid="filter-intent">
                <SelectValue placeholder="Looking for" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendship">Friendship</SelectItem>
                <SelectItem value="relationship">Relationship</SelectItem>
                <SelectItem value="both">Open to both</SelectItem>
              </SelectContent>
            </Select>

            {sparkState === "dismissed" && (
              <button
                onClick={() => setSparkState("visible")}
                className="ml-auto flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap transition-colors"
                data-testid="btn-spark-restore"
              >
                <RefreshCw className="w-3 h-3" /> Show Daily Spark
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-8 mt-8">

        {/* Daily Spark */}
        {sparkState !== "dismissed" && (
          <DailySparkCard
            spark={DAILY_SPARK}
            state={sparkState}
            onLike={handleSparkLike}
            onDismiss={handleSparkDismiss}
          />
        )}

        {/* Section divider when both spark + grid are visible */}
        {sparkState === "visible" && profiles.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Discover more</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        {/* Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-2">You're all caught up!</h2>
            <p className="text-muted-foreground">Check back later for more potential matches.</p>
            <Button
              className="mt-6 rounded-full"
              onClick={() => { setProfiles(mockProfiles); setLikedIds(new Set()); }}
              data-testid="btn-refresh-profiles"
            >
              Refresh Profiles
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {profiles.map((profile, idx) => {
                const isLiked = likedIds.has(profile.id);
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
                        src={profile.image}
                        alt={profile.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="font-serif text-3xl font-medium mb-1">{profile.name}, {profile.age}</h3>
                        <div className="flex items-center text-white/90 text-sm gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.city}</span>
                        </div>
                      </div>

                      {/* Pet Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-lg">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-border/50">
                          <img src={profile.pet.image} alt={profile.pet.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground leading-tight">{profile.pet.name}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{profile.pet.breed}</p>
                        </div>
                      </div>
                    </Link>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-6">"{profile.bio}"</p>

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
      </div>

      {/* Match Celebration Modal */}
      <MatchCelebrationModal
        open={matchOpen}
        profile={matchProfile}
        onClose={handleCloseMatch}
      />
    </div>
  );
}
