import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { X, Heart, MessageCircle, Eye, PawPrint, Check, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, markNotifRead, markAllNotifsRead } from "@/lib/notif-store";
import type { NotifType } from "@/lib/notif-store";

const typeIcon: Record<NotifType, React.ReactNode> = {
  match: <Heart className="w-3.5 h-3.5 fill-current" />,
  message: <MessageCircle className="w-3.5 h-3.5" />,
  view: <Eye className="w-3.5 h-3.5" />,
  playdate: <CalendarCheck className="w-3.5 h-3.5" />,
};

const typeColor: Record<NotifType, string> = {
  match: "bg-rose-100 text-rose-500",
  message: "bg-primary/15 text-primary",
  view: "bg-secondary text-muted-foreground",
  playdate: "bg-amber-100 text-amber-600",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ open, onClose }: Props) {
  const notifications = useNotifications();
  const unread = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.aside
            key="drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-background shadow-2xl flex flex-col border-l border-border"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <PawPrint className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground leading-none">Notifications</h2>
                  {unread > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">{unread} unread</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                    data-testid="btn-mark-all-read"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8 ml-1"
                  onClick={onClose}
                  data-testid="btn-close-notifications"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <PawPrint className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-serif text-lg text-foreground mb-1">All caught up</p>
                  <p className="text-sm text-muted-foreground">No new notifications right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((n, idx) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Link
                        href={n.href}
                        onClick={() => { markNotifRead(n.id); onClose(); }}
                        data-testid={`link-notif-${n.id}`}
                        className={`flex items-start gap-4 px-6 py-4 hover:bg-secondary/40 transition-colors cursor-pointer relative ${!n.read ? "bg-primary/[0.03]" : ""}`}
                      >
                        {!n.read && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}

                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-sm">
                            <img src={n.avatar} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-background ${typeColor[n.type]}`}>
                            {typeIcon[n.type]}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug mb-0.5 ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                            {n.title}
                          </p>
                          {n.petName && (
                            <p className="text-[11px] text-primary font-medium mb-0.5 flex items-center gap-1">
                              <PawPrint className="w-2.5 h-2.5" /> {n.petName}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {n.body}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1.5">{n.time}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="px-6 py-4 border-t border-border">
              <Link
                href="/discover"
                onClick={onClose}
                className="block text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                data-testid="link-notif-discover"
              >
                Discover more people →
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
