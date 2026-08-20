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
 *    hero-1200/2000/3200.jpg      cut from an 8K original with `sips -Z`
 *    member-1..4.png              the four illustrative members, 896×1280
 *    community.png                the community panel, 896×1280
 *    voice-1..3.png               200×200 is enough
 *
 *  These paths once named files that were never committed — profile_1..4.jpg,
 *  PawMate_community_summer.jpg and match.png — so six pictures on the landing
 *  page 404'd in production. The names below are the files that actually exist.
 *  Two of them are stand-ins rather than the intended art: `community.png` is
 *  byte-for-byte `member-3.png`, and the match card borrows Olivia's picture
 *  because no match.png was ever supplied.
 *
 *  Any format the browser reads works — .jpg and .webp too. If the extension
 *  changes, this file is the single place to say so.
 *
 *  `alt` is not decoration: it is what someone using a screen reader hears, and
 *  what shows if the file is missing. Update it with the picture.
 *
 *  It is a dictionary key rather than a sentence, because a Russian reader
 *  should not be read English. The empty string is the exception and means
 *  what it means in HTML: this picture carries nothing a reader needs.
 */
import type { TranslationKey } from "@/lib/i18n";

export interface LandingImage {
  src: string;
  alt: TranslationKey | "";
  /**
   * Optional wider versions of the same photograph. The browser picks one from
   * its own screen and connection, so a phone is not made to download a
   * picture built for a 5K display.
   */
  srcSet?: string;
  /** How wide the picture is drawn, so the browser can choose before layout. */
  sizes?: string;
}

const DIR = "/landing";

export const heroImage: LandingImage = {
  // The 1200 is the fallback for anything that ignores srcSet.
  src: `${DIR}/hero-1200.jpg`,
  srcSet: [
    `${DIR}/hero-1200.jpg 1200w`,
    `${DIR}/hero-2000.jpg 2000w`,
    `${DIR}/hero-3200.jpg 3200w`,
  ].join(", "),
  // Beside the text on a wide screen, full width once the two stack.
  sizes: "(min-width: 1024px) 58vw, 100vw",
  alt: "landing.heroAlt",
};

export const communityImage: LandingImage = {
  src: `${DIR}/community.png`,
  alt: "landing.communityAlt",
};

// Borrowed from Olivia's card: the caption beside it says she is the match, and
// there is no picture of her own. Swap this the moment a real one exists.
export const matchImage: LandingImage = {
  src: `${DIR}/member-1.png`,
  alt: "",
};

export interface LandingMember extends LandingImage {
  name: string;
  age: number;
  role: string;
  distanceKm: number;
}

/**
 * Illustrative members. These are not accounts that exist.
 *
 * The photographs are of the pets alone — nobody is pictured — so `alt` says
 * that rather than promising a face. The breeds are what is actually in the
 * frame: the old text called Sophie's collie a spaniel and James's Siamese cat
 * a dachshund.
 */
export const members: LandingMember[] = [
  { name: "Olivia", age: 48, role: "Teacher", distanceKm: 2, src: `${DIR}/member-1.png`, alt: "landing.oliviaAlt" },
  { name: "David", age: 52, role: "Architect", distanceKm: 5, src: `${DIR}/member-2.png`, alt: "landing.davidAlt" },
  { name: "Sophie", age: 50, role: "Marketing Manager", distanceKm: 3, src: `${DIR}/member-3.png`, alt: "landing.sophieAlt" },
  { name: "James", age: 54, role: "Entrepreneur", distanceKm: 4, src: `${DIR}/member-4.png`, alt: "landing.jamesAlt" },
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
