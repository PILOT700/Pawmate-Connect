import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Users, Quote, MapPin, PawPrint } from "lucide-react";

const petCommunityData = [
  { pet: "Biscuit", breed: "Golden Retriever", owner: "Clara", age: 31, city: "Portland", tags: ["Outdoor lover", "Dog park regular"], image: "/pet-card-1.png" },
  { pet: "Fig", breed: "Orange Tabby", owner: "Marcus", age: 38, city: "Austin", tags: ["Homebody", "Work from home"], image: "/pet-card-2.png" },
  { pet: "Scout", breed: "Border Collie", owner: "Nadia", age: 29, city: "Denver", tags: ["Morning person", "Trail runner"], image: "/pet-card-3.png" }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section — full-width cinematic */}
      <section className="relative w-full overflow-hidden" style={{ height: "calc(100vh - 4.5rem)" }}>
        {/* Background image */}
        <img
          src="/hero-couples.png"
          alt="Two couples walking toward each other in a sun-dappled park with their pets"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Layered gradient overlay: dark at edges, lighter in centre for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

        {/* Centered text content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] text-white mb-5 drop-shadow-sm">
              Connections that start with paws
            </h1>

            {/* Decorative paw divider */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <span className="block w-16 h-px bg-white/40" />
              <PawPrint className="w-5 h-5 text-white/70" />
              <span className="block w-16 h-px bg-white/40" />
            </div>

            <p className="text-base sm:text-lg md:text-xl text-white/85 mb-10 leading-relaxed font-light max-w-xl mx-auto">
              For pet lovers seeking meaningful relationships, friendship, and shared moments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding" data-testid="hero-cta-start">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-10 text-base h-13 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-black/20 font-medium"
                >
                  Join Pawmate
                </Button>
              </Link>
              <Link href="/#how-it-works" data-testid="hero-cta-learn">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-10 text-base h-13 bg-white/10 border-white/50 text-white hover:bg-white/20 backdrop-blur-sm font-medium"
                >
                  Learn more
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Subtle scroll-down indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5"
          >
            <span className="block w-1 h-1.5 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-card relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-foreground mb-4">Meaningful by design</h2>
            <p className="text-muted-foreground text-lg font-light">We built Pawmate differently. No swiping fatigue, just intentional connections.</p>
          </div>
          
          <div className="relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-border/60 z-0"></div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center mb-6 shadow-sm border border-amber-100/50">
                  <span className="font-serif text-4xl text-amber-700 italic">1</span>
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3">Authentic Profiles</h3>
                <p className="text-muted-foreground leading-relaxed font-light">Showcase your lifestyle and your pet's personality. We focus on who you are, not just what you look like.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/20">
                  <span className="font-serif text-4xl text-primary italic">2</span>
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3">Intentional Matching</h3>
                <p className="text-muted-foreground leading-relaxed font-light">Connect over shared interests, pet compatibility, and lifestyle alignment. Quality over quantity.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6 shadow-sm border border-accent/20">
                  <span className="font-serif text-4xl text-accent-foreground italic">3</span>
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3">Safe Community</h3>
                <p className="text-muted-foreground leading-relaxed font-light">A moderated space that values kindness and respect. Comfortable, secure, and genuine.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the community */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-foreground mb-4">Meet the community</h2>
              <p className="text-muted-foreground text-lg font-light">Genuine people and their best friends.</p>
            </div>
            <Link href="/discover" className="hidden md:flex items-center text-primary font-medium hover:text-primary/80 transition-colors">
              View more <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
            {petCommunityData.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className="min-w-[280px] md:min-w-0 bg-card rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 snap-center flex flex-col"
              >
                <div className="h-[240px] md:h-[280px] relative overflow-hidden">
                  <img src={item.image} alt={item.pet} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-serif text-3xl font-medium leading-tight">{item.pet}</h3>
                    <p className="text-white/90 text-sm">{item.breed}</p>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between bg-[#FCFBF8]">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{item.owner}, {item.age}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.city}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-full border border-border/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 md:hidden text-center">
            <Link href="/discover" className="inline-flex items-center text-primary font-medium">
              View more profiles <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust / Testimonial */}
      <section id="testimonials" className="py-24 bg-card relative overflow-hidden">
        <Quote className="absolute top-12 left-12 w-48 h-48 text-primary/5 -rotate-12 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="bg-[#FAF8F5] rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-16 border border-border/60 shadow-sm">
            <div className="md:w-1/2 relative">
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-foreground mb-8 leading-tight">
                "We met at the dog park, but Pawmate made the introduction."
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 italic font-serif leading-relaxed text-foreground/80">
                "I was tired of generic dating apps. Pawmate felt different—calmer, more genuine. Seeing someone's relationship with their pet tells you so much about their character."
              </p>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img src="/profile3.png" alt="Sarah" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-lg">Sarah & Bella</p>
                  <p className="text-sm text-muted-foreground">Found their pack in Seattle</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 w-full h-[400px] md:h-[500px] relative">
              <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-3xl overflow-hidden shadow-xl border-4 border-white z-20">
                <img src="/pet2.png" alt="Community pet" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-10 left-0 w-[55%] h-[55%] rounded-3xl overflow-hidden shadow-lg border-4 border-white z-30">
                <img src="/profile1.png" alt="Community member" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-[15%] w-[40%] h-[40%] rounded-3xl overflow-hidden shadow-md border-4 border-white z-10">
                <img src="/profile2.png" alt="Community member" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-b from-amber-50/50 to-primary/10">
        <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
          <div className="flex justify-center -space-x-4 mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm z-30">
              <img src="/profile1.png" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm z-20">
              <img src="/pet1.png" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-sm z-10">
              <img src="/profile2.png" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl font-semibold text-foreground mb-6">Ready to find your pack?</h2>
          <p className="text-xl text-muted-foreground mb-12 font-light max-w-xl mx-auto">Create your profile today and start connecting with people who share your love for animals.</p>
          <Link href="/create-profile" data-testid="footer-cta-start">
            <Button size="lg" className="rounded-full px-12 text-lg bg-primary text-primary-foreground hover:bg-primary/90 h-16 shadow-xl shadow-primary/20">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
