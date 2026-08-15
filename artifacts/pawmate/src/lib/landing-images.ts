/**
 * Every photograph on the landing page, in one place.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  REPLACING THE PHOTOS
 * ─────────────────────────────────────────────────────────────────────────────
 *  Drop a file into `public/landing/` under the name below and it is live —
 *  no code changes, no rebuild of anything but the app itself. Names are fixed
 *  precisely so a 4K photograph can replace a placeholder by overwriting it.
 *
 *    public/landing/hero.png          wide, 2400×1600 or larger
 *    public/landing/member-1..4.png   square, 800×800 or larger
 *    public/landing/community.png     portrait, 1200×1600 or larger
 *    public/landing/match.png         portrait, 600×800 or larger
 *    public/landing/voice-1..3.png    square, 200×200 is enough
 *
 *  Any format the browser reads works — .jpg and .webp too. If the extension
 *  changes, this file is the single place to say so.
 *
 *  `alt` is not decoration: it is what someone using a screen reader hears, and
 *  what shows if the file is missing. Update it with the picture.
 */

export interface LandingImage {
  src: string;
  alt: string;
}

const DIR = "/landing";

export const heroImage: LandingImage = {
  src: `${DIR}/hero.png`,
  alt: "Two couples walking a sunlit promenade with a golden retriever and a cat",
};

export const communityImage: LandingImage = {
  src: `${DIR}/community.png`,
  alt: "A woman sitting outdoors on a blanket with her dog and cat",
};

export const matchImage: LandingImage = {
  src: `${DIR}/match.png`,
  alt: "",
};

export interface LandingMember extends LandingImage {
  name: string;
  age: number;
  role: string;
  distance: string;
}

/** Illustrative members. These are not accounts that exist. */
export const members: LandingMember[] = [
  { name: "Olivia", age: 48, role: "Teacher", distance: "2 km away", src: `${DIR}/member-1.png`, alt: "Olivia with her golden retriever" },
  { name: "David", age: 52, role: "Architect", distance: "5 km away", src: `${DIR}/member-2.png`, alt: "David holding his cat" },
  { name: "Sophie", age: 50, role: "Marketing Manager", distance: "3 km away", src: `${DIR}/member-3.png`, alt: "Sophie with her spaniel" },
  { name: "James", age: 54, role: "Entrepreneur", distance: "4 km away", src: `${DIR}/member-4.png`, alt: "James with his dachshund" },
];

export interface LandingVoice extends LandingImage {
  quote: string;
  who: string;
}

/** Illustrative testimonials. Nobody has said these things. */
export const voices: LandingVoice[] = [
  {
    quote: "I found not only a great companion, but my dog found a new best friend too!",
    who: "Sarah & Max",
    src: `${DIR}/voice-1.png`,
    alt: "",
  },
  {
    quote: "PawMate brought us together. We fit in perfectly!",
    who: "Laura & Charlie",
    src: `${DIR}/voice-2.png`,
    alt: "",
  },
  {
    quote: "Finally a place where pets come first. That makes all the difference.",
    who: "Mark & Bella",
    src: `${DIR}/voice-3.png`,
    alt: "",
  },
];
