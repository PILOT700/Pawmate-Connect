import { Link } from "wouter";
import { PawPrint, Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * Terms, Privacy and the Guidelines are linked because the design asks for
 * them. They lead to short pages saying the document is being prepared rather
 * than to "#": a link that goes nowhere is worse than one that says so.
 */
const COLUMNS = [
  {
    heading: "footer.discover",
    links: [
      { key: "nav.howItWorks", href: "/#how-it-works" },
      { key: "footer.forPetLovers", href: "/#community" },
      { key: "footer.browseMembers", href: "/discover" },
    ],
  },
  {
    heading: "footer.community",
    links: [
      { key: "footer.events", href: "/community" },
      { key: "footer.helpCenter", href: "/help" },
      { key: "footer.guidelines", href: "/guidelines" },
    ],
  },
  {
    heading: "footer.company",
    links: [
      { key: "footer.aboutUs", href: "/about" },
      { key: "footer.terms", href: "/terms" },
      { key: "footer.privacy", href: "/privacy" },
    ],
  },
] as const;

const SOCIALS = [
  { icon: Instagram, label: "Instagram" },
  { icon: Facebook, label: "Facebook" },
  { icon: Twitter, label: "X" },
];

export function Footer() {
  const t = useT();

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
              {t("footer.tagline")}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={t(col.heading)}>
              <h4 className="font-serif text-base font-semibold text-forest mb-4">{t(col.heading)}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.key}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/65 hover:text-forest transition-colors"
                      data-testid={`footer-${l.key.split(".")[1]}`}
                    >
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h4 className="font-serif text-base font-semibold text-forest mb-4">{t("footer.newsletter")}</h4>
            <p className="text-sm text-foreground/65 leading-relaxed mb-4">
              {t("footer.newsletterBody")}
            </p>
            {/* Not wired to anything yet — there is no list to subscribe to, so
                it says so rather than pretending to accept an address. */}
            <div className="flex gap-2">
              <div className="flex-1 h-11 rounded-xl bg-background border border-card-border flex items-center px-3.5 gap-2 text-sm text-foreground/40">
                <Mail className="w-4 h-4 shrink-0" />
                {t("footer.emailPlaceholder")}
              </div>
            </div>
            <p className="text-xs text-foreground/45 mt-2">{t("footer.newsletterClosed")}</p>

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
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-foreground/55 hover:text-forest transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/privacy" className="text-sm text-foreground/55 hover:text-forest transition-colors">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
