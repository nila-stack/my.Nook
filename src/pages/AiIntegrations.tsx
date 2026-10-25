import { useEffect, useRef, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import {
  AddIntegrationDialog,
  ToolTile,
} from "../components/layout/AddIntegrationDialog";
import { integrationActions, useExtraTools } from "../data/integrations";
import { Button } from "../components/ui";
import plusWhite from "../assets/icons/plus-white.svg";
import infoCircle from "../assets/icons/info-circle-filled.svg";
import appClaude from "../assets/images/ai-logo-claude.png";
import appCursor from "../assets/images/ai-logo-cursor.png";
import appAntigravity from "../assets/images/ai-logo-antigravity.png";
import appLoveable from "../assets/images/ai-logo-loveable.png";
import appChatgpt from "../assets/images/ai-logo-chatgpt.png";

const connected = [
  { id: "claude", name: "Claude", tile: appClaude },
  { id: "cursor", name: "Cursor", tile: appCursor },
  { id: "antigravity", name: "Antigravity", tile: appAntigravity },
  { id: "loveable", name: "Loveable", tile: appLoveable },
  { id: "chatgpt", name: "ChatGPT", tile: appChatgpt },
];

/** The "•••" menu on a tool you added yourself: Remove disconnects it. */
function ToolMenu({ name, onRemove }: { name: string; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More options for ${name}`}
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center rounded-full text-[18px] leading-none tracking-[1px] text-ink hover:bg-surface-soft"
      >
        •••
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-[150px] rounded-[8px] border border-border bg-surface py-2 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
            className="flex h-9 w-full items-center px-[14px] text-left text-[14px] leading-none text-ink hover:bg-surface-soft"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

const cardClass =
  "flex items-center gap-6 rounded-[20px] border border-[#e6e6e6] bg-surface px-6 py-5";

export function AiIntegrations() {
  const extra = useExtraTools();
  const [adding, setAdding] = useState(false);
  return (
    <AppShell>
      <div className="flex flex-col gap-10 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-[27px] font-semibold leading-tight text-ink">
            AI Integrations
          </h1>
          <p className="text-[16px] leading-snug text-text-secondary">
            Connect your AI tools to send curated references, context and boards
            directly from my.Nook.
          </p>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="text-[14px] font-normal uppercase leading-none text-text-secondary">
            Connected
          </h2>
          <div className="flex flex-col gap-5">
            {connected.map((tool) => (
              <article key={tool.id} className={`${cardClass} !py-[16px]`}>
                <img
                  src={tool.tile}
                  alt=""
                  className="size-[80px] shrink-0 object-contain"
                />
                <div className="flex flex-1 flex-col gap-1.5">
                  <h3 className="text-[18px] font-semibold leading-none text-ink">
                    {tool.name}
                  </h3>
                  <p className="flex items-center gap-2 text-[14px] leading-none text-text-secondary">
                    <span className="size-2 rounded-full bg-[#1fb15a]" />
                    Connected
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="h-10 border-transparent bg-surface-soft px-6 text-[14px]"
                >
                  Manage
                </Button>
                <button
                  type="button"
                  aria-label={`More options for ${tool.name}`}
                  className="flex size-10 items-center justify-center rounded-full text-[18px] leading-none tracking-[1px] text-ink hover:bg-surface-soft"
                >
                  •••
                </button>
              </article>
            ))}
            {extra.map((tool) => (
              <article key={tool.id} className={`${cardClass} !py-[16px]`}>
                <ToolTile
                  name={tool.name}
                  className="size-[80px] rounded-[18px] text-[28px]"
                />
                <div className="flex flex-1 flex-col gap-1.5">
                  <h3 className="text-[18px] font-semibold leading-none text-ink">
                    {tool.name}
                  </h3>
                  <p className="flex items-center gap-2 text-[14px] leading-none text-text-secondary">
                    <span className="size-2 rounded-full bg-[#1fb15a]" />
                    Connected
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="h-10 border-transparent bg-surface-soft px-6 text-[14px]"
                >
                  Manage
                </Button>
                <ToolMenu
                  name={tool.name}
                  onRemove={() => integrationActions.remove(tool.id)}
                />
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className={cardClass}>
            <div className="flex flex-1 flex-col gap-1.5">
              <h3 className="text-[18px] font-semibold leading-none text-ink">
                Integrate more AI Tools from your Stack
              </h3>
              <p className="text-[14px] leading-snug text-text-secondary">
                Add an AI workspace to your my.Nook workflow.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setAdding(true)}
              className="h-[43px] gap-2 px-6 !text-[15px] leading-none"
            >
              <img src={plusWhite} alt="" className="size-[15px]" />
              Add integration
            </Button>
          </div>
        </section>

        <button
          type="button"
          className="flex w-fit items-center gap-3 text-[16px] font-medium leading-none text-text-secondary"
        >
          <img src={infoCircle} alt="" className="size-[21px]" />
          <span className="underline">How AI integration works?</span>
        </button>
      </div>
      {adding && <AddIntegrationDialog onClose={() => setAdding(false)} />}
    </AppShell>
  );
}
