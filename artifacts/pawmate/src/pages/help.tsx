import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useT, type TranslationKey } from "@/lib/i18n";

/**
 * Every answer here describes behaviour the app actually has. If a feature
 * changes, the answer changes with it — a help page that describes something
 * else is worse than no help page.
 *
 * The text itself lives in the dictionary so it can be read in either language;
 * this table is only the running order.
 */
const SECTIONS: { title: TranslationKey; items: { q: TranslationKey; a: TranslationKey }[] }[] = [
  {
    title: "help.profileTitle",
    items: [
      { q: "help.setupQ", a: "help.setupA" },
      { q: "help.changeQ", a: "help.changeA" },
      { q: "help.petQ", a: "help.petA" },
    ],
  },
  {
    title: "help.findingTitle",
    items: [
      { q: "help.feedQ", a: "help.feedA" },
      { q: "help.sparkQ", a: "help.sparkA" },
    ],
  },
  {
    title: "help.likesTitle",
    items: [
      { q: "help.likeQ", a: "help.likeA" },
      { q: "help.whereQ", a: "help.whereA" },
      { q: "help.undoQ", a: "help.undoA" },
    ],
  },
  {
    title: "help.messagesTitle",
    items: [
      { q: "help.whoQ", a: "help.whoA" },
      { q: "help.playdateQ", a: "help.playdateA" },
    ],
  },
  {
    title: "help.storiesTitle",
    items: [
      { q: "help.storiesQ", a: "help.storiesA" },
      { q: "help.organiseQ", a: "help.organiseA" },
    ],
  },
  {
    title: "help.safetyTitle",
    items: [
      { q: "help.botherQ", a: "help.botherA" },
      { q: "help.controlQ", a: "help.controlA" },
      { q: "help.dataQ", a: "help.dataA" },
      { q: "help.deleteQ", a: "help.deleteA" },
      { q: "help.passwordQ", a: "help.passwordA" },
    ],
  },
];

export default function Help() {
  const t = useT();

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
              {t("help.title")}
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              {t("help.intro")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16 max-w-3xl">
        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                {t(section.title)}
              </h2>
              <Accordion type="single" collapsible className="border-t border-border">
                {section.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      {t(item.q)}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed font-light">
                      {t(item.a)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-border text-center">
          <p className="text-muted-foreground font-light mb-6">
            {t("help.aboutPrompt")}
          </p>
          <Link href="/about">
            <Button variant="outline" className="rounded-full px-8 h-12">{t("help.aboutLink")}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
