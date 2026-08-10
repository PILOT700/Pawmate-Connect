import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, MapPin, MessageCircle, HeartOff, PawPrint } from "lucide-react";
import {
  useListSentLikes,
  useRemoveLike,
  getListSentLikesQueryKey,
  type SentLike,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";

const FALLBACK_IMAGE = "/profile1.png";
const FALLBACK_PET_IMAGE = "/pet1.png";

export default function LikedProfiles() {
  const { data, isLoading } = useListSentLikes();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const removeLike = useRemoveLike();
  const [pendingUnlike, setPendingUnlike] = useState<SentLike | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "mutual">("all");

  const handleUnlike = async () => {
    if (!pendingUnlike) return;

    const { id } = pendingUnlike;
    setPendingUnlike(null);
    setRemovingId(id);

    try {
      await removeLike.mutateAsync({ likeId: id });
      await queryClient.invalidateQueries({ queryKey: getListSentLikesQueryKey() });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't remove the like",
        description: apiErrorMessage(err, "Please try again."),
      });
    } finally {
      setRemovingId(null);
    }
  };

  const liked = data?.items ?? [];
  const mutualCount = liked.filter((item) => item.mutualMatch).length;
  const visible = tab === "mutual" ? liked.filter((item) => item.mutualMatch) : liked;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
                Liked Profiles
              </h1>
              <p className="text-muted-foreground text-sm">
                {liked.length} {liked.length === 1 ? "profile" : "profiles"} liked
                {mutualCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary font-medium">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    {mutualCount} mutual {mutualCount === 1 ? "match" : "matches"}
                  </span>
                )}
              </p>
            </div>

            {/* Tab pills */}
            <div className="flex items-center gap-2 bg-secondary rounded-full p-1 self-start sm:self-auto">
              <button
                onClick={() => setTab("all")}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${tab === "all" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="tab-all-likes"
              >
                All ({liked.length})
              </button>
              <button
                onClick={() => setTab("mutual")}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${tab === "mutual" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="tab-mutual-likes"
              >
                Mutual ({mutualCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-[1.75rem] border border-border bg-card overflow-hidden animate-pulse" style={{ aspectRatio: "4/5" }}>
                <div className="w-full h-full bg-secondary" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <PawPrint className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">
              {tab === "mutual" ? "No mutual matches yet" : "No liked profiles yet"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Head to Discover to start connecting with people who share your love of animals.
            </p>
            <Link href="/discover" data-testid="link-go-discover">
              <Button className="rounded-full px-8 bg-primary text-primary-foreground">
                Browse Profiles
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {visible.map((sentLike, idx) => {
                const profile = sentLike.likedUser;
                const pet = profile.pets[0];
                return (
                  <motion.div
                    key={sentLike.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: removingId === sentLike.id ? 0 : 1, y: 0, scale: removingId === sentLike.id ? 0.92 : 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.3, delay: idx * 0.06 }}
                    className="group bg-card rounded-[1.75rem] border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                    data-testid={`card-liked-${sentLike.id}`}
                  >
                    {/* Photo */}
                    <Link href={`/profile/${profile.id}`} className="block relative overflow-hidden" style={{ aspectRatio: "4/5" }} data-testid={`link-liked-profile-${profile.id}`}>
                      <img
                        src={profile.avatarUrl || FALLBACK_IMAGE}
                        alt={profile.firstName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent" />

                      {/* Mutual match badge */}
                      {sentLike.mutualMatch && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <Heart className="w-2.5 h-2.5 fill-current" />
                          Mutual match
                        </div>
                      )}

                      {/* Pet badge */}
                      {pet && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-xl p-1.5 pr-3 flex items-center gap-2 shadow-md">
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-border/30">
                            <img src={pet.photoUrl || FALLBACK_PET_IMAGE} alt={pet.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-foreground leading-none">{pet.name}</p>
                            {pet.breed && <p className="text-[9px] text-muted-foreground leading-none mt-0.5">{pet.breed}</p>}
                          </div>
                        </div>
                      )}

                      {/* Name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-serif text-2xl font-medium leading-tight">{profile.firstName}{profile.age ? `, ${profile.age}` : ""}</h3>
                        {profile.city && (
                          <div className="flex items-center text-white/85 text-xs gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {profile.city}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Card body */}
                    <div className="p-4 flex flex-col gap-3 flex-grow">
                      {profile.bio && (
                        <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                          "{profile.bio}"
                        </p>
                      )}

                      <p className="text-[10px] text-muted-foreground/60 mt-auto">
                        Liked {formatDistanceToNow(new Date(sentLike.likedAt), { addSuffix: true })}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-10 h-10 rounded-full border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors flex-shrink-0"
                          onClick={() => setPendingUnlike(sentLike)}
                          disabled={removingId === sentLike.id}
                          title="Unlike"
                          data-testid={`btn-unlike-${sentLike.id}`}
                        >
                          <HeartOff className="w-4 h-4" />
                        </Button>

                        <Link href="/messages" className="flex-1" data-testid={`link-message-${profile.id}`}>
                          <Button
                            className={`w-full h-10 rounded-full text-xs font-medium gap-1.5 ${
                              sentLike.mutualMatch
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                            data-testid={`btn-message-${profile.id}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {sentLike.mutualMatch ? "Send a message" : "Say hello"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingUnlike} onOpenChange={(open) => !open && setPendingUnlike(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove your like{pendingUnlike ? ` for ${pendingUnlike.likedUser.firstName}` : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingUnlike?.mutualMatch
                ? "You're matched, so this also ends the match — your conversation and any planned playdates will be deleted for both of you."
                : "They'll no longer appear in your liked profiles. You can like them again from Discover."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="btn-unlike-cancel">Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlike} data-testid="btn-unlike-confirm">
              {pendingUnlike?.mutualMatch ? "Unmatch" : "Remove like"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
