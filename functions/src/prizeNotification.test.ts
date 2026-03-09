import { describe, it, expect } from "vitest";
import { buildPrizeWinnerEmailHtml } from "./prizeNotification";

describe("buildPrizeWinnerEmailHtml", () => {
  it("includes the winning ticket number in the output", () => {
    const html = buildPrizeWinnerEmailHtml(
      "winner@example.com",
      "1234",
      "ICOM IC-7300",
    );
    expect(html).toContain("#1234");
    expect(html).toContain("1234");
  });

  it("includes the prize name in the output", () => {
    const html = buildPrizeWinnerEmailHtml(
      "winner@example.com",
      "5678",
      "Yaesu FT-991A",
    );
    expect(html).toContain("Yaesu FT-991A");
  });

  it("includes a link to pacific-div.web.app/prizes", () => {
    const html = buildPrizeWinnerEmailHtml(
      "winner@example.com",
      "9999",
      "Some Prize",
    );
    expect(html).toContain("pacific-div.web.app/prizes");
  });

  it("includes a link to manage notification preferences", () => {
    const html = buildPrizeWinnerEmailHtml(
      "winner@example.com",
      "9999",
      "Some Prize",
    );
    expect(html).toContain("pacific-div.web.app/profile");
  });

  it("includes a congratulatory message", () => {
    const html = buildPrizeWinnerEmailHtml(
      "winner@example.com",
      "1111",
      "Any Prize",
    );
    expect(html.toLowerCase()).toContain("congratulations");
  });

  it("returns a non-empty HTML string", () => {
    const html = buildPrizeWinnerEmailHtml(
      "winner@example.com",
      "42",
      "Grand Prize",
    );
    expect(html.length).toBeGreaterThan(100);
    expect(html).toContain("<!DOCTYPE html>");
  });
});
