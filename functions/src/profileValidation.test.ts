import { describe, it, expect } from "vitest";
import { validateRealProfile } from "./profileValidation";

describe("validateRealProfile", () => {
  // ── email_verified: true ──────────────────────────────────────────────────

  it("returns null when email_verified is true", () => {
    expect(validateRealProfile({ email_verified: true })).toBeNull();
  });

  it("returns null when email_verified is true regardless of provider", () => {
    expect(
      validateRealProfile({
        email_verified: true,
        firebase: { sign_in_provider: "password" },
      }),
    ).toBeNull();
  });

  // ── Google sign-in ────────────────────────────────────────────────────────

  it("returns null when sign_in_provider is google.com", () => {
    expect(
      validateRealProfile({ firebase: { sign_in_provider: "google.com" } }),
    ).toBeNull();
  });

  it("returns null when sign_in_provider is google.com even if email_verified is missing", () => {
    expect(
      validateRealProfile({ firebase: { sign_in_provider: "google.com" } }),
    ).toBeNull();
  });

  // ── unverified email ──────────────────────────────────────────────────────

  it("returns unverified-email when email_verified is false and provider is not google", () => {
    expect(
      validateRealProfile({
        email_verified: false,
        firebase: { sign_in_provider: "password" },
      }),
    ).toBe("unverified-email");
  });

  it("returns unverified-email when email_verified is absent", () => {
    expect(validateRealProfile({})).toBe("unverified-email");
  });

  it("returns unverified-email when email_verified is false and no firebase field", () => {
    expect(validateRealProfile({ email_verified: false })).toBe(
      "unverified-email",
    );
  });

  it("returns unverified-email when sign_in_provider is 'password' and email not verified", () => {
    expect(
      validateRealProfile({
        email_verified: false,
        firebase: { sign_in_provider: "password" },
      }),
    ).toBe("unverified-email");
  });

  // ── displayName is irrelevant ─────────────────────────────────────────────

  it("ignores displayName — returns null when email_verified is true and displayName is absent", () => {
    expect(validateRealProfile({ email_verified: true })).toBeNull();
  });

  it("ignores displayName — returns unverified-email even when displayName is present but email is unverified", () => {
    expect(
      validateRealProfile({
        email_verified: false,
        firebase: { sign_in_provider: "password" },
      }),
    ).toBe("unverified-email");
  });
});

