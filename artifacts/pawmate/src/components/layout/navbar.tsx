import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Bell, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = location !== "/" && location !== "/login" && location !== "/create-profile";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border relative">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between relative z-50 bg-transparent">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <Heart className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-serif text-2xl font-semibold tracking-wide text-foreground">Pawmate</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {!isLoggedIn ? (
              <>
                <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">How it works</a>
                <a href="/#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-testimonials">Stories</a>
                <div className="flex items-center gap-4">
                  <Link href="/login" data-testid="link-login">
                    <Button variant="ghost" className="font-medium text-foreground">Sign In</Button>
                  </Link>
                  <Link href="/create-profile" data-testid="link-get-started">
                    <Button className="rounded-full px-6 font-medium bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/discover" className={`text-sm font-medium transition-colors ${location === '/discover' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-nav-discover">Discover</Link>
                <Link href="/messages" className={`text-sm font-medium transition-colors ${location.startsWith('/messages') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} data-testid="link-nav-messages">Messages</Link>
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
          <Button variant="ghost" size="icon" className="md:hidden z-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="btn-mobile-menu">
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-20 left-0 right-0 bg-background border-b border-border shadow-lg p-6 flex flex-col gap-6 md:hidden z-40"
            >
              {!isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <a href="/#how-it-works" className="text-lg font-medium text-foreground py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>How it works</a>
                  <a href="/#testimonials" className="text-lg font-medium text-foreground py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>Stories</a>
                  <div className="flex flex-col gap-3 mt-4">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center h-12 text-base rounded-full">Sign In</Button>
                    </Link>
                    <Link href="/create-profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-center h-12 text-base rounded-full bg-primary text-primary-foreground">Get Started</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/discover" className="text-lg font-medium text-foreground py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
                  <Link href="/messages" className="text-lg font-medium text-foreground py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
                  <Link href="/profile/me" className="text-lg font-medium text-foreground py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  <Button variant="ghost" className="justify-start px-0 text-lg font-medium text-foreground py-2 h-auto" onClick={() => setMobileMenuOpen(false)}>
                    Notifications
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
