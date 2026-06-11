import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Check } from "lucide-react";

export default function CreateProfile() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const lifestyleTags = [
    "Morning person", "Night owl", "Homebody", "Outdoor lover", 
    "Coffee enthusiast", "Fitness focused", "Foodie", "Dog park regular",
    "Weekend hiker", "Couch cuddler", "Work from home", "Traveler"
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleComplete = () => {
    setLocation("/discover");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-primary">About You</span>
            <span className="text-sm font-medium text-muted-foreground">Your Pet</span>
            <span className="text-sm font-medium text-muted-foreground">Lifestyle</span>
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
                  <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Tell us about yourself</h2>
                  <p className="text-muted-foreground">Let's start with the basics.</p>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="w-32 h-32 rounded-full bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">Add Photo</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">First Name</Label>
                    <Input id="name" className="h-12 rounded-xl bg-background" data-testid="input-profile-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" className="h-12 rounded-xl bg-background" data-testid="input-profile-age" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" className="h-12 rounded-xl bg-background" data-testid="input-profile-city" />
                </div>

                <div className="space-y-2">
                  <Label>I'm looking for</Label>
                  <Select defaultValue="both">
                    <SelectTrigger className="h-12 rounded-xl bg-background" data-testid="select-profile-intent">
                      <SelectValue placeholder="Select intent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendship">Friendship (Playdates)</SelectItem>
                      <SelectItem value="relationship">Relationship</SelectItem>
                      <SelectItem value="both">Open to both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="A little bit about you..." className="min-h-[120px] rounded-xl bg-background resize-none" data-testid="input-profile-bio" />
                </div>

                <Button 
                  className="w-full h-14 rounded-full bg-primary text-primary-foreground text-lg mt-8"
                  onClick={() => setStep(2)}
                  data-testid="btn-next-step"
                >
                  Next Step
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
                  <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Meet your co-pilot</h2>
                  <p className="text-muted-foreground">Tell us about your pet.</p>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="w-32 h-32 rounded-full bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">Pet Photo</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pet-name">Pet's Name</Label>
                    <Input id="pet-name" className="h-12 rounded-xl bg-background" data-testid="input-pet-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Species</Label>
                    <Select defaultValue="dog">
                      <SelectTrigger className="h-12 rounded-xl bg-background" data-testid="select-pet-species">
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pet-breed">Breed</Label>
                    <Input id="pet-breed" className="h-12 rounded-xl bg-background" data-testid="input-pet-breed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pet-age">Age</Label>
                    <Input id="pet-age" className="h-12 rounded-xl bg-background" data-testid="input-pet-age" />
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <Button variant="outline" className="h-14 rounded-full px-8 border-border" onClick={() => setStep(1)} data-testid="btn-prev-step">
                    Back
                  </Button>
                  <Button className="flex-1 h-14 rounded-full bg-primary text-primary-foreground text-lg" onClick={() => setStep(3)} data-testid="btn-next-step">
                    Next Step
                  </Button>
                </div>
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
                  <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Lifestyle & Vibe</h2>
                  <p className="text-muted-foreground">Select tags that describe your day-to-day.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {lifestyleTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-2
                          ${isSelected 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                          }
                        `}
                        data-testid={`tag-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                        {tag}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-4 pt-8">
                  <Button variant="outline" className="h-14 rounded-full px-8 border-border" onClick={() => setStep(2)} data-testid="btn-prev-step">
                    Back
                  </Button>
                  <Button className="flex-1 h-14 rounded-full bg-primary text-primary-foreground text-lg" onClick={handleComplete} data-testid="btn-complete-profile">
                    Complete Profile
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
