import { describe, it, expect } from "vitest";
import {
  hexToRGBArray,
  contrastingColor,
  contrastingLinkColor,
  secondaryLinkColor,
} from "./colorUtils";

describe("hexToRGBArray", () => {
  it("parses a 6-digit hex color", () => {
    expect(hexToRGBArray("#4EA9D5")).toEqual([78, 169, 213]);
  });

  it("expands a 3-digit hex color", () => {
    expect(hexToRGBArray("#FFF")).toEqual([255, 255, 255]);
  });

  it("works without a leading #", () => {
    expect(hexToRGBArray("000000")).toEqual([0, 0, 0]);
  });
});

describe("contrastingColor", () => {
  it("returns black for a light background", () => {
    expect(contrastingColor("#FFFFFF")).toBe("#000000");
  });

  it("returns white for a dark background", () => {
    expect(contrastingColor("#000000")).toBe("#FFFFFF");
  });
});

describe("contrastingLinkColor", () => {
  it("returns a dark blue link color for a light background", () => {
    expect(contrastingLinkColor("#FFFFFF")).toBe("#155dfc");
  });

  it("returns a light link color for a dark background", () => {
    expect(contrastingLinkColor("#000000")).toBe("#9098dc");
  });
});

describe("secondaryLinkColor", () => {
  // renohamswap-2026: medium blue primary (#4EA9D5), white secondary (#FFFFFF)
  // luma of #4EA9D5 ≈ 152.8, luma of #FFFFFF = 255 → difference ≈ 102 ≥ 60 → use secondary
  it("uses secondaryColor when it provides sufficient luma contrast (renohamswap case)", () => {
    expect(secondaryLinkColor("#4EA9D5", "#FFFFFF")).toBe("#FFFFFF");
  });

  // pacificon-2026: medium-dark blue primary (#3d71a3), similar blue secondary (#3b82f6)
  // luma of #3d71a3 ≈ 105.6, luma of #3b82f6 ≈ 123.3 → difference ≈ 17.7 < 60 → fall back
  it("falls back to contrastingLinkColor when secondaryColor is too similar (pacificon case)", () => {
    expect(secondaryLinkColor("#3d71a3", "#3b82f6")).toBe(
      contrastingLinkColor("#3d71a3"),
    );
  });

  // hamvention-2026: red primary (#dc2626), slightly lighter red secondary (#ef4444)
  // difference ≈ 27.6 < 60 → fall back
  it("falls back when secondary is a similar shade of the primary (hamvention case)", () => {
    expect(secondaryLinkColor("#dc2626", "#ef4444")).toBe(
      contrastingLinkColor("#dc2626"),
    );
  });

  // loomis-2026: dark navy primary (#000080), golden secondary (#DCBf33)
  // luma of #000080 ≈ 9.2, luma of #DCBf33 ≈ 187 → difference ≈ 177.8 ≥ 60 → use secondary
  it("uses secondaryColor when it is clearly contrasting (loomis case)", () => {
    expect(secondaryLinkColor("#000080", "#DCBf33")).toBe("#DCBf33");
  });

  // seapac-2026: light sky blue primary (#87CEEB), dark navy secondary (#253C61)
  // luma of #87CEEB ≈ 193, luma of #253C61 ≈ 57.8 → difference ≈ 135.2 ≥ 60 → use secondary
  it("uses secondaryColor when it is a dark color on a light primary (seapac case)", () => {
    expect(secondaryLinkColor("#87CEEB", "#253C61")).toBe("#253C61");
  });

  // hamcation-2026: black primary, orange secondary (#f97316)
  // difference ≈ 136.8 ≥ 60 → use secondary
  it("uses secondaryColor on a black primary (hamcation case)", () => {
    expect(secondaryLinkColor("#000000", "#f97316")).toBe("#f97316");
  });
});
