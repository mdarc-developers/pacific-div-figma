#!/usr/bin/env python3
"""
patch-building-5-v7.py
======================
Takes hamvention-2026-building-5-hertz-original.svg and outputs a patched SVG
that the extract-booth-from-svg.html tool can read to produce correct CSV output.

What this script does
---------------------
The original SVG has no machine-readable booth numbers — they are drawn as
black path glyphs. The HTML extractor resolves booth numbers by looking for
the nearest <text> label within 10% of the SVG width of each green booth shape.

This script injects one <text> element per green booth shape, placed at the
shape's centroid, carrying the same transform="matrix(0,0.08,0.08,0,0,0)" as
the booth paths so the extractor's proximity match succeeds with distance = 0.

Booth number → path ID mapping verified against the rendered floor-plan image.
Missing booths: 5005, 5305, 5306, 5307 have no green shapes (door/aisle gaps).

Usage
-----
  python3 patch-building-5-v7.py \\
      --input  hamvention-2026-building-5-hertz-original.svg \\
      --output hamvention-2026-building-5-hertz-patched.svg
"""

import argparse
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

BOOTH_MAPPING = {
    "path5456": 5001, "path5483": 5002, "path5481": 5003, "path5479": 5004,
    "path5416": 5006, "path5418": 5007, "path5485": 5008, "path5491": 5009,
    "path5489": 5010, "path5487": 5011,
    "path5428": 5102, "path5434": 5103, "path5432": 5104, "path5430": 5105,
    "path5444": 5106, "path5450": 5107, "path5448": 5108, "path5446": 5109,
    "path5454": 5110,
    "path5420": 5202, "path5426": 5203, "path5424": 5204, "path5422": 5205,
    "path5436": 5206, "path5442": 5207, "path5440": 5208, "path5438": 5209,
    "path5452": 5210,
    "path5499": 5301, "path5505": 5302, "path5503": 5303, "path5501": 5304,
    "path5414": 5308, "path5497": 5309, "path5495": 5310, "path5493": 5311,
}

BOOTH_TRANSFORM = "matrix(0,0.08,0.08,0,0,0)"
SVG_NS = "http://www.w3.org/2000/svg"


def path_centroid(d: str) -> tuple[float, float]:
    """Return centroid of an SVG path in its own coordinate space."""
    tokens = re.sub(r'([MmZzLlHhVvCcSsQqTtAa])', r' \1 ', d).replace(',', ' ').split()
    pts = []
    cx = cy = 0.0
    i = 0
    cmd = 'M'
    while i < len(tokens):
        t = tokens[i]
        if re.match(r'^[MmZzLlHhVvCcSsQqTtAa]$', t):
            cmd = t; i += 1; continue
        if cmd in ('Z', 'z'):
            i += 1; continue
        try:
            v = float(t)
        except ValueError:
            i += 1; continue
        if cmd == 'H': cx = v;  pts.append((cx, cy)); i += 1; continue
        if cmd == 'h': cx += v; pts.append((cx, cy)); i += 1; continue
        if cmd == 'V': cy = v;  pts.append((cx, cy)); i += 1; continue
        if cmd == 'v': cy += v; pts.append((cx, cy)); i += 1; continue
        if i + 1 >= len(tokens): break
        try:
            v2 = float(tokens[i + 1])
        except ValueError:
            i += 1; continue
        if   cmd == 'M': cx, cy = v, v2;    pts.append((cx, cy)); cmd = 'L'; i += 2
        elif cmd == 'm': cx += v; cy += v2;  pts.append((cx, cy)); cmd = 'l'; i += 2
        elif cmd == 'L': cx, cy = v, v2;    pts.append((cx, cy)); i += 2
        elif cmd == 'l': cx += v; cy += v2;  pts.append((cx, cy)); i += 2
        elif cmd in ('C', 'c'):
            if i + 5 >= len(tokens): i += 1; continue
            ex, ey = float(tokens[i+4]), float(tokens[i+5])
            if cmd == 'C': cx, cy = ex, ey
            else:          cx += ex; cy += ey
            pts.append((cx, cy)); i += 6
        elif cmd in ('S', 's'):
            if i + 3 >= len(tokens): i += 1; continue
            ex, ey = float(tokens[i+2]), float(tokens[i+3])
            if cmd == 'S': cx, cy = ex, ey
            else:          cx += ex; cy += ey
            pts.append((cx, cy)); i += 4
        elif cmd in ('Q', 'q'):
            if i + 3 >= len(tokens): i += 1; continue
            ex, ey = float(tokens[i+2]), float(tokens[i+3])
            if cmd == 'Q': cx, cy = ex, ey
            else:          cx += ex; cy += ey
            pts.append((cx, cy)); i += 4
        elif cmd in ('A', 'a'):
            if i + 6 >= len(tokens): i += 1; continue
            ex, ey = float(tokens[i+5]), float(tokens[i+6])
            if cmd == 'A': cx, cy = ex, ey
            else:          cx += ex; cy += ey
            pts.append((cx, cy)); i += 7
        else:
            i += 1
    if not pts:
        return 0.0, 0.0
    return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)


def make_text_tag(booth_num: int, cx: float, cy: float) -> str:
    return (
        f'<text'
        f' x="{cx:.3f}"'
        f' y="{cy:.3f}"'
        f' transform="{BOOTH_TRANSFORM}"'
        f' font-size="100"'
        f' fill="#000000"'
        f' text-anchor="middle"'
        f' dominant-baseline="central"'
        f' id="label-{booth_num}"'
        f'>{booth_num}</text>'
    )


def patch(input_path: Path, output_path: Path) -> None:
    # Use ET only for reading/parsing — never for serialising
    ET.register_namespace("",         SVG_NS)
    ET.register_namespace("inkscape", "http://www.inkscape.org/namespaces/inkscape")
    ET.register_namespace("sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd")
    ET.register_namespace("xlink",    "http://www.w3.org/1999/xlink")
    ET.register_namespace("svg",      SVG_NS)

    tree = ET.parse(input_path)
    root = tree.getroot()

    # Build centroid table from parsed tree
    centroids: dict[str, tuple[float, float]] = {}
    for el in root.iter():
        pid = el.get("id", "")
        if pid in BOOTH_MAPPING:
            d = el.get("d", "")
            centroids[pid] = path_centroid(d)

    # Work on raw text — inject <text> immediately after each booth path closing />
    content = input_path.read_text(encoding="utf-8")

    injected = 0
    not_found = []

    for path_id, booth_num in sorted(BOOTH_MAPPING.items(), key=lambda x: x[1]):
        if path_id not in centroids:
            print(f"  WARN  {path_id} not found", file=sys.stderr)
            not_found.append(path_id)
            continue

        cx, cy = centroids[path_id]
        text_tag = make_text_tag(booth_num, cx, cy)

        # Find the closing /> of this specific path element
        # Match the element that contains id="pathXXXX"
        pattern = rf'(<path\b(?=[^>]*\bid="{re.escape(path_id)}"[^>]*/?>)[^>]*/?>)'
        m = re.search(pattern, content, re.DOTALL)
        if not m:
            # Fallback: find id="pathXXXX" anywhere in a path tag (multiline)
            pattern2 = rf'(<path\b[^>]*\bid="{re.escape(path_id)}"[^>]*/?>)'
            m = re.search(pattern2, content, re.DOTALL)
        if not m:
            print(f"  WARN  could not locate {path_id} in raw text", file=sys.stderr)
            not_found.append(path_id)
            continue

        insert_pos = m.end()
        content = content[:insert_pos] + "\n    " + text_tag + content[insert_pos:]
        print(f"  OK  booth {booth_num}  ({path_id})  centroid=({cx:.1f}, {cy:.1f})")
        injected += 1

    print(f"\nInjected {injected} labels, {len(not_found)} not found.")
    output_path.write_text(content, encoding="utf-8")
    print(f"Written to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input",  required=True, help="Original SVG file")
    parser.add_argument("--output", required=True, help="Output patched SVG file")
    args = parser.parse_args()
    inp = Path(args.input)
    if not inp.exists():
        print(f"ERROR: {inp} not found", file=sys.stderr)
        sys.exit(1)
    patch(inp, Path(args.output))


if __name__ == "__main__":
    main()
