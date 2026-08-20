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
    emailPlaceholder: "hello@example.com",
    namePlaceholder: "Sarah",
    backHome: "← Back to home",
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

  about: {
    title: "About Pawmate",
    intro:
      "Pawmate is a place to meet people through the animals you both care about — for a relationship, a friendship, or a standing walk on Sunday mornings.",

    petTitle: "Your pet is part of the introduction",
    petBody:
      "A profile here has two halves. Yours, and the animal you share your life with. Species, breed, age, the photo you actually like — all of it sits alongside your own, because for most people it is not a detail, it is the shape of the day.",
    interestTitle: "Interest is deliberate",
    interestBody:
      "You like someone from their profile or from the feed, and nothing happens until they like you back. There is no ranking to climb and no reward for opening the app more often.",
    meetTitle: "Meeting can be the point",
    meetBody:
      "Conversations can turn into a proposed playdate with a place and a time, and the community side runs real events — walks, meetups, cafés — that anyone can host and RSVP to.",
    leaveTitle: "Leaving is as easy as arriving",
    leaveBody:
      "Anyone can be blocked or reported from their profile, blocks are visible and reversible in Settings, and deleting your account removes it. Nothing is designed to be hard to undo.",

    questionsTitle: "Questions about how something works?",
    questionsBody: "The Help Center walks through profiles, matches, messages and events.",
    startExploring: "Start exploring",
  },

  help: {
    title: "Help Center",
    intro:
      "How profiles, matches, messages and events work — and what to do when something goes wrong.",
    aboutPrompt: "Curious what Pawmate is trying to be, rather than how it works?",
    aboutLink: "Read about Pawmate",

    profileTitle: "Your profile",
    setupQ: "How do I set up my profile?",
    setupA:
      "Signing up takes you through a short set of questions — the pet you have, who you want to meet, what you're looking for, and how far you're willing to go — and then into the profile form itself: name, age, city, a few lines about you, your photo, and your pet's details.",
    changeQ: "Can I change things later?",
    changeA:
      "Yes. Edit profile on your own profile page reopens the same form with everything already filled in, and saving updates your existing pet rather than adding another one.",
    petQ: "Do I have to add a pet?",
    petA:
      "No. Your profile works without one, and your pet card simply says you haven't added one yet. You can add it whenever you like.",

    findingTitle: "Finding people",
    feedQ: "How does Discover decide what to show me?",
    feedA:
      "It starts from what you said during onboarding — if you named a single kind of pet you'd like to meet, or a single thing you're looking for, the feed opens filtered that way. Change either filter at the top and your choice sticks for the rest of the visit.",
    sparkQ: "What is the Daily Spark?",
    sparkA:
      "One profile lifted out of the feed with an ice-breaker question attached, as a prompt to start somewhere rather than scroll. You can dismiss it and bring it back from the filter bar.",

    likesTitle: "Likes and matches",
    likeQ: "What happens when I like someone?",
    likeA:
      "They don't hear about it unless they like you back. When they do, it's a match: you both get a notification and can start a conversation.",
    whereQ: "Where can I see who I've liked?",
    whereA:
      "The Liked page lists every like you've sent and marks the ones that turned into matches.",
    undoQ: "Can I take a like back?",
    undoA:
      "Yes, from the Liked page. If you'd already matched, removing the like also ends the match — your conversation and any planned playdates go with it, for both of you.",

    messagesTitle: "Messages and playdates",
    whoQ: "Who can message me?",
    whoA:
      "Only people you've matched with. There is no way to send a message to someone who hasn't liked you back.",
    playdateQ: "How do playdates work?",
    playdateA:
      "Inside a conversation you can propose one with a place and a time. The other person accepts or declines, and the answer shows up in the conversation.",

    storiesTitle: "Stories and events",
    storiesQ: "What are stories?",
    storiesA:
      "Short photo posts on your profile, optionally marked as a pet moment. People who view them are recorded as having seen them.",
    organiseQ: "Can I organise something myself?",
    organiseA:
      "Yes — Community lists events by category, and anyone can create one with a place, a time and a description. Others can RSVP, save it for later, and comment.",

    safetyTitle: "Safety and your account",
    botherQ: "Someone is bothering me. What can I do?",
    botherA:
      "Every profile has block and report on it. Blocking hides you from each other; reporting sends us the reason and anything you want to add, and the person is not told. Blocks can be undone in Settings, where they're listed.",
    controlQ: "How do I control notifications and privacy?",
    controlA:
      "Settings holds both, and each toggle saves as you flip it — there's nothing to submit.",
    dataQ: "Can I get a copy of my data?",
    dataA:
      "Yes — Settings has a download that hands you a JSON file with everything we hold about you: your account, pets, preferences, and what you've done here. It leaves out messages other people wrote to you, since those are their words rather than yours.",
    deleteQ: "How do I delete my account?",
    deleteA: "At the bottom of Settings. You'll be asked to confirm, because it can't be undone.",
    passwordQ: "I've forgotten my password.",
    passwordA:
      "Choose “Forgot password?” on the sign-in page and we'll email a link to the address you signed up with. The link works for one hour, and setting a new password signs you out everywhere else.",
  },

  category: {
    meetup: "Meetup",
    cafe: "Pet café",
    adoption: "Adoption",
    training: "Training",
    trail: "Trail walk",
  },

  createEvent: {
    title: "Create Event",
    subtitle: "Organize a fun gathering for pet lovers in your community",
    imageLabel: "Event Image",
    preview: "Event preview",
    uploadHint: "Click to upload event image",
    titleLabel: "Event Title *",
    titlePlaceholder: "e.g., Dog Park Playdate",
    descLabel: "Description *",
    descPlaceholder: "Tell people about your event...",
    locationLabel: "Location *",
    locationPlaceholder: "e.g., Central Park, New York",
    categoryLabel: "Category *",
    startDate: "Start Date *",
    startTime: "Start Time *",
    endDate: "End Date *",
    endTime: "End Time *",
    maxLabel: "Max Attendees (Optional)",
    maxPlaceholder: "Leave blank for unlimited",
    tagsLabel: "Tags (Optional)",
    tagPlaceholder: "Add a tag and press Enter",
    addTag: "Add",
    submit: "Create Event",
    creating: "Creating…",
    created: "Event created successfully!",
    fieldsRequired: "Title, description, and location are required",
    datesRequired: "Start and end dates/times are required",
    endAfterStart: "End time must be after start time",
    couldNotCreate: "Could not create event",
  },

  lifestyle: {
    morningPerson: "Morning person",
    nightOwl: "Night owl",
    homebody: "Homebody",
    outdoorLover: "Outdoor lover",
    coffeeEnthusiast: "Coffee enthusiast",
    fitnessFocused: "Fitness focused",
    foodie: "Foodie",
    dogParkRegular: "Dog park regular",
    weekendHiker: "Weekend hiker",
    couchCuddler: "Couch cuddler",
    workFromHome: "Work from home",
    traveler: "Traveler",
  },

  createProfile: {
    stepAbout: "About You",
    stepPet: "Your Pet",
    stepLifestyle: "Lifestyle",

    editTitle: "Your details",
    editBody: "Change anything that's out of date.",
    newTitle: "Tell us about yourself",
    newBody: "Let's start with the basics.",

    avatarAlt: "Avatar preview",
    addPhoto: "Add Photo",
    age: "Age",
    city: "City",
    lookingFor: "I'm looking for",
    selectIntent: "Select intent",
    intentFriendship: "Friendship (Playdates)",
    intentRelationship: "Relationship",
    intentBoth: "Open to both",
    bio: "Bio",
    bioPlaceholder: "A little bit about you...",
    nextStep: "Next Step",

    petTitle: "Meet your co-pilot",
    petBody: "Tell us about your pet.",
    petPhotoAlt: "Pet photo preview",
    petPhoto: "Pet Photo",
    petName: "Pet's Name",
    species: "Species",
    selectSpecies: "Select species",
    breed: "Breed",
    petAge: "Age",
    years: "Years",
    removePetLink: "Remove {{name}} from my profile",

    lifestyleTitle: "Lifestyle & Vibe",
    lifestyleBody: "Select tags that describe your day-to-day.",
    complete: "Complete Profile",
    saveChanges: "Save changes",

    removeTitle: "Remove {{name}}?",
    removeBody:
      "Their photo and details come off your profile for good. You can add a pet again afterwards, but this one won't come back.",
    keepThem: "Keep them",
    remove: "Remove",
    petRemoved: "Pet removed",
    petRemovedBody: "{{name}} is no longer on your profile.",
    couldNotRemovePet: "Couldn't remove your pet",
    couldNotSave: "Couldn't save your profile",
  },

  profile: {
    notFound: "Profile not found",
    notFoundBody: "This member may have left Pawmate.",
    backToDiscover: "Back to Discover",

    moments: "Moments",
    edit: "Edit profile",
    like: "Like",
    likedState: "Liked",
    message: "Message",
    moreOptions: "More options for {{name}}",
    reportName: "Report {{name}}",
    blockName: "Block {{name}}",

    aboutMe: "About Me",
    lifestyle: "Lifestyle",
    yourMatch: "Your Match",

    meetPet: "Meet {{name}}",
    species: "Species",
    breed: "Breed",
    age: "Age",
    traits: "Traits",
    petYears: {
      one: "{{count}} year",
      other: "{{count}} years",
    },
    noPetOwn: "You haven't added a pet yet.",
    noPetOther: "{{name}} hasn't added a pet yet.",
    addPet: "Add your pet",
    theirPet: "their pet",

    couldNotLike: "Couldn't like this profile",
    blocked: "Blocked",
    blockedBody: "You won't see each other on Pawmate.",
    couldNotBlock: "Couldn't block this member",
    blockTitle: "Block {{name}}?",
    blockBody:
      "You'll stop seeing each other on Pawmate, and any match between you ends — along with the conversation. They aren't told they were blocked. You can undo this in Settings.",
    blockConfirm: "Block",

    reportTitle: "Report {{name}}",
    reportBody: "Tell us what's wrong. Reports are private — {{name}} won't know who filed one.",
    reportPlaceholder: "Anything else we should know? (optional)",
    sendReport: "Send report",
    reportSent: "Report sent",
    reportSentBody: "Thanks — we'll take a look.",
    couldNotReport: "Couldn't send the report",

    reasonHarassment: "Harassment or abuse",
    reasonSpam: "Spam or scam",
    reasonFake: "Fake profile",
    reasonInappropriate: "Inappropriate content",
    reasonAnimalWelfare: "Animal welfare concern",
    reasonOther: "Something else",
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your account and preferences",

    secProfile: "Profile",
    secNotifications: "Notifications",
    secPrivacy: "Privacy",
    secPreferences: "Preferences",
    secBlocked: "Blocked",
    secData: "Your Data",
    secDanger: "Danger Zone",

    yourProfile: "Your Profile",
    yourProfileBody: "Edit photos, bio, and lifestyle tags",
    petProfile: "Pet Profile",
    petProfileBody: "Update your pet's details and photos",

    newMatches: "New matches",
    newMatchesBody: "When someone likes you back",
    messages: "Messages",
    messagesBody: "When you receive a new message",
    profileViews: "Profile views",
    profileViewsBody: "When someone visits your profile",
    emailNotifs: "Email notifications",
    emailNotifsBody: "Weekly digest and match summaries",
    pushNotifs: "Push notifications",
    pushNotifsBody: "Real-time alerts on your device",

    showDistance: "Show distance",
    showDistanceBody: "Let others see how far away you are",
    lastActive: "Show last active",
    lastActiveBody: "Display when you were last online",
    showAge: "Show age on profile",
    incognito: "Incognito mode",
    incognitoBody: "Browse profiles without being seen",
    readReceipts: "Read receipts",
    readReceiptsBody: "Let matches know when you've read their messages",

    darkMode: "Dark mode",
    darkModeBody: "Easy on the eyes at night",
    locationServices: "Location services",
    locationServicesBody: "Used to show nearby members",
    language: "Language",
    discovery: "Discovery preferences",
    discoveryBody: "Age range, distance, pet type",

    blockedOn: "Blocked {{date}}",
    unblock: "Unblock",
    unblocked: "Unblocked",
    unblockedBody: "{{name}} can see you again.",
    couldNotUnblock: "Couldn't unblock",

    downloadData: "Download my data",
    preparingFile: "Preparing your file…",
    downloadDataBody: "Everything Pawmate holds about you, as a JSON file",
    downloaded: "Downloaded",
    downloadedBody: "Your data is in your downloads folder.",
    couldNotExport: "Couldn't prepare your data",

    signOut: "Sign out",
    deleteAccount: "Delete account",
    deleteAccountBody: "Permanently remove your profile and all data",
    version: "Pawmate v1.0 · Made with care for pet lovers",

    deleteTitle: "Delete your account?",
    deleteBody:
      "This removes your profile, pets, matches, messages, and everything you've posted. It cannot be undone.",
    keepAccount: "Keep my account",
    deleteConfirm: "Delete permanently",
    couldNotDelete: "Couldn't delete your account",
    couldNotSave: "Couldn't save that setting",
  },

  categoryFilter: {
    all: "All Events",
    meetup: "Meetups",
    cafe: "Pet Cafés",
    adoption: "Adoption",
    training: "Training",
    trail: "Trail Walks",
  },

  community: {
    title: "Community",
    subtitle: "Local events for pet lovers near you",
    searchPlaceholder: "Search events, locations, or tags…",
    eventsNear: {
      one: "{{count}} event near you",
      other: "{{count}} events near you",
    },
    noEvents: "No events found",
    noEventsBody: "Try a different category or search term",
    clearFilters: "Clear filters",

    featured: "Featured",
    organizedBy: "Organized by",
    attending: "{{count}} / {{max}} attending",
    almostFull: "Almost full!",
    going: "✓ Going",
    rsvp: "RSVP",

    noComments: "No comments yet — be the first!",
    commentPlaceholder: "Add a comment…",
    you: "You",

    yourRsvps: "Your RSVPs",
    noRsvps: "RSVP to events to see them here.",
    savedEvents: "Saved Events",
    noSaved: "Bookmark events to save them here.",
    hostTitle: "Host an event",
    hostBody: "Organize a meetup, walk, or gathering for the Pawmate community.",
    suggestEvent: "Suggest an event",

    errorLoading: "Error loading events",
    couldNotRsvp: "Couldn't update your RSVP",
    couldNotSave: "Couldn't update the bookmark",
    couldNotComment: "Couldn't add the comment",
    couldNotLike: "Couldn't update the like",
  },

  messages: {
    title: "Messages",
    searchPlaceholder: "Search messages...",
    active: "Active",
    loading: "Loading…",
    selectConversation: "Select a conversation",
    noMatches: "No matches yet",
    noMatchesBody: "Head to Discover to find someone to talk to.",
    browseProfiles: "Browse Profiles",
    sayHelloPreview: "Say hello 👋",
    withPet: "with {{name}}",
    tabChat: "Chat",
    tabPlaydate: "Playdate",
    loadingMessages: "Loading messages…",
    sayHelloTo: "Say hello to {{name}} 👋",
    typeMessage: "Type a message...",
    you: "You",
    today: "Today",
    yesterday: "Yesterday",
    notSent: "Message not sent",
    couldNotInvite: "Couldn't send that invite",
    couldNotUpdatePlaydate: "Couldn't update that playdate",
  },

  playdate: {
    statusProposed: "Awaiting response",
    statusAccepted: "Accepted ✓",
    statusDeclined: "Declined",

    upcoming: "Upcoming Playdates",
    accept: "Accept",
    decline: "Decline",
    propose: "Propose a playdate",
    proposeWith: "Propose a playdate with {{name}}",

    inviteSent: "Playdate invite sent to {{name}}! 🐾",
    planTitle: "Plan a pet playdate",
    planBody: "Pick a spot, choose a time, and send {{name}} a playdate invite — all in a few taps.",
    schedule: "Schedule a playdate",

    step1: "Step 1 of 3",
    step2: "Step 2 of 3",
    step3: "Step 3 of 3",
    chooseLocation: "Choose a location",
    pickDateTime: "Pick a date & time",
    reviewSend: "Review & send",
    nextPickTime: "Next: Pick a time",
    reviewInvite: "Review invite",

    placeLabel: "Place",
    placePlaceholder: "e.g. a park or a café nearby…",
    dateLabel: "Date",
    timeLabel: "Time",
    locationLabel: "Location",
    dateTimeLabel: "Date & time",
    inviteLabel: "Playdate invite",
    youAnd: "You + {{name}}",
    sendInvite: "Send invite",
    sending: "Sending…",
    sendRequestTo: "Send playdate request to {{name}}",

    requestTitle: "Playdate Request",
    withName: "with {{name}}",

    locPark: "Dog Park",
    locCafe: "Pet Café",
    locBeach: "Pet Beach",
    locTrail: "Nature Trail",
    locPlaza: "City Plaza",
  },

  landing: {
    heroAlt: "Two couples walking a sunlit promenade with a golden retriever and a cat",
    communityAlt: "A border collie running along a sunlit woodland path",
    oliviaAlt: "Olivia's golden retriever running through a sunlit meadow",
    davidAlt: "David's ginger cat lying in a patch of sunlight",
    sophieAlt: "Sophie's border collie running along a woodland path",
    jamesAlt: "James's Siamese cat sitting in the light",
    voice1: "I found not only a great companion, but my dog found a new best friend too!",
    voice1Who: "Sarah & Max",
    voice2: "PawMate brought us together. We fit in perfectly!",
    voice2Who: "Laura & Charlie",
    voice3: "Finally a place where pets come first. That makes all the difference.",
    voice3Who: "Mark & Bella",
    roleTeacher: "Teacher",
    roleArchitect: "Architect",
    roleMarketing: "Marketing Manager",
    roleEntrepreneur: "Entrepreneur",
    nameOlivia: "Olivia",
    nameDavid: "David",
    nameSophie: "Sophie",
    nameJames: "James",
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
    refreshProfiles: "Refresh Profiles",
    youLiked: "You liked {{name}} — fingers crossed for a mutual match! 🐾",
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
    mutualBadge: "Mutual match",
    likedAgo: "Liked {{when}}",
    confirmTitle: "Remove your like for {{name}}?",
    confirmTitleGeneric: "Remove your like?",
    notMutual: "They'll no longer appear in your liked profiles. You can like them again from Discover.",
    profilesLiked: {
      one: "{{count}} profile liked",
      other: "{{count}} profiles liked",
    },
    mutualMatches: {
      one: "{{count}} mutual match",
      other: "{{count}} mutual matches",
    },
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
    shareTitle: "Share a Story",
    shareSubtitle: "Capture and share a moment from your pet's day",
    imageLabel: "Story Image *",
    uploadHint: "Click to upload story image",
    captionLabel: "Caption (Optional)",
    petLabel: "Featured Pet (Optional)",
    previous: "Previous story",
    next: "Next story",
    petMomentBadge: "Pet moment",
  },

  match: {
    bothLiked: "You & {{name}} liked each other",
    greatTaste: "You both have great taste. Say hello and see where it goes 🐾",
    sendMessage: "Send {{name}} a message",
    keepDiscovering: "Keep discovering",
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
    basis: "Score based on pet type, lifestyle, and what you're both looking for",
  },

  notifications: {
    title: "Notifications",
    unread: "{{count}} unread",
    markAllRead: "Mark all read",
    allCaughtUp: "All caught up",
    nothingNew: "No new notifications right now.",
    couldNotMark: "Couldn't mark that as read",
    couldNotMarkAll: "Couldn't mark everything as read",
    discoverMore: "Discover more people →",
  },

  common: {
    tryAgain: "Please try again.",
    cancel: "Cancel",
    success: "Success",

  },
} as const;

/**
 * A count-dependent string, as its Intl plural categories.
 *
 * `other` is required because every language has it — it is what the lookup
 * falls back to. The rest are optional precisely so the languages can differ:
 * English fills `one` and `other`, Russian fills `one`, `few` and `many`.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/**
 * Whether a node is a set of plural forms rather than a group of keys.
 *
 * The test is that *every* key is a plural category — `{ one, other }` passes,
 * `{ title, subtitle }` does not. Without it a plural node would be widened
 * key-by-key and Russian could not add the `few` and `many` English lacks.
 */
type IsPlural<T> = [keyof T] extends [Intl.LDMLPluralRule] ? true : false;

/**
 * The shape every language must fill.
 *
 * `as const` above pins each English string to its own literal type, which is
 * what makes the key list exact — but it would also demand that Russian repeat
 * the English words verbatim. Widening the leaves back to `string` keeps the
 * keys strict and lets the values differ.
 */
type Widen<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : IsPlural<T[K]> extends true
      ? PluralForms
      : Widen<T[K]>;
};

export type Dictionary = Widen<typeof en>;
