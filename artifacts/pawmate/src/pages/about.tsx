import { Link } from "wouter";
import { motion } from "framer-motion";
import { PawPrint, Heart, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRINCIPLES = [
  {
    icon: PawPrint,
    title: "Your pet is part of the introduction",
    body: "A profile here has two halves. Yours, and the animal you share your life with. Species, breed, age, the photo you actually like — all of it sits alongside your own, because for most people it is not a detail, it is the shape of the day.",
  },
  {
    icon: Heart,
    title: "Interest is deliberate",
    body: "You like someone from their profile or from the feed, and nothing happens until they like you back. There is no ranking to climb and no reward for opening the app more often.",
  },
  {
    icon: Users,
    title: "Meeting can be the point",
    body: "Conversations can turn into a proposed playdate with a place and a time, and the community side runs real events — walks, meetups, cafés — that anyone can host and RSVP to.",
  },
  {
    icon: ShieldCheck,
    title: "Leaving is as easy as arriving",
    body: "Anyone can be blocked or reported from their profile, blocks are visible and reversible in Settings, and deleting your account removes it. Nothing is designed to be hard to undo.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-28 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl md:text-6xl font-semibold text-foreground mb-6">
              About Pawmate
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              Pawmate is a place to meet people through the animals you both care about —
              for a relationship, a friendship, or a standing walk on Sunday mornings.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-20 max-w-3xl">
        <div className="space-y-14">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex gap-5 md:gap-7">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">{p.title}</h2>
                  <p className="text-muted-foreground leading-relaxed font-light">{p.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 pt-12 border-t border-border text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
            Questions about how something works?
          </h2>
          <p className="text-muted-foreground font-light mb-8">
            The Help Center walks through profiles, matches, messages and events.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/help">
              <Button variant="outline" className="rounded-full px-8 h-12">Visit the Help Center</Button>
            </Link>
            <Link href="/discover">
              <Button className="rounded-full px-8 h-12 bg-primary text-primary-foreground">
                Start exploring
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
