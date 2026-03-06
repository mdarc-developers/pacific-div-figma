import { describe, it, expect } from "vitest";
import { buildRawMessage, buildWelcomeEmailHtml } from "./welcomeEmail";

describe("buildRawMessage", () => {
  it("returns a base64url encoded string", () => {
    const raw = buildRawMessage(
      "from@example.com",
      "to@example.com",
      "Test Subject",
      "<p>Hello</p>",
    );
    // base64url characters: A-Z a-z 0-9 - _  (no +, /, or trailing =)
    expect(raw).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it("decoded output contains From, To, Subject headers", () => {
    const raw = buildRawMessage(
      "from@example.com",
      "to@example.com",
      "Hello Subject",
      "<p>body</p>",
    );
    const decoded = Buffer.from(
      raw.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf-8");
    expect(decoded).toContain("From: from@example.com");
    expect(decoded).toContain("To: to@example.com");
    expect(decoded).toContain("Subject: Hello Subject");
    expect(decoded).toContain("<p>body</p>");
  });

  it("uses CRLF line endings as required by RFC 2822", () => {
    const raw = buildRawMessage(
      "from@example.com",
      "to@example.com",
      "Test Subject",
      "<p>body</p>",
    );
    const decoded = Buffer.from(
      raw.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf-8");
    // RFC 2822 requires CRLF (\r\n) line endings between headers and between
    // the header block and the body. The Gmail API sends this as a raw RFC 2822
    // message, so non-compliant line endings can cause delivery failures.
    expect(decoded).toContain("Subject: Test Subject\r\n\r\n<p>body</p>");
  });
});

describe("buildWelcomeEmailHtml", () => {
  it("includes the user display name when provided", () => {
    const html = buildWelcomeEmailHtml("Alice K6ABC", "alice@example.com");
    expect(html).toContain("Alice K6ABC");
  });

  it("falls back to email when displayName is undefined", () => {
    const html = buildWelcomeEmailHtml(undefined, "bob@example.com");
    expect(html).toContain("bob@example.com");
  });

  it("contains a link to the conference app", () => {
    const html = buildWelcomeEmailHtml("Charlie", "charlie@example.com");
    expect(html).toContain("pacific-div.web.app");
  });
});
