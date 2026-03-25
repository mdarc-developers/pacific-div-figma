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

export interface Booth {
  id: string;
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

export const BOOTHS: Booth[] = [
  // ── SERVICE STRIPS ──────────────────────────────────────────────────────
  {
    id: "registration",
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
    label: "2",
    type: "vendor-booth",
    x: X_VH1,
    y: Y_VH2,
    width: B,
    height: B,
  },
  {
    id: "b3",
    label: "3",
    type: "vendor-booth",
    x: X_VH1,
    y: Y_VH3,
    width: B,
    height: B,
  },
  {
    id: "b4",
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
    label: "8",
    type: "vendor-booth",
    x: X_VH2,
    y: Y_VH3,
    width: B,
    height: B,
  },
  {
    id: "b9",
    label: "9",
    type: "vendor-booth",
    x: X_VH2,
    y: Y_VH4,
    width: B,
    height: B,
  },
  {
    id: "b10",
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
    label: "11",
    type: "vendor-booth",
    x: X_VH3,
    y: Y_VH1,
    width: B,
    height: B,
  },
  {
    id: "b12",
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
    label: "13",
    type: "vendor-booth",
    x: X_VH3,
    y: Y_VH3,
    width: B,
    height: B,
  },
  {
    id: "b14",
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
// SVG overlay data: paths and text labels that were removed from
// pacificon-no-booths.svg compared to pacificon-template.svg.
// These are rendered programmatically on top of the base SVG.
// All coordinates are in the SVG viewBox space (0 0 27940 43180).
// ─────────────────────────────────────────────────────────────────────────────

export const SVG_VIEWBOX_WIDTH  = 27940;
export const SVG_VIEWBOX_HEIGHT = 43180;

export interface SvgTablePath {
  fill:        string;
  stroke:      string;
  strokeWidth?: number;
  d:           string;
}

export interface SvgTableText {
  x:          number;
  y:          number;
  fontSize:   string;
  fontWeight: string;
  fill:       string;
  textLength: number | null;
  content:    string;
  transform?: string;
}

/** Colored fill and outline paths removed from the no-booths SVG */
export const TABLE_PATHS: SvgTablePath[] = [
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 17437,27072 L 16384,27072 16384,28531 17437,28531 17437,27072 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 17437,27072 L 16384,27072 16384,28531 17437,28531 17437,27072 Z' },
  { fill: 'rgb(122,187,51)', stroke: 'none', d: 'M 14421,20216 L 14421,21365 14730,21365 14730,20216 14421,20216 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 14421,20216 L 14421,21365 14730,21365 14730,20216 14421,20216 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 5988,8756 L 5988,9809 7447,9809 7447,8756 5988,8756 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 5988,8756 L 5988,9809 7447,9809 7447,8756 5988,8756 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 7443,8756 L 7443,9809 8902,9809 8902,8756 7443,8756 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 7443,8756 L 7443,9809 8902,9809 8902,8756 7443,8756 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 19913,14627 L 18860,14627 18860,16086 19913,16086 19913,14627 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 19913,14627 L 18860,14627 18860,16086 19913,16086 19913,14627 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 19913,16075 L 18860,16075 18860,17534 19913,17534 19913,16075 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 19913,16075 L 18860,16075 18860,17534 19913,17534 19913,16075 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 19913,17524 L 18860,17524 18860,18983 19913,18983 19913,17524 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 19913,17524 L 18860,17524 18860,18983 19913,18983 19913,17524 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 19913,18986 L 18860,18986 18860,20445 19913,20445 19913,18986 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 19913,18986 L 18860,18986 18860,20445 19913,20445 19913,18986 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 19913,20435 L 18860,20435 18860,21894 19913,21894 19913,20435 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 19913,20435 L 18860,20435 18860,21894 19913,21894 19913,20435 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 20991,14627 L 19938,14627 19938,16086 20991,16086 20991,14627 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 20991,14627 L 19938,14627 19938,16086 20991,16086 20991,14627 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 20991,16075 L 19938,16075 19938,17534 20991,17534 20991,16075 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 20991,16075 L 19938,16075 19938,17534 20991,17534 20991,16075 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 20991,17524 L 19938,17524 19938,18983 20991,18983 20991,17524 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 20991,17524 L 19938,17524 19938,18983 20991,18983 20991,17524 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 20991,18986 L 19938,18986 19938,20445 20991,20445 20991,18986 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 20991,18986 L 19938,18986 19938,20445 20991,20445 20991,18986 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 20991,20435 L 19938,20435 19938,21894 20991,21894 20991,20435 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 20991,20435 L 19938,20435 19938,21894 20991,21894 20991,20435 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 23333,14627 L 22280,14627 22280,16086 23333,16086 23333,14627 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 23333,14627 L 22280,14627 22280,16086 23333,16086 23333,14627 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 23333,16075 L 22280,16075 22280,17534 23333,17534 23333,16075 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 23333,16075 L 22280,16075 22280,17534 23333,17534 23333,16075 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 23333,17524 L 22280,17524 22280,18983 23333,18983 23333,17524 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 23333,17524 L 22280,17524 22280,18983 23333,18983 23333,17524 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 23333,18986 L 22280,18986 22280,20445 23333,20445 23333,18986 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 23333,18986 L 22280,18986 22280,20445 23333,20445 23333,18986 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 23333,20435 L 22280,20435 22280,21894 23333,21894 23333,20435 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 23333,20435 L 22280,20435 22280,21894 23333,21894 23333,20435 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 24411,14627 L 23358,14627 23358,16086 24411,16086 24411,14627 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 24411,14627 L 23358,14627 23358,16086 24411,16086 24411,14627 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 24411,16075 L 23358,16075 23358,17534 24411,17534 24411,16075 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 24411,16075 L 23358,16075 23358,17534 24411,17534 24411,16075 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 24411,17524 L 23358,17524 23358,18983 24411,18983 24411,17524 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 24411,17524 L 23358,17524 23358,18983 24411,18983 24411,17524 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 24411,18986 L 23358,18986 23358,20445 24411,20445 24411,18986 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 24411,18986 L 23358,18986 23358,20445 24411,20445 24411,18986 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 24411,20435 L 23358,20435 23358,21894 24411,21894 24411,20435 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 24411,20435 L 23358,20435 23358,21894 24411,21894 24411,20435 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 25657,24322 L 25657,23269 24198,23269 24198,24322 25657,24322 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 25657,24322 L 25657,23269 24198,23269 24198,24322 25657,24322 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 24208,24322 L 24208,23269 22749,23269 22749,24322 24208,24322 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 24208,24322 L 24208,23269 22749,23269 22749,24322 24208,24322 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 22760,24322 L 22760,23269 21301,23269 21301,24322 22760,24322 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 22760,24322 L 22760,23269 21301,23269 21301,24322 22760,24322 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 21298,24322 L 21298,23269 19839,23269 19839,24322 21298,24322 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 21298,24322 L 21298,23269 19839,23269 19839,24322 21298,24322 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 19849,24322 L 19849,23269 18390,23269 18390,24322 19849,24322 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 19849,24322 L 19849,23269 18390,23269 18390,24322 19849,24322 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 26713,20348 L 25660,20348 25660,21807 26713,21807 26713,20348 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 26713,20348 L 25660,20348 25660,21807 26713,21807 26713,20348 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 26713,21804 L 25660,21804 25660,23263 26713,23263 26713,21804 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 26713,21804 L 25660,21804 25660,23263 26713,23263 26713,21804 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 26713,17365 L 25660,17365 25660,18824 26713,18824 26713,17365 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 26713,17365 L 25660,17365 25660,18824 26713,18824 26713,17365 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 26713,13840 L 25660,13840 25660,15299 26713,15299 26713,13840 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 26713,13840 L 25660,13840 25660,15299 26713,15299 26713,13840 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 3805,12961 L 4957,12961 4957,12315 3805,12315 3805,12961 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 3805,12961 L 4957,12961 4957,12315 3805,12315 3805,12961 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 5088,12961 L 6240,12961 6240,12315 5088,12315 5088,12961 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 5088,12961 L 6240,12961 6240,12315 5088,12315 5088,12961 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 6391,12961 L 7543,12961 7543,12315 6391,12315 6391,12961 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 6391,12961 L 7543,12961 7543,12315 6391,12315 6391,12961 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 7675,12961 L 8827,12961 8827,12315 7675,12315 7675,12961 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 7675,12961 L 8827,12961 8827,12315 7675,12315 7675,12961 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 12711,11583 L 12711,12735 13357,12735 13357,11583 12711,11583 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 12711,11583 L 12711,12735 13357,12735 13357,11583 12711,11583 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 13618,13011 L 14800,13011 14800,11363 13618,11363 13618,13011 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 13618,13011 L 14800,13011 14800,11363 13618,11363 13618,13011 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 16426,12019 L 17578,12019 17578,11343 16426,11343 16426,12019 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 16426,12019 L 17578,12019 17578,11343 16426,11343 16426,12019 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 17570,12019 L 18722,12019 18722,11343 17570,11343 17570,12019 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 17570,12019 L 18722,12019 18722,11343 17570,11343 17570,12019 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 18721,12019 L 19873,12019 19873,11343 18721,11343 18721,12019 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 18721,12019 L 19873,12019 19873,11343 18721,11343 18721,12019 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 19872,12019 L 21024,12019 21024,11343 19872,11343 19872,12019 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 19872,12019 L 21024,12019 21024,11343 19872,11343 19872,12019 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 21016,12019 L 22168,12019 22168,11343 21016,11343 21016,12019 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 21016,12019 L 22168,12019 22168,11343 21016,11343 21016,12019 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 22180,12019 L 23332,12019 23332,11343 22180,11343 22180,12019 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 22180,12019 L 23332,12019 23332,11343 22180,11343 22180,12019 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 23338,12019 L 24490,12019 24490,11343 23338,11343 23338,12019 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 23338,12019 L 24490,12019 24490,11343 23338,11343 23338,12019 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 24502,12019 L 25654,12019 25654,11343 24502,11343 24502,12019 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 24502,12019 L 25654,12019 25654,11343 24502,11343 24502,12019 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 17247,14501 L 16194,14501 16194,15960 17247,15960 17247,14501 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 17247,14501 L 16194,14501 16194,15960 17247,15960 17247,14501 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 17247,17332 L 16194,17332 16194,18791 17247,18791 17247,17332 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 17247,17332 L 16194,17332 16194,18791 17247,18791 17247,17332 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 17247,20329 L 16194,20329 16194,21788 17247,21788 17247,20329 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 17247,20329 L 16194,20329 16194,21788 17247,21788 17247,20329 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 17247,23510 L 16194,23510 16194,24969 17247,24969 17247,23510 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 17247,23510 L 16194,23510 16194,24969 17247,24969 17247,23510 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 17247,29926 L 16194,29926 16194,31385 17247,31385 17247,29926 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 17247,29926 L 16194,29926 16194,31385 17247,31385 17247,29926 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 15389,31474 L 14336,31474 14336,32933 15389,32933 15389,31474 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 15389,31474 L 14336,31474 14336,32933 15389,32933 15389,31474 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 17247,32870 L 16194,32870 16194,34329 17247,34329 17247,32870 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 17247,32870 L 16194,32870 16194,34329 17247,34329 17247,32870 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 14428,23070 L 14428,24222 15074,24222 15074,23070 14428,23070 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 14428,23070 L 14428,24222 15074,24222 15074,23070 14428,23070 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 14428,26100 L 14428,27252 15074,27252 15074,26100 14428,26100 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 14428,26100 L 14428,27252 15074,27252 15074,26100 14428,26100 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 14428,32933 L 14428,34085 15074,34085 15074,32933 14428,32933 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 14428,32933 L 14428,34085 15074,34085 15074,32933 14428,32933 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 14428,34097 L 14428,35249 15074,35249 15074,34097 14428,34097 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 14428,34097 L 14428,35249 15074,35249 15074,34097 14428,34097 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 16598,37040 L 16598,38192 17244,38192 17244,37040 16598,37040 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 16598,37040 L 16598,38192 17244,38192 17244,37040 16598,37040 Z' },
  { fill: 'rgb(255,192,0)', stroke: 'none', d: 'M 15402,16929 L 14349,16929 14349,18388 15402,18388 15402,16929 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 15402,16929 L 14349,16929 14349,18388 15402,18388 15402,16929 Z' },

  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 3348,11186 L 4401,11186 4401,9735 3348,9735 3348,11186 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 3348,11186 L 4401,11186 4401,9735 3348,9735 3348,11186 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 8548,12000 L 9700,12000 9700,11354 8548,11354 8548,12000 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 8548,12000 L 9700,12000 9700,11354 8548,11354 8548,12000 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 9851,12000 L 11003,12000 11003,11354 9851,11354 9851,12000 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 9851,12000 L 11003,12000 11003,11354 9851,11354 9851,12000 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 11134,12000 L 12286,12000 12286,11354 11134,11354 11134,12000 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 11134,12000 L 12286,12000 12286,11354 11134,11354 11134,12000 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 7371,12000 L 8523,12000 8523,11354 7371,11354 7371,12000 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 7371,12000 L 8523,12000 8523,11354 7371,11354 7371,12000 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 10839,10378 L 10839,11181 12298,11181 12298,10378 10839,10378 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 10839,10378 L 10839,11181 12298,11181 12298,10378 10839,10378 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 9388,10378 L 9388,11181 10847,11181 10847,10378 9388,10378 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 9388,10378 L 9388,11181 10847,11181 10847,10378 9388,10378 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 7960,10378 L 7960,11181 9370,11181 9370,10378 7960,10378 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 7960,10378 L 7960,11181 9370,11181 9370,10378 7960,10378 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 3348,9744 L 4401,9744 4401,8293 3348,8293 3348,9744 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 3348,9744 L 4401,9744 4401,8293 3348,8293 3348,9744 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 3348,8296 L 4401,8296 4401,6845 3348,6845 3348,8296 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 3348,8296 L 4401,8296 4401,6845 3348,6845 3348,8296 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 5814,5338 L 5814,6391 7273,6391 7273,5338 5814,5338 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 5814,5338 L 5814,6391 7273,6391 7273,5338 5814,5338 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 7269,5338 L 7269,6391 8728,6391 8728,5338 7269,5338 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 7269,5338 L 7269,6391 8728,6391 8728,5338 7269,5338 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 9406,5338 L 9406,6391 10865,6391 10865,5338 9406,5338 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 9406,5338 L 9406,6391 10865,6391 10865,5338 9406,5338 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 10861,5338 L 10861,6391 12320,6391 12320,5338 10861,5338 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 10861,5338 L 10861,6391 12320,6391 12320,5338 10861,5338 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 5993,7699 L 5993,8752 7452,8752 7452,7699 5993,7699 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 5993,7699 L 5993,8752 7452,8752 7452,7699 5993,7699 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 7448,7699 L 7448,8752 8907,8752 8907,7699 7448,7699 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 7448,7699 L 7448,8752 8907,8752 8907,7699 7448,7699 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 9406,8751 L 9406,9804 10865,9804 10865,8751 9406,8751 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 9406,8751 L 9406,9804 10865,9804 10865,8751 9406,8751 Z' },
  { fill: 'rgb(255,255,0)', stroke: 'none', d: 'M 14428,35243 L 14428,36395 15074,36395 15074,35243 14428,35243 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 14428,35243 L 14428,36395 15074,36395 15074,35243 14428,35243 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 8903,7699 L 8903,8752 10362,8752 10362,7699 8903,7699 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 8903,7699 L 8903,8752 10362,8752 10362,7699 8903,7699 Z' },
  { fill: 'rgb(119,207,244)', stroke: 'none', d: 'M 10358,7699 L 10358,8752 11817,8752 11817,7699 10358,7699 Z' },
  { fill: 'none', stroke: 'rgb(0,0,0)', strokeWidth: 25, d: 'M 10358,7699 L 10358,8752 11817,8752 11817,7699 10358,7699 Z' },
];

/** Text labels removed from the no-booths SVG */
export const TABLE_TEXTS: SvgTableText[] = [
  { x: 14445, y: 20231, fontSize: '282px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 1119, content: 'Security', transform: 'rotate(90 14445 20231)' },
  { x: 18556, y: 17000, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '2' },
  { x: 18556, y: 19910, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '4' },
  { x: 18556, y: 21359, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '5' },
  { x: 21116, y: 15552, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '6' },
  { x: 6482, y: 10220, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '34' },
  { x: 7937, y: 10220, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '35' },
  { x: 8939, y: 12375, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-6' },
  { x: 10163, y: 12375, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-7' },
  { x: 11389, y: 12375, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-8' },
  { x: 12344, y: 11759, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-9', transform: 'rotate(90 12344 11759)' },
  { x: 3981, y: 13451, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-1' },
  { x: 5264, y: 13451, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-2' },
  { x: 6567, y: 13451, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-3' },
  { x: 7850, y: 13451, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-4' },
  { x: 6514, y: 11986, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 801, content: 'NP-5' },
  { x: 16747, y: 12350, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-2' },
  { x: 14801, y: 11932, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-1', transform: 'rotate(90 14801 11932)' },
  { x: 17891, y: 12350, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-3' },
  { x: 19042, y: 12350, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-4' },
  { x: 20193, y: 12350, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-5' },
  { x: 21337, y: 12350, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-6' },
  { x: 22502, y: 12350, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-7' },
  { x: 23659, y: 12350, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-8' },
  { x: 24823, y: 12350, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 508, content: 'T-9' },
  { x: 15833, y: 14880, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 703, content: 'T-10', transform: 'rotate(90 15833 14880)' },
  { x: 15833, y: 17720, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 684, content: 'T-11', transform: 'rotate(90 15833 17720)' },
  { x: 15408, y: 17307, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 703, content: 'T-12', transform: 'rotate(90 15408 17307)' },
  { x: 15833, y: 20707, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 703, content: 'T-13', transform: 'rotate(90 15833 20707)' },
  { x: 15833, y: 23889, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 703, content: 'T-14', transform: 'rotate(90 15833 23889)' },
  { x: 15833, y: 27450, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 703, content: 'T-15', transform: 'rotate(90 15833 27450)' },
  { x: 15833, y: 30305, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 703, content: 'T-16', transform: 'rotate(90 15833 30305)' },
  { x: 15071, y: 23148, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 996, content: 'NP-10', transform: 'rotate(90 15071 23148)' },
  { x: 15104, y: 26187, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 977, content: 'NP-11', transform: 'rotate(90 15104 26187)' },
  { x: 12568, y: 21226, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 4939, content: 'Bishop Ranch Ballroom Patio', transform: 'rotate(90 12568 21226)' },
  { x: 15097, y: 33010, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 996, content: 'NP-12', transform: 'rotate(90 15097 33010)' },
  { x: 15124, y: 34174, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 996, content: 'NP-13', transform: 'rotate(90 15124 34174)' },
  { x: 16208, y: 37118, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 996, content: 'NP-15', transform: 'rotate(90 16208 37118)' },
  { x: 15388, y: 31853, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 703, content: 'T-17', transform: 'rotate(90 15388 31853)' },
  { x: 16837, y: 37224, fontSize: '282px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 783, content: 'DATV', transform: 'rotate(90 16837 37224)' },
  { x: 15833, y: 33248, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 703, content: 'T-18', transform: 'rotate(90 15833 33248)' },
  { x: 18556, y: 18455, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '3' },
  { x: 18556, y: 15552, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '1' },
  { x: 21116, y: 17000, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '7' },
  { x: 21116, y: 18455, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '8' },
  { x: 21116, y: 19910, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 235, content: '9' },
  { x: 20998, y: 21359, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '10' },
  { x: 21842, y: 15552, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 448, content: '11' },
  { x: 21831, y: 17000, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '12' },
  { x: 21831, y: 18449, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '13' },
  { x: 21831, y: 19910, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '14' },
  { x: 21831, y: 21359, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '15' },
  { x: 24431, y: 15552, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '16' },
  { x: 24431, y: 17000, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '17' },
  { x: 24431, y: 18449, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '18' },
  { x: 24431, y: 19910, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '19' },
  { x: 24431, y: 21359, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '20' },
  { x: 18885, y: 23298, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '21' },
  { x: 20333, y: 23298, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '22' },
  { x: 21795, y: 23298, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '23' },
  { x: 23243, y: 23298, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '24' },
  { x: 24692, y: 23298, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '25' },
  { x: 25185, y: 22728, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '26' },
  { x: 25185, y: 21273, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '27' },
  { x: 25185, y: 18290, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '28' },
  { x: 25185, y: 14764, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '29' },
  { x: 15155, y: 35305, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 996, content: 'NP-14', transform: 'rotate(90 15155 35305)' },
  { x: 4428, y: 10655, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '31' },
  { x: 4428, y: 9214, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '32' },
  { x: 4428, y: 7765, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '33' },
  { x: 9900, y: 10220, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '36' },
  { x: 6487, y: 7728, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '37' },
  { x: 7942, y: 7728, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '38' },
  { x: 9398, y: 7728, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '39' },
  { x: 10853, y: 7728, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '40' },
  { x: 6308, y: 6788, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '41' },
  { x: 7764, y: 6788, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '42' },
  { x: 9900, y: 6788, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '43' },
  { x: 11355, y: 6788, fontSize: '423px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 471, content: '44' },
  { x: 8166, y: 10940, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 996, content: 'NP-16' },
  { x: 9619, y: 10940, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 996, content: 'NP-17' },
  { x: 11070, y: 10940, fontSize: '353px', fontWeight: '700', fill: 'rgb(0,0,0)', textLength: 996, content: 'NP-18' },
];
