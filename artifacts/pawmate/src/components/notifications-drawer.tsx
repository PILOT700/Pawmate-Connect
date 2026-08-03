import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { X, Heart, MessageCircle, Eye, PawPrint, Check, CalendarCheck, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";

type NotifType = "match" | "message" | "view" | "playdate" | "comment" | "like";

const typeIcon: Record<NotifType, React.ReactNode> = {
  match: <Heart className="w-3.5 h-3.5 fill-current" />,
  message: <MessageCircle className="w-3.5 h-3.5" />,
  view: <Eye className="w-3.5 h-3.5" />,
  playdate: <CalendarCheck className="w-3.5 h-3.5" />,
  comment: <MessageCircle className="w-3.5 h-3.5" />,
  like: <Heart className="w-3.5 h-3.5 fill-current" />,
};

const typeColor: Record<NotifType, string> = {
  match: "bg-rose-100 text-rose-500",
  message: "bg-primary/15 text-primary",
  view: "bg-secondary text-muted-foreground",
  playdate: "bg-amber-100 text-amber-600",
  comment: "bg-primary/15 text-primary",
  like: "bg-rose-100 text-rose-500",
};

// Map API notification type to UI type
function mapNotificationType(type: string): NotifType {
  const mapping: Record<string, NotifType> = {
    match: "match",
    message: "message",
    profile_view: "view",
    playdate: "playdate",
    event_comment: "comment",
    profile_like: "like",
  };
  return mapping[type] || "message";
}

// Map API notification to display format
function getNotificationHref(type: string, relatedEntityId?: string): string {
  const mapping: Record<string, string> = {
    match: "/messages",
    message: "/messages",
    profile_view: "/discover",
    playdate: "/messages",
    event_comment: "/community",
    profile_like: "/liked",
  };
  return mapping[type] || "/";
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ open, onClose }: Props) {
  const { toast } = useToast();
  const { data, isLoading, refetch } = useListNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = data?.items || [];
  const unread = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (notifId: string) => {
    try {
      await markReadMutation.mutateAsync({ notificationId: notifId });
      await refetch();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: apiErrorMessage(err, "Failed to mark notification as read"),
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      await refetch();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: apiErrorMessage(err, "Failed to mark all notifications as read"),
      });
    }
  };

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
                    onClick={handleMarkAllRead}
                    disabled={markAllReadMutation.isPending}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
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
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <PawPrint className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="font-serif text-lg text-foreground mb-1">All caught up</p>
                  <p className="text-sm text-muted-foreground">No new notifications right now.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifications.map((n, idx) => {
                    const notifType = mapNotificationType(n.type);
                    const href = getNotificationHref(n.type, n.relatedEntityId);
                    const displayTime = new Date(n.createdAt as any).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <Link
                          href={href}
                          onClick={() => { handleMarkRead(n.id); onClose(); }}
                          data-testid={`link-notif-${n.id}`}
                          className={`flex items-start gap-4 px-6 py-4 hover:bg-secondary/40 transition-colors cursor-pointer relative ${!n.read ? "bg-primary/[0.03]" : ""}`}
                        >
                          {!n.read && (
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}

                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-sm bg-secondary">
                              {n.avatarUrl ? (
                                <img src={n.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-secondary">
                                  <PawPrint className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-background ${typeColor[notifType]}`}>
                              {typeIcon[notifType]}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug mb-0.5 ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {n.body}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1.5">{displayTime}</p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
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
