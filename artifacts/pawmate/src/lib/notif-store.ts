import { useSyncExternalStore } from "react";

export type NotifType = "match" | "message" | "view" | "playdate";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  avatar: string;
  petName?: string;
  read: boolean;
  href: string;
}

const INITIAL: Notification[] = [
  {
    id: "n1",
    type: "match",
    title: "It's a mutual match!",
    body: "You and Eleanor both liked each other. Say hello!",
    time: "2 min ago",
    avatar: "/profile1.png",
    petName: "Oliver",
    read: false,
    href: "/messages",
  },
  {
    id: "n2",
    type: "message",
    title: "New message from James",
    body: "\"Hey! Buster and I would love to meet Milo sometime.\"",
    time: "18 min ago",
    avatar: "/profile2.png",
    petName: "Buster",
    read: false,
    href: "/messages",
  },
  {
    id: "n3",
    type: "match",
    title: "It's a mutual match!",
    body: "You and Maya both liked each other. Start the conversation.",
    time: "1 hour ago",
    avatar: "/profile3.png",
    petName: "Luna",
    read: false,
    href: "/messages",
  },
  {
    id: "n4",
    type: "view",
    title: "Someone viewed your profile",
    body: "A member in San Francisco checked out your profile.",
    time: "3 hours ago",
    avatar: "/profile2.png",
    read: true,
    href: "/discover",
  },
  {
    id: "n5",
    type: "message",
    title: "New message from Chloe",
    body: "\"Cleo would definitely judge your dog, but in an affectionate way.\"",
    time: "Yesterday",
    avatar: "/profile1.png",
    petName: "Cleo",
    read: true,
    href: "/messages",
  },
  {
    id: "n6",
    type: "view",
    title: "3 people viewed your profile",
    body: "Your profile is getting attention this week.",
    time: "2 days ago",
    avatar: "/pet1.png",
    read: true,
    href: "/discover",
  },
];

let state: Notification[] = [...INITIAL];
const listeners = new Set<() => void>();

function broadcast() {
  listeners.forEach(l => l());
}

export function getNotifications(): Notification[] {
  return state;
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushNotification(n: Omit<Notification, "id" | "read">): void {
  state = [{ ...n, id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`, read: false }, ...state];
  broadcast();
}

export function markNotifRead(id: string): void {
  state = state.map(n => (n.id === id ? { ...n, read: true } : n));
  broadcast();
}

export function markAllNotifsRead(): void {
  state = state.map(n => ({ ...n, read: true }));
  broadcast();
}

export function useNotifications(): Notification[] {
  return useSyncExternalStore(subscribeNotifications, getNotifications);
}
