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

  species: {
    dog: "Dog",
    cat: "Cat",
    rabbit: "Rabbit",
    bird: "Bird",
    fish: "Fish",
    other: "Other",
  },

  intent: {
    relationship: "Meaningful relationship",
    relationshipBody: "Looking for love with a fellow pet lover",
    friendship: "Friendship",
    friendshipBody: "Companionship and shared experiences",
    playdates: "Pet playdates",
    playdatesBody: "Fun outings for our furry friends",
    casual: "Casual meetups",
    casualBody: "Coffee, walks, and good conversation",
    open: "Open to anything",
    openBody: "Let's see where things go",
  },

  onboarding: {
    yourPet: "What's your pet?",
    yourPetHint: "Select all that apply — choose as many as you like",
    whoToMeet: "Who do you want to meet?",
    whoToMeetHint: "We'll start your feed with these pet people",
    lookingFor: "What are you looking for?",
    lookingForHint: "You can select more than one",
    preferences: "Set your preferences",
    preferencesHint: "Help us find the best matches for you",
    maxDistance: "Maximum distance",
    ageRange: "Age range",
    from: "From",
    to: "To",
    years: "yrs",
    yourSetup: "Your setup",
    yours: "Yours",
    meeting: "Meeting",
    back: "Back",
    continue: "Continue",
    finish: "Find my matches",
    saving: "Saving…",
    couldNotSave: "Couldn't save your preferences",
    underAMinute: "Takes less than a minute",
  },

  discover: {
    filterSpecies: "Species",
    allPets: "All Pets",
    dogs: "Dogs",
    cats: "Cats",
    rabbits: "Rabbits",
    birds: "Birds",
    fishes: "Fish",
    otherPets: "Other",
    filterDistance: "Distance",
    anyDistance: "Any distance",
    within: "Within {{km}} km",
    filterIntent: "Looking for",
    everyone: "Everyone",
    ages: "Ages {{min}}–{{max}}",
    agesHint: "Set during onboarding — change it in Settings",
    dailySpark: "Daily Spark",
    refreshesDaily: "· Refreshes daily",
    iceBreaker: "Ice-breaker",
    likeName: "Like {{name}}",
    sendMessage: "Send a message",
    showSpark: "Show Daily Spark",
    discoverMore: "Discover more",
    openToConnecting: "Open to connecting",
    match: "{{percent}}% match",
    allCaughtUp: "You're all caught up!",
    checkBack: "Check back later for more potential matches.",
    couldNotLoad: "Couldn't load profiles right now.",
    retry: "Try again",
    couldNotLike: "Couldn't like that profile",
    couldNotSkip: "Couldn't skip that profile",
    prompt1: "If your pet could plan your perfect first date, what would it look like?",
    prompt2: "What's one thing your pet would want a date to know about you?",
    prompt3: "Coffee walk or brunch — what would your pet pick?",
  },

  liked: {
    title: "Liked profiles",
    subtitle: "Everyone you've liked, and who liked you back.",
    tabAll: "All",
    tabMutual: "Matched",
    noneYet: "No liked profiles yet",
    noneMutual: "No mutual matches yet",
    goDiscover: "Head to Discover to start connecting with people who share your love of animals.",
    browse: "Browse Profiles",
    sendMessage: "Send a message",
    sayHello: "Say hello",
    unlike: "Unlike",
    unmatch: "Unmatch",
    removeLike: "Remove like",
    keepIt: "Keep it",
    couldNotRemove: "Couldn't remove the like",
    endsMatch:
      "You're matched, so this also ends the match — your conversation and any planned playdates will be deleted for both of you.",
  },

  story: {
    newStory: "New story",
    caption: "Add a caption to your story...",
    selectPet: "Select a pet",
    petMoment: "This is a pet moment",
    preview: "Story preview",
    post: "Post Story",
    posting: "Posting…",
    uploading: "Uploading…",
    posted: "Story posted",
    pickImage: "Please select an image",
    imagesOnly: "Please select an image file",
    couldNotCreate: "Could not create story",
    previous: "Previous story",
    next: "Next story",
  },

  compat: {
    heading: "Pet Compatibility",
    petCompat: "Pet compatibility",
    lifestyle: "Lifestyle match",
    seeking: "What you seek",
    perfect: "Paw-fect match!",
    great: "Great companions",
    worth: "Worth exploring",
    different: "Different worlds",
  },

  notifications: {
    title: "Notifications",
    unread: "{{count}} unread",
    markAllRead: "Mark all read",
    allCaughtUp: "All caught up",
    nothingNew: "No new notifications right now.",
    couldNotMark: "Couldn't mark that as read",
    couldNotMarkAll: "Couldn't mark everything as read",
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
