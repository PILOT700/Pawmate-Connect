import { Link } from "wouter";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Stands in for a document that has not been written yet.
 *
 * The footer links to Terms, Privacy and the Guidelines because the design
 * calls for them, and because a signup form that asks people to agree to
 * something should at least say where that something is. Until the real text
 * exists, saying so plainly beats a link into nothing — and beats inventing
 * legal wording that would look authoritative while carrying no weight.
 */
export function DocumentPending({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-background flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg text-center"
      >
        <span className="w-14 h-14 rounded-full bg-sand flex items-center justify-center mx-auto mb-6">
          <FileText className="w-6 h-6 text-forest" strokeWidth={1.6} />
        </span>

        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-forest mb-4">{title}</h1>

        <p className="text-foreground/70 leading-relaxed mb-3">{blurb}</p>
        <p className="text-foreground/70 leading-relaxed mb-9">
          It isn't written yet. Rather than show you a page of text that looks official and
          isn't, we'd rather say so — and publish the real thing when it's ready.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/help">
            <Button className="h-12 rounded-xl px-6 bg-forest text-forest-foreground hover:bg-forest/90 font-medium">
              Visit the Help Center
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="h-12 rounded-xl px-6 border-card-border bg-card text-forest">
              Back to the start
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function Terms() {
  return (
    <DocumentPending
      title="Terms of Service"
      blurb="The terms set out what you can expect from PawMate and what we expect of you."
    />
  );
}

export function Privacy() {
  return (
    <DocumentPending
      title="Privacy Policy"
      blurb="The privacy policy explains what we hold about you, where it lives, and what you can ask us to do with it."
    />
  );
}

export function Guidelines() {
  return (
    <DocumentPending
      title="Community Guidelines"
      blurb="The guidelines describe how people are expected to treat each other here, and what happens when they don't."
    />
  );
}

export function Blog() {
  return (
    <DocumentPending
      title="Blog"
      blurb="Notes on pets, the people who love them, and what we're building here."
    />
  );
}
