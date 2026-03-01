// PacificonFloorMap.tsx
import React, { useState } from "react";
import {
  BOOTHS,
  COLORS,
  LEGEND_ITEMS,
  EMERGENCY_EXITS,
  ENTRANCES,
  MAP_WIDTH,
  MAP_HEIGHT,
  type Booth,
} from "@/data/pacificonData";

// ── BoothLabel ────────────────────────────────────────────────────────────────
function BoothLabel({ booth }: { booth: Booth }) {
  const { label, x, y, width, height, fontSize = 9, type } = booth;
  const lines = label.split("\n");
  const cx = x + width / 2;
  const cy = y + height / 2;
  const lh = fontSize * 1.2;
  const startY = cy - ((lines.length - 1) * lh) / 2;
  return (
    <text
      x={cx}
      y={startY}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={fontSize}
      fontFamily="Arial, Helvetica, sans-serif"
      fontWeight="bold"
      fill={COLORS[type].text}
      style={{ userSelect: "none", pointerEvents: "none" }}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={cx} dy={i === 0 ? 0 : lh}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

// ── SVG triangle arrow (no unicode) ──────────────────────────────────────────
function Arrow({
  x,
  y,
  dir,
}: {
  x: number;
  y: number;
  dir: "right" | "down" | "left" | "up";
}) {
  const s = 11,
    h = s / 2;
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <path
      d={`M${x},${y} L${x - s},${y - h} L${x - s},${y + h}Z`}
      fill="#3A7F30"
      stroke="#1A5018"
      strokeWidth={0.6}
      transform={`rotate(${rot},${x},${y})`}
    />
  );
}

// ── SVG cross (no unicode) ────────────────────────────────────────────────────
function ExX({ cx, cy }: { cx: number; cy: number }) {
  const r = 5.5;
  return (
    <g>
      <line
        x1={cx - r}
        y1={cy - r}
        x2={cx + r}
        y2={cy + r}
        stroke="#CC0000"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <line
        x1={cx + r}
        y1={cy - r}
        x2={cx - r}
        y2={cy + r}
        stroke="#CC0000"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </g>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  const W = 210,
    RH = 23;
  const rows = LEGEND_ITEMS.length + 2;
  const H = 28 + rows * RH + 18;
  return (
    <g transform="translate(15, 488)">
      <rect
        width={W}
        height={H}
        rx={3}
        fill="white"
        stroke="#bbb"
        strokeWidth={0.6}
        opacity={0.97}
      />
      <text
        x={8}
        y={15}
        fontSize={8}
        fontWeight="bold"
        fontFamily="Arial"
        fill="#111"
        letterSpacing={0.5}
      >
        LEGEND
      </text>
      {LEGEND_ITEMS.map(({ type, label }, i) => {
        const c = COLORS[type];
        const ry = 22 + i * RH;
        return (
          <g key={type} transform={`translate(8,${ry})`}>
            <rect
              width={15}
              height={11}
              rx={1.5}
              fill={c.fill}
              stroke={c.stroke}
              strokeWidth={0.7}
            />
            <text x={21} y={9.5} fontSize={7.5} fontFamily="Arial" fill="#222">
              {label}
            </text>
          </g>
        );
      })}
      {/* Emergency X */}
      <g transform={`translate(8,${22 + LEGEND_ITEMS.length * RH})`}>
        <line
          x1={2}
          y1={2}
          x2={10}
          y2={10}
          stroke="#CC0000"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <line
          x1={10}
          y1={2}
          x2={2}
          y2={10}
          stroke="#CC0000"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <text x={18} y={9.5} fontSize={7.5} fontFamily="Arial" fill="#222">
          Emergency Exit Only
        </text>
      </g>
      {/* Arrow */}
      <g transform={`translate(8,${22 + (LEGEND_ITEMS.length + 1) * RH})`}>
        <path
          d="M12,6 L2,1 L2,11Z"
          fill="#3A7F30"
          stroke="#1A5018"
          strokeWidth={0.6}
        />
        <text x={18} y={9.5} fontSize={7.5} fontFamily="Arial" fill="#222">
          Vendor Hall Entrance/Exit
        </text>
      </g>
      <text
        x={8}
        y={H - 4}
        fontSize={6}
        fontFamily="Arial"
        fill="#aaa"
        fontStyle="italic"
      >
        Items in red font are post-print revisions. Not to Scale.
      </text>
    </g>
  );
}

// ── PNG export ────────────────────────────────────────────────────────────────
async function exportToPNG() {
  const el = document.getElementById("pacificon-map-svg") as SVGSVGElement;
  if (!el) return;
  const clone = el.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(MAP_WIDTH));
  clone.setAttribute("height", String(MAP_HEIGHT));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", String(MAP_WIDTH));
  bg.setAttribute("height", String(MAP_HEIGHT));
  bg.setAttribute("fill", "white");
  clone.insertBefore(bg, clone.firstChild);
  clone.querySelectorAll("text,tspan").forEach((el) => {
    const cs = window.getComputedStyle(el as Element);
    const h = el as HTMLElement;
    h.style.fontFamily = cs.fontFamily;
    h.style.fontSize = cs.fontSize;
    h.style.fontWeight = cs.fontWeight;
  });
  const uri =
    "data:image/svg+xml;base64," +
    btoa(
      unescape(
        encodeURIComponent(new XMLSerializer().serializeToString(clone)),
      ),
    );
  const scale = 2;
  const c = document.createElement("canvas");
  c.width = MAP_WIDTH * scale;
  c.height = MAP_HEIGHT * scale;
  const ctx = c.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  await new Promise<void>((res, rej) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, MAP_WIDTH, MAP_HEIGHT);
      res();
    };
    img.onerror = rej;
    img.src = uri;
  });
  const a = document.createElement("a");
  a.download = "pacificon-floor-map.png";
  a.href = c.toDataURL("image/png");
  a.click();
}

// ── Main component ────────────────────────────────────────────────────────────
interface TT {
  label: string;
  sx: number;
  sy: number;
}

export function PacificonFloorMap() {
  const [tip, setTip] = useState<TT | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  const onEnter = (b: Booth, e: React.MouseEvent<SVGGElement>) => {
    const r = (e.currentTarget as Element)
      .closest<SVGSVGElement>("svg")
      ?.getBoundingClientRect();
    if (r)
      setTip({
        label: b.label.replace(/\n/g, " · "),
        sx: e.clientX - r.left + 8,
        sy: e.clientY - r.top - 28,
      });
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#eee",
        minHeight: "100vh",
        padding: "10px 14px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: 6,
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: 2,
              lineHeight: 1,
            }}
          >
            PACIFICON
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            Exhibit Space Layout
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>
            San Ramon Marriott Hotel · San Ramon, CA
          </div>
        </div>
      </div>

      <button
        onClick={exportToPNG}
        style={{
          marginBottom: 6,
          fontSize: 11,
          padding: "4px 12px",
          cursor: "pointer",
          border: "1px solid #999",
          borderRadius: 3,
          background: "#fff",
        }}
      >
        ⬇ Export PNG
      </button>

      <div style={{ position: "relative" }}>
        <svg
          id="pacificon-map-svg"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          width="100%"
          style={{
            display: "block",
            border: "2px solid #222",
            background: "white",
            borderRadius: 2,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="white" />

          {/* Bishop Ranch Patio side label */}
          <text
            x={28}
            y={1070}
            fontSize={9}
            fill="#666"
            fontFamily="Arial"
            fontWeight="600"
            textAnchor="middle"
            transform="rotate(-90,28,1070)"
          >
            Bishop Ranch Patio
          </text>

          {/* Security label */}
          <text
            x={530}
            y={650}
            fontSize={7}
            fill="#444"
            fontFamily="Arial"
            fontWeight="700"
            textAnchor="middle"
            transform="rotate(-90,530,650)"
          >
            Security
          </text>

          {/* All booths */}
          {BOOTHS.map((b) => {
            const c = COLORS[b.type];
            const isS = sel === b.id;
            return (
              <g
                key={b.id}
                style={{ cursor: "pointer" }}
                onClick={() => setSel(isS ? null : b.id)}
                onMouseEnter={(e) => onEnter(b, e)}
                onMouseLeave={() => setTip(null)}
              >
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.width}
                  height={b.height}
                  rx={1.5}
                  fill={isS ? "#FFD700" : c.fill}
                  stroke={isS ? "#B8860B" : c.stroke}
                  strokeWidth={isS ? 2 : 0.7}
                />
                <BoothLabel booth={b} />
              </g>
            );
          })}

          {EMERGENCY_EXITS.map(([cx, cy], i) => (
            <ExX key={i} cx={cx} cy={cy} />
          ))}
          {ENTRANCES.map(({ x, y, dir }, i) => (
            <Arrow key={i} x={x} y={y} dir={dir} />
          ))}
          <Legend />
        </svg>

        {tip && (
          <div
            style={{
              position: "absolute",
              left: tip.sx,
              top: tip.sy,
              background: "rgba(10,20,40,0.9)",
              color: "#fff",
              padding: "3px 8px",
              borderRadius: 3,
              fontSize: 10,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 20,
            }}
          >
            {tip.label}
          </div>
        )}
      </div>

      {sel &&
        (() => {
          const b = BOOTHS.find((b) => b.id === sel);
          if (!b) return null;
          const c = COLORS[b.type];
          return (
            <div
              style={{
                marginTop: 8,
                padding: "7px 12px",
                background: "#fff",
                border: `2px solid ${c.stroke}`,
                borderRadius: 4,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  width: 13,
                  height: 13,
                  background: c.fill,
                  border: `1.5px solid ${c.stroke}`,
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              <strong>{b.label.replace(/\n/g, " · ")}</strong>
              <span style={{ color: "#aaa", fontSize: 10 }}>{b.type}</span>
              <button
                onClick={() => setSel(null)}
                style={{
                  fontSize: 10,
                  cursor: "pointer",
                  background: "none",
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  padding: "1px 6px",
                }}
              >
                ✕
              </button>
            </div>
          );
        })()}
    </div>
  );
}
