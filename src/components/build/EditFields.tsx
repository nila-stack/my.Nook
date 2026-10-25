import { useState } from "react";

const hexPattern = /^#[0-9a-f]{6}$/i;

export function HexField({
  value,
  onCommit,
  label,
}: {
  value: string;
  onCommit: (hex: string) => void;
  label: string;
}) {
  // Hold the half-typed text locally; only a complete #RRGGBB is committed.
  const [text, setText] = useState<string | null>(null);
  return (
    <input
      aria-label={`${label} hex colour`}
      value={text ?? value}
      maxLength={7}
      spellCheck={false}
      onChange={(e) => {
        const next = e.target.value.startsWith("#")
          ? e.target.value
          : `#${e.target.value}`;
        setText(next);
        if (hexPattern.test(next)) onCommit(next.toUpperCase());
      }}
      onBlur={() => setText(null)}
      className="h-8 w-[104px] rounded-[8px] border border-border bg-surface px-2.5 text-[13px] uppercase leading-none text-ink outline-none transition-colors focus:border-accent"
    />
  );
}

export function EditableChips({
  items,
  onChange,
  editing,
  tone,
  min = 0,
  placeholder,
  label,
  chipClassName = "px-3.5 py-2",
}: {
  items: string[];
  onChange: (next: string[]) => void;
  editing: boolean;
  tone: "outline" | "tint";
  /** Fewest chips allowed — the last ones can't be removed. */
  min?: number;
  placeholder: string;
  label: string;
  chipClassName?: string;
}) {
  const [text, setText] = useState("");
  const chipClass = tone === "tint" ? "bg-accent-tint" : "border border-border";
  const add = () => {
    const value = text.trim().replace(/\s+/g, " ").slice(0, 24);
    if (!value) return;
    if (!items.some((i) => i.toLowerCase() === value.toLowerCase()))
      onChange([...items, value]);
    setText("");
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`flex items-center gap-1.5 rounded-full text-[13px] leading-none text-ink ${chipClassName} ${chipClass}`}
        >
          {item}
          {editing && (
            <button
              type="button"
              aria-label={`Remove ${item}`}
              disabled={items.length <= min}
              onClick={() => onChange(items.filter((i) => i !== item))}
              className="-mr-1 text-[15px] leading-none text-text-secondary hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
            >
              ×
            </button>
          )}
        </span>
      ))}
      {editing && (
        <input
          aria-label={label}
          value={text}
          maxLength={24}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          className="h-[34px] w-[130px] rounded-full border border-dashed border-border bg-surface px-3.5 text-[13px] text-ink outline-none transition-colors focus:border-accent"
        />
      )}
    </div>
  );
}
