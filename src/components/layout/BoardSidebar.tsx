import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Chip, PaletteDots } from "../ui";
import { SidebarFooter } from "./SidebarFooter";
import { ImportLinksDialog } from "./ImportLinksDialog";
import { ShareDialog } from "./ShareDialog";
import { commentActions } from "../../data/comments";
import type { Board } from "../../data/boards";
import { useBriefEdit } from "../../data/briefEdits";
import { colourTokens } from "../../lib/buildOutputs";
import logoMark from "../../assets/icons/logo-mark.svg";
import folderPanel from "../../assets/icons/folder-panel.svg";
import chevronDown from "../../assets/icons/chevron-down.svg";
import navImportLinks from "../../assets/icons/nav-import-links.svg";
import navUnsorted from "../../assets/icons/nav-unsorted-tray.png";
import navShare from "../../assets/icons/nav-share.svg";
import navComment from "../../assets/icons/nav-comment.svg";
import navSend from "../../assets/icons/nav-send.svg";

function SectionCaption({ children }: { children: string }) {
  return (
    <p className="px-3 text-[12px] font-medium text-text-muted">{children}</p>
  );
}

function NavRow({
  label,
  icon,
  active = false,
  to,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  to?: string;
  /** For rows that open a dialog instead of a screen. */
  onClick?: () => void;
}) {
  // Same pill as the main sidebar: grey on hover; light orange only for the row of the screen you are on.
  // Rows without a screen yet (no `to`) just get the grey hover and never turn orange.
  const row = (
    <span
      className={`flex w-[240px] items-center gap-[15px] rounded-[32px] px-3 py-2 text-[14px] leading-none text-ink transition-colors ${
        active
          ? "bg-accent-tint font-semibold"
          : "font-normal hover:bg-surface-soft"
      }`}
    >
      <img src={icon} alt="" className="size-[19px] shrink-0" />
      {label}
    </span>
  );
  return to ? (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className="block w-[240px]"
    >
      {row}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className="block w-[240px] text-left"
    >
      {row}
    </button>
  );
}

const BRIEF_OPEN_KEY = "nook.boardBriefOpen";

/** Remembers the Board Brief open/closed state across board pages (falls back silently when storage is unavailable). */
function useBriefOpen() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(BRIEF_OPEN_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const toggle = () =>
    setOpen((prev) => {
      try {
        localStorage.setItem(BRIEF_OPEN_KEY, prev ? "0" : "1");
      } catch {
        /* storage unavailable — state still works for this page */
      }
      return !prev;
    });
  return [open, toggle] as const;
}

export function BoardSidebar({
  board,
  hideBrief = false,
}: {
  board: Board;
  hideBrief?: boolean;
}) {
  const location = useLocation();
  const [briefOpen, toggleBrief] = useBriefOpen();
  const [importing, setImporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  // Edits from the Build page show here too; palette dots follow any colour roles that were changed.
  const edit = useBriefEdit(board.id);
  const brief = edit ?? board.brief;
  const paletteDots =
    brief && edit?.colours
      ? [
          ...new Set(
            colourTokens(brief.palette, brief.colours)
              .filter(
                (c) => c.name !== "surface" && c.name !== "text-secondary",
              )
              .map((c) => c.hex),
          ),
        ]
      : (brief?.palette ?? []);
  const fontsEdited =
    edit &&
    board.brief &&
    (edit.fonts.heading !== board.brief.fonts.heading ||
      edit.fonts.body !== board.brief.fonts.body);
  const onHandoff = location.pathname.startsWith(`/boards/${board.id}/handoff`);
  const onUnsorted = location.pathname === `/boards/${board.id}/unsorted`;

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-[320px] shrink-0 flex-col gap-[21px] overflow-y-auto border-r border-border bg-surface py-6 pl-[31px] pr-2">
        <Link
          to="/home"
          aria-label="my.Nook home"
          className="flex w-fit items-center gap-[5px]"
        >
          <img src={logoMark} alt="" className="size-6" />
          <p className="font-logo font-normal text-[20px] leading-none text-ink-soft">
            my.Nook
          </p>
        </Link>

        <Link
          to={`/boards/${board.id}`}
          className="relative block h-[185px] w-[220px] shrink-0 drop-shadow-[0px_0px_8px_rgba(0,0,0,0.12)]"
        >
          <div
            className="absolute left-0 top-0 h-[142px] w-full rounded-t-[30px] bg-placeholder bg-cover bg-center"
            style={
              board.imageUrl
                ? { backgroundImage: `url(${board.imageUrl})` }
                : undefined
            }
          />
          <img
            src={folderPanel}
            alt=""
            className="absolute left-0 top-[75px] h-[110px] w-[220px]"
          />
          <p className="absolute left-[10px] top-[86px] max-w-[105px] truncate text-[15px] font-medium leading-[normal] text-white">
            {board.title}
          </p>
          <p className="absolute right-[12px] top-[125px] whitespace-nowrap text-right font-medium leading-[normal] text-white">
            <span className="text-[18px]">
              {String(board.itemCount).padStart(2, "0")}
            </span>
            <span className="text-[16px]"> Links</span>
          </p>
          <p className="absolute right-[12px] top-[150px] whitespace-nowrap text-[12px] leading-[normal] text-[#e0e0e0]">
            {board.updatedLabel}
          </p>
        </Link>

        <nav className="flex flex-col gap-1">
          <SectionCaption>AI INTEGRATION</SectionCaption>
          <NavRow
            label="Send board to AI"
            icon={navSend}
            to={`/boards/${board.id}/handoff`}
            active={onHandoff}
          />
        </nav>

        <hr className="w-[250px] border-border" />

        <nav className="flex flex-col gap-1">
          <SectionCaption>ADD / CAPTURE</SectionCaption>
          <NavRow
            label="Import Links"
            icon={navImportLinks}
            onClick={() => setImporting(true)}
          />
          <NavRow
            label="Unsorted"
            icon={navUnsorted}
            to={`/boards/${board.id}/unsorted`}
            active={onUnsorted}
          />
        </nav>

        <hr className="w-[250px] border-border" />

        {brief && !hideBrief && (
          <>
            <div className="flex w-[258px] flex-col">
              <button
                type="button"
                aria-expanded={briefOpen}
                aria-controls="board-brief-panel"
                onClick={toggleBrief}
                className="flex w-full items-center justify-between rounded px-3 py-1 text-left hover:bg-surface-soft"
              >
                <span className="text-[12px] font-medium text-text-muted">
                  BOARD BRIEF
                </span>
                <img
                  src={chevronDown}
                  alt=""
                  className={`w-[10px] transition-transform duration-200 ${briefOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                id="board-brief-panel"
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                  briefOpen
                    ? "mt-3 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
                inert={!briefOpen}
              >
                <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-medium text-text-secondary">
                      Mood
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {brief.mood.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-medium text-text-secondary">
                      Palette
                    </p>
                    <PaletteDots colors={paletteDots} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-medium text-text-secondary">
                      Typography
                    </p>
                    <div className="rounded-md border border-border px-2.5 py-1.5 text-[13px] text-text-secondary">
                      {fontsEdited
                        ? `${brief.fonts.heading} / ${brief.fonts.body}`
                        : brief.typography}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[12px] font-medium text-text-secondary">
                      Notes
                    </p>
                    <div className="rounded-md border border-border p-2.5 text-[12px] text-[#b3b3b3]">
                      {brief.notes}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="w-[250px] border-border" />
          </>
        )}

        <nav className="flex flex-col gap-1">
          <SectionCaption>COLLABORATE</SectionCaption>
          <NavRow
            label="Share"
            icon={navShare}
            onClick={() => setSharing(true)}
          />
          <NavRow
            label="Comment"
            icon={navComment}
            onClick={() => commentActions.openAll()}
          />
        </nav>

        <SidebarFooter />
      </aside>
      {importing && (
        <ImportLinksDialog board={board} onClose={() => setImporting(false)} />
      )}
      {sharing && (
        <ShareDialog board={board} onClose={() => setSharing(false)} />
      )}
    </>
  );
}
