import { useState, type FormEvent } from "react";
import {
  integrationActions,
  logoForTool,
  suggestedTools,
  useExtraTools,
} from "../../data/integrations";
import { Button } from "../ui";
import plusBlack from "../../assets/icons/plus-black.svg";
import { Modal } from "./CreateDialogs";

/** The tool's logo when we have it (same 232px rounded-square artwork as the other AI logos), else its first letter. */
export function ToolTile({
  name,
  className = "size-[36px] text-[15px]",
}: {
  name: string;
  className?: string;
}) {
  const logo = logoForTool(name);
  if (logo) {
    // The artwork carries its own margin, so it is drawn a little larger than the letter tile it replaces.
    const size = className.match(/size-\[(\d+)px\]/)?.[1];
    const px = size ? (Number(size) === 36 ? 44 : Number(size)) : 44;
    return (
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        style={{ width: px, height: px }}
        className="shrink-0 object-contain"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-[10px] bg-surface-soft font-semibold leading-none text-ink ${className}`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

const rowClass =
  "flex items-center gap-3 rounded-[14px] border border-[#e6e6e6] bg-surface px-3 py-2.5";
const rowButton =
  "h-8 shrink-0 rounded-full border border-border bg-surface px-4 text-[13px] leading-none text-ink transition-colors hover:bg-surface-soft";
const captionClass =
  "text-[12px] font-normal uppercase leading-none text-text-secondary";

/**
 * "Integrate more AI tools": connect a suggested tool or add your own. With `onChoose` (the hand-off picker's "Other")
 * picking a tool also selects it as the destination and closes the dialog.
 */
export function AddIntegrationDialog({
  onClose,
  onChoose,
}: {
  onClose: () => void;
  onChoose?: (name: string) => void;
}) {
  const connected = useExtraTools();
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);

  const choose = (name: string) => {
    const stored = integrationActions.add(name);
    if (onChoose) {
      onChoose(stored);
      onClose();
    }
  };

  const addCustom = (e: FormEvent) => {
    e.preventDefault();
    if (!custom.trim()) {
      setError("Type the name of the tool.");
      return;
    }
    choose(custom);
    setCustom("");
  };

  const available = suggestedTools.filter(
    (s) =>
      !connected.some((c) => c.name.toLowerCase() === s.name.toLowerCase()),
  );

  return (
    <Modal
      title="Integrate more AI tools"
      description="Add an AI workspace to your my.Nook workflow."
      onClose={onClose}
    >
      <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto">
        {connected.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h3 className={captionClass}>Your tools</h3>
            {connected.map((tool) => (
              <div key={tool.id} className={rowClass}>
                <ToolTile name={tool.name} />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="truncate text-[14px] font-medium leading-none text-ink">
                    {tool.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] leading-none text-text-secondary">
                    <span className="size-1.5 rounded-full bg-[#1fb15a]" />
                    Connected
                  </span>
                </span>
                {onChoose ? (
                  <button
                    type="button"
                    className={rowButton}
                    onClick={() => choose(tool.name)}
                  >
                    Use
                  </button>
                ) : (
                  <button
                    type="button"
                    className={rowButton}
                    onClick={() => integrationActions.remove(tool.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </section>
        )}

        {available.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <h3 className={captionClass}>Popular tools</h3>
            {available.map((tool) => (
              <div key={tool.name} className={rowClass}>
                <ToolTile name={tool.name} />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="truncate text-[14px] font-medium leading-none text-ink">
                    {tool.name}
                  </span>
                  <span className="text-[12px] leading-none text-text-secondary">
                    {tool.by}
                  </span>
                </span>
                <button
                  type="button"
                  className={rowButton}
                  onClick={() => choose(tool.name)}
                >
                  Connect
                </button>
              </div>
            ))}
          </section>
        )}

        <form onSubmit={addCustom} noValidate className="flex flex-col gap-2.5">
          <h3 className={captionClass}>Add your own</h3>
          <div className="flex gap-2">
            <input
              aria-label="AI tool name"
              value={custom}
              maxLength={28}
              placeholder="Tool name"
              onChange={(e) => {
                setCustom(e.target.value);
                setError(null);
              }}
              className="h-10 min-w-0 flex-1 rounded-full border border-border bg-surface px-4 text-[14px] text-ink outline-none transition-colors focus:border-accent"
            />
            <button
              type="submit"
              aria-label="Add tool"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-tint transition-colors hover:bg-[#ffd5c4]"
            >
              <img src={plusBlack} alt="" className="size-[14px]" />
            </button>
          </div>
          {error && (
            <p role="alert" className="text-[13px] leading-none text-accent">
              {error}
            </p>
          )}
        </form>
      </div>

      {onChoose ? (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            className="h-10 px-6 text-[14px] leading-none"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            variant="primary"
            type="button"
            onClick={onClose}
            className="h-10 px-[27px] !text-[14px] leading-none"
          >
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
