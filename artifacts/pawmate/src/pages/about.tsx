import { Link } from "wouter";
import { motion } from "framer-motion";
import { PawPrint, Heart, Users, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT, type TranslationKey } from "@/lib/i18n";

/** Keys rather than sentences: the copy lives in the dictionary, in both languages. */
const PRINCIPLES: { icon: LucideIcon; title: TranslationKey; body: TranslationKey }[] = [
  { icon: PawPrint, title: "about.petTitle", body: "about.petBody" },
  { icon: Heart, title: "about.interestTitle", body: "about.interestBody" },
  { icon: Users, title: "about.meetTitle", body: "about.meetBody" },
  { icon: ShieldCheck, title: "about.leaveTitle", body: "about.leaveBody" },
];

export default function About() {
  const t = useT();

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
              {t("about.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              {t("about.intro")}
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
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">{t(p.title)}</h2>
                  <p className="text-muted-foreground leading-relaxed font-light">{t(p.body)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 pt-12 border-t border-border text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
            {t("about.questionsTitle")}
          </h2>
          <p className="text-muted-foreground font-light mb-8">
            {t("about.questionsBody")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/help">
              <Button variant="outline" className="rounded-full px-8 h-12">{t("pending.visitHelp")}</Button>
            </Link>
            <Link href="/discover">
              <Button className="rounded-full px-8 h-12 bg-primary text-primary-foreground">
                {t("about.startExploring")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
