import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Every answer here describes behaviour the app actually has. If a feature
 * changes, the answer changes with it — a help page that describes something
 * else is worse than no help page.
 */
const SECTIONS: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Your profile",
    items: [
      {
        q: "How do I set up my profile?",
        a: "Signing up takes you through a short set of questions — the pet you have, who you want to meet, what you're looking for, and how far you're willing to go — and then into the profile form itself: name, age, city, a few lines about you, your photo, and your pet's details.",
      },
      {
        q: "Can I change things later?",
        a: "Yes. Edit profile on your own profile page reopens the same form with everything already filled in, and saving updates your existing pet rather than adding another one.",
      },
      {
        q: "Do I have to add a pet?",
        a: "No. Your profile works without one, and your pet card simply says you haven't added one yet. You can add it whenever you like.",
      },
    ],
  },
  {
    title: "Finding people",
    items: [
      {
        q: "How does Discover decide what to show me?",
        a: "It starts from what you said during onboarding — if you named a single kind of pet you'd like to meet, or a single thing you're looking for, the feed opens filtered that way. Change either filter at the top and your choice sticks for the rest of the visit.",
      },
      {
        q: "What is the Daily Spark?",
        a: "One profile lifted out of the feed with an ice-breaker question attached, as a prompt to start somewhere rather than scroll. You can dismiss it and bring it back from the filter bar.",
      },
    ],
  },
  {
    title: "Likes and matches",
    items: [
      {
        q: "What happens when I like someone?",
        a: "They don't hear about it unless they like you back. When they do, it's a match: you both get a notification and can start a conversation.",
      },
      {
        q: "Where can I see who I've liked?",
        a: "The Liked page lists every like you've sent and marks the ones that turned into matches.",
      },
      {
        q: "Can I take a like back?",
        a: "Yes, from the Liked page. If you'd already matched, removing the like also ends the match — your conversation and any planned playdates go with it, for both of you.",
      },
    ],
  },
  {
    title: "Messages and playdates",
    items: [
      {
        q: "Who can message me?",
        a: "Only people you've matched with. There is no way to send a message to someone who hasn't liked you back.",
      },
      {
        q: "How do playdates work?",
        a: "Inside a conversation you can propose one with a place and a time. The other person accepts or declines, and the answer shows up in the conversation.",
      },
    ],
  },
  {
    title: "Stories and events",
    items: [
      {
        q: "What are stories?",
        a: "Short photo posts on your profile, optionally marked as a pet moment. People who view them are recorded as having seen them.",
      },
      {
        q: "Can I organise something myself?",
        a: "Yes — Community lists events by category, and anyone can create one with a place, a time and a description. Others can RSVP, save it for later, and comment.",
      },
    ],
  },
  {
    title: "Safety and your account",
    items: [
      {
        q: "Someone is bothering me. What can I do?",
        a: "Every profile has block and report on it. Blocking hides you from each other; reporting sends us the reason and anything you want to add, and the person is not told. Blocks can be undone in Settings, where they're listed.",
      },
      {
        q: "How do I control notifications and privacy?",
        a: "Settings holds both, and each toggle saves as you flip it — there's nothing to submit.",
      },
      {
        q: "Can I get a copy of my data?",
        a: "Yes — Settings has a download that hands you a JSON file with everything we hold about you: your account, pets, preferences, and what you've done here. It leaves out messages other people wrote to you, since those are their words rather than yours.",
      },
      {
        q: "How do I delete my account?",
        a: "At the bottom of Settings. You'll be asked to confirm, because it can't be undone.",
      },
      {
        q: "I've forgotten my password.",
        a: "There's no self-service password reset yet. If you can't get in, get in touch and we'll help — we'd rather say this plainly than send you round a loop that doesn't exist.",
      },
    ],
  },
];

export default function Help() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-8 py-20 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-5">
              Help Center
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              How profiles, matches, messages and events work — and what to do when
              something goes wrong.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16 max-w-3xl">
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="border-t border-border">
                {section.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed font-light">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-border text-center">
          <p className="text-muted-foreground font-light mb-6">
            Curious what Pawmate is trying to be, rather than how it works?
          </p>
          <Link href="/about">
            <Button variant="outline" className="rounded-full px-8 h-12">Read about Pawmate</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
