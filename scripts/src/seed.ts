/**
 * Seeds the database with the cast of characters the frontend used to hardcode,
 * reusing the same images from artifacts/pawmate/public so the screens look the
 * same once they're wired to real data.
 *
 * Idempotent: wipes the seeded tables and re-inserts. Run with:
 *   DATABASE_URL=... pnpm --filter @workspace/scripts run seed
 */
import bcrypt from "bcryptjs";
import {
  db,
  pool,
  usersTable,
  petsTable,
  userPreferencesTable,
  userSettingsTable,
  likesTable,
  matchesTable,
  messagesTable,
  communityEventsTable,
  eventCommentsTable,
  eventRsvpsTable,
  storiesTable,
  sessionsTable,
  type Species,
  type LookingFor,
} from "@workspace/db";

const DEMO_EMAIL = "demo@pawmate.app";
const SHARED_PASSWORD = "demo1234";

interface SeedPerson {
  email: string;
  firstName: string;
  age: number;
  city: string;
  bio: string;
  avatarUrl: string;
  lookingFor: LookingFor[];
  lifestyleTags: string[];
  pet: {
    name: string;
    species: Species;
    breed: string;
    ageYears: number;
    photoUrl: string;
    traits: string[];
  };
  stories?: { imageUrl: string; caption: string; isPetMoment?: boolean }[];
}

const PEOPLE: SeedPerson[] = [
  {
    email: "eleanor@pawmate.app",
    firstName: "Eleanor",
    age: 31,
    city: "San Francisco",
    bio: "Slow mornings, strong coffee, and finding the sunniest spot in the apartment. Looking for someone to share quiet Sundays with. I work as an illustrator and mostly just draw pictures of other people's pets.",
    avatarUrl: "/profile1.png",
    lookingFor: ["friendship"],
    lifestyleTags: ["Morning person", "Homebody", "Coffee enthusiast", "Creative"],
    pet: {
      name: "Oliver",
      species: "cat",
      breed: "Orange Tabby",
      ageYears: 4,
      photoUrl: "/pet2.png",
      traits: ["Cuddly", "Vocal", "Treat-motivated"],
    },
    stories: [
      { imageUrl: "/profile1.png", caption: "Sunday sketchbook session ☕" },
      { imageUrl: "/pet2.png", caption: "Oliver approves of this spot.", isPetMoment: true },
      { imageUrl: "/pet-card-1.png", caption: "Golden hour in Dolores Park 🌿" },
      { imageUrl: "/pet-card-2.png", caption: "He insisted on being in the photo.", isPetMoment: true },
    ],
  },
  {
    email: "james@pawmate.app",
    firstName: "James",
    age: 34,
    city: "Seattle",
    bio: "Architect by day, amateur chef by night. Buster comes everywhere with me. Hoping to find a hiking partner who doesn't mind a dog setting the pace.",
    avatarUrl: "/profile2.png",
    lookingFor: ["relationship"],
    lifestyleTags: ["Outdoorsy", "Foodie", "Early riser", "Active"],
    pet: {
      name: "Buster",
      species: "dog",
      breed: "French Bulldog",
      ageYears: 3,
      photoUrl: "/pet1.png",
      traits: ["Playful", "Stubborn", "Loyal"],
    },
    stories: [
      { imageUrl: "/profile2.png", caption: "Morning trail run with Buster 🌄" },
      { imageUrl: "/pet1.png", caption: "He stops for snacks, not for miles.", isPetMoment: true },
      { imageUrl: "/pet-card-3.png", caption: "Post-hike nap. Hard earned." },
    ],
  },
  {
    email: "maya@pawmate.app",
    firstName: "Maya",
    age: 28,
    city: "Portland",
    bio: "Always looking for the next adventure. Luna is the goodest girl and loves the beach. Hoping to find someone who's up for spontaneous road trips.",
    avatarUrl: "/profile3.png",
    lookingFor: ["open"],
    lifestyleTags: ["Outdoorsy", "Adventurous", "Morning person", "Dog lover"],
    pet: {
      name: "Luna",
      species: "dog",
      breed: "Golden Retriever",
      ageYears: 2,
      photoUrl: "/pet1.png",
      traits: ["Energetic", "Friendly", "Loves water"],
    },
    stories: [
      { imageUrl: "/profile3.png", caption: "Just us and the coast 🌊" },
      { imageUrl: "/pet1.png", caption: "Luna found the waves first.", isPetMoment: true },
      { imageUrl: "/pet-card-2.png", caption: "She makes friends everywhere she goes 🐾", isPetMoment: true },
    ],
  },
  {
    email: "david@pawmate.app",
    firstName: "David",
    age: 36,
    city: "Austin",
    bio: "Tech worker who unplugs by running trails. Milo keeps my pace honest. Looking for a low-key connection with someone who values quality time over quantity.",
    avatarUrl: "/profile2.png",
    lookingFor: ["casual"],
    lifestyleTags: ["Active", "Minimalist", "Coffee enthusiast", "Introvert"],
    pet: {
      name: "Milo",
      species: "dog",
      breed: "Mixed",
      ageYears: 5,
      photoUrl: "/pet1.png",
      traits: ["Calm", "Loyal", "Trail-tested"],
    },
    stories: [
      { imageUrl: "/profile2.png", caption: "5am trail, no regrets ☀️" },
      { imageUrl: "/pet1.png", caption: "Milo hits his stride around mile 3.", isPetMoment: true },
    ],
  },
  {
    email: "chloe@pawmate.app",
    firstName: "Chloe",
    age: 29,
    city: "Denver",
    bio: "Bookstore regular. Cleo thinks she runs the place. I just pay the rent. Seeking someone who gets that cats have strong opinions and that's a feature, not a bug.",
    avatarUrl: "/profile1.png",
    lookingFor: ["friendship"],
    lifestyleTags: ["Homebody", "Creative", "Bookworm", "Coffee enthusiast"],
    pet: {
      name: "Cleo",
      species: "cat",
      breed: "Siamese",
      ageYears: 3,
      photoUrl: "/pet2.png",
      traits: ["Opinionated", "Elegant", "Cuddly on her terms"],
    },
    stories: [
      { imageUrl: "/profile1.png", caption: "Found my corner 📖" },
      { imageUrl: "/pet2.png", caption: "Cleo has claimed this chair. I sit on the floor.", isPetMoment: true },
    ],
  },
  {
    email: "marcus@pawmate.app",
    firstName: "Marcus",
    age: 33,
    city: "Chicago",
    bio: "Just looking for someone who loves dogs as much as I do. Rex and I do the lakefront trail every morning. Weekends are for farmers markets and naps.",
    avatarUrl: "/profile3.png",
    lookingFor: ["relationship"],
    lifestyleTags: ["Outdoorsy", "Morning person", "Foodie", "Homebody"],
    pet: {
      name: "Rex",
      species: "dog",
      breed: "Labrador",
      ageYears: 4,
      photoUrl: "/pet1.png",
      traits: ["Gentle", "Obedient", "Always hungry"],
    },
    stories: [
      { imageUrl: "/profile3.png", caption: "Lakefront at sunrise 🌅" },
      { imageUrl: "/pet1.png", caption: "Rex leading the way as always.", isPetMoment: true },
    ],
  },
  {
    email: "sophia@pawmate.app",
    firstName: "Sophia",
    age: 32,
    city: "New York",
    bio: "Yoga teacher, terrible cook, great at finding the best brunch spots in the city. Noodle and I have a morning ritual — she gets the sunny patch on the rug, I get the coffee.",
    avatarUrl: "/profile1.png",
    lookingFor: ["friendship", "relationship"],
    lifestyleTags: ["Morning person", "Foodie", "Creative", "Outdoorsy"],
    pet: {
      name: "Noodle",
      species: "cat",
      breed: "Scottish Fold",
      ageYears: 2,
      photoUrl: "/pet2.png",
      traits: ["Sun-seeker", "Quiet", "Judgemental"],
    },
  },
  {
    email: "clara@pawmate.app",
    firstName: "Clara",
    age: 31,
    city: "Portland",
    bio: "Weekends belong to Biscuit and whichever trail we haven't tried yet.",
    avatarUrl: "/profile3.png",
    lookingFor: ["friendship", "playdates"],
    lifestyleTags: ["Outdoor lover", "Dog park regular"],
    pet: {
      name: "Biscuit",
      species: "dog",
      breed: "Golden Retriever",
      ageYears: 3,
      photoUrl: "/pet-card-1.png",
      traits: ["Sunny", "Sociable"],
    },
  },
  {
    email: "nadia@pawmate.app",
    firstName: "Nadia",
    age: 29,
    city: "Denver",
    bio: "Up before the sun, usually halfway up a trail with Scout by the time the coffee kicks in.",
    avatarUrl: "/profile3.png",
    lookingFor: ["playdates", "friendship"],
    lifestyleTags: ["Morning person", "Trail runner"],
    pet: {
      name: "Scout",
      species: "dog",
      breed: "Border Collie",
      ageYears: 4,
      photoUrl: "/pet-card-3.png",
      traits: ["Tireless", "Clever"],
    },
  },
];

interface SeedEvent {
  organizerEmail: string;
  category: "meetup" | "cafe" | "adoption" | "training" | "trail";
  title: string;
  description: string;
  location: string;
  startAt: Date;
  endAt: Date;
  maxAttendees: number;
  tags: string[];
  featured?: boolean;
  imageUrl?: string;
  comments?: { authorEmail: string; text: string }[];
}

// Dates are relative to "now" so the community feed never goes stale.
function daysFromNow(days: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const EVENTS: SeedEvent[] = [
  {
    organizerEmail: "maya@pawmate.app",
    category: "meetup",
    title: "Sunday Morning Dog Social",
    description:
      "Bring your pup for an off-leash romp and great coffee. All sizes and breeds welcome — we just ask that dogs are friendly and up to date on vaccines. There's a shaded area for humans and a water station for dogs.",
    location: "Dolores Park, San Francisco",
    startAt: daysFromNow(4, 9),
    endAt: daysFromNow(4, 11),
    maxAttendees: 40,
    tags: ["Dogs", "Off-leash", "Social", "All breeds"],
    featured: true,
    imageUrl: "/hero-couples.png",
    comments: [
      { authorEmail: "eleanor@pawmate.app", text: "Going with Oliver in his backpack! 🐱" },
      { authorEmail: "james@pawmate.app", text: "Buster is SO ready for this. See you there!" },
    ],
  },
  {
    organizerEmail: "chloe@pawmate.app",
    category: "adoption",
    title: "Summer Adoption Fair",
    description:
      "Meet dozens of lovable cats and dogs looking for their forever homes. Volunteers on-site to guide you through the process. Free admission, donations welcome.",
    location: "Ferry Building, SF",
    startAt: daysFromNow(3, 11),
    endAt: daysFromNow(3, 16),
    maxAttendees: 200,
    tags: ["Cats", "Dogs", "Adoption", "Family friendly"],
    comments: [
      {
        authorEmail: "chloe@pawmate.app",
        text: "I volunteer here every month — it's such a heartwarming event. Come early!",
      },
    ],
  },
  {
    organizerEmail: "marcus@pawmate.app",
    category: "cafe",
    title: "Paws & Lattes Café Crawl",
    description:
      "We're hitting three pet-friendly cafés in the Mission. Bring your furry co-pilot and enjoy good brews, good company, and plenty of photo ops. Route shared in the group chat.",
    location: "Mission District, SF",
    startAt: daysFromNow(10, 10),
    endAt: daysFromNow(10, 13),
    maxAttendees: 25,
    tags: ["Coffee", "Dogs", "Cats", "Social"],
  },
  {
    organizerEmail: "james@pawmate.app",
    category: "training",
    title: "Positive Reinforcement Workshop",
    description:
      "A hands-on 2-hour workshop covering loose-leash walking, recall, and calm greetings. Suitable for puppies and adult dogs. Bring high-value treats and your curious pup!",
    location: "Presidio Community Center",
    startAt: daysFromNow(7, 18),
    endAt: daysFromNow(7, 20),
    maxAttendees: 15,
    tags: ["Training", "Puppies", "Adults", "Positive reinforcement"],
    comments: [
      { authorEmail: "david@pawmate.app", text: "Milo desperately needs this 😅 just registered!" },
    ],
  },
  {
    organizerEmail: "eleanor@pawmate.app",
    category: "trail",
    title: "Marin Headlands Sunrise Hike",
    description:
      "A moderate 5-mile loop with stunning bay views at golden hour. Dogs must be leashed on the trail. We'll stop at a viewpoint for a group photo. Carpooling available from the city.",
    location: "Marin Headlands, CA",
    startAt: daysFromNow(11, 7),
    endAt: daysFromNow(11, 10, 30),
    maxAttendees: 20,
    tags: ["Hiking", "Dogs", "Nature", "Sunrise"],
  },
  {
    organizerEmail: "chloe@pawmate.app",
    category: "meetup",
    title: "Cat Lovers' Picnic",
    description:
      "For indoor cat people who want to meet other cat lovers outdoors! Share tips on enrichment, travel carriers, and harness training. A judgement-free zone for cat obsessives.",
    location: "Golden Gate Park",
    startAt: daysFromNow(17, 13),
    endAt: daysFromNow(17, 15, 30),
    maxAttendees: 30,
    tags: ["Cats", "Picnic", "Social", "Tips"],
    comments: [
      { authorEmail: "maya@pawmate.app", text: "Finally an event for cat parents! Luna is jealous 😆" },
    ],
  },
];

async function main(): Promise<void> {
  console.log("Seeding Pawmate…");

  // Everything else cascades from users; sessions are cleared so stale cookies
  // from a previous seed don't resolve to a deleted user.
  await db.delete(sessionsTable);
  await db.delete(communityEventsTable);
  await db.delete(usersTable);

  const passwordHash = await bcrypt.hash(SHARED_PASSWORD, 10);
  const idByEmail = new Map<string, string>();

  const [demo] = await db
    .insert(usersTable)
    .values({
      email: DEMO_EMAIL,
      passwordHash,
      firstName: "Alex",
      age: 30,
      city: "San Francisco",
      bio: "Just joined Pawmate. Here for long walks and good company.",
      avatarUrl: "/profile2.png",
      lookingFor: ["friendship", "relationship"],
      lifestyleTags: ["Morning person", "Outdoor lover", "Coffee enthusiast"],
      onboardingCompletedAt: new Date(),
    })
    .returning();

  if (!demo) throw new Error("Failed to create demo user");

  idByEmail.set(DEMO_EMAIL, demo.id);
  await db.insert(userPreferencesTable).values({ userId: demo.id });
  await db.insert(userSettingsTable).values({ userId: demo.id });
  await db.insert(petsTable).values({
    userId: demo.id,
    name: "Pepper",
    species: "dog",
    breed: "Beagle",
    ageYears: 3,
    photoUrl: "/pet1.png",
    traits: ["Curious", "Food-motivated"],
  });

  for (const person of PEOPLE) {
    const [user] = await db
      .insert(usersTable)
      .values({
        email: person.email,
        passwordHash,
        firstName: person.firstName,
        age: person.age,
        city: person.city,
        bio: person.bio,
        avatarUrl: person.avatarUrl,
        lookingFor: person.lookingFor,
        lifestyleTags: person.lifestyleTags,
        isOnline: Math.random() < 0.4,
        lastActiveAt: new Date(),
        onboardingCompletedAt: new Date(),
      })
      .returning();

    if (!user) throw new Error(`Failed to create ${person.email}`);

    idByEmail.set(person.email, user.id);

    await db.insert(userPreferencesTable).values({ userId: user.id });
    await db.insert(userSettingsTable).values({ userId: user.id });
    await db.insert(petsTable).values({ userId: user.id, ...person.pet });

    if (person.stories?.length) {
      await db.insert(storiesTable).values(
        person.stories.map((story) => ({
          userId: user.id,
          imageUrl: story.imageUrl,
          caption: story.caption,
          isPetMoment: story.isPetMoment ?? false,
        })),
      );
    }
  }

  // Eleanor and James already like the demo user, so a like back becomes an
  // instant match with a conversation ready to open.
  const admirers = ["eleanor@pawmate.app", "james@pawmate.app"];

  for (const email of admirers) {
    await db.insert(likesTable).values({ likerId: idByEmail.get(email)!, likedUserId: demo.id });
  }

  // Maya is already a mutual match, with messages waiting.
  const mayaId = idByEmail.get("maya@pawmate.app")!;
  await db.insert(likesTable).values({ likerId: mayaId, likedUserId: demo.id });
  await db.insert(likesTable).values({ likerId: demo.id, likedUserId: mayaId });

  const [userOneId, userTwoId] = demo.id < mayaId ? [demo.id, mayaId] : [mayaId, demo.id];
  const [match] = await db.insert(matchesTable).values({ userOneId, userTwoId }).returning();

  if (!match) throw new Error("Failed to create seed match");

  await db.insert(messagesTable).values([
    {
      matchId: match.id,
      senderId: mayaId,
      kind: "text",
      text: "Hi! Luna spotted Pepper at the park last weekend — small world!",
    },
    {
      matchId: match.id,
      senderId: mayaId,
      kind: "text",
      text: "Are you two up for a beach walk this weekend?",
    },
  ]);

  for (const event of EVENTS) {
    const [created] = await db
      .insert(communityEventsTable)
      .values({
        organizerId: idByEmail.get(event.organizerEmail)!,
        category: event.category,
        title: event.title,
        description: event.description,
        location: event.location,
        startAt: event.startAt,
        endAt: event.endAt,
        maxAttendees: event.maxAttendees,
        tags: event.tags,
        featured: event.featured ?? false,
        imageUrl: event.imageUrl,
      })
      .returning();

    if (!created) throw new Error(`Failed to create event ${event.title}`);

    if (event.comments?.length) {
      await db.insert(eventCommentsTable).values(
        event.comments.map((comment) => ({
          eventId: created.id,
          authorId: idByEmail.get(comment.authorEmail)!,
          text: comment.text,
        })),
      );
    }

    // A handful of attendees so the counts aren't all zero.
    const attendees = [...idByEmail.values()].filter(() => Math.random() < 0.5);

    if (attendees.length) {
      await db
        .insert(eventRsvpsTable)
        .values(attendees.map((userId) => ({ eventId: created.id, userId })))
        .onConflictDoNothing();
    }
  }

  console.log(`Seeded ${PEOPLE.length + 1} users, ${EVENTS.length} events.`);
  console.log(`Log in as ${DEMO_EMAIL} / ${SHARED_PASSWORD} (all seeded users share this password).`);
}

main()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });
