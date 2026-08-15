import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  PawPrint,
  ShieldCheck,
  MessageCircle,
  CalendarCheck,
  Users,
  Heart,
  MapPin,
  Quote,
  ChevronLeft,
  ChevronRight,
  Apple,
  Play,
} from "lucide-react";
import { heroImage, communityImage, matchImage, members, voices } from "@/lib/landing-images";

/**
 * PLACEHOLDER COPY — the wording below comes from the design and makes claims
 * the product cannot yet back: nothing verifies members, there are no apps in
 * either store, the quoted people do not exist, and the accounts number four
 * rather than thousands. Photographs are swapped through
 * `src/lib/landing-images.ts` without touching this file.
 */

const FEATURES = [
  { icon: PawPrint, title: "Pet-First Matching", body: "We match you based on your pets and lifestyle." },
  { icon: ShieldCheck, title: "Verified Members", body: "Real people, real pets. Safe and trustworthy." },
  { icon: MessageCircle, title: "Easy Conversations", body: "Break the ice with pet-friendly prompts." },
  { icon: CalendarCheck, title: "Meet & Connect", body: "Find friendship or love in your area." },
  { icon: Users, title: "Supportive Community", body: "Join events and groups for pet lovers." },
];

function Eyebrow({ icon: Icon, children }: { icon: typeof PawPrint; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="w-7 h-7 rounded-full bg-sand flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-warm" />
      </span>
      <span className="text-sm font-medium text-warm">{children}</span>
    </div>
  );
}

/** A store badge. Not a link: there is no app to send anyone to. */
function StoreBadge({ icon: Icon, small, large }: { icon: typeof Apple; small: string; large: string }) {
  return (
    <div className="h-12 rounded-lg bg-[#111] text-white flex items-center gap-2.5 px-4">
      <Icon className="w-6 h-6 shrink-0" />
      <span className="leading-tight text-left">
        <span className="block text-[0.55rem] uppercase tracking-wide opacity-80">{small}</span>
        <span className="block text-sm font-semibold -mt-0.5">{large}</span>
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ══════════════════════════ Hero ══════════════════════════ */}
      <section className="relative bg-background lg:min-h-[36rem]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="relative z-10 grid lg:grid-cols-2 items-center gap-8 pt-12 pb-8 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-sm border border-card-border pl-1.5 pr-4 py-1.5 mb-8 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-sand flex items-center justify-center">
                  <PawPrint className="w-3.5 h-3.5 text-forest" />
                </span>
                <span className="text-sm text-foreground/80">Connections that start with paws</span>
              </div>

              <h1 className="font-serif text-[2.75rem] leading-[1.06] sm:text-6xl lg:text-[4.1rem] font-semibold text-forest mb-6 text-balance">
                Where pet lovers find their person
              </h1>

              <p className="text-[1.05rem] text-foreground/70 leading-relaxed mb-9 max-w-sm">
                PawMate is a community for pet lovers seeking meaningful relationships,
                friendship, and shared moments.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/login?tab=register" data-testid="hero-cta-start">
                  <Button className="h-14 rounded-xl px-7 bg-forest text-forest-foreground hover:bg-forest/90 text-base font-medium shadow-sm">
                    <PawPrint className="w-4 h-4 mr-2" /> Join PawMate
                  </Button>
                </Link>
                <Link href="/#how-it-works" data-testid="hero-cta-learn">
                  <Button
                    variant="outline"
                    className="h-14 rounded-xl px-7 bg-card border-card-border text-base font-medium text-forest hover:bg-card"
                  >
                    Learn more
                  </Button>
                </Link>
              </div>
            </motion.div>

            <div className="hidden lg:block" aria-hidden="true" />
          </div>
        </div>

        {/* Runs to the window's edge, not the container's, and dissolves into
            the cream rather than ending on a line. */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-[58%]">
          <div className="relative h-72 sm:h-[26rem] lg:h-full">
            <img
              src={heroImage.src}
              alt={heroImage.alt}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent lg:via-background/25" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
      </section>

      {/* ═════════════════════ Feature strip ═════════════════════ */}
      <section id="how-it-works" className="relative z-10 bg-sand/60">
        <div className="container mx-auto px-4 md:px-8 py-12 lg:py-14">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="text-center flex flex-col items-center">
                  <span className="w-14 h-14 rounded-full bg-card flex items-center justify-center mb-4 shadow-xs">
                    <Icon className="w-6 h-6 text-forest" strokeWidth={1.6} />
                  </span>
                  <h3 className="font-semibold text-[0.95rem] text-forest mb-1.5">{f.title}</h3>
                  <p className="text-[0.83rem] text-foreground/65 leading-snug max-w-[13rem]">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ People who love pets ═══════════════════ */}
      <section id="community" className="bg-background">
        <div className="container mx-auto px-4 md:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-[1fr_23rem] gap-10 lg:gap-12 items-start">

            <div>
              <Eyebrow icon={Heart}>Find your match</Eyebrow>
              <h2 className="font-serif text-[2.1rem] lg:text-[2.65rem] leading-[1.12] font-semibold text-forest mb-9 text-balance max-w-md">
                People who love pets, just like you do
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {members.map((m) => (
                  <article
                    key={m.name}
                    className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-xs"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-sand">
                      <img src={m.src} alt={m.alt} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-semibold text-sm text-forest">{m.name}, {m.age}</h3>
                      <p className="text-xs text-foreground/60 mt-0.5">{m.role}</p>
                      <p className="flex items-center gap-1 text-xs text-foreground/60 mt-2">
                        <MapPin className="w-3 h-3 text-warm shrink-0" /> {m.distance}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <Link href="/discover" data-testid="link-browse-members">
                <Button className="mt-8 h-12 rounded-xl px-6 bg-forest text-forest-foreground hover:bg-forest/90 font-medium">
                  <PawPrint className="w-4 h-4 mr-2" /> Browse members
                </Button>
              </Link>
            </div>

            {/* Phone panel */}
            <div className="bg-sand/70 rounded-[1.75rem] p-7 lg:p-8 flex flex-col items-center text-center">
              <div className="w-[13rem] rounded-[2.25rem] bg-card border-[7px] border-[#1b1b1b] shadow-lg overflow-hidden mb-8">
                <div className="pt-6 pb-7 px-5">
                  <p className="font-serif text-[0.95rem] text-forest mb-4">PawMate</p>
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4 bg-sand">
                    <img src={matchImage.src} alt={matchImage.alt} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="font-serif text-[1.3rem] font-semibold text-forest">It's a match!</p>
                  <p className="text-[0.7rem] text-foreground/60 mt-1.5 leading-snug">
                    You and Olivia<br />liked each other.
                  </p>
                  <Heart className="w-5 h-5 text-warm mx-auto mt-5" strokeWidth={1.5} />
                  <span className="block w-20 h-1 rounded-full bg-foreground/15 mx-auto mt-6" />
                </div>
              </div>

              <span className="w-9 h-9 rounded-full bg-card flex items-center justify-center mb-3 shadow-xs">
                <PawPrint className="w-4 h-4 text-forest" />
              </span>
              <h3 className="font-serif text-[1.6rem] font-semibold text-forest mb-2.5">Better together</h3>
              <p className="text-sm text-foreground/65 leading-relaxed mb-6 max-w-[15rem]">
                Our app makes it easy to find people who share your love for pets.
              </p>

              <div className="flex flex-col gap-2.5 w-full max-w-[12rem]">
                <StoreBadge icon={Apple} small="Download on the" large="App Store" />
                <StoreBadge icon={Play} small="Get it on" large="Google Play" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════ Real stories ══════════════════════ */}
      <section id="stories" className="bg-sand/40 border-y border-card-border">
        <div className="grid lg:grid-cols-[27rem_1fr] items-stretch">
          <div className="h-72 lg:h-auto lg:min-h-[27rem] bg-sand">
            <img
              src={communityImage.src}
              alt={communityImage.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="px-4 md:px-8 lg:px-14 py-14 lg:py-16">
            <div className="flex items-start justify-between gap-6 mb-9">
              <div>
                <Eyebrow icon={PawPrint}>Community</Eyebrow>
                <h2 className="font-serif text-[2.1rem] lg:text-[2.5rem] leading-[1.12] font-semibold text-forest text-balance max-w-sm">
                  Real stories from real pet lovers
                </h2>
              </div>
              {/* Present in the design; there is only one page of stories, so
                  they are shown inert rather than wired to nothing. */}
              <div className="hidden md:flex gap-2 shrink-0 pt-1" aria-hidden="true">
                <span className="w-11 h-11 rounded-full bg-card border border-card-border flex items-center justify-center text-foreground/40">
                  <ChevronLeft className="w-4 h-4" />
                </span>
                <span className="w-11 h-11 rounded-full bg-card border border-card-border flex items-center justify-center text-foreground/40">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {voices.map((v) => (
                <figure key={v.who} className="bg-card border border-card-border rounded-2xl p-5 flex flex-col">
                  <Quote className="w-5 h-5 text-warm/70 fill-warm/30 mb-3" />
                  <blockquote className="text-[0.85rem] text-foreground/80 leading-relaxed flex-1">
                    {v.quote}
                  </blockquote>
                  <figcaption className="flex items-center gap-2 mt-5 text-xs text-foreground/60">
                    <span className="w-7 h-7 rounded-full overflow-hidden bg-sand shrink-0">
                      <img src={v.src} alt={v.alt} className="w-full h-full object-cover" loading="lazy" />
                    </span>
                    — {v.who}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ Closing band ═══════════════════════ */}
      <section className="bg-background pt-14 pb-16 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-forest text-forest-foreground px-7 py-10 md:px-14 md:py-11">
            <Heart
              className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 w-44 h-44 text-forest-foreground/10"
              strokeWidth={0.9}
              aria-hidden="true"
            />
            <PawPrint
              className="pointer-events-none absolute right-8 bottom-3 w-24 h-24 text-forest-foreground/10"
              strokeWidth={0.9}
              aria-hidden="true"
            />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="md:pl-24">
                <h2 className="font-serif text-[1.8rem] md:text-[2.1rem] font-semibold mb-2 text-balance">
                  Ready to start your story?
                </h2>
                <p className="text-forest-foreground/70 leading-relaxed max-w-sm text-[0.95rem]">
                  Join thousands of pet lovers and find friendship, love, and wagging tails.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 shrink-0">
                <Link href="/login?tab=register" data-testid="footer-cta-start">
                  <Button className="h-12 rounded-xl px-6 bg-card text-forest hover:bg-card/90 font-medium">
                    <PawPrint className="w-4 h-4 mr-2" /> Sign up for free
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl px-6 bg-transparent border-forest-foreground/35 text-forest-foreground hover:bg-forest-foreground/10 font-medium"
                  >
                    Learn more
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
