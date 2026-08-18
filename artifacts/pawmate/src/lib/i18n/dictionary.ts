/**
 * Every piece of text the interface says, in both languages.
 *
 * English is the source: `Dictionary` is derived from it, so a key added here
 * and not translated is a type error in `ru.ts` rather than an English word
 * appearing in the middle of a Russian sentence.
 *
 * Keys read as paths — `nav.howItWorks`, `auth.signIn` — so the place a string
 * belongs is obvious from the key alone.
 *
 * Plurals: a value may be an object of Intl plural categories instead of a
 * string. Russian needs `one/few/many` where English needs `one/other`, and
 * `Intl.PluralRules` decides which applies. Never hand-roll that.
 */

export const en = {
  nav: {
    howItWorks: "How it works",
    findPets: "Find pets",
    successStories: "Success stories",
    blog: "Blog",
    aboutUs: "About us",
    logIn: "Log in",
    signUp: "Sign up",
    discover: "Discover",
    liked: "Liked",
    community: "Community",
    createEvent: "+ Event",
    createStory: "+ Story",
    messages: "Messages",
    myProfile: "My Profile",
    settings: "Settings",
    logOut: "Log out",
    language: "Language",
  },

  home: {
    badge: "Connections that start with paws",
    heroTitle: "Where pet lovers find their person",
    heroBody:
      "PawMate is a community for pet lovers seeking meaningful relationships, friendship, and shared moments.",
    join: "Join PawMate",
    learnMore: "Learn more",

    featureMatchingTitle: "Pet-First Matching",
    featureMatchingBody: "We match you based on your pets and lifestyle.",
    featureSafetyTitle: "Block and Report",
    featureSafetyBody: "Anyone can be blocked or reported, from their profile.",
    featureTalkTitle: "Easy Conversations",
    featureTalkBody: "Break the ice with pet-friendly prompts.",
    featureMeetTitle: "Meet & Connect",
    featureMeetBody: "Find friendship or love in your area.",
    featureCommunityTitle: "Supportive Community",
    featureCommunityBody: "Join events and groups for pet lovers.",

    findYourMatch: "Find your match",
    membersTitle: "People who love pets, just like you do",
    browseMembers: "Browse members",
    betterTogether: "Better together",
    betterTogetherBody: "Our app makes it easy to find people who share your love for pets.",
    itsAMatch: "It's a match!",
    matchSubtitle: "You and Olivia liked each other.",
    downloadOn: "Download on the",
    appStore: "App Store",
    getItOn: "Get it on",
    googlePlay: "Google Play",

    communityEyebrow: "Community",
    storiesTitle: "Real stories from real pet lovers",

    ctaTitle: "Ready to start your story?",
    ctaBody: "Join thousands of pet lovers and find friendship, love, and wagging tails.",
    ctaSignUp: "Sign up for free",

    awayFrom: "{{distance}} km away",
  },

  footer: {
    tagline:
      "Meaningful connections grounded in a shared love of animals. Find your person, and their pet.",
    discover: "Discover",
    community: "Community",
    company: "Company",
    newsletter: "Newsletter",
    newsletterBody: "Occasional notes about new features and local events.",
    newsletterClosed: "Sign-ups open once we launch.",
    emailPlaceholder: "you@example.com",
    forPetLovers: "For pet lovers",
    browseMembers: "Browse members",
    events: "Events",
    helpCenter: "Help Center",
    guidelines: "Community Guidelines",
    aboutUs: "About us",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    rights: "© {{year}} PawMate. All rights reserved.",
  },

  auth: {
    welcome: "Welcome to Pawmate",
    subtitle: "Find connections that start with paws.",
    signIn: "Sign In",
    createAccount: "Create Account",
    email: "Email",
    password: "Password",
    firstName: "First Name",
    forgotPassword: "Forgot password?",
    signingIn: "Signing in…",
    creating: "Creating…",
    couldNotSignIn: "Could not sign in",
    couldNotCreate: "Could not create account",
    passwordHint: "At least 10 characters",
    consent: "By creating an account you agree to our {{terms}} and {{privacy}}.",
    termsWord: "Terms",
    privacyWord: "Privacy Policy",
  },

  reset: {
    forgotTitle: "Forgot your password?",
    forgotBody: "Give us the address you signed up with and we'll send a link to set a new one.",
    sendLink: "Send the link",
    sending: "Sending…",
    backToSignIn: "Back to sign in",
    checkEmail: "Check your email",
    checkEmailBody:
      "If there's a Pawmate account for {{email}}, a link to choose a new password is on its way. It works for one hour.",
    couldNotSend: "Couldn't send the link",
    chooseNew: "Choose a new password",
    chooseNewBody:
      "At least ten characters, and not one that has turned up in a data breach. Signing in anywhere else will need the new one.",
    newPassword: "New password",
    repeatIt: "Repeat it",
    mismatch: "These two don't match.",
    setPassword: "Set the password",
    saving: "Saving…",
    changed: "Password changed",
    changedBody: "You've been signed out everywhere else. Sign in with the new one.",
    couldNotChange: "Couldn't change the password",
    askAgain: "Ask for a fresh link and try again.",
  },

  pending: {
    visitHelp: "Visit the Help Center",
    backToStart: "Back to the start",
    notWritten:
      "It isn't written yet. Rather than show you a page of text that looks official and isn't, we'd rather say so — and publish the real thing when it's ready.",
    termsTitle: "Terms of Service",
    termsBlurb: "The terms set out what you can expect from PawMate and what we expect of you.",
    privacyTitle: "Privacy Policy",
    privacyBlurb:
      "The privacy policy explains what we hold about you, where it lives, and what you can ask us to do with it.",
    guidelinesTitle: "Community Guidelines",
    guidelinesBlurb:
      "The guidelines describe how people are expected to treat each other here, and what happens when they don't.",
    blogTitle: "Blog",
    blogBlurb: "Notes on pets, the people who love them, and what we're building here.",
  },

  common: {
    tryAgain: "Please try again.",
  },
} as const;

/**
 * The shape every language must fill.
 *
 * `as const` above pins each English string to its own literal type, which is
 * what makes the key list exact — but it would also demand that Russian repeat
 * the English words verbatim. Widening the leaves back to `string` keeps the
 * keys strict and lets the values differ.
 */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
