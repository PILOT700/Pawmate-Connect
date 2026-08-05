import { pgEnum } from "drizzle-orm/pg-core";

export const speciesEnum = pgEnum("species", [
  "dog",
  "cat",
  "rabbit",
  "bird",
  "fish",
  "other",
]);

export const lookingForEnum = pgEnum("looking_for", [
  "friendship",
  "relationship",
  "playdates",
  "casual",
  "open",
]);

export const playdateStatusEnum = pgEnum("playdate_status", [
  "proposed",
  "accepted",
  "declined",
]);

export const eventCategoryEnum = pgEnum("event_category", [
  "meetup",
  "cafe",
  "adoption",
  "training",
  "trail",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "match",
  "message",
  "view",
  "playdate",
]);

export const messageKindEnum = pgEnum("message_kind", ["text", "playdate"]);

export type Species = (typeof speciesEnum.enumValues)[number];
export type LookingFor = (typeof lookingForEnum.enumValues)[number];
export type PlaydateStatus = (typeof playdateStatusEnum.enumValues)[number];
export type EventCategory = (typeof eventCategoryEnum.enumValues)[number];
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
export type MessageKind = (typeof messageKindEnum.enumValues)[number];
