import { describe, it, expect } from "vitest";
import {
  VERIFICATION_EMAIL_SUBJECT,
  buildVerificationEmailHtml,
} from "./verificationEmail";

describe("VERIFICATION_EMAIL_SUBJECT", () => {
  it("is a non-empty string", () => {
    expect(typeof VERIFICATION_EMAIL_SUBJECT).toBe("string");
    expect(VERIFICATION_EMAIL_SUBJECT.length).toBeGreaterThan(0);
  });
});

describe("buildVerificationEmailHtml", () => {
  it("includes the user display name when provided", () => {
    const html = buildVerificationEmailHtml(
      "Alice K6ABC",
      "alice@example.com",
      "https://example.com/verify?token=abc123",
    );
    expect(html).toContain("Alice K6ABC");
  });

  it("falls back to email address when displayName is undefined", () => {
    const html = buildVerificationEmailHtml(
      undefined,
      "bob@example.com",
      "https://example.com/verify?token=abc123",
    );
    expect(html).toContain("bob@example.com");
  });

  it("embeds the verification link as an anchor href", () => {
    const link = "https://example.com/verify?token=abc123";
    const html = buildVerificationEmailHtml(
      "Charlie",
      "charlie@example.com",
      link,
    );
    expect(html).toContain(`href="${link}"`);
  });

  it("renders the plain-text fallback link in the body", () => {
    const link = "https://example.com/verify?token=abc123";
    const html = buildVerificationEmailHtml("Dave", "dave@example.com", link);
    // The link must appear at least twice: once in the button href and once as
    // a plain-text fallback paragraph.
    const occurrences = html.split(link).length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });

  it("includes a link to the conference app domain", () => {
    const html = buildVerificationEmailHtml(
      "Eve",
      "eve@example.com",
      "https://example.com/verify?token=abc123",
    );
    expect(html).toContain("pacific-div.web.app");
  });

  it("contains the recipient email address in the body text", () => {
    const html = buildVerificationEmailHtml(
      "Frank",
      "frank@example.com",
      "https://example.com/verify?token=abc123",
    );
    expect(html).toContain("frank@example.com");
  });
});
