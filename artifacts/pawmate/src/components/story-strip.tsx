import { useState } from "react";
import { motion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { StoryViewer } from "@/components/story-viewer";
import type { Story } from "@/components/story-viewer";

interface StoryStripProps {
  name: string;
  avatar: string;
  stories: Story[];
}

export function StoryStrip({ name, avatar, stories }: StoryStripProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [startIdx, setStartIdx] = useState(0);
  const [seenSet, setSeenSet] = useState<Set<string>>(new Set());

  const openAt = (i: number) => {
    setStartIdx(i);
    setViewerOpen(true);
  };

  const handleClose = () => {
    setViewerOpen(false);
    setSeenSet(prev => new Set([...prev, ...stories.map(s => s.id)]));
  };

  return (
    <>
      <div className="flex items-start gap-3 overflow-x-auto no-scrollbar pb-1" data-testid="story-strip">
        {stories.map((story, i) => {
          const seen = seenSet.has(story.id);
          return (
            <motion.button
              key={story.id}
              onClick={() => openAt(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5"
              data-testid={`btn-story-${story.id}`}
            >
              {/* Ring + thumbnail */}
              <div className={`p-[2.5px] rounded-full ${seen ? "bg-border" : "bg-gradient-to-br from-amber-400 via-rose-400 to-primary"}`}>
                <div className="p-[2px] rounded-full bg-card">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative">
                    <img
                      src={story.image}
                      alt={story.caption ?? `Story ${i + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                    {story.petMoment && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center border border-card">
                        <PawPrint className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium leading-none truncate max-w-[68px] text-center">
                {story.petMoment ? "🐾 Pet" : `Moment ${i + 1}`}
              </span>
            </motion.button>
          );
        })}
      </div>

      <StoryViewer
        stories={stories}
        startIndex={startIdx}
        name={name}
        avatar={avatar}
        open={viewerOpen}
        onClose={handleClose}
      />
    </>
  );
}
