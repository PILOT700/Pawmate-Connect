import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Bell, PawPrint, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const publicNavLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "For pet lovers", href: "/#community" },
  { label: "Safety", href: "/#how-it-works" },
  { label: "Community", href: "/#testimonials" },
  { label: "About us", href: "/#testimonials" },
];

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const isLoggedIn = !!user;

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  const userInitial = user?.user_metadata?.full_name?.[0]?.toUpperCase()
    ?? user?.email?.[0]?.toUpperCase()
    ?? "U";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-8 h-[4.5rem] flex items-center justify-between relative z-50">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <PawPrint className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
            <span className="font-serif text-2xl font-semibold tracking-wide text-foreground">Pawmate</span>
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
                  <Link href="/login" data-testid="link-get-started">
                    <Button className="rounded-full px-5 h-9 font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      Sign up
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/discover"
                  className={`text-sm font-medium transition-colors ${location === "/discover" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-nav-discover"
                >
                  Discover
                </Link>
                <Link
                  href="/messages"
                  className={`text-sm font-medium transition-colors ${location.startsWith("/messages") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-nav-messages"
                >
                  Messages
                </Link>
                <div className="flex items-center gap-3 ml-3">
                  <Button variant="ghost" size="icon" className="rounded-full relative" data-testid="btn-notifications">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-secondary transition-colors"
                        data-testid="btn-user-menu"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                          {userInitial}
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5">
                      <div className="px-2 py-1.5 mb-1">
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link href="/profile/me" data-testid="link-my-profile">
                          <User className="w-4 h-4 mr-2" /> My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link href="/create-profile" data-testid="link-edit-profile">
                          <PawPrint className="w-4 h-4 mr-2" /> Edit Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="rounded-xl cursor-pointer text-destructive focus:text-destructive"
                        data-testid="btn-sign-out"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-11 text-base rounded-full bg-primary text-primary-foreground">Sign up</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {userInitial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name ?? "My Account"}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</p>
                    </div>
                  </div>
                  <Link href="/discover" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
                  <Link href="/messages" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
                  <Link href="/profile/me" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="text-base font-medium text-destructive text-left py-1.5"
                    data-testid="btn-mobile-sign-out"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
