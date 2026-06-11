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
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Safety</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Guidelines</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pawmate. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
