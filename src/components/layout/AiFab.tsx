import { useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import aiFabIcon from "../../assets/icons/ai-fab.svg";
import chatLogo from "../../assets/icons/chat-ai-logo.svg";
import chatActions from "../../assets/icons/chat-actions.svg";
import chatPlus from "../../assets/icons/chat-plus.svg";
import chatMic from "../../assets/icons/chat-mic.svg";
import chatSend from "../../assets/icons/chat-send.svg";

const routeSuggestions: { pattern: string; suggestions: string[] }[] = [
  {
    pattern: "/home",
    suggestions: [
      "Analyse & auto-tag references",
      "Find something I saved",
      "Analyse this board",
      "Extract visual language",
    ],
  },
  {
    pattern: "/boards/:boardId/handoff/review",
    suggestions: [
      "References being sent",
      "Tags, palette & typography",
      "Designer notes & source attribution",
      "Selected AI tool + export mode",
    ],
  },
  {
    pattern: "/boards/:boardId/handoff",
    suggestions: [
      "Selected / essential references",
      "Project intent",
      "Mood & colour palette",
      "Typography & visual language",
    ],
  },
  {
    pattern: "/boards/:boardId",
    suggestions: [
      "3 selected references",
      "3 mood tags",
      "1 colour palette",
      "Typography & layout notes",
    ],
  },
];

function suggestionsFor(pathname: string) {
  return routeSuggestions.find((r) => matchPath({ path: r.pattern, end: true }, pathname))?.suggestions ?? [];
}

/** Floating "AI assistant" button, present on every authenticated screen; opens the chat panel on the right. */
export function AiFab() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { pathname } = useLocation();
  const suggestions = suggestionsFor(pathname);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="AI assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-8 flex size-16 items-center justify-center rounded-full bg-ink shadow-panel transition-transform hover:scale-105"
        >
          <img src={aiFabIcon} alt="" className="size-[30px]" />
        </button>
      )}

      {open && (
        <aside
          aria-label="AI chat"
          className="fixed right-0 top-0 z-40 flex h-screen w-[404px] max-w-full flex-col bg-surface shadow-[-6px_0px_33px_0px_rgba(0,0,0,0.12)] pb-[55px] pl-[46px] pr-[44px] pt-[64px]"
        >
          <header className="flex items-start justify-between">
            <h2 className="text-[20px] font-semibold leading-none text-ink">my.Nook Assistant</h2>
            <div className="relative -mr-[7px] mt-[1px] h-[23px] w-[61px]">
              <img src={chatActions} alt="" className="size-full" />
              <button
                type="button"
                aria-label="New chat"
                onClick={() => setDraft("")}
                className="absolute inset-y-0 left-0 w-1/2"
              />
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="absolute inset-y-0 right-0 w-1/2"
              />
            </div>
          </header>

          <div className="flex flex-1 flex-col justify-end gap-[33px]">
            <div className="flex flex-col pl-[6px]">
              <img src={chatLogo} alt="" className="size-[53px]" />
              <p className="mt-[20px] text-[20px] font-semibold leading-none text-ink">What can I help you with?</p>
              {suggestions.length > 0 && (
                <ul className="mt-[30px] flex flex-col">
                  {suggestions.map((text, i) => (
                    <li key={text} className={i === 0 ? "" : "mt-[25px]"}>
                      <button
                        type="button"
                        onClick={() => setDraft(text)}
                        className="block text-left text-[14px] leading-[17px] text-ink transition-colors hover:font-medium hover:text-accent focus-visible:font-medium focus-visible:text-accent"
                      >
                        {text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative h-[104px] w-[314px] rounded-[12px] border border-[#e0e0e0] bg-[#fff4ef]">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask my.Nook AI about your reference..."
                className="absolute inset-x-5 top-[19px] h-[40px] resize-none bg-transparent text-[14px] leading-[normal] text-ink outline-none placeholder:text-[#494949]"
              />
              <img src={chatPlus} alt="" className="absolute bottom-4 left-5 size-[23px]" />
              <img src={chatMic} alt="" className="absolute bottom-[15px] left-[230px] size-[25px]" />
              <button type="button" aria-label="Send" className="absolute bottom-[11px] left-[263px] block size-[31px]">
                <img src={chatSend} alt="" className="size-[30px]" />
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
