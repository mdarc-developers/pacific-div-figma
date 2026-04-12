import { describe, it, expect } from "vitest";
import { validateRealProfile } from "./profileValidation";

describe("validateRealProfile", () => {
  it("returns null when displayName is a non-empty string", () => {
    expect(validateRealProfile({ displayName: "Alice Cooper" })).toBeNull();
    expect(validateRealProfile({ displayName: "Bob Johnson" })).toBeNull();
  });

  it("also returns null when a callsign is present alongside displayName", () => {
    expect(
      validateRealProfile({ displayName: "Alice Cooper", callsign: "K6AL" }),
    ).toBeNull();
  });

  it("returns null even when callsign is absent, as long as displayName is set", () => {
    expect(validateRealProfile({ displayName: "Guest Attendee" })).toBeNull();
  });

  it("returns missing-display-name when displayName field is absent", () => {
    expect(validateRealProfile({})).toBe("missing-display-name");
  });

  it("returns missing-display-name when displayName is an empty string", () => {
    expect(validateRealProfile({ displayName: "" })).toBe(
      "missing-display-name",
    );
  });

  it("returns missing-display-name when displayName is whitespace only", () => {
    expect(validateRealProfile({ displayName: "   " })).toBe(
      "missing-display-name",
    );
  });

  it("returns missing-display-name when displayName is not a string", () => {
    expect(validateRealProfile({ displayName: 123 })).toBe(
      "missing-display-name",
    );
    expect(validateRealProfile({ displayName: null })).toBe(
      "missing-display-name",
    );
    expect(validateRealProfile({ displayName: true })).toBe(
      "missing-display-name",
    );
    expect(validateRealProfile({ displayName: [] })).toBe(
      "missing-display-name",
    );
  });

  it("trims whitespace before validating the displayName", () => {
    expect(validateRealProfile({ displayName: " Alice " })).toBeNull();
  });
});
