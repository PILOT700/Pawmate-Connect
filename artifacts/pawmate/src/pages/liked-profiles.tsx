import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, MessageCircle, HeartOff, PawPrint } from "lucide-react";

const initialLiked = [
  {
    id: "1",
    name: "Eleanor",
    age: 31,
    city: "San Francisco",
    image: "/profile1.png",
    pet: { name: "Oliver", breed: "Orange Tabby", image: "/pet2.png" },
    bio: "Slow mornings, strong coffee, and finding the sunniest spot in the apartment. Looking for someone to share quiet Sundays with.",
    likedAt: "2 hours ago",
    mutualMatch: true,
  },
  {
    id: "2",
    name: "James",
    age: 34,
    city: "Seattle",
    image: "/profile2.png",
    pet: { name: "Buster", breed: "French Bulldog", image: "/pet1.png" },
    bio: "Architect by day, amateur chef by night. Buster comes everywhere with me. Hoping to find a hiking partner.",
    likedAt: "Yesterday",
    mutualMatch: false,
  },
  {
    id: "3",
    name: "Maya",
    age: 28,
    city: "Portland",
    image: "/profile3.png",
    pet: { name: "Luna", breed: "Golden Retriever", image: "/pet1.png" },
    bio: "Always looking for the next adventure. Luna is the goodest girl and loves the beach.",
    likedAt: "3 days ago",
    mutualMatch: true,
  },
  {
    id: "4",
    name: "Chloe",
    age: 29,
    city: "Denver",
    image: "/profile1.png",
    pet: { name: "Cleo", breed: "Siamese", image: "/pet2.png" },
    bio: "Bookstore regular. Cleo thinks she runs the place. I just pay the rent.",
    likedAt: "Last week",
    mutualMatch: false,
  },
];

export default function LikedProfiles() {
  const [liked, setLiked] = useState(initialLiked);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleUnlike = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setLiked(prev => prev.filter(p => p.id !== id));
      setRemovingId(null);
    }, 300);
  };

  const mutualCount = liked.filter(p => p.mutualMatch).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
                Liked Profiles
              </h1>
              <p className="text-muted-foreground text-sm">
                {liked.length} {liked.length === 1 ? "profile" : "profiles"} liked
                {mutualCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary font-medium">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    {mutualCount} mutual {mutualCount === 1 ? "match" : "matches"}
                  </span>
                )}
              </p>
            </div>

            {/* Tab pills */}
            <div className="flex items-center gap-2 bg-secondary rounded-full p-1 self-start sm:self-auto">
              <button className="px-4 py-1.5 text-sm font-medium rounded-full bg-card shadow-sm text-foreground" data-testid="tab-all-likes">
                All ({liked.length})
              </button>
              <button className="px-4 py-1.5 text-sm font-medium rounded-full text-muted-foreground hover:text-foreground transition-colors" data-testid="tab-mutual-likes">
                Mutual ({mutualCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8">
        {liked.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <PawPrint className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">No liked profiles yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Head to Discover to start connecting with people who share your love of animals.
            </p>
            <Link href="/discover" data-testid="link-go-discover">
              <Button className="rounded-full px-8 bg-primary text-primary-foreground">
                Browse Profiles
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {liked.map((profile, idx) => (
                <motion.div
                  key={profile.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: removingId === profile.id ? 0 : 1, y: 0, scale: removingId === profile.id ? 0.92 : 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="group bg-card rounded-[1.75rem] border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                  data-testid={`card-liked-${profile.id}`}
                >
                  {/* Photo */}
                  <Link href={`/profile/${profile.id}`} className="block relative overflow-hidden" style={{ aspectRatio: "4/5" }} data-testid={`link-liked-profile-${profile.id}`}>
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent" />

                    {/* Mutual match badge */}
                    {profile.mutualMatch && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Heart className="w-2.5 h-2.5 fill-current" />
                        Mutual match
                      </div>
                    )}

                    {/* Pet badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-1.5 pr-3 flex items-center gap-2 shadow-md">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-border/30">
                        <img src={profile.pet.image} alt={profile.pet.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-foreground leading-none">{profile.pet.name}</p>
                        <p className="text-[9px] text-muted-foreground leading-none mt-0.5">{profile.pet.breed}</p>
                      </div>
                    </div>

                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-serif text-2xl font-medium leading-tight">{profile.name}, {profile.age}</h3>
                      <div className="flex items-center text-white/85 text-xs gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {profile.city}
                      </div>
                    </div>
                  </Link>

                  {/* Card body */}
                  <div className="p-4 flex flex-col gap-3 flex-grow">
                    <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                      "{profile.bio}"
                    </p>

                    <p className="text-[10px] text-muted-foreground/60 mt-auto">
                      Liked {profile.likedAt}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors flex-shrink-0"
                        onClick={() => handleUnlike(profile.id)}
                        title="Unlike"
                        data-testid={`btn-unlike-${profile.id}`}
                      >
                        <HeartOff className="w-4 h-4" />
                      </Button>

                      <Link href="/messages" className="flex-1" data-testid={`link-message-${profile.id}`}>
                        <Button
                          className={`w-full h-10 rounded-full text-xs font-medium gap-1.5 ${
                            profile.mutualMatch
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                          data-testid={`btn-message-${profile.id}`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {profile.mutualMatch ? "Send a message" : "Say hello"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
