import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send, ArrowLeft, PawPrint, MapPin, Calendar, Clock, Check, X, ChevronRight, TreePine, Coffee, Waves, Building2, Flower2, CalendarCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday, differenceInCalendarDays } from "date-fns";
import {
  useListMatches,
  useListMessages,
  getListMessagesQueryKey,
  getListMatchesQueryKey,
  useSendMessage,
  useMarkMatchRead,
  useListPlaydates,
  useProposePlaydate,
  useRespondToPlaydate,
  type MatchSummary,
  type Message,
  type Playdate,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";
import { useT, useFormatters, useDateFnsLocale, type TranslationKey } from "@/lib/i18n";
import type { Locale as DateFnsLocale } from "date-fns";
import { PLAYDATE_PLACES, playdatePlaceKey } from "@/lib/playdate-places";

/** Icon and colour per place — the drawing, kept beside the screen that draws. */
const PLACE_STYLE: Record<string, { icon: typeof TreePine; color: string }> = {
  park: { icon: TreePine, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  cafe: { icon: Coffee, color: "text-amber-700 bg-amber-50 border-amber-200" },
  beach: { icon: Waves, color: "text-sky-600 bg-sky-50 border-sky-200" },
  trail: { icon: Flower2, color: "text-violet-600 bg-violet-50 border-violet-200" },
  plaza: { icon: Building2, color: "text-slate-600 bg-slate-50 border-slate-200" },
};

const FALLBACK_IMAGE = "/profile1.png";

// ─── Display helpers ──────────────────────────────────────────────────────────

// `Playdate.date` comes back as a full ISO datetime (midnight UTC of that
// calendar day) — formatting it directly with local-time `date-fns` can roll
// it back a day in negative-offset zones. Re-anchor to local noon first.
type Labels = (key: TranslationKey, vars?: Record<string, string | number>) => string;

function formatPlaydateDate(iso: string, locale: DateFnsLocale | undefined): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return format(new Date(y!, m! - 1, d!, 12), "EEE, d MMM", { locale });
}

function formatConversationTime(iso: string, locale: DateFnsLocale | undefined, t: Labels): string {
  const date = new Date(iso);
  // 24-hour, day-first: the conventions this audience reads, in either language.
  if (isToday(date)) return format(date, "HH:mm", { locale });
  if (isYesterday(date)) return t("messages.yesterday");
  const daysAgo = differenceInCalendarDays(new Date(), date);
  if (daysAgo < 7) return format(date, "EEE", { locale });
  return format(date, "d MMM", { locale });
}

function dayDividerLabel(date: Date, locale: DateFnsLocale | undefined, t: Labels): string {
  if (isToday(date)) return t("messages.today");
  if (isYesterday(date)) return t("messages.yesterday");
  return format(date, "EEEE, d MMM", { locale });
}

// ─── Conversation list ────────────────────────────────────────────────────────

interface ConversationView {
  id: string;
  name: string;
  pet?: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  online: boolean;
}

function toConversationView(
  match: MatchSummary,
  locale: DateFnsLocale | undefined,
  t: Labels,
): ConversationView {
  const lastAt = match.lastMessageAt ?? match.matchedAt;
  return {
    id: match.id,
    name: match.otherUser.firstName,
    pet: match.otherPet?.name,
    avatar: match.otherUser.avatarUrl || FALLBACK_IMAGE,
    lastMessage: match.lastMessage || t("messages.sayHelloPreview"),
    time: formatConversationTime(lastAt, locale, t),
    unread: match.unreadCount > 0,
    online: match.otherUser.isOnline,
  };
}

// ─── Playdate status (single source of truth — matches the API) ─────────────

const STATUS_STYLE: Record<Playdate["status"], { badge: string; label: TranslationKey }> = {
  proposed: { badge: "bg-amber-50 border-amber-200 text-amber-700", label: "playdate.statusProposed" },
  accepted: { badge: "bg-emerald-50 border-emerald-200 text-emerald-700", label: "playdate.statusAccepted" },
  declined: { badge: "bg-rose-50 border-rose-200 text-rose-700", label: "playdate.statusDeclined" },
};

// ─── Playdate tab data ────────────────────────────────────────────────────────

/** The shared table, dressed with the icons and colours this screen draws. */
const LOCATIONS = PLAYDATE_PLACES.map((place) => ({
  ...place,
  ...PLACE_STYLE[place.id]!,
}));

/** A stored place, translated when it is one of ours and left alone when typed. */
function placeLabel(place: string, t: Labels): string {
  const key = playdatePlaceKey(place);
  return key ? t(key) : place;
}

// 24-hour, matching the rest of the app.
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00"];

/** The next seven days, named by `Intl` rather than a hard-coded English table. */
function getDays(locale: string) {
  const days = [];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      key: d.toDateString(),
      short: d.toLocaleDateString(locale, { weekday: "short" }),
      num: d.getDate(),
      month: d.toLocaleDateString(locale, { month: "short" }),
    });
  }
  return days;
}

interface ProposeData {
  place: string;
  placeSub?: string;
  date: string;
  timeSlot: string;
}

type ScheduleStep = "idle" | "location" | "datetime" | "confirm" | "sent";

interface PlaydateTabProps {
  chatName: string;
  chatAvatar: string;
  playdates: Playdate[];
  currentUserId: string;
  onPropose: (data: ProposeData) => Promise<void>;
  onRespond: (playdateId: string, status: "accepted" | "declined") => Promise<void>;
}

function PlaydateTab({ chatName, chatAvatar, playdates, currentUserId, onPropose, onRespond }: PlaydateTabProps) {
  const t = useT();
  const { locale } = useFormatters();
  const dfLocale = useDateFnsLocale();
  const { user } = useAuth();
  const DAYS = getDays(locale);
  const [step, setStep] = useState<ScheduleStep>("idle");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const locObj = LOCATIONS.find(l => l.id === selectedLocation);
  const dayObj = DAYS.find(d => d.key === selectedDay);

  const handleSend = async () => {
    if (!locObj || !dayObj || !selectedTime || !selectedDay) return;
    try {
      await onPropose({
        place: locObj.value,
        date: format(new Date(selectedDay), "yyyy-MM-dd"),
        timeSlot: selectedTime,
      });
      setStep("sent");
    } catch {
      // onPropose already surfaced a toast — stay on this step so the user can retry.
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
      {playdates.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("playdate.upcoming")}</p>
          {playdates.map(pd => {
            const s = STATUS_STYLE[pd.status];
            const canRespond = pd.status === "proposed" && pd.proposedByUserId !== currentUserId;
            return (
              <motion.div
                key={pd.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={chatAvatar} alt={chatName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{chatName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{placeLabel(pd.place, t)}{pd.placeSub ? ` · ${pd.placeSub}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" /> {formatPlaydateDate(pd.date, dfLocale)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {pd.timeSlot}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${s.badge}`}>
                    {t(s.label)}
                  </span>
                </div>
                {canRespond && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1 h-8 rounded-full text-xs" onClick={() => onRespond(pd.id, "accepted")} data-testid={`btn-confirm-pd-${pd.id}`}>
                      <Check className="w-3 h-3 mr-1" /> {t("playdate.accept")}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8 rounded-full text-xs border-border" onClick={() => onRespond(pd.id, "declined")} data-testid={`btn-decline-pd-${pd.id}`}>
                      <X className="w-3 h-3 mr-1" /> {t("playdate.decline")}
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <Separator className="bg-border/50" />

      <AnimatePresence mode="wait">
        {(step === "idle" || step === "sent") && (
          <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {step === "sent" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm text-emerald-700 font-medium">{t("playdate.inviteSent", { name: chatName })}</p>
              </div>
            )}
            <div className="bg-gradient-to-br from-primary/5 via-amber-50/40 to-rose-50/30 border border-primary/15 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <PawPrint className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">{t("playdate.planTitle")}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {t("playdate.planBody", { name: chatName })}
                </p>
              </div>
              <Button
                onClick={() => setStep("location")}
                className="rounded-full px-8 h-11 bg-primary text-primary-foreground shadow-sm font-medium"
                data-testid="btn-schedule-playdate"
              >
                {t("playdate.schedule")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === "location" && (
          <motion.div key="location" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep("idle")} className="text-muted-foreground hover:text-foreground transition-colors" data-testid="btn-pd-back-idle">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="text-xs text-muted-foreground">{t("playdate.step1")}</p>
                <h3 className="font-serif text-lg font-semibold text-foreground">{t("playdate.chooseLocation")}</h3>
              </div>
            </div>
            <div className="space-y-2.5">
              {LOCATIONS.map(loc => {
                const Icon = loc.icon;
                const active = selectedLocation === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc.id)}
                    data-testid={`btn-loc-${loc.id}`}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 text-left transition-all duration-150 ${
                      active ? loc.color + " shadow-sm" : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${active ? loc.color : "bg-secondary border-border text-muted-foreground"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{t(loc.label)}</p>
                    </div>
                    {active && <Check className="w-4 h-4 text-current flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={() => setStep("datetime")}
              disabled={!selectedLocation}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground"
              data-testid="btn-pd-next-datetime"
            >
              {t("playdate.nextPickTime")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {step === "datetime" && (
          <motion.div key="datetime" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep("location")} className="text-muted-foreground hover:text-foreground transition-colors" data-testid="btn-pd-back-location">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="text-xs text-muted-foreground">{t("playdate.step2")}</p>
                <h3 className="font-serif text-lg font-semibold text-foreground">{t("playdate.pickDateTime")}</h3>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("playdate.dateLabel")}</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {DAYS.map(day => (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDay(day.key)}
                    data-testid={`btn-day-${day.num}`}
                    className={`flex-shrink-0 flex flex-col items-center px-3.5 py-3 rounded-2xl border-2 min-w-[58px] transition-all duration-150 ${
                      selectedDay === day.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wide">{day.short}</span>
                    <span className="text-lg font-bold mt-0.5 leading-none">{day.num}</span>
                    <span className="text-[10px] mt-0.5">{day.month}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("playdate.timeLabel")}</p>
              <div className="grid grid-cols-4 gap-2">
                {TIMES.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    data-testid={`btn-time-${t.replace(/\s|:/g, "-")}`}
                    className={`py-2 rounded-xl text-xs font-medium border-2 transition-all duration-150 ${
                      selectedTime === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setStep("confirm")}
              disabled={!selectedDay || !selectedTime}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground"
              data-testid="btn-pd-next-confirm"
            >
              {t("playdate.reviewInvite")} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {step === "confirm" && locObj && dayObj && selectedTime && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep("datetime")} className="text-muted-foreground hover:text-foreground transition-colors" data-testid="btn-pd-back-datetime">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="text-xs text-muted-foreground">{t("playdate.step3")}</p>
                <h3 className="font-serif text-lg font-semibold text-foreground">{t("playdate.reviewSend")}</h3>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-amber-50/50 border border-primary/15 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-background">
                    <img src={user?.avatarUrl || FALLBACK_IMAGE} alt={t("messages.you")} className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-background">
                    <img src={chatAvatar} alt={chatName} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("playdate.inviteLabel")}</p>
                  <p className="text-sm font-semibold text-foreground">{t("playdate.youAnd", { name: chatName })}</p>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${locObj.color}`}>
                    <locObj.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("playdate.locationLabel")}</p>
                    <p className="text-sm font-semibold text-foreground">{t(locObj.label)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border border-border bg-secondary flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("playdate.dateTimeLabel")}</p>
                    <p className="text-sm font-semibold text-foreground">{dayObj.short}, {dayObj.month} {dayObj.num} · {selectedTime}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("idle")} className="flex-1 h-11 rounded-full border-border" data-testid="btn-pd-cancel">
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSend} className="flex-1 h-11 rounded-full bg-primary text-primary-foreground shadow-sm font-medium" data-testid="btn-pd-send-invite">
                <Send className="w-4 h-4 mr-2" /> {t("playdate.sendInvite")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Playdate Card (in-thread) ────────────────────────────────────────────────

interface PlaydateCardProps {
  playdate: Playdate;
  sentAt: string;
  chatName: string;
  canRespond: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

function PlaydateCard({ playdate, sentAt, chatName, canRespond, onAccept, onDecline }: PlaydateCardProps) {
  const t = useT();
  const dfLocale = useDateFnsLocale();
  const s = STATUS_STYLE[playdate.status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-full max-w-[320px] mx-auto"
      data-testid={`playdate-card-${playdate.id}`}
    >
      <div className="bg-gradient-to-br from-amber-50/80 to-primary/5 border border-amber-200/60 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-amber-200/40 bg-amber-50/60">
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-amber-800 leading-none">{t("playdate.requestTitle")}</p>
            <p className="text-[10px] text-amber-600 mt-0.5">{t("playdate.withName", { name: chatName })}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.badge}`}>
            {t(s.label)}
          </span>
        </div>

        {/* Details */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-foreground">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="font-medium">{placeLabel(playdate.place, t)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatPlaydateDate(playdate.date, dfLocale)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{playdate.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* Accept / Decline */}
        <AnimatePresence>
          {canRespond && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-3 flex gap-2"
            >
              <Button
                size="sm"
                className="flex-1 h-8 rounded-full text-xs bg-primary text-primary-foreground"
                onClick={onAccept}
                data-testid={`btn-accept-${playdate.id}`}
              >
                <Check className="w-3 h-3 mr-1" /> {t("playdate.accept")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 rounded-full text-xs border-border"
                onClick={onDecline}
                data-testid={`btn-decline-${playdate.id}`}
              >
                <X className="w-3 h-3 mr-1" /> {t("playdate.decline")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-1.5">{format(new Date(sentAt), "HH:mm", { locale: dfLocale })}</p>
    </motion.div>
  );
}

// ─── Compose panel ────────────────────────────────────────────────────────────

interface ComposePanelProps {
  chatName: string;
  chatAvatar: string;
  onSend: (data: ProposeData) => Promise<void>;
  onClose: () => void;
}

function ComposePanel({ chatName, chatAvatar, onSend, onClose }: ComposePanelProps) {
  const t = useT();
  const { locale } = useFormatters();
  const DAYS = getDays(locale);
  const [selDay, setSelDay] = useState<string | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [place, setPlace] = useState("");
  const [sending, setSending] = useState(false);
  const placeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { placeRef.current?.focus(); }, []);

  const canSend = !!selDay && !!selTime && place.trim().length > 0;

  const handleSend = async () => {
    if (!canSend || !selDay || !selTime) return;
    setSending(true);
    try {
      await onSend({ place: place.trim(), date: format(new Date(selDay), "yyyy-MM-dd"), timeSlot: selTime });
      onClose();
    } catch {
      // onSend already surfaced a toast.
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      key="compose-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.2 }}
      className="border-t border-border bg-card px-4 py-4 space-y-4"
      data-testid="playdate-compose-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarCheck className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">{t("playdate.proposeWith", { name: chatName })}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          data-testid="btn-close-compose"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Place */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">{t("playdate.placeLabel")}</label>
        <input
          ref={placeRef}
          type="text"
          value={place}
          onChange={e => setPlace(e.target.value)}
          placeholder={t("playdate.placePlaceholder")}
          className="w-full h-9 px-3 text-sm bg-secondary/60 border border-border/60 rounded-xl focus:outline-none focus:border-primary/40 focus:bg-secondary transition-colors"
          data-testid="input-pd-place"
        />
      </div>

      {/* Date chips */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">{t("playdate.dateLabel")}</label>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {DAYS.map(day => (
            <button
              key={day.key}
              onClick={() => setSelDay(day.key)}
              data-testid={`btn-cpd-day-${day.num}`}
              className={`flex-shrink-0 flex flex-col items-center px-2.5 py-2 rounded-xl border-2 min-w-[48px] transition-all duration-150 ${
                selDay === day.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wide">{day.short}</span>
              <span className="text-base font-bold leading-none mt-0.5">{day.num}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time chips */}
      <div>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">{t("playdate.timeLabel")}</label>
        <div className="flex flex-wrap gap-1.5">
          {TIMES.map(t => (
            <button
              key={t}
              onClick={() => setSelTime(t)}
              data-testid={`btn-cpd-time-${t.replace(/\s|:/g, "-")}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all duration-150 ${
                selTime === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Send */}
      <Button
        onClick={handleSend}
        disabled={!canSend || sending}
        className="w-full h-10 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm"
        data-testid="btn-send-playdate-card"
      >
        <Send className="w-3.5 h-3.5 mr-2" /> {sending ? t("playdate.sending") : t("playdate.sendRequestTo", { name: chatName })}
      </Button>
    </motion.div>
  );
}

// ─── Main Messages page ───────────────────────────────────────────────────────

export default function Messages() {
  const t = useT();
  const dfLocale = useDateFnsLocale();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "playdate">("chat");
  const [composeOpen, setComposeOpen] = useState(false);
  const [search, setSearch] = useState("");

  // There's no realtime channel, so an incoming message would otherwise only
  // appear after leaving and re-entering the conversation. Polling is paused
  // while the tab is in the background.
  const OPEN_CHAT_POLL_MS = 5000;
  const CONVERSATION_LIST_POLL_MS = 15000;

  const { data: matchesData, isLoading: matchesLoading, refetch: refetchMatches } = useListMatches(
    { pageSize: 50 },
    {
      query: {
        queryKey: getListMatchesQueryKey({ pageSize: 50 }),
        refetchInterval: CONVERSATION_LIST_POLL_MS,
        refetchIntervalInBackground: false,
      },
    },
  );
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useListMessages(
    activeMatchId ?? "",
    { pageSize: 100 },
    {
      query: {
        queryKey: getListMessagesQueryKey(activeMatchId ?? "", { pageSize: 100 }),
        enabled: !!activeMatchId,
        refetchInterval: OPEN_CHAT_POLL_MS,
        refetchIntervalInBackground: false,
      },
    },
  );
  const { data: playdatesData, refetch: refetchPlaydates } = useListPlaydates({ pageSize: 100 });

  const sendMessage = useSendMessage();
  const markRead = useMarkMatchRead();
  const proposePlaydate = useProposePlaydate();
  const respondToPlaydate = useRespondToPlaydate();

  const matches = matchesData?.items ?? [];
  const conversations = matches.map((m) => toConversationView(m, dfLocale, t));
  const filteredConversations = search.trim()
    ? conversations.filter(c => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    : conversations;

  const activeMatch = matches.find(m => m.id === activeMatchId) ?? null;
  const messages = messagesData?.items ?? [];
  const playdates = playdatesData?.items ?? [];
  const playdatesById = new Map(playdates.map(pd => [pd.id, pd] as const));
  const matchPlaydates = playdates
    .filter(pd => pd.matchId === activeMatchId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Default to the first conversation once matches load.
  useEffect(() => {
    if (!activeMatchId && matches.length > 0) {
      setActiveMatchId(matches[0]!.id);
    }
  }, [matches, activeMatchId]);

  // Mark the opened conversation read and clear its unread badge on the left.
  useEffect(() => {
    if (!activeMatchId) return;
    markRead.mutate(
      { matchId: activeMatchId },
      { onSuccess: () => refetchMatches() },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMatchId]);

  const handleSelectChat = (matchId: string) => {
    setActiveMatchId(matchId);
    setShowChat(true);
    setActiveTab("chat");
    setComposeOpen(false);
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatchId || !messageText.trim()) return;
    const text = messageText.trim();
    setMessageText("");
    try {
      await sendMessage.mutateAsync({ matchId: activeMatchId, data: { text } });
      await Promise.all([refetchMessages(), refetchMatches()]);
    } catch (err) {
      setMessageText(text);
      toast({
        variant: "destructive",
        title: t("messages.notSent"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

  const handleProposePlaydate = async (data: ProposeData) => {
    if (!activeMatchId || !activeMatch) return;
    try {
      await proposePlaydate.mutateAsync({ matchId: activeMatchId, data });
      await Promise.all([refetchMessages(), refetchPlaydates(), refetchMatches()]);
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("messages.couldNotInvite"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
      throw err;
    }
  };

  const handleRespondPlaydate = async (playdateId: string, status: "accepted" | "declined") => {
    try {
      await respondToPlaydate.mutateAsync({ playdateId, data: { status } });
      await Promise.all([refetchMessages(), refetchPlaydates(), refetchMatches()]);
      const pd = playdatesById.get(playdateId);
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("messages.couldNotUpdatePlaydate"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

  // Interleave day-divider labels between messages grouped by calendar day.
  type MessageEntry =
    | { type: "divider"; key: string; label: string }
    | { type: "message"; message: Message };
  const renderableMessages: MessageEntry[] = [];
  {
    let lastDayKey = "";
    for (const msg of messages) {
      const sentAt = new Date(msg.sentAt);
      const dayKey = format(sentAt, "yyyy-MM-dd");
      if (dayKey !== lastDayKey) {
        renderableMessages.push({ type: "divider", key: `divider-${dayKey}`, label: dayDividerLabel(sentAt, dfLocale, t) });
        lastDayKey = dayKey;
      }
      renderableMessages.push({ type: "message", message: msg });
    }
  }

  if (!matchesLoading && matches.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-16 text-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-5">
          <PawPrint className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-serif text-2xl text-foreground mb-2">{t("messages.noMatches")}</h2>
        <p className="text-muted-foreground mb-6">{t("messages.noMatchesBody")}</p>
        <a href="/discover">
          <Button className="rounded-full px-8 bg-primary text-primary-foreground">{t("messages.browseProfiles")}</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-4 md:py-8 h-[calc(100vh-5rem)]">
      <div className="bg-card rounded-[2rem] border border-card-border shadow-sm h-full flex overflow-hidden">

        {/* Left Panel */}
        <div className={`w-full md:w-1/3 border-r border-border flex flex-col bg-card ${showChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">{t("messages.title")}</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("messages.searchPlaceholder")}
                className="pl-10 h-10 bg-secondary border-none rounded-full"
                data-testid="input-search-messages"
              />
            </div>
          </div>

          <div className="px-6 pb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("messages.active")}</h3>
          </div>
          <Separator className="bg-border/50" />

          <ScrollArea className="flex-1">
            {filteredConversations.map((chat) => (
              <button
                key={chat.id}
                className={`w-full text-left p-4 flex gap-4 items-center transition-colors border-b border-border/20 ${
                  activeMatchId === chat.id
                    ? 'bg-secondary/30 border-l-4 border-l-primary'
                    : 'hover:bg-secondary/20 border-l-4 border-l-transparent'
                }`}
                onClick={() => handleSelectChat(chat.id)}
                data-testid={`btn-chat-${chat.id}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  {chat.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></span>}
                  {chat.unread && <span className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-card flex items-center justify-center"><span className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></span></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-foreground truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{chat.time}</span>
                  </div>
                  {chat.pet && (
                    <div className="flex items-center text-xs text-primary font-medium mb-0.5">
                      <PawPrint className="w-3 h-3 mr-1" />
                      {chat.pet}
                    </div>
                  )}
                  <p className={`text-sm truncate ${chat.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Right Panel */}
        <div className={`w-full md:w-2/3 flex-col bg-[#FCFBF8] relative ${showChat ? 'flex' : 'hidden md:flex'}`}>
          {!activeMatch ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              {matchesLoading ? t("messages.loading") : t("messages.selectConversation")}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-border px-4 md:px-6 bg-card shrink-0">
                <div className="h-16 flex items-center">
                  <div className="flex items-center gap-3 md:gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setShowChat(false)}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img src={activeMatch.otherUser.avatarUrl || FALLBACK_IMAGE} alt={activeMatch.otherUser.firstName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground leading-tight">{activeMatch.otherUser.firstName}</h3>
                      {activeMatch.otherPet && <p className="text-xs text-muted-foreground">{t("messages.withPet", { name: activeMatch.otherPet.name })}</p>}
                    </div>
                  </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-0 -mb-px">
                  {(["chat", "playdate"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      data-testid={`tab-${tab}`}
                      className={`relative px-5 py-2.5 text-sm font-medium transition-colors capitalize flex items-center gap-1.5 ${
                        activeTab === tab
                          ? "text-foreground border-b-2 border-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "playdate" && <PawPrint className="w-3.5 h-3.5" />}
                      {tab === "chat" ? t("messages.tabChat") : t("messages.tabPlaydate")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {activeTab === "chat" ? (
                  <motion.div
                    key="chat-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col flex-1 min-h-0"
                  >
                    {/* Top gradient */}
                    <div className="absolute top-[108px] left-0 right-0 h-6 bg-gradient-to-b from-card to-transparent pointer-events-none z-10" />

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 md:p-6">
                      <div className="space-y-5">
                        {messagesLoading ? (
                          <p className="text-center text-sm text-muted-foreground py-8">{t("messages.loadingMessages")}</p>
                        ) : renderableMessages.length === 0 ? (
                          <p className="text-center text-sm text-muted-foreground py-8">{t("messages.sayHelloTo", { name: activeMatch.otherUser.firstName })}</p>
                        ) : (
                          renderableMessages.map((entry) => {
                            if (entry.type === "divider") {
                              return (
                                <div key={entry.key} className="text-center pb-2 pt-2">
                                  <span className="text-[11px] font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full uppercase tracking-wider">{entry.label}</span>
                                </div>
                              );
                            }

                            const msg = entry.message;
                            const isMe = msg.senderId === user!.id;

                            if (msg.kind === "playdate") {
                              const pd = msg.playdateId ? playdatesById.get(msg.playdateId) : undefined;
                              if (!pd) return null;
                              return (
                                <PlaydateCard
                                  key={msg.id}
                                  playdate={pd}
                                  sentAt={msg.sentAt}
                                  chatName={activeMatch.otherUser.firstName}
                                  canRespond={pd.status === "proposed" && pd.proposedByUserId !== user!.id}
                                  onAccept={() => handleRespondPlaydate(pd.id, "accepted")}
                                  onDecline={() => handleRespondPlaydate(pd.id, "declined")}
                                />
                              );
                            }

                            return (
                              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                  {!isMe && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-auto">
                                      <img src={activeMatch.otherUser.avatarUrl || FALLBACK_IMAGE} alt={activeMatch.otherUser.firstName} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3.5 shadow-sm text-[15px] ${isMe ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm' : 'bg-card border border-border text-foreground rounded-2xl rounded-bl-sm'}`}>
                                      <p className="leading-relaxed">{msg.text}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 px-1">
                                      <span className="text-[10px] text-muted-foreground font-medium">{format(new Date(msg.sentAt), "HH:mm", { locale: dfLocale })}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>

                    {/* Compose panel (slides up) */}
                    <AnimatePresence>
                      {composeOpen && (
                        <ComposePanel
                          chatName={activeMatch.otherUser.firstName}
                          chatAvatar={activeMatch.otherUser.avatarUrl || FALLBACK_IMAGE}
                          onSend={handleProposePlaydate}
                          onClose={() => setComposeOpen(false)}
                        />
                      )}
                    </AnimatePresence>

                    {/* Input area */}
                    <div className="p-3 md:p-4 bg-card border-t border-border shrink-0">
                      {/* Propose pill */}
                      {!composeOpen && (
                        <div className="flex gap-2 mb-2">
                          <button
                            onClick={() => setComposeOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                            data-testid="btn-propose-playdate"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            {t("playdate.propose")}
                          </button>
                        </div>
                      )}

                      <form className="flex gap-2 items-end" onSubmit={handleSendText}>
                        <div className="bg-secondary/60 rounded-[1.5rem] flex-1 flex items-center px-4 min-h-[56px] border border-border/50 focus-within:border-primary/30 focus-within:bg-secondary transition-colors">
                          <input
                            type="text"
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder={t("messages.typeMessage")}
                            className="bg-transparent w-full focus:outline-none text-[15px] py-3"
                            data-testid="input-chat-message"
                          />
                        </div>
                        <Button
                          type="submit"
                          size="icon"
                          className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 shadow-sm transition-transform active:scale-95"
                          disabled={!messageText.trim() || sendMessage.isPending}
                          data-testid="btn-send-message"
                        >
                          <Send className="w-5 h-5 ml-1" />
                        </Button>
                      </form>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="playdate-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex flex-col flex-1 min-h-0 overflow-hidden"
                  >
                    <PlaydateTab
                      chatName={activeMatch.otherUser.firstName}
                      chatAvatar={activeMatch.otherUser.avatarUrl || FALLBACK_IMAGE}
                      playdates={matchPlaydates}
                      currentUserId={user!.id}
                      onPropose={handleProposePlaydate}
                      onRespond={handleRespondPlaydate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
