import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MapPin, X, Bookmark } from "lucide-react";
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

type Profile = typeof mockProfiles[number];

export default function Discover() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [matchOpen, setMatchOpen] = useState(false);

  const handleSkip = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const handleLike = (profile: Profile) => {
    setLikedIds(prev => new Set([...prev, profile.id]));
    // ~60% chance of a mutual match for demo purposes
    const isMatch = Math.random() < 0.6;
    if (isMatch) {
      // Small delay so the heart animation plays first
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Filters Bar */}
      <div className="sticky top-20 z-40 bg-background/90 backdrop-blur-md border-b border-border py-4">
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
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 md:px-8 mt-8">
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
