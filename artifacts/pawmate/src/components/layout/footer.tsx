import { Heart } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-background py-16 border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-6 inline-flex">
              <Heart className="w-6 h-6 text-primary" />
              <span className="font-serif text-2xl font-semibold tracking-wide text-foreground">Pawmate</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              Meaningful connections grounded in a shared love of animals. Find your person, and their pet.
            </p>
          </div>
          {/* Only what there is a page for. Careers, Press, Safety and
              Guidelines were links to nowhere. */}
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Pawmate</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-help">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pawmate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
