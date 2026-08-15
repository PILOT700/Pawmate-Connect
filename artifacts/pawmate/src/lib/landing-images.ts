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
 *  Change a path below and the page follows. The files in place now:
 *
 *    PawMate_hero_summer.jpg      wants 2400×1600 or larger
 *    PawMate_profile_1..4.jpg     wants 800×800 or larger
 *    PawMate_community_summer.jpg wants 1200×1600 or larger
 *    match.png                    wants 600×800 or larger
 *    voice-1..3.png               200×200 is enough
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
  src: `${DIR}/PawMate_hero_summer.jpg`,
  alt: "Two couples walking a sunlit promenade with a golden retriever and a cat",
};

export const communityImage: LandingImage = {
  src: `${DIR}/PawMate_community_summer.jpg`,
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
  { name: "Olivia", age: 48, role: "Teacher", distance: "2 km away", src: `${DIR}/PawMate_profile_1.jpg`, alt: "Olivia with her golden retriever" },
  { name: "David", age: 52, role: "Architect", distance: "5 km away", src: `${DIR}/PawMate_profile_2.jpg`, alt: "David holding his cat" },
  { name: "Sophie", age: 50, role: "Marketing Manager", distance: "3 km away", src: `${DIR}/PawMate_profile_3.jpg`, alt: "Sophie with her spaniel" },
  { name: "James", age: 54, role: "Entrepreneur", distance: "4 km away", src: `${DIR}/PawMate_profile_4.jpg`, alt: "James with his dachshund" },
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
