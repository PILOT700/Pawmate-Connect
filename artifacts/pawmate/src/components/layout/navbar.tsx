import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Bell, User, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const publicNavLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "For pet lovers", href: "/#community" },
  { label: "Safety", href: "/#how-it-works" },
  { label: "Community", href: "/#testimonials" },
  { label: "About us", href: "/#testimonials" },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = location !== "/" && location !== "/login" && location !== "/create-profile";
  const isHero = location === "/";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-8 h-[4.5rem] flex items-center justify-between relative z-50">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <PawPrint className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
            <span className="font-serif text-2xl font-semibold tracking-wide text-foreground">
              Pawmate
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {!isLoggedIn ? (
              <>
                {publicNavLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex items-center gap-3 ml-2">
                  <Link href="/login" data-testid="link-login">
                    <Button variant="outline" className="font-medium rounded-full px-5 h-9 border-border text-foreground">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/create-profile" data-testid="link-get-started">
                    <Button className="rounded-full px-5 h-9 font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      Sign up
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/discover" className={`text-sm font-medium transition-colors ${location === "/discover" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid="link-nav-discover">Discover</Link>
                <Link href="/messages" className={`text-sm font-medium transition-colors ${location.startsWith("/messages") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`} data-testid="link-nav-messages">Messages</Link>
                <div className="flex items-center gap-3 ml-3">
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
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden z-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="btn-mobile-menu"
          >
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

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-[4.5rem] left-0 right-0 bg-background border-b border-border shadow-xl p-6 flex flex-col gap-5 md:hidden z-40"
            >
              {!isLoggedIn ? (
                <>
                  {publicNavLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-base font-medium text-foreground py-1.5 border-b border-border/40"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3 pt-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-11 text-base rounded-full">Log in</Button>
                    </Link>
                    <Link href="/create-profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-11 text-base rounded-full bg-primary text-primary-foreground">Sign up</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/discover" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
                  <Link href="/messages" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
                  <Link href="/profile/me" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
