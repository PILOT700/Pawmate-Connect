import { Link } from "wouter";
import { PawPrint, Instagram, Facebook, Twitter, Mail } from "lucide-react";

/**
 * Terms, Privacy and the Guidelines are linked because the design asks for
 * them. They lead to short pages saying the document is being prepared rather
 * than to "#": a link that goes nowhere is worse than one that says so.
 */
const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Discover",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "For pet lovers", href: "/#community" },
      { label: "Browse members", href: "/discover" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Events", href: "/community" },
      { label: "Help Center", href: "/help" },
      { label: "Community Guidelines", href: "/guidelines" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const SOCIALS = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Twitter, label: "X" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-card-border mt-auto">
      <div className="container mx-auto px-4 md:px-8 py-14">
        <div className="grid gap-10 lg:gap-8 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.5fr]">

          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <PawPrint className="w-6 h-6 text-forest transition-transform group-hover:scale-110" />
              <span className="font-serif text-2xl font-semibold text-forest">PawMate</span>
            </Link>
            <p className="text-sm text-foreground/65 leading-relaxed max-w-xs">
              Meaningful connections grounded in a shared love of animals. Find your person,
              and their pet.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h4 className="font-serif text-base font-semibold text-forest mb-4">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/65 hover:text-forest transition-colors"
                      data-testid={`footer-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h4 className="font-serif text-base font-semibold text-forest mb-4">Newsletter</h4>
            <p className="text-sm text-foreground/65 leading-relaxed mb-4">
              Occasional notes about new features and local events.
            </p>
            {/* Not wired to anything yet — there is no list to subscribe to, so
                it says so rather than pretending to accept an address. */}
            <div className="flex gap-2">
              <div className="flex-1 h-11 rounded-xl bg-background border border-card-border flex items-center px-3.5 gap-2 text-sm text-foreground/40">
                <Mail className="w-4 h-4 shrink-0" />
                you@example.com
              </div>
            </div>
            <p className="text-xs text-foreground/45 mt-2">Sign-ups open once we launch.</p>

            <div className="flex gap-2.5 mt-6">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  title={`${label} — not set up yet`}
                  className="w-9 h-9 rounded-full bg-background border border-card-border flex items-center justify-center text-foreground/45"
                >
                  <Icon className="w-4 h-4" />
                </span>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-12 pt-7 border-t border-card-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-foreground/55">
            &copy; {new Date().getFullYear()} PawMate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-foreground/55 hover:text-forest transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-foreground/55 hover:text-forest transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
