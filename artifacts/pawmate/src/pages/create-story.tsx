import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCreateStory, useListMyPets } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";
import { uploadImage } from "@/lib/cloudinary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateStory() {
  const [, setRoute] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [caption, setCaption] = useState("");
  const [isPetMoment, setIsPetMoment] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: petsResponse } = useListMyPets();
  const pets = petsResponse?.items || [];

  const [isUploading, setIsUploading] = useState(false);
  const createStory = useCreateStory();
  const isSubmitting = isUploading || createStory.isPending;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImagePreview(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!image) {
      setError("Please select an image");
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(image);
      setIsUploading(false);

      await createStory.mutateAsync({
        data: {
          imageUrl,
          caption: caption || undefined,
          isPetMoment: isPetMoment || undefined,
        },
      });

      toast({
        title: "Success",
        description: "Story posted successfully!",
      });

      setRoute("/discover");
    } catch (err) {
      setIsUploading(false);
      setError(apiErrorMessage(err, "Could not create story"));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-3xl p-8 shadow-xl"
        >
          <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
            Share a Story
          </h1>
          <p className="text-muted-foreground mb-8">
            Capture and share a moment from your pet's day
          </p>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Story Image *</Label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Story preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview("");
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload story image
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption" className="text-sm font-medium">
                Caption (Optional)
              </Label>
              <Textarea
                id="caption"
                placeholder="Add a caption to your story..."
                className="bg-background rounded-xl resize-none"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {/* Pet Selection */}
            {pets.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="pet" className="text-sm font-medium">
                  Featured Pet (Optional)
                </Label>
                <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                  <SelectTrigger className="h-11 bg-background rounded-xl">
                    <SelectValue placeholder="Select a pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Pet Moment Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <input
                type="checkbox"
                id="isPetMoment"
                checked={isPetMoment}
                onChange={(e) => setIsPetMoment(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <Label
                htmlFor="isPetMoment"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                This is a special pet moment
              </Label>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-medium"
              >
                {isUploading ? "Uploading…" : isSubmitting ? "Posting…" : "Post Story"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRoute("/discover")}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
