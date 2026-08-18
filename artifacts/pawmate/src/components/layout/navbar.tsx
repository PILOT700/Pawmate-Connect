import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Bell, User, PawPrint, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationsDrawer } from "@/components/notifications-drawer";
import {
  useLogoutUser,
  useListNotifications,
  getListNotificationsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { useI18n, LANGUAGES } from "@/lib/i18n";


// The five entries the design asks for. Every one lands somewhere real:
// "Blog" has no posts yet and says so rather than pointing at nothing.
const publicNavLinks = [
  { key: "nav.howItWorks", href: "/#how-it-works" },
  { key: "nav.findPets", href: "/discover" },
  { key: "nav.successStories", href: "/#stories" },
  { key: "nav.blog", href: "/blog" },
  { key: "nav.aboutUs", href: "/about" },
] as const;

/**
 * Two languages, so a pair of buttons beats a dropdown: the choice and the
 * current state are both visible without opening anything.
 */
function LanguageToggle({
  language,
  setLanguage,
  className = "",
}: {
  language: string;
  setLanguage: (next: "en" | "ru") => void;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center rounded-xl border border-border overflow-hidden ${className}`}
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLanguage(l.code)}
          aria-pressed={language === l.code}
          className={`px-2.5 h-9 text-xs font-medium transition-colors ${
            language === l.code
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid={`btn-lang-${l.code}`}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { user, refreshSession } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const logout = useLogoutUser();

  const isLoggedIn = Boolean(user);
  // Polled so the badge reflects notifications created while the tab is open.
  const { data: notificationsData } = useListNotifications(undefined, {
    query: {
      queryKey: getListNotificationsQueryKey(),
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    },
  });
  const unreadCount = (notificationsData?.items ?? []).filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout.mutateAsync();
    await refreshSession();
    setMobileMenuOpen(false);
    setLocation("/");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-8 h-[4.5rem] flex items-center justify-between relative z-50">

          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <PawPrint className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
            <span className="font-serif text-2xl font-semibold tracking-wide text-foreground">Pawmate</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            {!isLoggedIn ? (
              <>
                {publicNavLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-${link.key.split(".")[1]}`}
                  >
                    {t(link.key)}
                  </a>
                ))}
                <div className="flex items-center gap-3 ml-2">
                  <LanguageToggle language={language} setLanguage={setLanguage} />
                  <Link href="/login" data-testid="link-login">
                    <Button variant="outline" className="font-medium rounded-xl px-5 h-10 border-border text-foreground">
                      {t("nav.logIn")}
                    </Button>
                  </Link>
                  <Link href="/login?tab=register" data-testid="link-get-started">
                    <Button className="rounded-xl px-5 h-10 font-medium bg-forest text-forest-foreground hover:bg-forest/90">
                      {t("nav.signUp")}
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
                  href="/liked"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${location === "/liked" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-nav-liked"
                >
                  <Heart className={`w-3.5 h-3.5 ${location === "/liked" ? "fill-current text-primary" : ""}`} />
                  Liked
                </Link>
                <Link
                  href="/community"
                  className={`text-sm font-medium transition-colors ${location === "/community" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-nav-community"
                >
                  Community
                </Link>
                <div className="h-4 w-px bg-border/30" />
                <Link
                  href="/create-event"
                  className={`text-sm font-medium transition-colors ${location === "/create-event" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-nav-create-event"
                >
                  + Event
                </Link>
                <Link
                  href="/create-story"
                  className={`text-sm font-medium transition-colors ${location === "/create-story" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-nav-create-story"
                >
                  + Story
                </Link>
                <Link
                  href="/messages"
                  className={`text-sm font-medium transition-colors ${location.startsWith("/messages") ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-nav-messages"
                >
                  Messages
                </Link>
                <div className="flex items-center gap-3 ml-3">
                  <button
                    onClick={() => setNotifOpen(true)}
                    className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    data-testid="btn-notifications"
                  >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-400 border-2 border-background" />
                    )}
                  </button>
                  <Link href="/settings" data-testid="link-nav-profile">
                    <Button variant="ghost" size="icon" className="rounded-full bg-secondary">
                      <User className="w-5 h-5 text-foreground" />
                    </Button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
                    title="Log out"
                    data-testid="btn-logout"
                  >
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden z-50"
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
              className="absolute top-[4.5rem] left-0 right-0 bg-background border-b border-border shadow-xl p-6 flex flex-col gap-5 lg:hidden z-40"
            >
              {!isLoggedIn ? (
                <>
                  {publicNavLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.href}
                      className="text-base font-medium text-foreground py-1.5 border-b border-border/40"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(link.key)}
                    </a>
                  ))}
                  <div className="flex flex-col gap-3 pt-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-11 text-base rounded-full">Log in</Button>
                    </Link>
                    <Link href="/login?tab=register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-11 text-base rounded-full bg-primary text-primary-foreground">Sign up</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/discover" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Discover</Link>
                  <Link href="/liked" className="text-base font-medium text-foreground py-1.5 border-b border-border/40 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <Heart className="w-4 h-4 text-primary" /> Liked
                  </Link>
                  <Link href="/community" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Community</Link>
                  <Link href="/create-event" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Create Event</Link>
                  <Link href="/create-story" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Share Story</Link>
                  <Link href="/messages" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
                  <Link href="/profile/me" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  <Link href="/settings" className="text-base font-medium text-foreground py-1.5 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                  <button
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="text-base font-medium text-foreground py-1.5 flex items-center gap-2 disabled:opacity-50"
                    data-testid="btn-logout-mobile"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
