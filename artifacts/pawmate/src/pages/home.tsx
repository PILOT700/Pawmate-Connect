import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-background">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="font-serif text-5xl md:text-7xl font-semibold leading-[1.1] text-foreground mb-6">
                Find connections that include the <span className="text-primary italic">whole</span> family.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-light">
                A warm, intimate community where your pet is your personality. For adults who want meaningful connections grounded in a shared love of animals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create-profile" data-testid="hero-cta-start">
                  <Button size="lg" className="w-full sm:w-auto rounded-full px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 h-14">
                    Join Pawmate <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login" data-testid="hero-cta-login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 text-base h-14">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
                <img 
                  src="/hero.png" 
                  alt="Couple walking dog in park" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              
              {/* Floating Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 md:-left-12 bg-card p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-border/50 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                  <img src="/pet1.png" alt="Pet avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Matched with Charlie</p>
                  <p className="text-xs text-muted-foreground">3 miles away</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center ml-2">
                  <Heart className="w-4 h-4 text-accent-foreground fill-accent-foreground" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-5xl font-semibold text-foreground mb-4">Meaningful by design</h2>
            <p className="text-muted-foreground text-lg">We built Pawmate differently. No swiping fatigue, just intentional connections.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-card-border/50">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Authentic Profiles</h3>
              <p className="text-muted-foreground leading-relaxed">Showcase your lifestyle and your pet's personality. We focus on who you are, not just what you look like.</p>
            </div>
            <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-card-border/50">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Intentional Matching</h3>
              <p className="text-muted-foreground leading-relaxed">Connect over shared interests, pet compatibility, and lifestyle alignment. Quality over quantity.</p>
            </div>
            <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-card-border/50">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">Safe & Respectful</h3>
              <p className="text-muted-foreground leading-relaxed">A moderated community that values kindness and respect. A comfortable space to explore connections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Testimonial */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-primary/5 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 border border-primary/10">
            <div className="md:w-1/2">
              <h2 className="font-serif text-3xl md:text-5xl font-semibold text-foreground mb-6">"We met at the dog park, but Pawmate made the introduction."</h2>
              <p className="text-lg text-muted-foreground mb-8 italic">"I was tired of generic dating apps. Pawmate felt different—calmer, more genuine. Seeing someone's relationship with their pet tells you so much about their character."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img src="/profile3.png" alt="Sarah" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Sarah & Bella (Golden Retriever)</p>
                  <p className="text-sm text-muted-foreground">Found their pack in Seattle</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src="/profile1.png" alt="Community member" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img src="/pet2.png" alt="Community pet" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img src="/profile2.png" alt="Community member" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-secondary flex items-center justify-center p-6 text-center">
                  <p className="font-serif text-2xl text-foreground font-medium">Join our growing community.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-card text-center border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">Ready to find your pack?</h2>
          <p className="text-lg text-muted-foreground mb-10">Create your profile today and start connecting with people who share your love for animals.</p>
          <Link href="/create-profile" data-testid="footer-cta-start">
            <Button size="lg" className="rounded-full px-10 text-base bg-primary text-primary-foreground hover:bg-primary/90 h-14">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
