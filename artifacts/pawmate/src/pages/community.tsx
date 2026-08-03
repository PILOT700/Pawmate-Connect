import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  MapPin, Calendar, Users, MessageCircle, Share2, Bookmark,
  ChevronDown, ChevronUp, Search, PawPrint, TreePine, Coffee,
  Heart, Star, Sparkles, Send, Filter, Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useListEvents,
  useRsvpToEvent,
  useCancelEventRsvp,
  useSaveEvent,
  useUnsaveEvent,
  type CommunityEvent,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";

type EventCategory = "all" | "meetup" | "cafe" | "adoption" | "training" | "trail";

const CATEGORIES: { id: EventCategory; label: string; icon: React.ReactNode; color: string; activeBg: string }[] = [
  { id: "all", label: "All Events", icon: <Sparkles className="w-3.5 h-3.5" />, color: "text-foreground", activeBg: "bg-foreground text-background" },
  { id: "meetup", label: "Meetups", icon: <PawPrint className="w-3.5 h-3.5" />, color: "text-primary", activeBg: "bg-primary text-primary-foreground" },
  { id: "cafe", label: "Pet Cafés", icon: <Coffee className="w-3.5 h-3.5" />, color: "text-amber-700", activeBg: "bg-amber-600 text-white" },
  { id: "adoption", label: "Adoption", icon: <Heart className="w-3.5 h-3.5" />, color: "text-rose-600", activeBg: "bg-rose-500 text-white" },
  { id: "training", label: "Training", icon: <Star className="w-3.5 h-3.5" />, color: "text-violet-600", activeBg: "bg-violet-500 text-white" },
  { id: "trail", label: "Trail Walks", icon: <TreePine className="w-3.5 h-3.5" />, color: "text-emerald-700", activeBg: "bg-emerald-600 text-white" },
];


const FALLBACK_ORGANIZER_AVATAR = "/profile1.png";

const CATEGORY_STYLE: Record<Exclude<EventCategory, "all">, { badge: string; icon: React.ReactNode }> = {
  meetup: { badge: "bg-primary/10 text-primary border-primary/20", icon: <PawPrint className="w-3 h-3" /> },
  cafe: { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: <Coffee className="w-3 h-3" /> },
  adoption: { badge: "bg-rose-50 text-rose-600 border-rose-200", icon: <Heart className="w-3 h-3" /> },
  training: { badge: "bg-violet-50 text-violet-600 border-violet-200", icon: <Star className="w-3 h-3" /> },
  trail: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <TreePine className="w-3 h-3" /> },
};

function EventCard({ event, onRefetch }: { event: CommunityEvent; onRefetch: () => void }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { toast } = useToast();

  const rsvpMutation = useRsvpToEvent();
  const cancelRsvpMutation = useCancelEventRsvp();
  const saveMutation = useSaveEvent();
  const unsaveMutation = useUnsaveEvent();

  const style = CATEGORY_STYLE[event.category];
  const maxAttendees = event.maxAttendees || 50;
  const pct = Math.round((event.attendeeCount / maxAttendees) * 100);
  const almostFull = pct >= 80;

  const handleRsvp = async () => {
    try {
      if (event.rsvped) {
        await cancelRsvpMutation.mutateAsync({ eventId: event.id });
      } else {
        await rsvpMutation.mutateAsync({ eventId: event.id });
      }
      onRefetch();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: apiErrorMessage(err, "Failed to update RSVP"),
      });
    }
  };

  const handleSave = async () => {
    try {
      if (event.saved) {
        await unsaveMutation.mutateAsync({ eventId: event.id });
      } else {
        await saveMutation.mutateAsync({ eventId: event.id });
      }
      onRefetch();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: apiErrorMessage(err, "Failed to update RSVP"),
      });
    }
  };


  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className={`bg-card rounded-[2rem] border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${event.featured ? "border-primary/25" : "border-border"}`}
      data-testid={`event-card-${event.id}`}
    >
      {/* Featured banner image */}
      {event.featured && event.imageUrl && (
        <div className="h-40 overflow-hidden relative">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-amber-400 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        </div>
      )}

      <div className="p-5 md:p-6 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src={FALLBACK_ORGANIZER_AVATAR} alt="Organizer" className="w-9 h-9 rounded-full object-cover border border-border/50 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">Organized by</p>
              <p className="text-sm font-semibold text-foreground leading-tight mt-0.5">Community Organizer</p>
            </div>
          </div>
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${style.badge}`}>
            {style.icon}
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-1.5 leading-snug">{event.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5" /> {new Date(event.startAt as any).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5">
            <Filter className="w-3.5 h-3.5" /> {new Date(event.startAt as any).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – {new Date(event.endAt as any).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
          <span className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5" /> {event.location}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {event.tags.map(tag => (
            <span key={tag} className="text-[11px] bg-background border border-border rounded-full px-2.5 py-1 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Attendance bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              {event.attendeeCount} / {maxAttendees} attending
            </span>
            {almostFull && <span className="text-amber-600 font-semibold">Almost full!</span>}
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${almostFull ? "bg-amber-400" : "bg-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <motion.div whileTap={{ scale: 0.94 }} className="flex-1">
            <Button
              onClick={handleRsvp}
              disabled={rsvpMutation.isPending || cancelRsvpMutation.isPending}
              className={`w-full h-10 rounded-full text-sm font-medium transition-all ${
                event.rsvped
                  ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              }`}
              data-testid={`btn-rsvp-${event.id}`}
            >
              {event.rsvped ? "✓ Going" : "RSVP"}
            </Button>
          </motion.div>
          <button
            onClick={() => setCommentsOpen(o => !o)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full hover:bg-secondary"
            data-testid={`btn-comments-${event.id}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>0</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || unsaveMutation.isPending}
            className={`p-2.5 rounded-full hover:bg-secondary transition-colors ${event.saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            data-testid={`btn-save-${event.id}`}
          >
            <Bookmark className={`w-4 h-4 ${event.saved ? "fill-primary" : ""}`} />
          </button>
          <button className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" data-testid={`btn-share-${event.id}`}>
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {commentsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/50 pt-4 space-y-3">
                <p className="text-sm text-muted-foreground text-center py-2">Comments coming soon — be the first!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export default function Community() {
  const [category, setCategory] = useState<EventCategory>("all");
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const apiCategory = category === "all" ? undefined : (category as Exclude<EventCategory, "all">);
  const { data, isLoading, error, refetch } = useListEvents({
    category: apiCategory,
  });

  const events = data?.items || [];

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading events",
        description: apiErrorMessage(error, "Failed to load events"),
      });
    }
  }, [error, toast]);

  const filtered = events.filter(e => {
    const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase()) || e.location.toLowerCase().includes(query.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    return matchQuery;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 pt-10 pb-6">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-1">Community</h1>
          <p className="text-muted-foreground text-sm">Local events for pet lovers near you</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main feed */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Search + filter bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search events, locations, or tags…"
                  className="pl-10 h-11 rounded-full bg-card border-border"
                  data-testid="input-search-events"
                />
              </div>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    data-testid={`filter-cat-${cat.id}`}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border-2 transition-all duration-150 flex-shrink-0 ${
                      category === cat.id
                        ? cat.activeBg + " border-transparent shadow-sm"
                        : "bg-card border-border " + cat.color + " hover:border-primary/30"
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count / Loading */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground font-medium">
                  {filtered.length} event{filtered.length !== 1 ? "s" : ""} near you
                </p>

                {/* Event cards */}
                <AnimatePresence mode="popLayout">
                  {filtered.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <PawPrint className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-serif text-xl text-foreground mb-2">No events found</h3>
                      <p className="text-sm text-muted-foreground">Try a different category or search term</p>
                      <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setCategory("all"); setQuery(""); }}>
                        Clear filters
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {filtered.map(event => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onRefetch={() => refetch()}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 space-y-5 flex-shrink-0">

            {/* Your RSVPs */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Your RSVPs</h3>
              {events.filter(e => e.rsvped).length === 0 ? (
                <p className="text-sm text-muted-foreground">RSVP to events to see them here.</p>
              ) : (
                <div className="space-y-3">
                  {events.filter(e => e.rsvped).map(e => (
                    <div key={e.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_STYLE[e.category].badge.includes("primary") ? "bg-primary" : e.category === "adoption" ? "bg-rose-500" : e.category === "cafe" ? "bg-amber-500" : e.category === "training" ? "bg-violet-500" : "bg-emerald-500"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.startAt as any).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {new Date(e.startAt as any).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved events */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Saved Events</h3>
              {events.filter(e => e.saved).length === 0 ? (
                <p className="text-sm text-muted-foreground">Bookmark events to save them here.</p>
              ) : (
                <div className="space-y-3">
                  {events.filter(e => e.saved).map(e => (
                    <div key={e.id} className="flex items-start gap-3">
                      <Bookmark className="w-3.5 h-3.5 text-primary fill-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.startAt as any).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggest an event */}
            <div className="bg-gradient-to-br from-primary/5 to-amber-50/40 border border-primary/15 rounded-2xl p-5 text-center space-y-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground">Host an event</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Organize a meetup, walk, or gathering for the Pawmate community.</p>
              </div>
              <Button className="w-full h-9 rounded-full text-sm bg-primary text-primary-foreground" data-testid="btn-host-event">
                Suggest an event
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
