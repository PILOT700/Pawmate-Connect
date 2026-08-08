import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCreateEvent } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { apiErrorMessage } from "@/lib/api-error";
import { uploadImage } from "@/lib/cloudinary";

const CATEGORIES = ["meetup", "cafe", "adoption", "training", "trail"] as const;

export default function CreateEvent() {
  const [, setRoute] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("meetup");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const createEvent = useCreateEvent();
  const isSubmitting = isUploading || createEvent.isPending;

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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Title, description, and location are required");
      return;
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      setError("Start and end dates/times are required");
      return;
    }

    try {
      const startAt = new Date(`${startDate}T${startTime}`);
      const endAt = new Date(`${endDate}T${endTime}`);

      if (startAt >= endAt) {
        setError("End time must be after start time");
        return;
      }

      let imageUrl: string | undefined;
      if (image) {
        setIsUploading(true);
        imageUrl = await uploadImage(image);
        setIsUploading(false);
      }

      await createEvent.mutateAsync({
        data: {
          title,
          description,
          location,
          category,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
          tags: tags.length > 0 ? tags : undefined,
          imageUrl,
        },
      });

      toast({
        title: "Success",
        description: "Event created successfully!",
      });

      setRoute("/community");
    } catch (err) {
      setIsUploading(false);
      setError(apiErrorMessage(err, "Could not create event"));
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
            Create Event
          </h1>
          <p className="text-muted-foreground mb-8">
            Organize a fun gathering for pet lovers in your community
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
              <Label className="text-sm font-medium">Event Image</Label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-48 object-cover"
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
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload event image
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Event Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Dog Park Playdate"
                className="h-11 bg-background rounded-xl"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Tell people about your event..."
                className="bg-background rounded-xl resize-none"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location *
              </Label>
              <Input
                id="location"
                placeholder="e.g., Central Park, New York"
                className="h-11 bg-background rounded-xl"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select value={category} onValueChange={(val) => setCategory(val as typeof CATEGORIES[number])}>
                <SelectTrigger className="h-11 bg-background rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date/Time Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="h-11 bg-background rounded-xl"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium">
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  className="h-11 bg-background rounded-xl"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  className="h-11 bg-background rounded-xl"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium">
                  End Time *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  className="h-11 bg-background rounded-xl"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Max Attendees */}
            <div className="space-y-2">
              <Label htmlFor="maxAttendees" className="text-sm font-medium">
                Max Attendees (Optional)
              </Label>
              <Input
                id="maxAttendees"
                type="number"
                placeholder="Leave blank for unlimited"
                className="h-11 bg-background rounded-xl"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                min="1"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag and press Enter"
                  className="h-11 bg-background rounded-xl"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  className="h-11 rounded-xl"
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-medium"
              >
                {isUploading ? "Uploading…" : isSubmitting ? "Creating…" : "Create Event"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRoute("/community")}
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
