import { describe, it, expect } from "vitest";
import { validateRealProfile } from "./profileValidation";

describe("validateRealProfile", () => {
  it("returns null when callsign is a non-empty string", () => {
    expect(validateRealProfile({ callsign: "W6AB" })).toBeNull();
    expect(validateRealProfile({ callsign: "K6AL" })).toBeNull();
    expect(validateRealProfile({ callsign: "N6YZ" })).toBeNull();
  });

  it("returns missing-callsign when callsign field is absent", () => {
    expect(validateRealProfile({})).toBe("missing-callsign");
  });

  it("returns missing-callsign when callsign is an empty string", () => {
    expect(validateRealProfile({ callsign: "" })).toBe("missing-callsign");
  });

  it("returns missing-callsign when callsign is whitespace only", () => {
    expect(validateRealProfile({ callsign: "   " })).toBe("missing-callsign");
  });

  it("returns missing-callsign when callsign is not a string", () => {
    expect(validateRealProfile({ callsign: 123 })).toBe("missing-callsign");
    expect(validateRealProfile({ callsign: null })).toBe("missing-callsign");
    expect(validateRealProfile({ callsign: true })).toBe("missing-callsign");
    expect(validateRealProfile({ callsign: [] })).toBe("missing-callsign");
  });

  it("trims whitespace before validating the callsign", () => {
    expect(validateRealProfile({ callsign: " W6AB " })).toBeNull();
  });
});
