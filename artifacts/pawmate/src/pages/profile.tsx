import { useParams, Link } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, MessageCircle, ArrowLeft, Loader, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import { CompatibilityScore } from "@/components/compatibility-score";
import type { CompatibilityInput } from "@/components/compatibility-score";
import { StoryStrip } from "@/components/story-strip";
import type { Story } from "@/components/story-viewer";
import {
  useGetMyProfile,
  useGetUserProfile,
  useListMyPets,
  useListUserPets,
  useListUserStories,
  useMarkStoryViewed,
  getGetMyProfileQueryKey,
  getGetUserProfileQueryKey,
  getListMyPetsQueryKey,
  getListUserPetsQueryKey,
  getListUserStoriesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";

const FALLBACK_IMAGE = "/profile1.png";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  // "/profile/me" and a link to your own id are the same page.
  const isOwnProfile = !id || id === "me" || id === currentUser?.id;
  const userId = isOwnProfile ? currentUser?.id : id;

  const myProfile = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey(), enabled: isOwnProfile },
  });
  const otherProfile = useGetUserProfile(id ?? "", {
    query: { queryKey: getGetUserProfileQueryKey(id ?? ""), enabled: !isOwnProfile && !!id },
  });
  const myPets = useListMyPets({
    query: { queryKey: getListMyPetsQueryKey(), enabled: isOwnProfile },
  });
  const otherPets = useListUserPets(id ?? "", {
    query: { queryKey: getListUserPetsQueryKey(id ?? ""), enabled: !isOwnProfile && !!id },
  });

  const profile = isOwnProfile ? myProfile.data : otherProfile.data;
  const pets = (isOwnProfile ? myPets.data : otherPets.data) ?? [];
  const pet = pets[0];

  const profileLoading = isOwnProfile ? myProfile.isLoading : otherProfile.isLoading;
  const profileError = isOwnProfile ? myProfile.error : otherProfile.error;

  const { data: storiesData, isLoading: storiesLoading } = useListUserStories(userId ?? "", {
    query: { queryKey: getListUserStoriesQueryKey(userId ?? ""), enabled: !!userId },
  });
  const markViewedMutation = useMarkStoryViewed();

  const stories: Story[] = (storiesData ?? []).map((s) => ({
    id: s.id,
    image: s.imageUrl || "",
    caption: s.caption || "",
    petMoment: s.isPetMoment || false,
  }));

  // Mark stories as viewed once they've been rendered.
  useEffect(() => {
    storiesData?.forEach((story) => {
      if (!story.viewed) {
        markViewedMutation.mutateAsync({ storyId: story.id }).catch((err: unknown) => {
          console.error("Failed to mark story as viewed:", err);
        });
      }
    });
    // markViewedMutation is intentionally excluded — it is recreated each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storiesData]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <PawPrint className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-2xl text-foreground mb-2">Profile not found</h1>
        <p className="text-muted-foreground mb-6">This member may have left Pawmate.</p>
        <Link href="/discover">
          <Button className="rounded-full px-8">Back to Discover</Button>
        </Link>
      </div>
    );
  }

  const heroImage = profile.avatarUrl || FALLBACK_IMAGE;
  const compatInput: CompatibilityInput = {
    theirPetSpecies: pet?.species,
    theirLifestyle: profile.lifestyleTags,
    theirLookingFor: profile.lookingFor,
    theirTraits: pet?.traits ?? [],
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        <img src={heroImage} alt={profile.firstName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <Link href="/discover" className="absolute top-6 left-6 z-10" data-testid="btn-back">
          <Button variant="outline" size="icon" className="rounded-full bg-background/50 backdrop-blur-md border-transparent hover:bg-background/80">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl -mt-32 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[3rem] p-8 md:p-12 shadow-xl border border-card-border/50"
        >
          {/* Story Strip */}
          {(storiesLoading || stories.length > 0) && (
            <div className="mb-8">
              <h2 className="font-serif text-xl font-medium text-foreground mb-4">Moments</h2>
              {storiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <StoryStrip name={profile.firstName} avatar={heroImage} stories={stories} />
              )}
            </div>
          )}

          {/* Name + actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-border pb-8">
            <div>
              <h1 className="font-serif text-5xl font-semibold text-foreground mb-3">
                {profile.firstName}{profile.age ? `, ${profile.age}` : ""}
              </h1>
              {profile.city && (
                <div className="flex items-center text-muted-foreground gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{profile.city}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              {isOwnProfile ? (
                <Link href="/create-profile" data-testid="btn-edit-profile" className="flex-1 md:flex-none">
                  <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-14 border-border">
                    Edit profile
                  </Button>
                </Link>
              ) : (
                <>
                  <Button size="lg" className="flex-1 md:flex-none rounded-full px-8 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm border border-accent-foreground/10 h-14" data-testid="btn-profile-like">
                    <Heart className="w-5 h-5 mr-2 fill-current" /> Like
                  </Button>
                  <Link href="/messages" data-testid="btn-profile-message" className="flex-1 md:flex-none">
                    <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-14 border-border">
                      <MessageCircle className="w-5 h-5 mr-2" /> Message
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-12">
            {/* Left: bio + lifestyle */}
            <div className="md:col-span-3 space-y-10">
              {profile.bio && (
                <section>
                  <h2 className="font-serif text-2xl font-medium text-foreground mb-4">About Me</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed font-light">{profile.bio}</p>
                </section>
              )}

              {profile.lifestyleTags.length > 0 && (
                <section>
                  <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Lifestyle</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.lifestyleTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-4 py-2 rounded-full text-sm bg-secondary text-secondary-foreground font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Compatibility score — mobile placement */}
              {!isOwnProfile && pet && (
                <div className="md:hidden">
                  <h2 className="font-serif text-2xl font-medium text-foreground mb-4">Your Match</h2>
                  <CompatibilityScore input={compatInput} />
                </div>
              )}
            </div>

            {/* Right: pet card + compat score */}
            <div className="md:col-span-2 space-y-6">
              {pet ? (
                <div className="bg-secondary/30 rounded-[2rem] p-6 border border-secondary">
                  <h2 className="font-serif text-2xl font-medium text-foreground mb-6 text-center">Meet {pet.name}</h2>
                  {pet.photoUrl && (
                    <div className="aspect-square rounded-2xl overflow-hidden mb-6">
                      <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-border/50">
                      <span className="text-muted-foreground">Species</span>
                      <span className="font-medium text-foreground capitalize">{pet.species}</span>
                    </div>
                    {pet.breed && (
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-muted-foreground">Breed</span>
                        <span className="font-medium text-foreground">{pet.breed}</span>
                      </div>
                    )}
                    {pet.ageYears != null && (
                      <div className="flex justify-between items-center pb-3 border-b border-border/50">
                        <span className="text-muted-foreground">Age</span>
                        <span className="font-medium text-foreground">
                          {pet.ageYears} {pet.ageYears === 1 ? "year" : "years"}
                        </span>
                      </div>
                    )}
                    {pet.traits.length > 0 && (
                      <div className="pt-2">
                        <span className="text-muted-foreground block mb-2 text-sm">Traits</span>
                        <div className="flex flex-wrap gap-1">
                          {pet.traits.map((trait) => (
                            <Badge key={trait} variant="outline" className="rounded-full text-xs font-normal border-border bg-background">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-secondary/30 rounded-[2rem] p-6 border border-secondary text-center">
                  <PawPrint className="w-7 h-7 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {isOwnProfile ? "You haven't added a pet yet." : `${profile.firstName} hasn't added a pet yet.`}
                  </p>
                  {isOwnProfile && (
                    <Link href="/create-profile">
                      <Button variant="outline" className="rounded-full">Add your pet</Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Compatibility score — desktop sidebar */}
              {!isOwnProfile && pet && (
                <div className="hidden md:block">
                  <CompatibilityScore input={compatInput} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
