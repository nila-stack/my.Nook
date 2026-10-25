import { useState, type FormEvent } from "react";
import type { Board } from "../../data/boards";
import { useHandoffReferences } from "../../data/essentials";
import {
  shareActions,
  useShares,
  type ShareAccess,
  type ShareScope,
} from "../../data/shares";
import { useMembers } from "../../data/team";
import { Avatar } from "../ui/Avatar";
import { Button, Checkbox, Chip } from "../ui";
import { Modal } from "./CreateDialogs";

const captionClass = "text-[15px] font-semibold leading-none text-ink";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Mailed = { mail: string; access: ShareAccess };

/**
 * "Share" from a board's sidebar: share the whole board or only its essential references, with team members you
 * tick and/or anyone you add by email. Team members keep the access their role gives them; each emailed person
 * gets a View / Edit choice beside their address.
 */
export function ShareDialog({
  board,
  onClose,
}: {
  board: Board;
  onClose: () => void;
}) {
  const members = useMembers().filter((m) => m.role !== "Owner");
  const existing = useShares(board.id);
  const { all, essential } = useHandoffReferences(board.id);

  const [scope, setScope] = useState<ShareScope>("board");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [emails, setEmails] = useState<Mailed[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const alreadyHas = (who: string) => existing.some((s) => s.who === who);
  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  // Accepts one or several addresses (comma, space or new line) and adds the valid ones to the list below.
  // Returns the updated list, or null when something typed isn't an address.
  const stage = (): Mailed[] | null => {
    const parts = draft.split(/[\s,;]+/).filter(Boolean);
    if (parts.length === 0) return emails;
    const bad = parts.filter((p) => !emailPattern.test(p));
    if (bad.length > 0) {
      setError(`"${bad[0]}" doesn't look like an email address.`);
      return null;
    }
    const next = [...emails];
    for (const p of parts.map((x) => x.toLowerCase()))
      if (!next.some((e) => e.mail === p))
        next.push({ mail: p, access: "view" });
    setEmails(next);
    setDraft("");
    setError(null);
    return next;
  };

  const setMailAccess = (mail: string, access: ShareAccess) =>
    setEmails((prev) =>
      prev.map((e) => (e.mail === mail ? { ...e, access } : e)),
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const list = stage();
    if (list === null) return;
    const total = picked.size + list.length;
    if (total === 0) {
      setError("Pick someone from your team or add an email address.");
      return;
    }
    shareActions.add(board.id, [
      ...[...picked].map((who) => ({
        who,
        scope,
        access: (members.find((m) => m.id === who)?.role === "Viewer"
          ? "view"
          : "edit") as ShareAccess,
      })),
      ...list.map((x) => ({ who: x.mail, scope, access: x.access })),
    ]);
    setDone(total);
  };

  const noEssentials = essential.length === 0;

  if (done !== null) {
    return (
      <Modal title="Shared" hideTitle onClose={onClose}>
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-accent-tint text-[28px] leading-none text-accent">
            ✓
          </span>
          <p className="text-[14px] leading-snug text-ink">
            {scope === "board"
              ? "The whole board"
              : `${essential.length} essential ${essential.length === 1 ? "reference" : "references"}`}{" "}
            shared with {done} {done === 1 ? "person" : "people"}.
          </p>
          <Button
            variant="primary"
            type="button"
            onClick={onClose}
            className="h-10 px-[27px] !text-[14px] leading-none"
          >
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Share" width="w-[520px]" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div
            role="radiogroup"
            aria-label="What to share"
            className="grid grid-cols-2 gap-3"
          >
            {(
              [
                [
                  "board",
                  "Entire board",
                  `All ${all.length} ${all.length === 1 ? "reference" : "references"}`,
                ],
                [
                  "essential",
                  "Essential only",
                  noEssentials
                    ? "None marked essential yet"
                    : `${essential.length} marked essential`,
                ],
              ] as const
            ).map(([id, label, detail]) => {
              const disabled = id === "essential" && noEssentials;
              const selected = scope === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => setScope(id)}
                  className={`flex items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected
                      ? "border-transparent bg-accent-tint"
                      : "border-[#e6e6e6] bg-surface hover:bg-surface-soft"
                  }`}
                >
                  <span
                    className={`flex size-[18px] shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-accent bg-accent"
                        : "border-border bg-surface"
                    }`}
                  >
                    {selected && (
                      <span className="size-[6px] rounded-full bg-white" />
                    )}
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <span className="text-[14px] font-medium leading-none text-ink">
                      {label}
                    </span>
                    <span className="text-[12px] leading-none text-text-secondary">
                      {detail}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className={captionClass}>Share with your team</p>
          <ul className="flex max-h-[200px] flex-col gap-1 overflow-y-auto pr-1">
            {members.map((m) => {
              const has = alreadyHas(m.id);
              return (
                <li key={m.id}>
                  <label
                    className={`flex items-center gap-3 rounded-[12px] px-2 py-2 ${
                      has
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:bg-surface-soft"
                    }`}
                  >
                    <Checkbox
                      aria-label={`Share with ${m.name}`}
                      checked={picked.has(m.id) || has}
                      disabled={has}
                      onChange={() => toggle(m.id)}
                      className="size-[16px] shrink-0"
                    />
                    <Avatar name={m.name} size={32} />
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="truncate text-[14px] font-medium leading-none text-ink">
                        {m.name}
                      </span>
                      <span className="truncate text-[12px] leading-none text-text-secondary">
                        {m.email}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] leading-none text-text-secondary">
                      {has
                        ? "Has access"
                        : m.status === "invited"
                          ? "Invite pending"
                          : m.role}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="share-email" className={captionClass}>
            Or add an email
          </label>
          <div className="flex gap-2">
            <input
              id="share-email"
              type="email"
              value={draft}
              placeholder="name@company.com"
              onChange={(e) => {
                setDraft(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  stage();
                }
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "share-error" : undefined}
              className="h-10 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-[14px] text-ink outline-none transition-colors placeholder:text-text-muted focus:border-accent"
            />
            <button
              type="button"
              onClick={stage}
              disabled={draft.trim() === ""}
              className="h-10 shrink-0 rounded-full border border-border bg-surface px-5 text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add
            </button>
          </div>
          {error && (
            <p
              id="share-error"
              role="alert"
              className="text-[13px] leading-snug text-accent"
            >
              {error}
            </p>
          )}
          {emails.length > 0 && (
            <ul
              className="flex flex-col gap-2"
              aria-label="Emails to share with"
            >
              {emails.map((x) => (
                <li
                  key={x.mail}
                  className="flex items-center gap-3 rounded-[14px] border border-[#e6e6e6] bg-surface py-2 pl-4 pr-2"
                >
                  <span className="min-w-0 flex-1 truncate text-[14px] leading-none text-ink">
                    {x.mail}
                  </span>
                  <div
                    role="group"
                    aria-label={`Access for ${x.mail}`}
                    className="flex shrink-0 gap-1.5"
                  >
                    {(
                      [
                        ["view", "View"],
                        ["edit", "Edit"],
                      ] as const
                    ).map(([id, label]) => (
                      <Chip
                        key={id}
                        tone="tint"
                        selected={x.access === id}
                        aria-pressed={x.access === id}
                        onClick={() => setMailAccess(x.mail, id)}
                        className="h-8 px-4 text-[13px] leading-none"
                      >
                        {label}
                      </Chip>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${x.mail}`}
                    onClick={() =>
                      setEmails((prev) => prev.filter((e) => e.mail !== x.mail))
                    }
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-[16px] leading-none text-text-secondary transition-colors hover:bg-surface-soft hover:text-ink"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            className="h-10 px-6 text-[14px] leading-none"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="h-10 px-6 !text-[14px] leading-none"
          >
            Share
          </Button>
        </div>
      </form>
    </Modal>
  );
}
