import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  MapPin, Calendar, Users, MessageCircle, Share2, Bookmark,
  ChevronDown, ChevronUp, Search, PawPrint, TreePine, Coffee,
  Heart, Star, Sparkles, Send, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EventCategory = "all" | "meetup" | "cafe" | "adoption" | "training" | "trail";

const CATEGORIES: { id: EventCategory; label: string; icon: React.ReactNode; color: string; activeBg: string }[] = [
  { id: "all", label: "All Events", icon: <Sparkles className="w-3.5 h-3.5" />, color: "text-foreground", activeBg: "bg-foreground text-background" },
  { id: "meetup", label: "Meetups", icon: <PawPrint className="w-3.5 h-3.5" />, color: "text-primary", activeBg: "bg-primary text-primary-foreground" },
  { id: "cafe", label: "Pet Cafés", icon: <Coffee className="w-3.5 h-3.5" />, color: "text-amber-700", activeBg: "bg-amber-600 text-white" },
  { id: "adoption", label: "Adoption", icon: <Heart className="w-3.5 h-3.5" />, color: "text-rose-600", activeBg: "bg-rose-500 text-white" },
  { id: "training", label: "Training", icon: <Star className="w-3.5 h-3.5" />, color: "text-violet-600", activeBg: "bg-violet-500 text-white" },
  { id: "trail", label: "Trail Walks", icon: <TreePine className="w-3.5 h-3.5" />, color: "text-emerald-700", activeBg: "bg-emerald-600 text-white" },
];

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

interface Event {
  id: string;
  category: Exclude<EventCategory, "all">;
  title: string;
  organizer: string;
  organizerAvatar: string;
  description: string;
  location: string;
  date: string;
  time: string;
  attendees: number;
  maxAttendees: number;
  tags: string[];
  saved: boolean;
  comments: Comment[];
  featured?: boolean;
  image?: string;
}

const EVENTS: Event[] = [
  {
    id: "e1",
    category: "meetup",
    title: "Sunday Morning Dog Social",
    organizer: "Maya R.",
    organizerAvatar: "/profile3.png",
    description: "Bring your pup for an off-leash romp and great coffee. All sizes and breeds welcome — we just ask that dogs are friendly and up to date on vaccines. There's a shaded area for humans and a water station for dogs.",
    location: "Dolores Park, San Francisco",
    date: "Sun, Jul 20",
    time: "9:00 – 11:00 AM",
    attendees: 24,
    maxAttendees: 40,
    tags: ["Dogs", "Off-leash", "Social", "All breeds"],
    saved: false,
    featured: true,
    image: "/hero-couples.png",
    comments: [
      { id: "c1", author: "Eleanor", avatar: "/profile1.png", text: "Going with Oliver in his backpack! 🐱", time: "2h ago", likes: 5 },
      { id: "c2", author: "James", avatar: "/profile2.png", text: "Buster is SO ready for this. See you there!", time: "1h ago", likes: 3 },
    ],
  },
  {
    id: "e2",
    category: "adoption",
    title: "Summer Adoption Fair",
    organizer: "SF Animal Shelter",
    organizerAvatar: "/profile1.png",
    description: "Meet dozens of lovable cats and dogs looking for their forever homes. Volunteers on-site to guide you through the process. Free admission, donations welcome.",
    location: "Ferry Building, SF",
    date: "Sat, Jul 19",
    time: "11:00 AM – 4:00 PM",
    attendees: 87,
    maxAttendees: 200,
    tags: ["Cats", "Dogs", "Adoption", "Family friendly"],
    saved: true,
    comments: [
      { id: "c3", author: "Chloe", avatar: "/profile1.png", text: "I volunteer here every month — it's such a heartwarming event. Come early!", time: "3h ago", likes: 12 },
    ],
  },
  {
    id: "e3",
    category: "cafe",
    title: "Paws & Lattes Café Crawl",
    organizer: "Marcus T.",
    organizerAvatar: "/profile3.png",
    description: "We're hitting three pet-friendly cafés in the Mission. Bring your furry co-pilot and enjoy good brews, good company, and plenty of photo ops. Route shared in the group chat.",
    location: "Mission District, SF",
    date: "Sat, Jul 26",
    time: "10:00 AM – 1:00 PM",
    attendees: 16,
    maxAttendees: 25,
    tags: ["Coffee", "Dogs", "Cats", "Social"],
    saved: false,
    comments: [],
  },
  {
    id: "e4",
    category: "training",
    title: "Positive Reinforcement Workshop",
    organizer: "Bark Academy",
    organizerAvatar: "/profile2.png",
    description: "A hands-on 2-hour workshop covering loose-leash walking, recall, and calm greetings. Suitable for puppies and adult dogs. Bring high-value treats and your curious pup!",
    location: "Presidio Community Center",
    date: "Wed, Jul 23",
    time: "6:00 – 8:00 PM",
    attendees: 12,
    maxAttendees: 15,
    tags: ["Training", "Puppies", "Adults", "Positive reinforcement"],
    saved: false,
    comments: [
      { id: "c4", author: "David", avatar: "/profile2.png", text: "Milo desperately needs this 😅 just registered!", time: "5h ago", likes: 7 },
    ],
  },
  {
    id: "e5",
    category: "trail",
    title: "Marin Headlands Sunrise Hike",
    organizer: "Eleanor K.",
    organizerAvatar: "/profile1.png",
    description: "A moderate 5-mile loop with stunning bay views at golden hour. Dogs must be leashed on the trail. We'll stop at a viewpoint for a group photo. Carpooling available from the city.",
    location: "Marin Headlands, CA",
    date: "Sun, Jul 27",
    time: "7:00 – 10:30 AM",
    attendees: 9,
    maxAttendees: 20,
    tags: ["Hiking", "Dogs", "Nature", "Sunrise"],
    saved: false,
    comments: [],
  },
  {
    id: "e6",
    category: "meetup",
    title: "Cat Lovers' Picnic",
    organizer: "Chloe B.",
    organizerAvatar: "/profile1.png",
    description: "For indoor cat people who want to meet other cat lovers outdoors! Share tips on enrichment, travel carriers, and harness training. A judgement-free zone for cat obsessives.",
    location: "Golden Gate Park",
    date: "Sat, Aug 2",
    time: "1:00 – 3:30 PM",
    attendees: 19,
    maxAttendees: 30,
    tags: ["Cats", "Picnic", "Social", "Tips"],
    saved: false,
    comments: [
      { id: "c5", author: "Maya", avatar: "/profile3.png", text: "Finally an event for cat parents! Luna is jealous 😆", time: "1d ago", likes: 9 },
    ],
  },
];

const CATEGORY_STYLE: Record<Exclude<EventCategory, "all">, { badge: string; icon: React.ReactNode }> = {
  meetup: { badge: "bg-primary/10 text-primary border-primary/20", icon: <PawPrint className="w-3 h-3" /> },
  cafe: { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: <Coffee className="w-3 h-3" /> },
  adoption: { badge: "bg-rose-50 text-rose-600 border-rose-200", icon: <Heart className="w-3 h-3" /> },
  training: { badge: "bg-violet-50 text-violet-600 border-violet-200", icon: <Star className="w-3 h-3" /> },
  trail: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <TreePine className="w-3 h-3" /> },
};

function EventCard({ event }: { event: Event & { rsvped: boolean; savedState: boolean; onRsvp: () => void; onSave: () => void } }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(event.comments);
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});

  const style = CATEGORY_STYLE[event.category];
  const pct = Math.round((event.attendees / event.maxAttendees) * 100);
  const almostFull = pct >= 80;

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: `new-${Date.now()}`,
      author: "You",
      avatar: "/profile1.png",
      text: newComment,
      time: "Just now",
      likes: 0,
    }]);
    setNewComment("");
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
      {event.featured && event.image && (
        <div className="h-40 overflow-hidden relative">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover object-center" />
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
            <img src={event.organizerAvatar} alt={event.organizer} className="w-9 h-9 rounded-full object-cover border border-border/50 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">Organized by</p>
              <p className="text-sm font-semibold text-foreground leading-tight mt-0.5">{event.organizer}</p>
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
            <Calendar className="w-3.5 h-3.5" /> {event.date}
          </span>
          <span className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5">
            <Filter className="w-3.5 h-3.5" /> {event.time}
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
              {event.rsvped ? event.attendees + 1 : event.attendees} / {event.maxAttendees} attending
            </span>
            {almostFull && <span className="text-amber-600 font-semibold">Almost full!</span>}
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${almostFull ? "bg-amber-400" : "bg-primary"}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct + (event.rsvped ? 3 : 0), 100)}%` }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <motion.div whileTap={{ scale: 0.94 }} className="flex-1">
            <Button
              onClick={event.onRsvp}
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
            <span>{comments.length}</span>
          </button>
          <button
            onClick={event.onSave}
            className={`p-2.5 rounded-full hover:bg-secondary transition-colors ${event.savedState ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            data-testid={`btn-save-${event.id}`}
          >
            <Bookmark className={`w-4 h-4 ${event.savedState ? "fill-primary" : ""}`} />
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
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">No comments yet — be the first!</p>
                )}
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="bg-secondary/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                        <p className="text-xs font-semibold text-foreground mb-0.5">{c.author}</p>
                        <p className="text-sm text-foreground leading-relaxed">{c.text}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 px-1">
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                        <button
                          onClick={() => setCommentLikes(prev => ({ ...prev, [c.id]: (prev[c.id] ?? c.likes) + 1 }))}
                          className="text-[10px] text-muted-foreground hover:text-rose-500 transition-colors font-medium flex items-center gap-0.5"
                        >
                          ♥ {commentLikes[c.id] ?? c.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* New comment input */}
                <form onSubmit={handleComment} className="flex gap-2 items-center pt-1">
                  <img src="/profile1.png" alt="You" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 flex items-center bg-secondary/60 border border-border/50 rounded-full px-4 h-9 focus-within:border-primary/30 transition-colors">
                    <input
                      type="text"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add a comment…"
                      className="bg-transparent text-sm w-full focus:outline-none"
                      data-testid={`input-comment-${event.id}`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
                    data-testid={`btn-submit-comment-${event.id}`}
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </form>
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
  const [rsvpSet, setRsvpSet] = useState<Set<string>>(new Set(["e2"]));
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set(["e2"]));

  const toggleRsvp = (id: string) => setRsvpSet(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSave = (id: string) => setSavedSet(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtered = EVENTS.filter(e => {
    const matchCat = category === "all" || e.category === category;
    const matchQuery = !query || e.title.toLowerCase().includes(query.toLowerCase()) || e.location.toLowerCase().includes(query.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    return matchCat && matchQuery;
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

            {/* Results count */}
            <p className="text-xs text-muted-foreground font-medium">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""} near San Francisco
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
                      event={{
                        ...event,
                        rsvped: rsvpSet.has(event.id),
                        savedState: savedSet.has(event.id),
                        onRsvp: () => toggleRsvp(event.id),
                        onSave: () => toggleSave(event.id),
                      }}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 space-y-5 flex-shrink-0">

            {/* Your RSVPs */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Your RSVPs</h3>
              {[...rsvpSet].length === 0 ? (
                <p className="text-sm text-muted-foreground">RSVP to events to see them here.</p>
              ) : (
                <div className="space-y-3">
                  {EVENTS.filter(e => rsvpSet.has(e.id)).map(e => (
                    <div key={e.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_STYLE[e.category].badge.includes("primary") ? "bg-primary" : e.category === "adoption" ? "bg-rose-500" : e.category === "cafe" ? "bg-amber-500" : e.category === "training" ? "bg-violet-500" : "bg-emerald-500"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{e.date} · {e.time.split("–")[0].trim()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved events */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Saved Events</h3>
              {[...savedSet].length === 0 ? (
                <p className="text-sm text-muted-foreground">Bookmark events to save them here.</p>
              ) : (
                <div className="space-y-3">
                  {EVENTS.filter(e => savedSet.has(e.id)).map(e => (
                    <div key={e.id} className="flex items-start gap-3">
                      <Bookmark className="w-3.5 h-3.5 text-primary fill-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{e.date}</p>
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
