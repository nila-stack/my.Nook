import type { CSSProperties } from "react";
import type { Board } from "../../data/boards";
import { colourTokens, fontTokens, spacingTokens, type Include, type PrototypeKind } from "../../lib/buildOutputs";

const roundMoods = ["playful", "folk", "dreamy", "warm", "soft", "poetic"];

/** A small, live mock-up of the board's style: the board's own palette, fonts, radius and spacing applied to a layout. */
export function PrototypePreview({
  board,
  kind,
  include,
}: {
  board: Board;
  kind: PrototypeKind;
  include: Include;
}) {
  const brief = board.brief!;
  const c = Object.fromEntries(colourTokens(brief.palette, brief.colours).map((t) => [t.name, t.hex]));
  const fonts = fontTokens(brief);
  const space = spacingTokens(brief);
  const radius = brief.mood.some((m) => roundMoods.includes(m.toLowerCase())) ? 18 : 8;

  // Without the palette / typography options the layout falls back to neutral greys and the system font.
  const col = include.palette
    ? c
    : { primary: "#5C5C5C", secondary: "#8C8C8C", accent: "#1A1A1A", background: "#F2F2F2", surface: "#FFFFFF", "text-primary": "#1A1A1A", "text-secondary": "#5C5C5C" };
  const heading = include.typography ? fonts[0].stack : "system-ui, sans-serif";
  const body = include.typography ? fonts[1].stack : "system-ui, sans-serif";

  const frame: CSSProperties = { background: col.background, color: col["text-primary"], fontFamily: body };
  const h: CSSProperties = { fontFamily: heading, color: col["text-primary"] };
  const btn = (bg: string, fg: string, border?: string): CSSProperties => ({
    background: bg,
    color: fg,
    border: `1.5px solid ${border ?? bg}`,
    borderRadius: 999,
    padding: `${space[0].px + 2}px ${space[1].px + 6}px`,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: body,
  });
  const card: CSSProperties = { background: col.surface, borderRadius: radius, padding: space[1].px + 4 };
  const onPrimary = "#FFFFFF";

  return (
    <div className="overflow-hidden rounded-[14px] border border-border" style={frame}>
      {kind === "landing" && (
        <div className="flex flex-col" style={{ gap: space[2].px }}>
          <div className="flex items-center justify-between" style={{ padding: `${space[1].px}px ${space[2].px}px` }}>
            <span style={{ ...h, fontSize: 18 }}>{board.title}</span>
            <span className="flex gap-4 text-[12px]" style={{ color: col["text-secondary"] }}>
              <span>Work</span>
              <span>About</span>
              <span>Contact</span>
            </span>
          </div>
          <div className="flex flex-col items-start" style={{ gap: space[1].px, padding: `0 ${space[2].px}px` }}>
            <h3 className="max-w-[420px] text-[34px] leading-[1.05]" style={h}>
              {brief.tagline}
            </h3>
            <p className="max-w-[420px] text-[13px] leading-[1.6]" style={{ color: col["text-secondary"] }}>
              {brief.notes}
            </p>
            <div className="flex gap-2">
              <span style={btn(col.primary, onPrimary)}>Get started</span>
              <span style={btn("transparent", col["text-primary"], col["text-primary"])}>See the work</span>
            </div>
          </div>
          <div className="grid grid-cols-3" style={{ gap: space[1].px, padding: `0 ${space[2].px}px ${space[2].px}px` }}>
            {brief.keywords.slice(0, 3).map((k, i) => (
              <div key={k} style={card}>
                <div className="mb-3 h-1.5 w-10 rounded-full" style={{ background: [col.primary, col.accent, col.secondary][i] }} />
                <p className="text-[13px]" style={{ ...h, fontSize: 15 }}>
                  {k}
                </p>
                <p className="mt-1 text-[11px] leading-snug" style={{ color: col["text-secondary"] }}>
                  Built from this board&apos;s {brief.mood[i % brief.mood.length].toLowerCase()} direction.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {kind === "dashboard" && (
        <div className="flex min-h-[330px]">
          <div className="flex w-[110px] flex-col gap-2 p-4" style={{ background: col.surface }}>
            <span style={{ ...h, fontSize: 15 }}>{board.title}</span>
            {["Overview", "Mood", "Palette", "Notes"].map((l, i) => (
              <span
                key={l}
                className="rounded-full px-2.5 py-1 text-[11px]"
                style={i === 0 ? { background: col.primary, color: onPrimary } : { color: col["text-secondary"] }}
              >
                {l}
              </span>
            ))}
          </div>
          <div className="flex flex-1 flex-col" style={{ gap: space[1].px, padding: space[1].px + 4 }}>
            <div className="grid grid-cols-3" style={{ gap: space[1].px }}>
              {[
                ["References", String(board.itemCount)],
                ["Mood", brief.mood[0]],
                ["Keywords", String(brief.keywords.length)],
              ].map(([label, value]) => (
                <div key={label} style={card}>
                  <p className="text-[11px]" style={{ color: col["text-secondary"] }}>
                    {label}
                  </p>
                  <p style={{ ...h, fontSize: 22 }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-1 items-end gap-2" style={{ ...card, minHeight: 120 }}>
              {[48, 72, 40, 90, 60, 80, 54].map((v, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ height: `${v}%`, background: [col.primary, col.accent, col.secondary][i % 3], borderRadius: Math.min(radius, 8) }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {kind === "components" && (
        <div className="grid grid-cols-2" style={{ gap: space[1].px, padding: space[2].px }}>
          <div className="flex flex-col" style={{ ...card, gap: space[1].px }}>
            <p style={{ ...h, fontSize: 13 }}>Buttons</p>
            <div className="flex flex-wrap gap-2">
              <span style={btn(col.primary, onPrimary)}>Primary</span>
              <span style={btn(col.accent, onPrimary)}>Accent</span>
              <span style={btn("transparent", col["text-primary"], col["text-primary"])}>Outline</span>
            </div>
          </div>
          <div className="flex flex-col" style={{ ...card, gap: space[1].px }}>
            <p style={{ ...h, fontSize: 13 }}>Tags</p>
            <div className="flex flex-wrap gap-2">
              {brief.mood.map((m, i) => (
                <span key={m} style={btn([col.primary, col.accent, col.secondary][i % 3] + "26", col["text-primary"], "transparent")}>
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col" style={{ ...card, gap: space[1].px }}>
            <p style={{ ...h, fontSize: 13 }}>Input</p>
            <div className="px-3 py-2 text-[12px]" style={{ border: `1.5px solid ${col.secondary}`, borderRadius: radius, color: col["text-secondary"] }}>
              Search {board.title.toLowerCase()}…
            </div>
          </div>
          <div className="flex flex-col" style={{ ...card, gap: space[1].px }}>
            <p style={{ ...h, fontSize: 13 }}>Card</p>
            <p style={{ ...h, fontSize: 17 }}>{brief.tagline}</p>
            <p className="text-[11px]" style={{ color: col["text-secondary"] }}>
              {brief.keywords.slice(0, 2).join(" · ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
