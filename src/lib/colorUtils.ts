export function hexToRGBArray(hex: string): number[] {
  if (hex.startsWith("#")) hex = hex.substring(1);
  if (hex.length === 3) hex = hex.replace(/./g, "$&$&"); // Expand shorthand
  if (hex.length !== 6) throw new Error(`Invalid HEX color: ${hex}`);
  const rgb = [];
  for (let i = 0; i <= 2; i++) {
    rgb[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return rgb;
}

export function contrastingColor(color: string): string {
  const rgb = typeof color === "string" ? hexToRGBArray(color) : color;
  const luma = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return luma >= 165 ? "#000000" : "#FFFFFF";
}

export function contrastingLinkColor(color: string): string {
  const rgb = typeof color === "string" ? hexToRGBArray(color) : color;
  const luma = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return luma >= 165 ? "#155dfc" : "#9098dc";
}

/** Blend a hex color toward white by the given ratio (0 = original, 1 = white). */
export function blendWithWhite(hex: string, ratio = 0.5): string {
  const rgb = hexToRGBArray(hex);
  const blended = rgb.map((c) => Math.round(c + (255 - c) * ratio));
  return "#" + blended.map((c) => c.toString(16).padStart(2, "0")).join("");
}
