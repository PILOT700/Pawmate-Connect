import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Check, Loader } from "lucide-react";
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
import {
  useUpdateMyProfile,
  useCreateMyPet,
  useUpdatePet,
  useDeletePet,
  useGetMyProfile,
  useListMyPets,
  getGetMyProfileQueryKey,
  getListMyPetsQueryKey,
  type Species,
  type LookingFor,
  type User,
  type Pet,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";
import { uploadImage } from "@/lib/cloudinary";
import { clearOnboardingPetSpecies, readOnboardingPetSpecies } from "@/lib/onboarding-pet";
import { useT } from "@/lib/i18n";
import { LIFESTYLE_TAGS } from "@/lib/lifestyle-tags";

// The intent picker offers "both", which maps onto two API values.
const INTENT_TO_LOOKING_FOR: Record<string, LookingFor[]> = {
  friendship: ["friendship"],
  relationship: ["relationship"],
  both: ["friendship", "relationship"],
};

/** Collapses the stored values back onto the single choice the picker shows. */
function lookingForToIntent(values: LookingFor[]): string {
  const friendship = values.includes("friendship");
  const relationship = values.includes("relationship");

  if (friendship && relationship) return "both";
  if (friendship) return "friendship";
  if (relationship) return "relationship";
  return "both";
}

/**
 * The wizard itself. It is mounted only once its data is in hand, so every
 * field can start from the saved value — filling them in afterwards would
 * mean setting state mid-transition, which stalls the step animation.
 */
function ProfileWizard({
  me,
  existingPet,
  isEditing,
}: {
  me: User;
  existingPet?: Pet;
  isEditing: boolean;
}) {
  const t = useT();
  const [, setLocation] = useLocation();
  const { refreshSession } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>(me.lifestyleTags ?? []);

  const [name, setName] = useState(me.firstName ?? "");
  const [age, setAge] = useState(me.age != null ? String(me.age) : "");
  const [city, setCity] = useState(me.city ?? "");
  const [intent, setIntent] = useState(lookingForToIntent(me.lookingFor));
  const [bio, setBio] = useState(me.bio ?? "");
  const [petName, setPetName] = useState(existingPet?.name ?? "");
  // Falls back to what onboarding was told, so answering "cat" there doesn't
  // hand you a form that says dog.
  const [petSpecies, setPetSpecies] = useState<string>(
    existingPet?.species ?? readOnboardingPetSpecies() ?? "dog",
  );
  const [petBreed, setPetBreed] = useState(existingPet?.breed ?? "");
  const [petAge, setPetAge] = useState(
    existingPet?.ageYears != null ? String(existingPet.ageYears) : "",
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(me.avatarUrl ?? "");
  const [petPhotoFile, setPetPhotoFile] = useState<File | null>(null);
  const [petPhotoPreview, setPetPhotoPreview] = useState<string>(existingPet?.photoUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [removePetOpen, setRemovePetOpen] = useState(false);

  const updateProfile = useUpdateMyProfile();
  const createPet = useCreateMyPet();
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();
  const isSaving =
    isUploading || updateProfile.isPending || createPet.isPending || updatePet.isPending;

  const handleRemovePet = async () => {
    if (!existingPet) return;
    setRemovePetOpen(false);

    try {
      await deletePet.mutateAsync({ petId: existingPet.id });
      // The form still holds the removed pet's details, and leaving them on
      // screen invites saving it straight back. Clearing them makes the step
      // read as what it now is: empty.
      setPetName("");
      setPetBreed("");
      setPetAge("");
      setPetPhotoFile(null);
      setPetPhotoPreview("");
      await queryClient.invalidateQueries({ queryKey: getListMyPetsQueryKey() });
      toast({
        title: t("createProfile.petRemoved"),
        description: t("createProfile.petRemovedBody", { name: existingPet.name }),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: t("createProfile.couldNotRemovePet"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

  const handlePhotoSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File) => void,
    setPreview: (url: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => setPreview(evt.target?.result as string);
    reader.readAsDataURL(file);
  };


  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleComplete = async () => {
    try {
      setIsUploading(true);
      const avatarUrl = avatarFile ? await uploadImage(avatarFile) : undefined;
      const petPhotoUrl = petPhotoFile ? await uploadImage(petPhotoFile) : undefined;
      setIsUploading(false);

      await updateProfile.mutateAsync({
        data: {
          // A name can't be blanked out, so it's only sent when present.
          ...(name ? { firstName: name } : {}),
          ...(age ? { age: Number(age) } : {}),
          // Sent even when empty, otherwise clearing them here wouldn't stick.
          city,
          bio,
          ...(intent ? { lookingFor: INTENT_TO_LOOKING_FOR[intent] ?? [] } : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
          lifestyleTags: selectedTags,
        },
      });

      if (petName && petSpecies) {
        const petData = {
          name: petName,
          species: petSpecies as Species,
          ...(petBreed ? { breed: petBreed } : {}),
          ...(petAge && !Number.isNaN(Number(petAge)) ? { ageYears: Number(petAge) } : {}),
          ...(petPhotoUrl ? { photoUrl: petPhotoUrl } : {}),
        };

        // Updating rather than inserting, or every save would add another pet.
        if (existingPet) {
          await updatePet.mutateAsync({ petId: existingPet.id, data: petData });
        } else {
          await createPet.mutateAsync({ data: petData });
        }

        // The pet record is now the answer to "what's your pet?"; the handover
        // from onboarding has nothing left to do.
        clearOnboardingPetSpecies();
      }

      await refreshSession();
      setLocation(isEditing ? "/profile/me" : "/discover");
    } catch (err) {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: t("createProfile.couldNotSave"),
        description: apiErrorMessage(err, t("common.tryAgain")),
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-primary">{t("createProfile.stepAbout")}</span>
            <span className="text-sm font-medium text-muted-foreground">{t("createProfile.stepPet")}</span>
            <span className="text-sm font-medium text-muted-foreground">{t("createProfile.stepLifestyle")}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-card border border-card-border p-8 md:p-12 rounded-[2rem] shadow-sm">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">
                    {isEditing ? t("createProfile.editTitle") : t("createProfile.newTitle")}
                  </h2>
                  <p className="text-muted-foreground">
                    {isEditing ? t("createProfile.editBody") : t("createProfile.newBody")}
                  </p>
                </div>

                <div className="flex justify-center mb-8">
                  <label className="w-32 h-32 rounded-full bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={t("createProfile.avatarAlt")} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">{t("createProfile.addPhoto")}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoSelect(e, setAvatarFile, setAvatarPreview)}
                      data-testid="input-avatar-photo"
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("auth.firstName")}</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl bg-background" data-testid="input-profile-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">{t("createProfile.age")}</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-12 rounded-xl bg-background" data-testid="input-profile-age" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">{t("createProfile.city")}</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="h-12 rounded-xl bg-background" data-testid="input-profile-city" />
                </div>

                <div className="space-y-2">
                  <Label>{t("createProfile.lookingFor")}</Label>
                  <Select value={intent} onValueChange={setIntent}>
                    <SelectTrigger className="h-12 rounded-xl bg-background" data-testid="select-profile-intent">
                      <SelectValue placeholder={t("createProfile.selectIntent")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendship">{t("createProfile.intentFriendship")}</SelectItem>
                      <SelectItem value="relationship">{t("createProfile.intentRelationship")}</SelectItem>
                      <SelectItem value="both">{t("createProfile.intentBoth")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("createProfile.bio")}</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t("createProfile.bioPlaceholder")} className="min-h-[120px] rounded-xl bg-background resize-none" data-testid="input-profile-bio" />
                </div>

                <Button 
                  className="w-full h-14 rounded-full bg-primary text-primary-foreground text-lg mt-8"
                  onClick={() => setStep(2)}
                  data-testid="btn-next-step"
                >
                  {t("createProfile.nextStep")}
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">{t("createProfile.petTitle")}</h2>
                  <p className="text-muted-foreground">{t("createProfile.petBody")}</p>
                </div>

                <div className="flex justify-center mb-8">
                  <label className="w-32 h-32 rounded-full bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground overflow-hidden">
                    {petPhotoPreview ? (
                      <img src={petPhotoPreview} alt={t("createProfile.petPhotoAlt")} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">{t("createProfile.petPhoto")}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoSelect(e, setPetPhotoFile, setPetPhotoPreview)}
                      data-testid="input-pet-photo"
                    />
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pet-name">{t("createProfile.petName")}</Label>
                    <Input id="pet-name" value={petName} onChange={(e) => setPetName(e.target.value)} className="h-12 rounded-xl bg-background" data-testid="input-pet-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("createProfile.species")}</Label>
                    <Select value={petSpecies} onValueChange={setPetSpecies}>
                      <SelectTrigger className="h-12 rounded-xl bg-background" data-testid="select-pet-species">
                        <SelectValue placeholder={t("createProfile.selectSpecies")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">{t("species.dog")}</SelectItem>
                        <SelectItem value="cat">{t("species.cat")}</SelectItem>
                        <SelectItem value="bird">{t("species.bird")}</SelectItem>
                        <SelectItem value="other">{t("species.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pet-breed">{t("createProfile.breed")}</Label>
                    <Input id="pet-breed" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} className="h-12 rounded-xl bg-background" data-testid="input-pet-breed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pet-age">{t("createProfile.petAge")}</Label>
                    <Input id="pet-age" type="number" value={petAge} onChange={(e) => setPetAge(e.target.value)} placeholder={t("createProfile.years")} className="h-12 rounded-xl bg-background" data-testid="input-pet-age" />
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <Button variant="outline" className="h-14 rounded-full px-8 border-border" onClick={() => setStep(1)} data-testid="btn-prev-step">
                    {t("onboarding.back")}
                  </Button>
                  <Button className="flex-1 h-14 rounded-full bg-primary text-primary-foreground text-lg" onClick={() => setStep(3)} data-testid="btn-next-step">
                    {t("createProfile.nextStep")}
                  </Button>
                </div>

                {/* Only once there is a pet on file. Clearing the fields above
                    would not remove it — saving skips a blank pet rather than
                    deleting one, so there has to be a way to say so outright. */}
                {existingPet && (
                  <div className="pt-6 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setRemovePetOpen(true)}
                      className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                      data-testid="btn-remove-pet"
                    >
                      {t("createProfile.removePetLink", { name: existingPet.name })}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">{t("createProfile.lifestyleTitle")}</h2>
                  <p className="text-muted-foreground">{t("createProfile.lifestyleBody")}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {LIFESTYLE_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag.value);
                    return (
                      <button
                        key={tag.value}
                        onClick={() => toggleTag(tag.value)}
                        className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-2
                          ${isSelected 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                          }
                        `}
                        data-testid={`tag-${tag.value.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                        {t(tag.label)}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-4 pt-8">
                  <Button variant="outline" className="h-14 rounded-full px-8 border-border" onClick={() => setStep(2)} data-testid="btn-prev-step">
                    {t("onboarding.back")}
                  </Button>
                  <Button className="flex-1 h-14 rounded-full bg-primary text-primary-foreground text-lg" onClick={handleComplete} disabled={isSaving} data-testid="btn-complete-profile">
                    {isUploading
                      ? t("story.uploading")
                      : isSaving
                        ? t("onboarding.saving")
                        : isEditing
                          ? t("createProfile.saveChanges")
                          : t("createProfile.complete")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AlertDialog open={removePetOpen} onOpenChange={setRemovePetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("createProfile.removeTitle", { name: existingPet?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("createProfile.removeBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="btn-remove-pet-cancel">{t("createProfile.keepThem")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemovePet} data-testid="btn-remove-pet-confirm">
              {t("createProfile.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CreateProfile() {
  const { data: me, isLoading: profileLoading } = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey() },
  });
  const { data: myPets, isLoading: petsLoading } = useListMyPets({
    query: { queryKey: getListMyPetsQueryKey() },
  });

  if (profileLoading || petsLoading || !me) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-background flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ProfileWizard
      me={me}
      existingPet={myPets?.[0]}
      // Someone who already finished onboarding is editing, not signing up.
      isEditing={Boolean(me.onboardingCompletedAt)}
    />
  );
}
