import { describe, it, expect } from "vitest";
import { validateRealProfile } from "./profileValidation";

describe("validateRealProfile", () => {
  it("returns null when displayName is a non-empty string", () => {
    expect(validateRealProfile({ displayName: "Alice K6ABC" })).toBeNull();
  });

  it("returns null when displayName has leading/trailing spaces (non-empty after trim)", () => {
    expect(validateRealProfile({ displayName: "  Alice  " })).toBeNull();
  });

  it("returns missing-display-name when displayName is absent", () => {
    expect(validateRealProfile({})).toBe("missing-display-name");
  });

  it("returns missing-display-name when displayName is an empty string", () => {
    expect(validateRealProfile({ displayName: "" })).toBe(
      "missing-display-name",
    );
  });

  it("returns missing-display-name when displayName is only whitespace", () => {
    expect(validateRealProfile({ displayName: "   " })).toBe(
      "missing-display-name",
    );
  });

  it("returns missing-display-name when displayName is null", () => {
    expect(validateRealProfile({ displayName: null })).toBe(
      "missing-display-name",
    );
  });

  it("returns missing-display-name when displayName is a number", () => {
    expect(validateRealProfile({ displayName: 42 })).toBe(
      "missing-display-name",
    );
  });

  it("returns missing-display-name when displayName is an array", () => {
    expect(validateRealProfile({ displayName: ["Alice"] })).toBe(
      "missing-display-name",
    );
  });

  it("does not require callsign — returns null when callsign is absent", () => {
    expect(
      validateRealProfile({ displayName: "Bob W7XYZ" }),
    ).toBeNull();
  });

  it("ignores extra fields — returns null with displayName and other fields present", () => {
    expect(
      validateRealProfile({
        displayName: "Carol N7ABC",
        callsign: "N7ABC",
        email: "carol@example.com",
        profileVisible: true,
      }),
    ).toBeNull();
  });
});
