import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, PawPrint } from "lucide-react";
import { useT } from "@/lib/i18n";

export interface Story {
  id: string;
  image: string;
  caption?: string;
  petMoment?: boolean;
}

interface StoryViewerProps {
  stories: Story[];
  startIndex: number;
  name: string;
  avatar: string;
  open: boolean;
  onClose: () => void;
}

const DURATION = 4500; // ms per story

export function StoryViewer({ stories, startIndex, name, avatar, open, onClose }: StoryViewerProps) {
  const t = useT();
  const [idx, setIdx] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const goNext = useCallback(() => {
    if (idx < stories.length - 1) {
      setIdx(i => i + 1);
      setProgress(0);
      elapsedRef.current = 0;
    } else {
      onClose();
    }
  }, [idx, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (idx > 0) {
      setIdx(i => i - 1);
      setProgress(0);
      elapsedRef.current = 0;
    }
  }, [idx]);

  // Timer logic
  useEffect(() => {
    if (!open || paused) return;

    const tick = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = elapsedRef.current + (ts - startTimeRef.current);
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        goNext();
      }
    };

    startTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      elapsedRef.current = 0;
    };
  }, [open, idx, paused, goNext]);

  // Pause on hold
  const handlePauseStart = () => {
    setPaused(true);
    cancelAnimationFrame(rafRef.current);
  };
  const handlePauseEnd = () => {
    setPaused(false);
    elapsedRef.current = progress * DURATION;
    startTimeRef.current = 0;
  };

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, goNext, goPrev, onClose]);

  const story = stories[idx];

  return (
    <AnimatePresence>
      {open && story && (
        <motion.div
          key="story-viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          data-testid="story-viewer"
        >
          {/* Story image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0"
              onMouseDown={handlePauseStart}
              onMouseUp={handlePauseEnd}
              onTouchStart={handlePauseStart}
              onTouchEnd={handlePauseEnd}
            >
              <img
                src={story.image}
                alt={story.caption ?? name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40 pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Progress bars */}
          <div className="absolute top-3 left-4 right-4 flex gap-1 z-10">
            {stories.map((s, i) => (
              <div key={s.id} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: i < idx ? "100%" : i === idx ? `${progress * 100}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header — avatar + name + close */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/60 shadow-md">
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight drop-shadow-md">{name}</p>
                {story.petMoment && (
                  <span className="flex items-center gap-1 text-white/80 text-[10px] font-medium">
                    <PawPrint className="w-3 h-3" /> Pet moment
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
              data-testid="btn-story-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Caption */}
          {story.caption && (
            <motion.div
              key={`cap-${story.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15 }}
              className="absolute bottom-12 left-6 right-6 z-10"
            >
              <p className="text-white text-sm leading-relaxed drop-shadow-lg font-medium text-center">
                {story.caption}
              </p>
            </motion.div>
          )}

          {/* Tap zones */}
          <button
            className="absolute left-0 top-0 h-full w-1/3 z-20 focus:outline-none"
            onClick={goPrev}
            data-testid="btn-story-prev"
            aria-label={t("story.previous")}
          />
          <button
            className="absolute right-0 top-0 h-full w-1/3 z-20 focus:outline-none"
            onClick={goNext}
            data-testid="btn-story-next"
            aria-label={t("story.next")}
          />

          {/* Visible nav arrows (desktop) */}
          {idx > 0 && (
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors z-30 hidden md:flex"
              data-testid="btn-story-prev-arrow"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {idx < stories.length - 1 && (
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors z-30 hidden md:flex"
              data-testid="btn-story-next-arrow"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
