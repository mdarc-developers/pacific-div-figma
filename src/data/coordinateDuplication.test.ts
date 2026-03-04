import { describe, it, expect } from "vitest";
import { BOOTH_DATA, ROOM_DATA } from "@/lib/sessionData";

/**
 * Serialise a coords array to a canonical string for exact-match comparison.
 * Two entries are considered duplicates when every vertex is identical and
 * appears in the same order.
 */
function coordsKey(coords: [number, number][]): string {
  return JSON.stringify(coords);
}

function findDuplicateCoords(
  items: { coords: [number, number][] }[],
): string[] {
  const seen = new Map<string, number>();
  const dupes: string[] = [];
  items.forEach((item, index) => {
    const key = coordsKey(item.coords);
    if (seen.has(key)) {
      dupes.push(`index ${seen.get(key)} and ${index}: ${key}`);
    } else {
      seen.set(key, index);
    }
  });
  return dupes;
}

// ── Booth coordinate uniqueness ───────────────────────────────────────────────
describe("booth coordinate uniqueness", () => {
  Object.entries(BOOTH_DATA).forEach(([conferenceId, maps]) => {
    maps.forEach(([url, booths]) => {
      it(`${conferenceId} (${url}): no two booths share identical coords`, () => {
        const dupes = findDuplicateCoords(booths);
        expect(
          dupes,
          `Duplicate booth coords in ${conferenceId} (${url}): ${dupes.join("; ")}`,
        ).toEqual([]);
      });
    });
  });
});

// ── Room coordinate uniqueness ────────────────────────────────────────────────
describe("room coordinate uniqueness", () => {
  Object.entries(ROOM_DATA).forEach(([conferenceId, maps]) => {
    maps.forEach(([url, rooms]) => {
      it(`${conferenceId} (${url}): no two rooms share identical coords`, () => {
        const dupes = findDuplicateCoords(rooms);
        expect(
          dupes,
          `Duplicate room coords in ${conferenceId} (${url}): ${dupes.join("; ")}`,
        ).toEqual([]);
      });
    });
  });
});
