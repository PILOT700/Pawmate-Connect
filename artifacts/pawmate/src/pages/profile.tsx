import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, MessageCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { CompatibilityScore } from "@/components/compatibility-score";
import type { CompatibilityInput } from "@/components/compatibility-score";

const PROFILES: Record<string, {
  id: string; name: string; age: number; city: string; image: string; bio: string;
  lifestyle: string[]; lookingFor: string;
  pet: { name: string; species: string; breed: string; age: string; image: string; traits: string[] };
}> = {
  "1": {
    id: "1", name: "Eleanor", age: 31, city: "San Francisco",
    image: "/profile1.png",
    bio: "Slow mornings, strong coffee, and finding the sunniest spot in the apartment. Looking for someone to share quiet Sundays with. I work as an illustrator and mostly just draw pictures of other people's pets.",
    lifestyle: ["Morning person", "Homebody", "Coffee enthusiast", "Creative"],
    lookingFor: "Friendship",
    pet: { name: "Oliver", species: "Cat", breed: "Orange Tabby", age: "4 years", image: "/pet2.png", traits: ["Cuddly", "Vocal", "Treat-motivated"] }
  },
  "2": {
    id: "2", name: "James", age: 34, city: "Seattle",
    image: "/profile2.png",
    bio: "Architect by day, amateur chef by night. Buster comes everywhere with me. Hoping to find a hiking partner who doesn't mind a dog setting the pace.",
    lifestyle: ["Outdoorsy", "Foodie", "Early riser", "Active"],
    lookingFor: "Relationship",
    pet: { name: "Buster", species: "Dog", breed: "French Bulldog", age: "3 years", image: "/pet1.png", traits: ["Playful", "Stubborn", "Loyal"] }
  },
  "3": {
    id: "3", name: "Maya", age: 28, city: "Portland",
    image: "/profile3.png",
    bio: "Always looking for the next adventure. Luna is the goodest girl and loves the beach. Hoping to find someone who's up for spontaneous road trips.",
    lifestyle: ["Outdoorsy", "Adventurous", "Morning person", "Dog lover"],
    lookingFor: "Open to anything",
    pet: { name: "Luna", species: "Dog", breed: "Golden Retriever", age: "2 years", image: "/pet1.png", traits: ["Energetic", "Friendly", "Loves water"] }
  },
  "4": {
    id: "4", name: "David", age: 36, city: "Austin",
    image: "/profile2.png",
    bio: "Tech worker who unplugs by running trails. Milo keeps my pace honest. Looking for a low-key connection with someone who values quality time over quantity.",
    lifestyle: ["Active", "Minimalist", "Coffee enthusiast", "Introvert"],
    lookingFor: "Casual meetups",
    pet: { name: "Milo", species: "Dog", breed: "Mixed", age: "5 years", image: "/pet1.png", traits: ["Calm", "Loyal", "Trail-tested"] }
  },
  "5": {
    id: "5", name: "Chloe", age: 29, city: "Denver",
    image: "/profile1.png",
    bio: "Bookstore regular. Cleo thinks she runs the place. I just pay the rent. Seeking someone who gets that cats have strong opinions and that's a feature, not a bug.",
    lifestyle: ["Homebody", "Creative", "Bookworm", "Coffee enthusiast"],
    lookingFor: "Friendship",
    pet: { name: "Cleo", species: "Cat", breed: "Siamese", age: "3 years", image: "/pet2.png", traits: ["Opinionated", "Elegant", "Cuddly on her terms"] }
  },
  "6": {
    id: "6", name: "Marcus", age: 33, city: "Chicago",
    image: "/profile3.png",
    bio: "Just looking for someone who loves dogs as much as I do. Rex and I do the lakefront trail every morning. Weekends are for farmers markets and naps.",
    lifestyle: ["Outdoorsy", "Morning person", "Foodie", "Homebody"],
    lookingFor: "Relationship",
    pet: { name: "Rex", species: "Dog", breed: "Labrador", age: "4 years", image: "/pet1.png", traits: ["Gentle", "Obedient", "Always hungry"] }
  },
};

const FALLBACK = PROFILES["1"];

export default function Profile() {
  const { id } = useParams();
  const profile = (id && PROFILES[id]) ? PROFILES[id] : { ...FALLBACK, name: "Eleanor", id: id ?? "me" };

  const compatInput: CompatibilityInput = {
    theirPetSpecies: profile.pet.species,
    theirLifestyle: profile.lifestyle,
    theirLookingFor: profile.lookingFor,
    theirTraits: profile.pet.traits,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <Link href="/discover" className="absolute top-6 left-6 z-10" data-testid="btn-back">
          <Button variant="outline" size="icon" className="rounded-full bg-background/50 backdrop-blur-md border-transparent hover:bg-background/80">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl -mt-32 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[3rem] p-8 md:p-12 shadow-xl border border-card-border/50"
        >
          {/* Name + actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-border pb-8">
            <div>
              <h1 className="font-serif text-5xl font-semibold text-foreground mb-3">{profile.name}, {profile.age}</h1>
              <div className="flex items-center text-muted-foreground gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{profile.city}</span>
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <Button size="lg" className="flex-1 md:flex-none rounded-full px-8 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm border border-accent-foreground/10 h-14" data-testid="btn-profile-like">
                <Heart className="w-5 h-5 mr-2 fill-current" /> Like
              </Button>
              <Link href="/messages" data-testid="btn-profile-message" className="flex-1 md:flex-none">
                <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-14 border-border">
                  <MessageCircle className="w-5 h-5 mr-2" /> Message
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-12">
            {/* Left: bio + lifestyle */}
            <div className="md:col-span-3 space-y-10">
              <section>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">About Me</h2>
                <p className="text-muted-foreground text-lg leading-relaxed font-light">{profile.bio}</p>
              </section>

              <section>
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Lifestyle</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.lifestyle.map(tag => (
                    <Badge key={tag} variant="secondary" className="px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Compatibility score — visible on mobile below lifestyle, on desktop it's in the sidebar */}
              <div className="md:hidden">
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Your Match</h2>
                <CompatibilityScore input={compatInput} />
              </div>
            </div>

            {/* Right: pet card + compat score */}
            <div className="md:col-span-2 space-y-6">
              {/* Pet card */}
              <div className="bg-secondary/30 rounded-[2rem] p-6 border border-secondary">
                <h2 className="font-serif text-2xl font-medium text-foreground mb-6 text-center">Meet {profile.pet.name}</h2>
                <div className="aspect-square rounded-2xl overflow-hidden mb-6">
                  <img src={profile.pet.image} alt={profile.pet.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border/50">
                    <span className="text-muted-foreground">Breed</span>
                    <span className="font-medium text-foreground">{profile.pet.breed}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border/50">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium text-foreground">{profile.pet.age}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-2 text-sm">Traits</span>
                    <div className="flex flex-wrap gap-1">
                      {profile.pet.traits.map(trait => (
                        <Badge key={trait} variant="outline" className="rounded-full text-xs font-normal border-border bg-background">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compatibility score — desktop sidebar */}
              <div className="hidden md:block">
                <CompatibilityScore input={compatInput} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
