import { describe, it, expect } from "vitest";
import { buildFeedbackEmailHtml } from "./feedbackEmailContent";

describe("buildFeedbackEmailHtml", () => {
  it("includes the page URL in the output", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/schedule",
      "Missing session time",
    );
    expect(html).toContain("https://pacific-div.web.app/schedule");
  });

  it("includes the message text in the output", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/maps",
      "The map image is broken",
    );
    expect(html).toContain("The map image is broken");
  });

  it("includes the sender email when provided", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/forums",
      "Great app!",
      "user@example.com",
    );
    expect(html).toContain("user@example.com");
  });

  it("omits the From line when sender email is not provided", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/prizes",
      "Anonymous feedback",
    );
    expect(html).not.toContain("<strong>From:</strong>");
  });

  it("escapes HTML special characters in the message", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/",
      "<script>alert('xss')</script>",
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("converts newlines to <br /> in the message", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/",
      "Line one\nLine two",
    );
    expect(html).toContain("Line one<br />");
    expect(html).toContain("Line two");
  });

  it("includes the user-agent string when provided", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/schedule",
      "Crashes on load",
      undefined,
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    );
    expect(html).toContain("Mozilla/5.0 (iPhone");
    expect(html).toContain("User-Agent:");
  });

  it("omits the User-Agent line when not provided", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/schedule",
      "No UA provided",
    );
    expect(html).not.toContain("User-Agent:");
  });

  it("escapes HTML special characters in the user-agent string", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/",
      "Test",
      undefined,
      "<script>evil</script>",
    );
    expect(html).not.toContain("<script>evil</script>");
    expect(html).toContain("&lt;script&gt;evil&lt;/script&gt;");
  });

  it("includes a link to pacific-div.web.app", () => {
    const html = buildFeedbackEmailHtml(
      "https://pacific-div.web.app/alerts",
      "Test feedback",
    );
    expect(html).toContain("pacific-div.web.app");
  });
});
