import { describe, expect, it } from "vitest";
import { notificationText } from "./notification-text";

/**
 * The server stores the English it rendered plus the values behind it, and the
 * reader's own client composes the sentence. Three of these rules are easy to
 * break by accident, and each would be invisible until a member noticed.
 */

/** Stands in for `t`: echoes the key and its values so assertions stay readable. */
const t = ((key: string, vars?: Record<string, string | number>) =>
  vars
    ? `${key}(${Object.entries(vars)
        .map(([k, v]) => `${k}=${v}`)
        .join(",")})`
    : key) as never;

describe("what a notification says", () => {
  it("composes a match from its values", () => {
    expect(
      notificationText(
        {
          type: "match",
          title: "New match",
          body: "You and Марина liked each other.",
          params: { name: "Марина" },
        },
        t,
      ),
    ).toEqual({
      title: "notifications.matchTitle",
      body: "notifications.matchBody(name=Марина)",
    });
  });

  it("never translates a message body — those are the sender's own words", () => {
    const { title, body } = notificationText(
      {
        type: "message",
        title: "New message from Марина",
        body: "Привет! Как дела?",
        params: { name: "Марина" },
      },
      t,
    );

    expect(title).toBe("notifications.messageTitle(name=Марина)");
    expect(body).toBe("Привет! Как дела?");
  });

  it("translates a place we suggested, and leaves a typed one alone", () => {
    expect(
      notificationText(
        {
          type: "playdate",
          title: "Playdate invite",
          body: "x",
          params: { name: "Марина", place: "Dog Park" },
        },
        t,
      ).body,
    ).toBe("notifications.playdateBody(name=Марина,place=playdate.locPark)");

    expect(
      notificationText(
        {
          type: "playdate",
          title: "Playdate invite",
          body: "x",
          params: { name: "Марина", place: "У фонтана" },
        },
        t,
      ).body,
    ).toBe("notifications.playdateBody(name=Марина,place=У фонтана)");
  });

  it("falls back to the stored text for rows written before params existed", () => {
    // Every notification in the database today is one of these. Losing this
    // branch would blank them rather than degrade them.
    for (const params of [null, undefined]) {
      expect(
        notificationText(
          { type: "match", title: "New match", body: "You and Olivia liked each other.", params },
          t,
        ),
      ).toEqual({ title: "New match", body: "You and Olivia liked each other." });
    }
  });

  it("falls back for a type it does not know", () => {
    expect(
      notificationText(
        { type: "view", title: "Profile view", body: "Someone looked.", params: { name: "X" } },
        t,
      ),
    ).toEqual({ title: "Profile view", body: "Someone looked." });
  });
});
