import { describe, it, expect } from "vitest";
import {
  parsePoints,
  detectBounds,
  fallbackLayout,
  type SvgMapBooth,
} from "@/app/components/ExhibitorsMapViewSvg";
import { boothToSvgMapBooth } from "@/app/components/ExhibitorsMapView";
import type { Booth } from "@/types/conference";

// ── parsePoints ───────────────────────────────────────────────────────────────
describe("parsePoints", () => {
  it("parses a standard space-separated x,y string", () => {
    expect(parsePoints("263.36,224.48 272.48,219.04 277.76,228.16")).toEqual([
      [263.36, 224.48],
      [272.48, 219.04],
      [277.76, 228.16],
    ]);
  });

  it("parses integer coordinates", () => {
    expect(parsePoints("507,118 507,128 518,128 518,118")).toEqual([
      [507, 118],
      [507, 128],
      [518, 128],
      [518, 118],
    ]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parsePoints("")).toEqual([]);
    expect(parsePoints("   ")).toEqual([]);
  });

  it("skips pairs that contain NaN", () => {
    // "abc,1" and "2,xyz" are invalid; only "3,4" is valid
    expect(parsePoints("abc,1 3,4 2,xyz")).toEqual([[3, 4]]);
  });

  it("handles extra whitespace between pairs", () => {
    expect(parsePoints("  10,20   30,40  ")).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });
});

// ── detectBounds ──────────────────────────────────────────────────────────────
describe("detectBounds", () => {
  it("returns null for an empty array", () => {
    expect(detectBounds([])).toBeNull();
  });

  it("returns null when all svgPoints are invalid", () => {
    const booths: SvgMapBooth[] = [{ boothNum: 1, svgPoints: "" }];
    expect(detectBounds(booths)).toBeNull();
  });

  it("computes correct bounds for a single booth", () => {
    const booths: SvgMapBooth[] = [
      { boothNum: 1010, svgPoints: "263,224 272,219 278,228 269,234" },
    ];
    expect(detectBounds(booths)).toEqual({
      minX: 263,
      maxX: 278,
      minY: 219,
      maxY: 234,
    });
  });

  it("computes correct bounds across multiple booths", () => {
    const booths: SvgMapBooth[] = [
      { boothNum: 1, svgPoints: "10,20 30,40" },
      { boothNum: 2, svgPoints: "5,50 35,15" },
    ];
    expect(detectBounds(booths)).toEqual({
      minX: 5,
      maxX: 35,
      minY: 15,
      maxY: 50,
    });
  });
});

// ── fallbackLayout ────────────────────────────────────────────────────────────
describe("fallbackLayout", () => {
  it("returns a default layout for empty booths", () => {
    const layout = fallbackLayout([]);
    expect(layout).toEqual({ vbW: 100, vbH: 100, translateX: 0, translateY: 0 });
  });

  it("adds 10 % margin around the bounding box", () => {
    // Range 200 wide × 100 tall  → vbW = 200*1.2 = 240, vbH = 100*1.2 = 120
    const booths: SvgMapBooth[] = [
      { boothNum: 1, svgPoints: "100,50 300,150" },
    ];
    const layout = fallbackLayout(booths);
    expect(layout.vbW).toBeCloseTo(240);
    expect(layout.vbH).toBeCloseTo(120);
  });

  it("sets translateX/Y so the bounding box starts at the 10 % margin", () => {
    // minX=100, rangeW=200, pad=10% → translateX = 100 - 200*0.1 = 80
    // minY=50,  rangeH=100, pad=10% → translateY = 50  - 100*0.1 = 40
    const booths: SvgMapBooth[] = [
      { boothNum: 1, svgPoints: "100,50 300,150" },
    ];
    const layout = fallbackLayout(booths);
    expect(layout.translateX).toBeCloseTo(80);
    expect(layout.translateY).toBeCloseTo(40);
  });

  it("produces a layout that places all booth corners inside the viewBox", () => {
    const booths: SvgMapBooth[] = [
      { boothNum: 1, svgPoints: "263,132 477,352" },
    ];
    const { vbW, vbH, translateX, translateY } = fallbackLayout(booths);
    // After applying translate every corner should be in [0, vbW] × [0, vbH]
    for (const [x, y] of parsePoints(booths[0].svgPoints)) {
      expect(x - translateX).toBeGreaterThanOrEqual(0);
      expect(x - translateX).toBeLessThanOrEqual(vbW);
      expect(y - translateY).toBeGreaterThanOrEqual(0);
      expect(y - translateY).toBeLessThanOrEqual(vbH);
    }
  });
});

// ── boothToSvgMapBooth ────────────────────────────────────────────────────────
describe("boothToSvgMapBooth", () => {
  const makeBooth = (id: number, coords: [number, number][]): Booth => ({
    id,
    coords,
    locationZone: "test",
  });

  it("maps booth id to boothNum", () => {
    const result = boothToSvgMapBooth(makeBooth(1010, [[263, 224]]));
    expect(result.boothNum).toBe(1010);
  });

  it("converts a single coord pair to a svgPoints string", () => {
    const result = boothToSvgMapBooth(makeBooth(1, [[507, 118]]));
    expect(result.svgPoints).toBe("507,118");
  });

  it("joins multiple coord pairs with spaces", () => {
    const result = boothToSvgMapBooth(
      makeBooth(2, [
        [507, 118],
        [507, 128],
        [518, 128],
        [518, 118],
      ]),
    );
    expect(result.svgPoints).toBe("507,118 507,128 518,128 518,118");
  });

  it("preserves decimal precision in coords", () => {
    const result = boothToSvgMapBooth(
      makeBooth(3, [
        [263.36, 224.48],
        [272.48, 219.04],
      ]),
    );
    expect(result.svgPoints).toBe("263.36,224.48 272.48,219.04");
  });

  it("uses x as the first value and y as the second (SVG convention)", () => {
    // Building 2 booth 2008: [[507,118],[507,128],[518,128],[518,118]]
    // After subtracting building-2 translate (≈495.2, ≈97.9) the first value
    // (507-495=12) lands near the left edge of the SVG — confirming it is x.
    const result = boothToSvgMapBooth(
      makeBooth(2008, [
        [507, 118],
        [518, 118],
      ]),
    );
    const pairs = result.svgPoints.split(" ").map((p) => p.split(",").map(Number));
    // first value of each pair should equal the original coords[i][0]
    expect(pairs[0][0]).toBe(507);
    expect(pairs[1][0]).toBe(518);
  });
});
