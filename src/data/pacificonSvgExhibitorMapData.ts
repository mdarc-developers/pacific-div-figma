// pacificonSvgExhibitorMapData.ts
// ─────────────────────────────────────────────────────────────────────────────
// ALL coordinates were derived by pixel-measuring the original 1280×1702 image,
// then scaling to a 1000×1633 SVG canvas at 0.6353 px/unit so ALL 5 booth
// columns fit (the original image was cropped and didn't show cols 4–5).
// ─────────────────────────────────────────────────────────────────────────────

export type BoothType =
  | "vendor-booth" // Blue (#77CFF4)
  | "vendor-table" // Orange (#FFC000)
  | "nonprofit-table" // Yellow (#FFFF00)
  | "activity" // Green (#7ABB33) — lobby, kit building, W1AW
  | "room" // Deep green — ballrooms
  | "hallway" // Light gray — hallway labels, patio
  | "service"; // Medium gray — registration, restrooms

/** Canvas-space booth entry (1280×1720 coordinate system). */
export interface BoothSpec {
  /** String identifier used internally by the canvas renderer. */
  id: string;
  /** Numeric id matching the PACIFICON_MAP_BOOTHS / mapBooths id scheme. */
  numericId: number;
  label: string; // \n for line breaks
  type: BoothType;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
}

export const COLORS: Record<
  BoothType,
  { fill: string; stroke: string; text: string }
> = {
  "vendor-booth": { fill: "#77CFF4", stroke: "#2A7A9B", text: "#0D2B3E" },
  "vendor-table": { fill: "#FFC000", stroke: "#B38600", text: "#3D2200" },
  "nonprofit-table": { fill: "#FFFF00", stroke: "#B8A000", text: "#2D2700" },
  activity: { fill: "#7ABB33", stroke: "#4A7A1E", text: "#FFFFFF" },
  room: { fill: "#2D5C1E", stroke: "#1A3D10", text: "#FFFFFF" },
  hallway: { fill: "#D8D8D8", stroke: "#999999", text: "#333333" },
  service: { fill: "#888888", stroke: "#555555", text: "#FFFFFF" },
};

export const LEGEND_ITEMS: { type: BoothType; label: string }[] = [
  { type: "vendor-booth", label: "Vendor Booth" },
  { type: "vendor-table", label: "Vendor Table" },
  { type: "nonprofit-table", label: "Non-Profit Table" },
  { type: "activity", label: "PACIFICON Activities Area" },
];

// Canvas — full content width (shows all 5 booth columns)
export const MAP_WIDTH = 1280; // just enough room for col5 right edge
export const MAP_HEIGHT = 1720;

// ── Shared sizes (all vendor hall booths are identical) ───────────────────
const B = 84.5; // booth width & height
const TW = 40.0; // T-table width (west-wall tables)

// ── Column x-anchors (measured from original, scaled) ────────────────────
const X_REG = 9; // registration/will-call strip
const X_LOB = 47; // lobby + prize booth left edge
const X_CC = 107; // contra costa content left
const X_SORT = 545; // sorting board / T-10/11/13 left edge
const X_BALL = 481; // CC ballroom / kit building left
const X_WIRE = 586; // wired comm + T-1..9 + VH col 1
const X_VH1 = 586; // vendor hall column 1
const X_VH2 = X_VH1 + B;
const X_VH3 = X_VH2 + B;
const X_VH4 = X_VH3 + B;
const X_VH5 = X_VH4 + B; // col 5 (booths 20, 29, 28, 27)
const X_NP_L = 496; // NP-10/11 and lower NP tables

// ── Row y-anchors (measured from original, scaled) ───────────────────────
const Y_TOP = 62; // very top of content
const Y_B33 = 90; // booth 33/41 top
const Y_B37 = 177; // booth 37/34/35/36 top
const Y_MDARC = 261; // MDARC top
const Y_NP19 = 296; // NP-19 top
const Y_NP16 = 261; // NP-16/17/18 top (same as MDARC)
const Y_NP5 = 319; // NP-5..9 top
const Y_NP1 = 371; // NP-1..4 top
const Y_PATIO = 414; // CC patio + kit building top
const Y_WIRE = 316; // wired comm bar
const Y_T = 352; // T-1..9 row
const Y_BRH = 386; // Bishop Ranch Hallway / VH row 1 / T-10
const Y_VH1 = 386; // vendor hall row 1
const Y_VH2 = Y_VH1 + B;
const Y_VH3 = Y_VH2 + B;
const Y_VH4 = Y_VH3 + B;
const Y_VH5 = Y_VH4 + B;
const Y_LVH = 816; // lower vendor hall (booths 21-26)
const Y_BALL = 901; // bishop ranch ballroom
const Y_T15 = 901;
const Y_T16 = 999;
const Y_T17 = 1082;
const Y_T18 = 1147;
const Y_W1AW = 1212;
const Y_NP12 = 1212;
const Y_NP13 = 1261;
const Y_NP14 = 1309;
const Y_REST = 1396;
const Y_BOT = 1509; // bottom rooms (NP-15, boardrooms)

export const BOOTHS: BoothSpec[] = [
  // ── SERVICE STRIPS ──────────────────────────────────────────────────────
  {
    id: "registration",
    numericId: 902,
    label: "REGISTRATION",
    type: "service",
    x: X_REG,
    y: 178,
    width: 38,
    height: 248,
    fontSize: 5.5,
  },
  {
    id: "will-call",
    numericId: 903,
    label: "WILL\nCALL",
    type: "service",
    x: X_REG,
    y: 426,
    width: 38,
    height: 60,
    fontSize: 5.5,
  },

  // ── PRIZE BOOTH + LOBBY ─────────────────────────────────────────────────
  {
    id: "prize-booth",
    numericId: 904,
    label: "PACIFICON\nPRIZE\nBOOTH",
    type: "activity",
    x: X_LOB,
    y: Y_TOP,
    width: 57,
    height: 113,
    fontSize: 6,
  },
  {
    id: "lobby",
    numericId: 905,
    label: "LOBBY",
    type: "activity",
    x: X_LOB,
    y: 177,
    width: 57,
    height: 397,
    fontSize: 14,
  },

  // ── CONTRA COSTA VENDOR HALL ────────────────────────────────────────────
  {
    id: "cc-hall-hdr",
    numericId: 916,
    label: "Contra Costa\nVendor Hall",
    type: "hallway",
    x: X_CC,
    y: Y_TOP,
    width: 446,
    height: 27,
    fontSize: 9,
  },

  // Booths 33, 41
  {
    id: "b33",
    numericId: 33,
    label: "33\nFree TV",
    type: "vendor-booth",
    x: X_CC,
    y: Y_B33,
    width: 84.5,
    height: 84.5,
    fontSize: 8,
  },
  {
    id: "b41",
    numericId: 41,
    label: "41\nLoderma\nthe Potter",
    type: "vendor-booth",
    x: X_CC + 84.5,
    y: Y_B33,
    width: 136,
    height: 84.5,
    fontSize: 8,
  },

  // Booths 37, 34, 35, 36
  {
    id: "b37",
    numericId: 37,
    label: "37",
    type: "vendor-booth",
    x: X_CC,
    y: Y_B37,
    width: 84.5,
    height: 82.5,
    fontSize: 9,
  },
  {
    id: "b34",
    numericId: 34,
    label: "34\nLong Island\nCW Club",
    type: "vendor-booth",
    x: X_CC + 84.5,
    y: Y_B37,
    width: 137,
    height: 82.5,
    fontSize: 8,
  },
  {
    id: "b35",
    numericId: 35,
    label: "35",
    type: "vendor-booth",
    x: X_CC + 222,
    y: Y_B37,
    width: 82.5,
    height: 82.5,
    fontSize: 9,
  },
  {
    id: "b36",
    numericId: 36,
    label: "36\nAI6VM\nRadio",
    type: "vendor-booth",
    x: X_CC + 306,
    y: Y_B37,
    width: 65,
    height: 82.5,
    fontSize: 8,
  },

  // MDARC / NP-19
  {
    id: "mdarc",
    numericId: 920,
    label: "MDARC",
    type: "nonprofit-table",
    x: X_CC,
    y: Y_MDARC,
    width: 84.5,
    height: 35,
    fontSize: 8,
  },
  {
    id: "np19",
    numericId: 219,
    label: "NP-19",
    type: "nonprofit-table",
    x: X_CC,
    y: Y_NP19,
    width: 84.5,
    height: 25,
    fontSize: 7,
  },

  // NP-16, 17, 18
  {
    id: "np16",
    numericId: 216,
    label: "NP-16\nORCA",
    type: "nonprofit-table",
    x: X_CC + 198,
    y: Y_NP16,
    width: 76,
    height: 57,
    fontSize: 7,
  },
  {
    id: "np17",
    numericId: 217,
    label: "NP-17\nMesh\ntastic",
    type: "nonprofit-table",
    x: X_CC + 276,
    y: Y_NP16,
    width: 76,
    height: 57,
    fontSize: 7,
  },
  {
    id: "np18",
    numericId: 218,
    label: "NP-18\nSF\nSkywarn",
    type: "nonprofit-table",
    x: X_CC + 353,
    y: Y_NP16,
    width: 83,
    height: 57,
    fontSize: 7,
  },

  // NP-5 .. NP-9
  {
    id: "np5",
    numericId: 205,
    label: "NP-5\nQSL Bureau",
    type: "nonprofit-table",
    x: X_CC + 84.5,
    y: Y_NP5,
    width: 74,
    height: 51,
    fontSize: 7,
  },
  {
    id: "np6",
    numericId: 206,
    label: "NP-6\nSOTA",
    type: "nonprofit-table",
    x: X_CC + 160,
    y: Y_NP5,
    width: 74,
    height: 51,
    fontSize: 7,
  },
  {
    id: "np7",
    numericId: 207,
    label: "NP-7\nYLRL",
    type: "nonprofit-table",
    x: X_CC + 235,
    y: Y_NP5,
    width: 74,
    height: 51,
    fontSize: 7,
  },
  {
    id: "np8",
    numericId: 208,
    label: "NP-8\nSNARS",
    type: "nonprofit-table",
    x: X_CC + 310,
    y: Y_NP5,
    width: 74,
    height: 51,
    fontSize: 7,
  },
  {
    id: "np9",
    numericId: 209,
    label: "NP-9\nQCWA",
    type: "nonprofit-table",
    x: X_CC + 385,
    y: Y_NP5,
    width: 51,
    height: 51,
    fontSize: 7,
  },

  // Sorting board
  {
    id: "sorting",
    numericId: 301,
    label: "Sorting\nBoard",
    type: "vendor-table",
    x: X_SORT,
    y: Y_NP5,
    width: 41,
    height: 99,
    fontSize: 7,
  },

  // NP-1 .. NP-4
  {
    id: "np1",
    numericId: 201,
    label: "NP-1\nNARCC",
    type: "nonprofit-table",
    x: X_CC,
    y: Y_NP1,
    width: 84.5,
    height: 42,
    fontSize: 7,
  },
  {
    id: "np2",
    numericId: 202,
    label: "NP-2\nBay Area\nMesh",
    type: "nonprofit-table",
    x: X_CC + 84.5,
    y: Y_NP1,
    width: 84.5,
    height: 42,
    fontSize: 7,
  },
  {
    id: "np3",
    numericId: 203,
    label: "NP-3\nNCCC",
    type: "nonprofit-table",
    x: X_CC + 171,
    y: Y_NP1,
    width: 76,
    height: 42,
    fontSize: 7,
  },
  {
    id: "np4",
    numericId: 204,
    label: "NP-4\nROAR I'ntl",
    type: "nonprofit-table",
    x: X_CC + 249,
    y: Y_NP1,
    width: 84.5,
    height: 42,
    fontSize: 7,
  },

  // Contra Costa Patio
  {
    id: "cc-patio",
    numericId: 921,
    label: "Contra Costa Patio",
    type: "hallway",
    x: X_CC,
    y: Y_PATIO,
    width: 478,
    height: 170,
    fontSize: 11,
  },

  // ── CC BALLROOM SALON 2 ──────────────────────────────────────────────────
  {
    id: "cc-ballroom",
    numericId: 922,
    label: "Contra Costa\nBallroom\nSalon 2",
    type: "room",
    x: X_BALL,
    y: Y_TOP,
    width: 229,
    height: 254,
    fontSize: 12,
  },

  // ── BISHOP RANCH HALLWAY + WIRED COMM ───────────────────────────────────
  {
    id: "br-hallway",
    numericId: 923,
    label: "Bishop Ranch\nHallway",
    type: "hallway",
    x: X_WIRE,
    y: Y_BRH,
    width: 125,
    height: 32,
    fontSize: 8,
  },
  {
    id: "br-hall-lbl",
    numericId: 924,
    label: "Bishop Ranch\nVendor Hall",
    type: "hallway",
    x: X_VH3,
    y: Y_WIRE,
    width: 297,
    height: 36,
    fontSize: 9,
  },
  {
    id: "wired-comm",
    numericId: 302,
    label: "Wired Communications",
    type: "vendor-table",
    x: X_WIRE,
    y: Y_WIRE,
    width: 422,
    height: 34,
    fontSize: 9,
  },

  // T-1 .. T-9
  ...["T-1", "T-2", "T-3", "T-4", "T-5", "T-6", "T-7", "T-8", "T-9"].map(
    (t, i) => ({
      id: t.toLowerCase(),
      numericId: 101 + i,
      label: t,
      type: "vendor-table" as BoothType,
      x: X_WIRE + i * 24.8,
      y: Y_T,
      width: 24.8,
      height: 33,
      fontSize: 6,
    }),
  ),

  // ── WEST-WALL T-TABLES ───────────────────────────────────────────────────
  {
    id: "t10",
    numericId: 110,
    label: "T-10\nWestern\nCare",
    type: "vendor-table",
    x: X_SORT,
    y: Y_VH1,
    width: TW,
    height: B,
    fontSize: 7,
  },
  {
    id: "t11",
    numericId: 111,
    label: "T-11\nHiplam\nShirts",
    type: "vendor-table",
    x: X_SORT,
    y: Y_VH2,
    width: TW,
    height: B,
    fontSize: 7,
  },
  {
    id: "t13",
    numericId: 113,
    label: "T-13\nRemote\nTX",
    type: "vendor-table",
    x: X_SORT,
    y: Y_VH3 + B * 0.5,
    width: TW,
    height: B * 1.2,
    fontSize: 7,
  },

  // ── VENDOR HALL BOOTHS ───────────────────────────────────────────────────
  // Col 1 (1-5)
  {
    id: "b1",
    numericId: 1,
    label: "1\nFlexRadio",
    type: "vendor-booth",
    x: X_VH1,
    y: Y_VH1,
    width: B,
    height: B,
    fontSize: 8,
  },
  {
    id: "b2",
    numericId: 2,
    label: "2",
    type: "vendor-booth",
    x: X_VH1,
    y: Y_VH2,
    width: B,
    height: B,
  },
  {
    id: "b3",
    numericId: 3,
    label: "3",
    type: "vendor-booth",
    x: X_VH1,
    y: Y_VH3,
    width: B,
    height: B,
  },
  {
    id: "b4",
    numericId: 4,
    label: "4",
    type: "vendor-booth",
    x: X_VH1,
    y: Y_VH4,
    width: B,
    height: B,
    fontSize: 8,
  },
  {
    id: "b5",
    numericId: 5,
    label: "5",
    type: "vendor-booth",
    x: X_VH1,
    y: Y_VH5,
    width: B,
    height: B,
  },
  // Col 2 (6-10)
  {
    id: "b6",
    numericId: 6,
    label: "6\nYaesu",
    type: "vendor-booth",
    x: X_VH2,
    y: Y_VH1,
    width: B,
    height: B,
    fontSize: 8,
  },
  {
    id: "b7",
    numericId: 7,
    label: "7\nImpulse\nElectronics",
    type: "vendor-booth",
    x: X_VH2,
    y: Y_VH2,
    width: B,
    height: B,
    fontSize: 7,
  },
  {
    id: "b8",
    numericId: 8,
    label: "8",
    type: "vendor-booth",
    x: X_VH2,
    y: Y_VH3,
    width: B,
    height: B,
  },
  {
    id: "b9",
    numericId: 9,
    label: "9",
    type: "vendor-booth",
    x: X_VH2,
    y: Y_VH4,
    width: B,
    height: B,
  },
  {
    id: "b10",
    numericId: 10,
    label: "10\nCom\nIndustries",
    type: "vendor-booth",
    x: X_VH2,
    y: Y_VH5,
    width: B,
    height: B,
    fontSize: 7,
  },
  // Col 3 (11-15)
  {
    id: "b11",
    numericId: 11,
    label: "11",
    type: "vendor-booth",
    x: X_VH3,
    y: Y_VH1,
    width: B,
    height: B,
  },
  {
    id: "b12",
    numericId: 12,
    label: "12\nHRO",
    type: "vendor-booth",
    x: X_VH3,
    y: Y_VH2,
    width: B,
    height: B,
    fontSize: 8,
  },
  {
    id: "b13",
    numericId: 13,
    label: "13",
    type: "vendor-booth",
    x: X_VH3,
    y: Y_VH3,
    width: B,
    height: B,
  },
  {
    id: "b14",
    numericId: 14,
    label: "14\n12 Volt\nPower",
    type: "vendor-booth",
    x: X_VH3,
    y: Y_VH4,
    width: B,
    height: B,
    fontSize: 7,
  },
  {
    id: "b15",
    numericId: 15,
    label: "15",
    type: "vendor-booth",
    x: X_VH3,
    y: Y_VH5,
    width: B,
    height: B,
  },
  // Col 4 (16-19)
  {
    id: "b16",
    numericId: 16,
    label: "16\nBatteries\nPlus",
    type: "vendor-booth",
    x: X_VH4,
    y: Y_VH1,
    width: B,
    height: B,
    fontSize: 7,
  },
  {
    id: "b17",
    numericId: 17,
    label: "17\nMMDVM",
    type: "vendor-booth",
    x: X_VH4,
    y: Y_VH2,
    width: B,
    height: B,
    fontSize: 8,
  },
  {
    id: "b18",
    numericId: 18,
    label: "18\nBald\nPaddle",
    type: "vendor-booth",
    x: X_VH4,
    y: Y_VH3,
    width: B,
    height: B,
    fontSize: 7,
  },
  {
    id: "b19",
    numericId: 19,
    label: "19\n12 Volt\nPower",
    type: "vendor-booth",
    x: X_VH4,
    y: Y_VH4,
    width: B,
    height: B,
    fontSize: 7,
  },
  // Col 5 (20, 27, 28, 29)
  {
    id: "b20",
    numericId: 20,
    label: "20\n12 Volt\nPower",
    type: "vendor-booth",
    x: X_VH5,
    y: Y_VH4,
    width: B,
    height: B,
    fontSize: 7,
  },
  {
    id: "b29",
    numericId: 29,
    label: "29\nDromo\nKart SD",
    type: "vendor-booth",
    x: X_VH5,
    y: Y_VH1,
    width: B,
    height: 105,
    fontSize: 7,
  },
  {
    id: "b28",
    numericId: 28,
    label: "28\nPark Lane\nJewelry",
    type: "vendor-booth",
    x: X_VH5,
    y: Y_VH1 + 105,
    width: B,
    height: B,
    fontSize: 7,
  },
  {
    id: "b27",
    numericId: 27,
    label: "27",
    type: "vendor-booth",
    x: X_VH5,
    y: Y_VH5,
    width: B,
    height: B,
  },

  // ── KIT BUILDING ─────────────────────────────────────────────────────────
  {
    id: "kit-building",
    numericId: 925,
    label: "Pacificon\nKit\nBuilding",
    type: "activity",
    x: X_BALL,
    y: Y_PATIO,
    width: 189,
    height: 248,
    fontSize: 13,
  },

  // ── LOWER VENDOR HALL (booths 21-26) ────────────────────────────────────
  {
    id: "np10",
    numericId: 210,
    label: "NP-10\nHornet",
    type: "nonprofit-table",
    x: X_NP_L,
    y: Y_LVH,
    width: 54,
    height: 67,
    fontSize: 7,
  },
  {
    id: "t14",
    numericId: 114,
    label: "T-14\nCompu\ndigital",
    type: "vendor-table",
    x: X_SORT,
    y: Y_LVH,
    width: TW,
    height: B,
    fontSize: 7,
  },
  {
    id: "b21",
    numericId: 21,
    label: "21\nConnect\nSystems",
    type: "vendor-booth",
    x: X_VH1,
    y: Y_LVH,
    width: B,
    height: B,
    fontSize: 7,
  },
  {
    id: "b22",
    numericId: 22,
    label: "22\nElecraft",
    type: "vendor-booth",
    x: X_VH2,
    y: Y_LVH,
    width: B,
    height: B,
    fontSize: 8,
  },
  {
    id: "b23",
    numericId: 23,
    label: "23\nElecraft",
    type: "vendor-booth",
    x: X_VH3,
    y: Y_LVH,
    width: B,
    height: B,
    fontSize: 8,
  },
  {
    id: "b24",
    numericId: 24,
    label: "24\nElecraft",
    type: "vendor-booth",
    x: X_VH4,
    y: Y_LVH,
    width: B,
    height: B,
    fontSize: 8,
  },
  {
    id: "b25",
    numericId: 25,
    label: "25\nElecraft",
    type: "vendor-booth",
    x: X_VH5,
    y: Y_LVH,
    width: B,
    height: B,
    fontSize: 8,
  },

  // Halibut Electronics — spans cols 4+5, rows 5+lower
  {
    id: "b26",
    numericId: 26,
    label: "26\nHalibut\nElectronics",
    type: "vendor-booth",
    x: X_VH4,
    y: Y_VH5,
    width: B * 2,
    height: B + (Y_LVH - Y_VH5),
    fontSize: 8,
  },

  // ── BISHOP RANCH BALLROOM ────────────────────────────────────────────────
  {
    id: "br-ballroom",
    numericId: 926,
    label: "Bishop Ranch Ballroom\nSalons E-H",
    type: "room",
    x: X_VH1,
    y: Y_BALL,
    width: B * 4,
    height: 389,
    fontSize: 14,
  },

  // T-tables alongside ballroom
  {
    id: "np11",
    numericId: 211,
    label: "NP-11\nParcelino\nMobile",
    type: "nonprofit-table",
    x: X_NP_L,
    y: Y_T15,
    width: 54,
    height: 76,
    fontSize: 7,
  },
  {
    id: "t15",
    numericId: 115,
    label: "T-15\nOpen\nSpace",
    type: "vendor-table",
    x: X_SORT,
    y: Y_T15,
    width: TW,
    height: 97,
    fontSize: 7,
  },
  {
    id: "t16",
    numericId: 116,
    label: "T-16\nBioenno\nPower",
    type: "vendor-table",
    x: X_SORT,
    y: Y_T16,
    width: TW,
    height: 81,
    fontSize: 7,
  },
  {
    id: "t17",
    numericId: 117,
    label: "T-17",
    type: "vendor-table",
    x: X_SORT,
    y: Y_T17,
    width: TW,
    height: 64,
    fontSize: 7,
  },
  {
    id: "t18",
    numericId: 118,
    label: "T-18",
    type: "vendor-table",
    x: X_SORT,
    y: Y_T18,
    width: TW,
    height: 64,
    fontSize: 7,
  },

  // ── W1AW / NP lower / RESTROOMS ─────────────────────────────────────────
  {
    id: "w1aw",
    numericId: 912,
    label: "W1AW/6\nSpecial Event\nStation",
    type: "activity",
    x: X_LOB,
    y: Y_W1AW,
    width: 286,
    height: 183,
    fontSize: 13,
  },
  {
    id: "np12",
    numericId: 212,
    label: "NP-12\nLARK",
    type: "nonprofit-table",
    x: X_NP_L,
    y: Y_NP12,
    width: 83,
    height: 47,
    fontSize: 7,
  },
  {
    id: "np13",
    numericId: 213,
    label: "NP-13\nSF Hab",
    type: "nonprofit-table",
    x: X_NP_L,
    y: Y_NP13,
    width: 83,
    height: 47,
    fontSize: 7,
  },
  {
    id: "np14",
    numericId: 214,
    label: "NP-14\nParcelino\nAmateur",
    type: "nonprofit-table",
    x: X_NP_L,
    y: Y_NP14,
    width: 83,
    height: 56,
    fontSize: 7,
  },
  {
    id: "restrooms",
    numericId: 913,
    label: "Restrooms",
    type: "service",
    x: X_LOB,
    y: Y_REST,
    width: 286,
    height: 110,
    fontSize: 12,
  },

  // ── BOTTOM ROOMS ─────────────────────────────────────────────────────────
  {
    id: "np15",
    numericId: 215,
    label: "NP-15\nDATV",
    type: "nonprofit-table",
    x: X_NP_L,
    y: Y_BOT,
    width: 83,
    height: 125,
    fontSize: 7,
  },
  {
    id: "sr-boardroom",
    numericId: 927,
    label: "San Ramon\nBoardroom",
    type: "room",
    x: X_NP_L + 83,
    y: Y_BOT,
    width: 234,
    height: 125,
    fontSize: 10,
  },
  {
    id: "pleasanton",
    numericId: 928,
    label: "Pleasanton/Danville",
    type: "room",
    x: X_NP_L + 317,
    y: Y_BOT,
    width: 194,
    height: 125,
    fontSize: 11,
  },
];

// ── Emergency exits [cx, cy] ──────────────────────────────────────────────
export const EMERGENCY_EXITS: [number, number][] = [
  [X_BALL + 229, Y_TOP + 8], // top-right of CC ballroom
  [X_SORT - 2, Y_NP5 + 6], // sorting board left
  [X_WIRE, Y_WIRE - 10], // wired comm left end
  [X_VH5 + B, Y_VH1 + B], // right wall, row 2
  [X_VH5 + B, Y_VH4 + 5], // right wall, row 4
  [X_VH5 + B, Y_LVH + 40], // lower vendor hall right
  [X_VH5 + B, Y_REST + 55], // right side, restroom level
];

// ── Entrance arrows ───────────────────────────────────────────────────────
export const ENTRANCES: {
  x: number;
  y: number;
  dir: "right" | "down" | "left" | "up";
}[] = [
  { x: X_CC - 4, y: Y_NP5 + 25, dir: "right" }, // Contra Costa Hallway
  { x: X_VH2 + B / 2, y: Y_VH1 - 4, dir: "down" }, // Bishop Ranch top
  { x: X_VH2 + B / 2, y: Y_LVH - 4, dir: "down" }, // Bishop Ranch lower
];

// ─────────────────────────────────────────────────────────────────────────────
// SVG overlay data — structured booth definitions.
// Extracted from the paths and text labels that were removed from
// pacificon-no-booths.svg compared to pacificon-template.svg.
// These are rendered programmatically on top of the base SVG.
// All coordinates are in the SVG viewBox space (0 0 27940 43180).
// ─────────────────────────────────────────────────────────────────────────────

export const SVG_VIEWBOX_WIDTH  = 27940;
export const SVG_VIEWBOX_HEIGHT = 43180;

/** URL of the base floor-plan SVG (walls, rooms, legend, doors). */
export const SVG_MAP_URL = "/assets/maps/pacificon-no-booths.svg";

// ─────────────────────────────────────────────────────────────────────────────
// SVG fill colours keyed by BoothType (original RGB values from the SVG file).
// ─────────────────────────────────────────────────────────────────────────────
const SVG_FILL_COLOR: Partial<Record<BoothType, string>> = {
  "vendor-booth":    "rgb(119,207,244)",
  "vendor-table":    "rgb(255,192,0)",
  "nonprofit-table": "rgb(255,255,0)",
  activity:          "rgb(122,187,51)",
};

/**
 * One entry per physical booth / table / activity area that has a coloured
 * fill rectangle rendered on top of the base SVG.
 *
 * svgX/Y/W/H — rectangle position in the SVG viewBox coordinate system.
 * label*     — default booth label text and its SVG-space position/style.
 * secondaryLabel* — optional additional label (e.g. exhibitor name already
 *                   hard-coded into the map, like "DATV" on NP-15).
 * exhibitorId — when set, the assigned exhibitor's name is rendered as an
 *               overlay centred inside the booth rectangle(s).
 */
export interface PacificonMapBooth {
  /** Numeric id (matches BOOTHS numericId and mapBooths id scheme). */
  id: number;
  /** Determines fill colour and legend category. */
  type: BoothType;
  /** SVG-space rectangle coordinates. */
  svgX: number;
  svgY: number;
  svgW: number;
  svgH: number;
  /** Default booth label text (e.g. "1", "NP-5", "T-3", "Security"). */
  label?: string;
  /** SVG-space label anchor position. */
  labelX?: number;
  labelY?: number;
  /** CSS font-size string (e.g. "423px"). */
  labelFontSize?: string;
  /** CSS font-weight string (e.g. "700"). */
  labelFontWeight?: string;
  /** SVG textLength attribute value (null = no textLength). */
  labelTextLength?: number | null;
  /** SVG transform string for the label (e.g. "rotate(90 x y)"). */
  labelTransform?: string;
  /** Optional hard-coded secondary label (used for pre-assigned exhibitor names). */
  secondaryLabel?: string;
  secondaryLabelX?: number;
  secondaryLabelY?: number;
  secondaryLabelFontSize?: string;
  secondaryLabelFontWeight?: string;
  secondaryLabelTextLength?: number | null;
  secondaryLabelTransform?: string;
  /**
   * When set, identifies the exhibitor assigned to this booth.
   * The component will render their name as a dynamic overlay.
   */
  exhibitorId?: string;
}

/**
 * Text-only labels that appear on the map without a coloured fill rectangle.
 * Used for hallway / area labels (e.g. "Bishop Ranch Ballroom Patio").
 */
export interface SvgHallwayLabel {
  text: string;
  x: number;
  y: number;
  fontSize: string;
  fontWeight: string;
  textLength: number | null;
  transform?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// All 80 booth / table / activity locations with their SVG coordinates and
// label data.  Sorted roughly top-to-bottom, left-to-right by map region:
//   CC Contra Costa Vendor Hall (ids 31-44)
//   T-tables (ids 101-118)
//   NP-tables (ids 201-218)
//   Bishop Ranch Vendor Hall booths (ids 1-29)
//   Activity / security (id 901)
//
// Each entry is kept on one line to keep the table compact; use the field
// names in PacificonMapBooth above as a reference for each positional value.
// To change the type, colour, or default label of any location edit only the
// 'type' and/or 'label' field of the corresponding entry.
// ─────────────────────────────────────────────────────────────────────────────
export const PACIFICON_MAP_BOOTHS: PacificonMapBooth[] = [
{ id: 41, type: 'vendor-booth', svgX: 5814, svgY: 5338, svgW: 1459, svgH: 1053, label: '41', labelX: 6308, labelY: 6788, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 42, type: 'vendor-booth', svgX: 7269, svgY: 5338, svgW: 1459, svgH: 1053, label: '42', labelX: 7764, labelY: 6788, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 43, type: 'vendor-booth', svgX: 9406, svgY: 5338, svgW: 1459, svgH: 1053, label: '43', labelX: 9900, labelY: 6788, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 44, type: 'vendor-booth', svgX: 10861, svgY: 5338, svgW: 1459, svgH: 1053, label: '44', labelX: 11355, labelY: 6788, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 33, type: 'vendor-booth', svgX: 3348, svgY: 6845, svgW: 1053, svgH: 1451, label: '33', labelX: 4428, labelY: 7765, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 37, type: 'vendor-booth', svgX: 5993, svgY: 7699, svgW: 1459, svgH: 1053, label: '37', labelX: 6487, labelY: 7728, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 38, type: 'vendor-booth', svgX: 7448, svgY: 7699, svgW: 1459, svgH: 1053, label: '38', labelX: 7942, labelY: 7728, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 39, type: 'vendor-booth', svgX: 8903, svgY: 7699, svgW: 1459, svgH: 1053, label: '39', labelX: 9398, labelY: 7728, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 40, type: 'vendor-booth', svgX: 10358, svgY: 7699, svgW: 1459, svgH: 1053, label: '40', labelX: 10853, labelY: 7728, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 32, type: 'vendor-booth', svgX: 3348, svgY: 8293, svgW: 1053, svgH: 1451, label: '32', labelX: 4428, labelY: 9214, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 34, type: 'vendor-booth', svgX: 5988, svgY: 8756, svgW: 1459, svgH: 1053, label: '34', labelX: 6482, labelY: 10220, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 35, type: 'vendor-booth', svgX: 7443, svgY: 8756, svgW: 1459, svgH: 1053, label: '35', labelX: 7937, labelY: 10220, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 36, type: 'vendor-booth', svgX: 9406, svgY: 8751, svgW: 1459, svgH: 1053, label: '36', labelX: 9900, labelY: 10220, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 31, type: 'vendor-booth', svgX: 3348, svgY: 9735, svgW: 1053, svgH: 1451, label: '31', labelX: 4428, labelY: 10655, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 102, type: 'vendor-table', svgX: 16426, svgY: 11343, svgW: 1152, svgH: 676, label: 'T-2', labelX: 16747, labelY: 12350, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508 },
  { id: 103, type: 'vendor-table', svgX: 17570, svgY: 11343, svgW: 1152, svgH: 676, label: 'T-3', labelX: 17891, labelY: 12350, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508 },
  { id: 104, type: 'vendor-table', svgX: 18721, svgY: 11343, svgW: 1152, svgH: 676, label: 'T-4', labelX: 19042, labelY: 12350, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508 },
  { id: 105, type: 'vendor-table', svgX: 19872, svgY: 11343, svgW: 1152, svgH: 676, label: 'T-5', labelX: 20193, labelY: 12350, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508 },
  { id: 106, type: 'vendor-table', svgX: 21016, svgY: 11343, svgW: 1152, svgH: 676, label: 'T-6', labelX: 21337, labelY: 12350, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508 },
  { id: 107, type: 'vendor-table', svgX: 22180, svgY: 11343, svgW: 1152, svgH: 676, label: 'T-7', labelX: 22502, labelY: 12350, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508 },
  { id: 108, type: 'vendor-table', svgX: 23338, svgY: 11343, svgW: 1152, svgH: 676, label: 'T-8', labelX: 23659, labelY: 12350, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508 },
  { id: 109, type: 'vendor-table', svgX: 24502, svgY: 11343, svgW: 1152, svgH: 676, label: 'T-9', labelX: 24823, labelY: 12350, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508 },
  { id: 101, type: 'vendor-table', svgX: 13618, svgY: 11363, svgW: 1182, svgH: 1648, label: 'T-1', labelX: 14801, labelY: 11932, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 508, labelTransform: 'rotate(90 14801 11932)' },
  { id: 216, type: 'nonprofit-table', svgX: 7960, svgY: 10378, svgW: 1410, svgH: 803, label: 'NP-16', labelX: 8166, labelY: 10940, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 996 },
  { id: 217, type: 'nonprofit-table', svgX: 9388, svgY: 10378, svgW: 1459, svgH: 803, label: 'NP-17', labelX: 9619, labelY: 10940, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 996 },
  { id: 218, type: 'nonprofit-table', svgX: 10839, svgY: 10378, svgW: 1459, svgH: 803, label: 'NP-18', labelX: 11070, labelY: 10940, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 996 },
  { id: 205, type: 'nonprofit-table', svgX: 7371, svgY: 11354, svgW: 1152, svgH: 646, label: 'NP-5', labelX: 6514, labelY: 11986, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801 },
  { id: 206, type: 'nonprofit-table', svgX: 8548, svgY: 11354, svgW: 1152, svgH: 646, label: 'NP-6', labelX: 8939, labelY: 12375, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801 },
  { id: 207, type: 'nonprofit-table', svgX: 9851, svgY: 11354, svgW: 1152, svgH: 646, label: 'NP-7', labelX: 10163, labelY: 12375, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801 },
  { id: 208, type: 'nonprofit-table', svgX: 11134, svgY: 11354, svgW: 1152, svgH: 646, label: 'NP-8', labelX: 11389, labelY: 12375, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801 },
  { id: 209, type: 'nonprofit-table', svgX: 12711, svgY: 11583, svgW: 646, svgH: 1152, label: 'NP-9', labelX: 12344, labelY: 11759, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801, labelTransform: 'rotate(90 12344 11759)' },
  { id: 201, type: 'nonprofit-table', svgX: 3805, svgY: 12315, svgW: 1152, svgH: 646, label: 'NP-1', labelX: 3981, labelY: 13451, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801 },
  { id: 202, type: 'nonprofit-table', svgX: 5088, svgY: 12315, svgW: 1152, svgH: 646, label: 'NP-2', labelX: 5264, labelY: 13451, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801 },
  { id: 203, type: 'nonprofit-table', svgX: 6391, svgY: 12315, svgW: 1152, svgH: 646, label: 'NP-3', labelX: 6567, labelY: 13451, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801 },
  { id: 204, type: 'nonprofit-table', svgX: 7675, svgY: 12315, svgW: 1152, svgH: 646, label: 'NP-4', labelX: 7850, labelY: 13451, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 801 },
  { id: 1, type: 'vendor-booth', svgX: 18860, svgY: 14627, svgW: 1053, svgH: 1459, label: '1', labelX: 18556, labelY: 15552, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 2, type: 'vendor-booth', svgX: 18860, svgY: 16075, svgW: 1053, svgH: 1459, label: '2', labelX: 18556, labelY: 17000, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 3, type: 'vendor-booth', svgX: 18860, svgY: 17524, svgW: 1053, svgH: 1459, label: '3', labelX: 18556, labelY: 18455, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 4, type: 'vendor-booth', svgX: 18860, svgY: 18986, svgW: 1053, svgH: 1459, label: '4', labelX: 18556, labelY: 19910, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 5, type: 'vendor-booth', svgX: 18860, svgY: 20435, svgW: 1053, svgH: 1459, label: '5', labelX: 18556, labelY: 21359, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 6, type: 'vendor-booth', svgX: 19938, svgY: 14627, svgW: 1053, svgH: 1459, label: '6', labelX: 21116, labelY: 15552, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 7, type: 'vendor-booth', svgX: 19938, svgY: 16075, svgW: 1053, svgH: 1459, label: '7', labelX: 21116, labelY: 17000, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 8, type: 'vendor-booth', svgX: 19938, svgY: 17524, svgW: 1053, svgH: 1459, label: '8', labelX: 21116, labelY: 18455, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 9, type: 'vendor-booth', svgX: 19938, svgY: 18986, svgW: 1053, svgH: 1459, label: '9', labelX: 21116, labelY: 19910, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 235 },
  { id: 10, type: 'vendor-booth', svgX: 19938, svgY: 20435, svgW: 1053, svgH: 1459, label: '10', labelX: 20998, labelY: 21359, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 110, type: 'vendor-table', svgX: 16194, svgY: 14501, svgW: 1053, svgH: 1459, label: 'T-10', labelX: 15833, labelY: 14880, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 703, labelTransform: 'rotate(90 15833 14880)' },
  { id: 112, type: 'vendor-table', svgX: 14349, svgY: 16929, svgW: 1053, svgH: 1459, label: 'T-12', labelX: 15408, labelY: 17307, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 703, labelTransform: 'rotate(90 15408 17307)' },
  { id: 111, type: 'vendor-table', svgX: 16194, svgY: 17332, svgW: 1053, svgH: 1459, label: 'T-11', labelX: 15833, labelY: 17720, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 684, labelTransform: 'rotate(90 15833 17720)' },
  { id: 11, type: 'vendor-booth', svgX: 22280, svgY: 14627, svgW: 1053, svgH: 1459, label: '11', labelX: 21842, labelY: 15552, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 448 },
  { id: 12, type: 'vendor-booth', svgX: 22280, svgY: 16075, svgW: 1053, svgH: 1459, label: '12', labelX: 21831, labelY: 17000, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 13, type: 'vendor-booth', svgX: 22280, svgY: 17524, svgW: 1053, svgH: 1459, label: '13', labelX: 21831, labelY: 18449, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 14, type: 'vendor-booth', svgX: 22280, svgY: 18986, svgW: 1053, svgH: 1459, label: '14', labelX: 21831, labelY: 19910, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 15, type: 'vendor-booth', svgX: 22280, svgY: 20435, svgW: 1053, svgH: 1459, label: '15', labelX: 21831, labelY: 21359, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 113, type: 'vendor-table', svgX: 16194, svgY: 20329, svgW: 1053, svgH: 1459, label: 'T-13', labelX: 15833, labelY: 20707, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 703, labelTransform: 'rotate(90 15833 20707)' },
  { id: 16, type: 'vendor-booth', svgX: 23358, svgY: 14627, svgW: 1053, svgH: 1459, label: '16', labelX: 24431, labelY: 15552, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 17, type: 'vendor-booth', svgX: 23358, svgY: 16075, svgW: 1053, svgH: 1459, label: '17', labelX: 24431, labelY: 17000, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 18, type: 'vendor-booth', svgX: 23358, svgY: 17524, svgW: 1053, svgH: 1459, label: '18', labelX: 24431, labelY: 18449, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 19, type: 'vendor-booth', svgX: 23358, svgY: 18986, svgW: 1053, svgH: 1459, label: '19', labelX: 24431, labelY: 19910, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 20, type: 'vendor-booth', svgX: 23358, svgY: 20435, svgW: 1053, svgH: 1459, label: '20', labelX: 24431, labelY: 21359, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 29, type: 'vendor-booth', svgX: 25660, svgY: 13840, svgW: 1053, svgH: 1459, label: '29', labelX: 25185, labelY: 14764, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 28, type: 'vendor-booth', svgX: 25660, svgY: 17365, svgW: 1053, svgH: 1459, label: '28', labelX: 25185, labelY: 18290, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 27, type: 'vendor-booth', svgX: 25660, svgY: 20348, svgW: 1053, svgH: 1459, label: '27', labelX: 25185, labelY: 21273, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 26, type: 'vendor-booth', svgX: 25660, svgY: 21804, svgW: 1053, svgH: 1459, label: '26', labelX: 25185, labelY: 22728, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 114, type: 'vendor-table', svgX: 16194, svgY: 23510, svgW: 1053, svgH: 1459, label: 'T-14', labelX: 15833, labelY: 23889, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 703, labelTransform: 'rotate(90 15833 23889)' },
  { id: 21, type: 'vendor-booth', svgX: 18390, svgY: 23269, svgW: 1459, svgH: 1053, label: '21', labelX: 18885, labelY: 23298, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 22, type: 'vendor-booth', svgX: 19839, svgY: 23269, svgW: 1459, svgH: 1053, label: '22', labelX: 20333, labelY: 23298, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 23, type: 'vendor-booth', svgX: 21301, svgY: 23269, svgW: 1459, svgH: 1053, label: '23', labelX: 21795, labelY: 23298, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 24, type: 'vendor-booth', svgX: 22749, svgY: 23269, svgW: 1459, svgH: 1053, label: '24', labelX: 23243, labelY: 23298, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 25, type: 'vendor-booth', svgX: 24198, svgY: 23269, svgW: 1459, svgH: 1053, label: '25', labelX: 24692, labelY: 23298, labelFontSize: '423px', labelFontWeight: '700', labelTextLength: 471 },
  { id: 210, type: 'nonprofit-table', svgX: 14428, svgY: 23070, svgW: 646, svgH: 1152, label: 'NP-10', labelX: 15071, labelY: 23148, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 996, labelTransform: 'rotate(90 15071 23148)' },
  { id: 115, type: 'vendor-table', svgX: 16384, svgY: 27072, svgW: 1053, svgH: 1459, label: 'T-15', labelX: 15833, labelY: 27450, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 703, labelTransform: 'rotate(90 15833 27450)' },
  { id: 211, type: 'nonprofit-table', svgX: 14428, svgY: 26100, svgW: 646, svgH: 1152, label: 'NP-11', labelX: 15104, labelY: 26187, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 977, labelTransform: 'rotate(90 15104 26187)' },
  { id: 116, type: 'vendor-booth', svgX: 16194, svgY: 29926, svgW: 1053, svgH: 1459, label: 'T-16', labelX: 15833, labelY: 30305, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 703, labelTransform: 'rotate(90 15833 30305)' },
  { id: 117, type: 'vendor-table', svgX: 14336, svgY: 31474, svgW: 1053, svgH: 1459, label: 'T-17', labelX: 15388, labelY: 31853, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 703, labelTransform: 'rotate(90 15388 31853)' },
  { id: 212, type: 'nonprofit-table', svgX: 14428, svgY: 32933, svgW: 646, svgH: 1152, label: 'NP-12', labelX: 15097, labelY: 33010, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 996, labelTransform: 'rotate(90 15097 33010)' },
  { id: 118, type: 'vendor-table', svgX: 16194, svgY: 32870, svgW: 1053, svgH: 1459, label: 'T-18', labelX: 15833, labelY: 33248, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 703, labelTransform: 'rotate(90 15833 33248)' },
  { id: 213, type: 'nonprofit-table', svgX: 14428, svgY: 34097, svgW: 646, svgH: 1152, label: 'NP-13', labelX: 15124, labelY: 34174, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 996, labelTransform: 'rotate(90 15124 34174)' },
  { id: 214, type: 'nonprofit-table', svgX: 14428, svgY: 35243, svgW: 646, svgH: 1152, label: 'NP-14', labelX: 15155, labelY: 35305, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 996, labelTransform: 'rotate(90 15155 35305)' },
  { id: 215, type: 'nonprofit-table', svgX: 16598, svgY: 37040, svgW: 646, svgH: 1152, label: 'NP-15', labelX: 16208, labelY: 37118, labelFontSize: '353px', labelFontWeight: '700', labelTextLength: 996, labelTransform: 'rotate(90 16208 37118)', secondaryLabel: 'DATV', secondaryLabelX: 16837, secondaryLabelY: 37224, secondaryLabelFontSize: '282px', secondaryLabelFontWeight: '700', secondaryLabelTextLength: 783, secondaryLabelTransform: 'rotate(90 16837 37224)' },
  { id: 901, type: 'activity', svgX: 14421, svgY: 20216, svgW: 309, svgH: 1149, label: 'Security', labelX: 14445, labelY: 20231, labelFontSize: '282px', labelFontWeight: '700', labelTextLength: 1119, labelTransform: 'rotate(90 14445 20231)' },
];

/** Returns the SVG fill colour string for a given booth type. */
export function svgFillColor(type: BoothType): string {
  return SVG_FILL_COLOR[type] ?? "rgb(200,200,200)";
}

// ─────────────────────────────────────────────────────────────────────────────
// Text-only area / hallway labels (no coloured fill rectangle).
// ─────────────────────────────────────────────────────────────────────────────
export const HALLWAY_LABELS: SvgHallwayLabel[] = [
  {
    text: "Bishop Ranch Ballroom Patio",
    x: 12568,
    y: 21226,
    fontSize: "353px",
    fontWeight: "700",
    textLength: 4939,
    transform: "rotate(90 12568 21226)",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// mapBooths — Booth[] in conference.ts format, keyed by the SVG map URL.
// Provides the interactive polygon overlays for this SVG exhibitor map.
// ─────────────────────────────────────────────────────────────────────────────
import type { Booth, Exhibitor } from "@/types/conference";

export const svgMapBooths: [string, Booth[]] = [
  SVG_MAP_URL,
  PACIFICON_MAP_BOOTHS.map((b) => ({
    id: b.id,
    coords: [
      [b.svgX, b.svgY],
      [b.svgX + b.svgW, b.svgY],
      [b.svgX + b.svgW, b.svgY + b.svgH],
      [b.svgX, b.svgY + b.svgH],
    ] as [number, number][],
    locationZone: locationZoneForId(b.id),
    label: b.label,
  })),
];

/** Derive a human-readable location zone from the booth numeric id. */
function locationZoneForId(id: number): string {
  if (id >= 1 && id <= 29) return "Bishop Ranch Vendor Hall";
  if (id >= 31 && id <= 44) return "Contra Costa Vendor Hall";
  if (id >= 101 && id <= 118) return "Vendor Tables";
  if (id >= 201 && id <= 219) return "Non-Profit Tables";
  if (id === 901) return "Event Security";
  return "Other";
}

// ─────────────────────────────────────────────────────────────────────────────
// mapExhibitors — Exhibitor[] in conference.ts format, keyed by SVG map URL.
// Initial assignments: ARRL at booths 4 & 5, DATV at NP-15 (id 215).
// ─────────────────────────────────────────────────────────────────────────────
export const svgMapExhibitors: [string, Exhibitor[]] = [
  SVG_MAP_URL,
  [
    {
      id: "arrl",
      name: "ARRL",
      description: "American Radio Relay League",
      boothName: "4  5",
      location: [4, 5],
      type: "vendor-booth",
      color: "#77cff4",
      url: "https://www.arrl.org",
    },
    {
      id: "datv",
      name: "DATV",
      description: "Digital Amateur TV",
      boothName: "NP-15",
      location: [215],
      type: "nonprofit-table",
      color: "#FFFF00",
      url: "",
    },
  ],
];
