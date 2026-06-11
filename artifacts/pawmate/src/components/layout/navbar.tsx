import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Bell, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = location !== "/" && location !== "/login";

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
          <Heart className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-serif text-2xl font-semibold tracking-wide text-foreground">Pawmate</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {!isLoggedIn ? (
            <>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">How it works</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-testimonials">Stories</a>
              <div className="flex items-center gap-4">
                <Link href="/login" data-testid="link-login">
                  <Button variant="ghost" className="font-medium text-foreground">Sign In</Button>
                </Link>
                <Link href="/login" data-testid="link-get-started">
                  <Button className="rounded-full px-6 font-medium bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link href="/discover" className={`text-sm font-medium transition-colors ${location === '/discover' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-nav-discover">Discover</Link>
              <Link href="/messages" className={`text-sm font-medium transition-colors ${location === '/messages' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-nav-messages">Messages</Link>
              <div className="flex items-center gap-4 ml-4">
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="btn-notifications">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Link href="/profile/me" data-testid="link-nav-profile">
                  <Button variant="ghost" size="icon" className="rounded-full bg-secondary">
                    <User className="w-5 h-5 text-foreground" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="btn-mobile-menu">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2">
          {!isLoggedIn ? (
            <>
              <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>How it works</a>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-foreground">Sign In</Button>
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full bg-primary text-primary-foreground">Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/discover" className="px-4 py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
              <Link href="/messages" className="px-4 py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <Link href="/profile/me" className="px-4 py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
