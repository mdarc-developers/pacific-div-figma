// pacificonData.ts
// ─────────────────────────────────────────────────────────────────────────────
// ALL coordinates were derived by pixel-measuring the original 1280×1702 image,
// then scaling to a 1000×1633 SVG canvas at 0.6353 px/unit so ALL 5 booth
// columns fit (the original image was cropped and didn't show cols 4–5).
// ─────────────────────────────────────────────────────────────────────────────

export type BoothType =
  | "vendor-booth"      // Blue
  | "vendor-table"      // Orange
  | "nonprofit-table"   // Yellow
  | "activity"          // Dark green — lobby, kit building, W1AW
  | "room"              // Deep green — ballrooms
  | "hallway"           // Light gray — hallway labels, patio
  | "service";          // Medium gray — registration, restrooms

export interface Booth {
  id: string;
  label: string;        // \n for line breaks
  type: BoothType;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
}

export const COLORS: Record<BoothType, { fill: string; stroke: string; text: string }> = {
  "vendor-booth":    { fill: "#7EC8E3", stroke: "#2A7A9B", text: "#0D2B3E" },
  "vendor-table":    { fill: "#F5A623", stroke: "#C07800", text: "#3D2200" },
  "nonprofit-table": { fill: "#F5E030", stroke: "#B8A000", text: "#2D2700" },
  "activity":        { fill: "#4A8F3F", stroke: "#2A5C23", text: "#FFFFFF" },
  "room":            { fill: "#2D5C1E", stroke: "#1A3D10", text: "#FFFFFF" },
  "hallway":         { fill: "#D8D8D8", stroke: "#999999", text: "#333333" },
  "service":         { fill: "#888888", stroke: "#555555", text: "#FFFFFF" },
};

export const LEGEND_ITEMS: { type: BoothType; label: string }[] = [
  { type: "vendor-booth",    label: "Vendor Booth" },
  { type: "vendor-table",    label: "Vendor Table" },
  { type: "nonprofit-table", label: "Non-Profit Table" },
  { type: "activity",        label: "PACIFICON Activities Area" },
];

// Canvas — full content width (shows all 5 booth columns)
export const MAP_WIDTH  = 1280;  // just enough room for col5 right edge
export const MAP_HEIGHT = 1720;

// ── Shared sizes (all vendor hall booths are identical) ───────────────────
const B = 84.5;   // booth width & height
const TW = 40.0;  // T-table width (west-wall tables)

// ── Column x-anchors (measured from original, scaled) ────────────────────
const X_REG  =   9;   // registration/will-call strip
const X_LOB  =  47;   // lobby + prize booth left edge
const X_CC   = 107;   // contra costa content left
const X_SORT = 545;   // sorting board / T-10/11/13 left edge
const X_BALL = 481;   // CC ballroom / kit building left
const X_WIRE = 586;   // wired comm + T-1..9 + VH col 1
const X_VH1  = 586;   // vendor hall column 1
const X_VH2  = X_VH1 + B;
const X_VH3  = X_VH2 + B;
const X_VH4  = X_VH3 + B;
const X_VH5  = X_VH4 + B;    // col 5 (booths 20, 29, 28, 27)
const X_NP_L = 496;   // NP-10/11 and lower NP tables

// ── Row y-anchors (measured from original, scaled) ───────────────────────
const Y_TOP  =  62;   // very top of content
const Y_B33  =  90;   // booth 33/41 top
const Y_B37  = 177;   // booth 37/34/35/36 top
const Y_MDARC= 261;   // MDARC top
const Y_NP19 = 296;   // NP-19 top
const Y_NP16 = 261;   // NP-16/17/18 top (same as MDARC)
const Y_NP5  = 319;   // NP-5..9 top
const Y_NP1  = 371;   // NP-1..4 top
const Y_PATIO= 414;   // CC patio + kit building top
const Y_WIRE = 316;   // wired comm bar
const Y_T    = 352;   // T-1..9 row
const Y_BRH  = 386;   // Bishop Ranch Hallway / VH row 1 / T-10
const Y_VH1  = 386;   // vendor hall row 1
const Y_VH2  = Y_VH1 + B;
const Y_VH3  = Y_VH2 + B;
const Y_VH4  = Y_VH3 + B;
const Y_VH5  = Y_VH4 + B;
const Y_LVH  = 816;   // lower vendor hall (booths 21-26)
const Y_BALL = 901;   // bishop ranch ballroom
const Y_T15  = 901;
const Y_T16  = 999;
const Y_T17  = 1082;
const Y_T18  = 1147;
const Y_W1AW = 1212;
const Y_NP12 = 1212;
const Y_NP13 = 1261;
const Y_NP14 = 1309;
const Y_REST = 1396;
const Y_BOT  = 1509;  // bottom rooms (NP-15, boardrooms)

export const BOOTHS: Booth[] = [

  // ── SERVICE STRIPS ──────────────────────────────────────────────────────
  { id: "registration", label: "REGISTRATION",              type: "service",         x: X_REG, y: 178,     width: 38,   height: 248,  fontSize: 5.5 },
  { id: "will-call",    label: "WILL\nCALL",                type: "service",         x: X_REG, y: 426,     width: 38,   height: 60,   fontSize: 5.5 },

  // ── PRIZE BOOTH + LOBBY ─────────────────────────────────────────────────
  { id: "prize-booth",  label: "PACIFICON\nPRIZE\nBOOTH",  type: "activity",        x: X_LOB, y: Y_TOP,   width: 57,   height: 113,  fontSize: 6 },
  { id: "lobby",        label: "LOBBY",                    type: "activity",        x: X_LOB, y: 177,     width: 57,   height: 397,  fontSize: 14 },

  // ── CONTRA COSTA VENDOR HALL ────────────────────────────────────────────
  { id: "cc-hall-hdr",  label: "Contra Costa\nVendor Hall",type: "hallway",         x: X_CC,  y: Y_TOP,   width: 446,  height: 27,   fontSize: 9 },

  // Booths 33, 41
  { id: "b33",  label: "33\nFree TV",                      type: "vendor-booth",    x: X_CC,        y: Y_B33, width: 84.5, height: 84.5, fontSize: 8 },
  { id: "b41",  label: "41\nLoderma\nthe Potter",          type: "vendor-booth",    x: X_CC + 84.5, y: Y_B33, width: 136,  height: 84.5, fontSize: 8 },

  // Booths 37, 34, 35, 36
  { id: "b37",  label: "37",                               type: "vendor-booth",    x: X_CC,        y: Y_B37, width: 84.5, height: 82.5, fontSize: 9 },
  { id: "b34",  label: "34\nLong Island\nCW Club",         type: "vendor-booth",    x: X_CC + 84.5, y: Y_B37, width: 137,  height: 82.5, fontSize: 8 },
  { id: "b35",  label: "35",                               type: "vendor-booth",    x: X_CC + 222,  y: Y_B37, width: 82.5, height: 82.5, fontSize: 9 },
  { id: "b36",  label: "36\nAI6VM\nRadio",                 type: "vendor-booth",    x: X_CC + 306,  y: Y_B37, width: 65,   height: 82.5, fontSize: 8 },

  // MDARC / NP-19
  { id: "mdarc", label: "MDARC",                           type: "nonprofit-table", x: X_CC,        y: Y_MDARC, width: 84.5, height: 35,  fontSize: 8 },
  { id: "np19",  label: "NP-19",                           type: "nonprofit-table", x: X_CC,        y: Y_NP19,  width: 84.5, height: 25,  fontSize: 7 },

  // NP-16, 17, 18
  { id: "np16",  label: "NP-16\nORCA",                     type: "nonprofit-table", x: X_CC + 198,  y: Y_NP16,  width: 76,   height: 57,  fontSize: 7 },
  { id: "np17",  label: "NP-17\nMesh\ntastic",             type: "nonprofit-table", x: X_CC + 276,  y: Y_NP16,  width: 76,   height: 57,  fontSize: 7 },
  { id: "np18",  label: "NP-18\nSF\nSkywarn",              type: "nonprofit-table", x: X_CC + 353,  y: Y_NP16,  width: 83,   height: 57,  fontSize: 7 },

  // NP-5 .. NP-9
  { id: "np5",   label: "NP-5\nQSL Bureau",                type: "nonprofit-table", x: X_CC + 84.5, y: Y_NP5,   width: 74,   height: 51,  fontSize: 7 },
  { id: "np6",   label: "NP-6\nSOTA",                      type: "nonprofit-table", x: X_CC + 160,  y: Y_NP5,   width: 74,   height: 51,  fontSize: 7 },
  { id: "np7",   label: "NP-7\nYLRL",                      type: "nonprofit-table", x: X_CC + 235,  y: Y_NP5,   width: 74,   height: 51,  fontSize: 7 },
  { id: "np8",   label: "NP-8\nSNARS",                     type: "nonprofit-table", x: X_CC + 310,  y: Y_NP5,   width: 74,   height: 51,  fontSize: 7 },
  { id: "np9",   label: "NP-9\nQCWA",                      type: "nonprofit-table", x: X_CC + 385,  y: Y_NP5,   width: 51,   height: 51,  fontSize: 7 },

  // Sorting board
  { id: "sorting", label: "Sorting\nBoard",                type: "vendor-table",    x: X_SORT,      y: Y_NP5,   width: 41,   height: 99,  fontSize: 7 },

  // NP-1 .. NP-4
  { id: "np1",   label: "NP-1\nNARCC",                     type: "nonprofit-table", x: X_CC,        y: Y_NP1,   width: 84.5, height: 42,  fontSize: 7 },
  { id: "np2",   label: "NP-2\nBay Area\nMesh",            type: "nonprofit-table", x: X_CC + 84.5, y: Y_NP1,   width: 84.5, height: 42,  fontSize: 7 },
  { id: "np3",   label: "NP-3\nNCCC",                      type: "nonprofit-table", x: X_CC + 171,  y: Y_NP1,   width: 76,   height: 42,  fontSize: 7 },
  { id: "np4",   label: "NP-4\nROAR I'ntl",                type: "nonprofit-table", x: X_CC + 249,  y: Y_NP1,   width: 84.5, height: 42,  fontSize: 7 },

  // Contra Costa Patio
  { id: "cc-patio",    label: "Contra Costa Patio",        type: "hallway",         x: X_CC,        y: Y_PATIO, width: 478,  height: 170, fontSize: 11 },

  // ── CC BALLROOM SALON 2 ──────────────────────────────────────────────────
  { id: "cc-ballroom", label: "Contra Costa\nBallroom\nSalon 2", type: "room",      x: X_BALL,      y: Y_TOP,   width: 229,  height: 254, fontSize: 12 },

  // ── BISHOP RANCH HALLWAY + WIRED COMM ───────────────────────────────────
  { id: "br-hallway",   label: "Bishop Ranch\nHallway",    type: "hallway",         x: X_WIRE,      y: Y_BRH,   width: 125,  height: 32,  fontSize: 8 },
  { id: "br-hall-lbl",  label: "Bishop Ranch\nVendor Hall",type: "hallway",         x: X_VH3,       y: Y_WIRE,  width: 297,  height: 36,  fontSize: 9 },
  { id: "wired-comm",   label: "Wired Communications",     type: "vendor-table",    x: X_WIRE,      y: Y_WIRE,  width: 422,  height: 34,  fontSize: 9 },

  // T-1 .. T-9
  ...["T-1","T-2","T-3","T-4","T-5","T-6","T-7","T-8","T-9"].map((t, i) => ({
    id: t.toLowerCase(),
    label: t,
    type: "vendor-table" as BoothType,
    x: X_WIRE + i * 24.8,
    y: Y_T,
    width: 24.8,
    height: 33,
    fontSize: 6,
  })),

  // ── WEST-WALL T-TABLES ───────────────────────────────────────────────────
  { id: "t10",  label: "T-10\nWestern\nCare",              type: "vendor-table",    x: X_SORT,  y: Y_VH1,  width: TW, height: B,    fontSize: 7 },
  { id: "t11",  label: "T-11\nHiplam\nShirts",             type: "vendor-table",    x: X_SORT,  y: Y_VH2,  width: TW, height: B,    fontSize: 7 },
  { id: "t13",  label: "T-13\nRemote\nTX",                 type: "vendor-table",    x: X_SORT,  y: Y_VH3 + B*0.5, width: TW, height: B*1.2, fontSize: 7 },

  // ── VENDOR HALL BOOTHS ───────────────────────────────────────────────────
  // Col 1 (1-5)
  { id: "b1",  label: "1\nFlexRadio",                      type: "vendor-booth",    x: X_VH1, y: Y_VH1, width: B, height: B, fontSize: 8 },
  { id: "b2",  label: "2",                                 type: "vendor-booth",    x: X_VH1, y: Y_VH2, width: B, height: B },
  { id: "b3",  label: "3",                                 type: "vendor-booth",    x: X_VH1, y: Y_VH3, width: B, height: B },
  { id: "b4",  label: "4\nARRL",                           type: "vendor-booth",    x: X_VH1, y: Y_VH4, width: B, height: B, fontSize: 8 },
  { id: "b5",  label: "5",                                 type: "vendor-booth",    x: X_VH1, y: Y_VH5, width: B, height: B },
  // Col 2 (6-10)
  { id: "b6",  label: "6\nYaesu",                          type: "vendor-booth",    x: X_VH2, y: Y_VH1, width: B, height: B, fontSize: 8 },
  { id: "b7",  label: "7\nImpulse\nElectronics",           type: "vendor-booth",    x: X_VH2, y: Y_VH2, width: B, height: B, fontSize: 7 },
  { id: "b8",  label: "8",                                 type: "vendor-booth",    x: X_VH2, y: Y_VH3, width: B, height: B },
  { id: "b9",  label: "9",                                 type: "vendor-booth",    x: X_VH2, y: Y_VH4, width: B, height: B },
  { id: "b10", label: "10\nCom\nIndustries",               type: "vendor-booth",    x: X_VH2, y: Y_VH5, width: B, height: B, fontSize: 7 },
  // Col 3 (11-15)
  { id: "b11", label: "11",                                type: "vendor-booth",    x: X_VH3, y: Y_VH1, width: B, height: B },
  { id: "b12", label: "12\nHRO",                           type: "vendor-booth",    x: X_VH3, y: Y_VH2, width: B, height: B, fontSize: 8 },
  { id: "b13", label: "13",                                type: "vendor-booth",    x: X_VH3, y: Y_VH3, width: B, height: B },
  { id: "b14", label: "14\n12 Volt\nPower",                type: "vendor-booth",    x: X_VH3, y: Y_VH4, width: B, height: B, fontSize: 7 },
  { id: "b15", label: "15",                                type: "vendor-booth",    x: X_VH3, y: Y_VH5, width: B, height: B },
  // Col 4 (16-19)
  { id: "b16", label: "16\nBatteries\nPlus",               type: "vendor-booth",    x: X_VH4, y: Y_VH1, width: B, height: B, fontSize: 7 },
  { id: "b17", label: "17\nMMDVM",                         type: "vendor-booth",    x: X_VH4, y: Y_VH2, width: B, height: B, fontSize: 8 },
  { id: "b18", label: "18\nBald\nPaddle",                  type: "vendor-booth",    x: X_VH4, y: Y_VH3, width: B, height: B, fontSize: 7 },
  { id: "b19", label: "19\n12 Volt\nPower",                type: "vendor-booth",    x: X_VH4, y: Y_VH4, width: B, height: B, fontSize: 7 },
  // Col 5 (20, 27, 28, 29)
  { id: "b20", label: "20\n12 Volt\nPower",                type: "vendor-booth",    x: X_VH5, y: Y_VH4, width: B, height: B, fontSize: 7 },
  { id: "b29", label: "29\nDromo\nKart SD",                type: "vendor-booth",    x: X_VH5, y: Y_VH1, width: B, height: 105, fontSize: 7 },
  { id: "b28", label: "28\nPark Lane\nJewelry",            type: "vendor-booth",    x: X_VH5, y: Y_VH1 + 105, width: B, height: B, fontSize: 7 },
  { id: "b27", label: "27",                                type: "vendor-booth",    x: X_VH5, y: Y_VH5, width: B, height: B },

  // ── KIT BUILDING ─────────────────────────────────────────────────────────
  { id: "kit-building", label: "Pacificon\nKit\nBuilding", type: "activity",        x: X_BALL, y: Y_PATIO, width: 189, height: 248, fontSize: 13 },

  // ── LOWER VENDOR HALL (booths 21-26) ────────────────────────────────────
  { id: "np10", label: "NP-10\nHornet",                    type: "nonprofit-table", x: X_NP_L, y: Y_LVH,   width: 54,   height: 67,  fontSize: 7 },
  { id: "t14",  label: "T-14\nCompu\ndigital",             type: "vendor-table",    x: X_SORT, y: Y_LVH,   width: TW,   height: B,   fontSize: 7 },
  { id: "b21",  label: "21\nConnect\nSystems",             type: "vendor-booth",    x: X_VH1,  y: Y_LVH,   width: B,    height: B,   fontSize: 7 },
  { id: "b22",  label: "22\nElecraft",                     type: "vendor-booth",    x: X_VH2,  y: Y_LVH,   width: B,    height: B,   fontSize: 8 },
  { id: "b23",  label: "23\nElecraft",                     type: "vendor-booth",    x: X_VH3,  y: Y_LVH,   width: B,    height: B,   fontSize: 8 },
  { id: "b24",  label: "24\nElecraft",                     type: "vendor-booth",    x: X_VH4,  y: Y_LVH,   width: B,    height: B,   fontSize: 8 },
  { id: "b25",  label: "25\nElecraft",                     type: "vendor-booth",    x: X_VH5,  y: Y_LVH,   width: B,    height: B,   fontSize: 8 },

  // Halibut Electronics — spans cols 4+5, rows 5+lower
  { id: "b26",  label: "26\nHalibut\nElectronics",         type: "vendor-booth",    x: X_VH4,  y: Y_VH5,   width: B*2,  height: B + (Y_LVH - Y_VH5), fontSize: 8 },

  // ── BISHOP RANCH BALLROOM ────────────────────────────────────────────────
  { id: "br-ballroom", label: "Bishop Ranch Ballroom\nSalons E-H", type: "room",   x: X_VH1,  y: Y_BALL,  width: B*4,  height: 389, fontSize: 14 },

  // T-tables alongside ballroom
  { id: "np11", label: "NP-11\nParcelino\nMobile",         type: "nonprofit-table", x: X_NP_L, y: Y_T15,   width: 54,   height: 76,  fontSize: 7 },
  { id: "t15",  label: "T-15\nOpen\nSpace",                type: "vendor-table",    x: X_SORT, y: Y_T15,   width: TW,   height: 97,  fontSize: 7 },
  { id: "t16",  label: "T-16\nBioenno\nPower",             type: "vendor-table",    x: X_SORT, y: Y_T16,   width: TW,   height: 81,  fontSize: 7 },
  { id: "t17",  label: "T-17",                             type: "vendor-table",    x: X_SORT, y: Y_T17,   width: TW,   height: 64,  fontSize: 7 },
  { id: "t18",  label: "T-18",                             type: "vendor-table",    x: X_SORT, y: Y_T18,   width: TW,   height: 64,  fontSize: 7 },

  // ── W1AW / NP lower / RESTROOMS ─────────────────────────────────────────
  { id: "w1aw",      label: "W1AW/6\nSpecial Event\nStation", type: "activity",    x: X_LOB,  y: Y_W1AW,  width: 286,  height: 183, fontSize: 13 },
  { id: "np12",      label: "NP-12\nLARK",                    type: "nonprofit-table", x: X_NP_L, y: Y_NP12, width: 83, height: 47,  fontSize: 7 },
  { id: "np13",      label: "NP-13\nSF Hab",                  type: "nonprofit-table", x: X_NP_L, y: Y_NP13, width: 83, height: 47,  fontSize: 7 },
  { id: "np14",      label: "NP-14\nParcelino\nAmateur",      type: "nonprofit-table", x: X_NP_L, y: Y_NP14, width: 83, height: 56,  fontSize: 7 },
  { id: "restrooms", label: "Restrooms",                      type: "service",     x: X_LOB,  y: Y_REST,  width: 286,  height: 110, fontSize: 12 },

  // ── BOTTOM ROOMS ─────────────────────────────────────────────────────────
  { id: "np15",         label: "NP-15\nDATV",             type: "nonprofit-table", x: X_NP_L,       y: Y_BOT, width: 83,  height: 125, fontSize: 7 },
  { id: "sr-boardroom", label: "San Ramon\nBoardroom",    type: "room",            x: X_NP_L + 83,   y: Y_BOT, width: 234, height: 125, fontSize: 10 },
  { id: "pleasanton",   label: "Pleasanton/Danville",     type: "room",            x: X_NP_L + 317,  y: Y_BOT, width: 194, height: 125, fontSize: 11 },
];

// ── Emergency exits [cx, cy] ──────────────────────────────────────────────
export const EMERGENCY_EXITS: [number, number][] = [
  [X_BALL + 229,  Y_TOP + 8],           // top-right of CC ballroom
  [X_SORT - 2,    Y_NP5 + 6],           // sorting board left
  [X_WIRE,        Y_WIRE - 10],         // wired comm left end
  [X_VH5 + B,     Y_VH1 + B],          // right wall, row 2
  [X_VH5 + B,     Y_VH4 + 5],          // right wall, row 4
  [X_VH5 + B,     Y_LVH + 40],         // lower vendor hall right
  [X_VH5 + B,     Y_REST + 55],        // right side, restroom level
];

// ── Entrance arrows ───────────────────────────────────────────────────────
export const ENTRANCES: { x: number; y: number; dir: "right"|"down"|"left"|"up" }[] = [
  { x: X_CC - 4,      y: Y_NP5 + 25,  dir: "right" },  // Contra Costa Hallway
  { x: X_VH2 + B/2,  y: Y_VH1 - 4,   dir: "down"  },  // Bishop Ranch top
  { x: X_VH2 + B/2,  y: Y_LVH - 4,   dir: "down"  },  // Bishop Ranch lower
];
