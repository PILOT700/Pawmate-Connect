import { describe, expect, it } from "vitest";
import { apiErrorMessage } from "./api-error";

describe("the message shown when a request fails", () => {
  it("prefers what the server said", () => {
    const error = Object.assign(new Error("HTTP 409 Conflict: Email already registered"), {
      data: { message: "Email already registered" },
    });

    expect(apiErrorMessage(error, "Please try again.")).toBe("Email already registered");
  });

  it("never leaks the status prefix the fetch wrapper adds", () => {
    const error = Object.assign(new Error("HTTP 401 Unauthorized: Wrong password"), {
      data: { message: "Wrong password" },
    });

    expect(apiErrorMessage(error, "Please try again.")).not.toContain("HTTP 401");
  });

  it("falls back to the error itself when there is no body", () => {
    expect(apiErrorMessage(new Error("Network request failed"), "Please try again.")).toBe(
      "Network request failed",
    );
  });

  it("uses the caller's wording when there is nothing to go on", () => {
    expect(apiErrorMessage(null, "Please try again.")).toBe("Please try again.");
    expect(apiErrorMessage({ data: {} }, "Please try again.")).toBe("Please try again.");
  });

  it("does not mistake a non-string message for one", () => {
    const error = Object.assign(new Error("HTTP 500"), { data: { message: { code: 12 } } });

    expect(apiErrorMessage(error, "Please try again.")).toBe("HTTP 500");
  });
});
