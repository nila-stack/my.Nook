import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Avatar } from "../components/ui/Avatar";
import { useCommentsUi } from "../data/comments";
import { destinations } from "../data/destinations";
import { WORKSPACE, useMembers } from "../data/team";
import { useBoards, useUnsorted } from "../data/unsorted";
import logoMark from "../assets/icons/logo-mark.svg";
import arrowForward from "../assets/icons/arrow-forward.svg";
import starFilled from "../assets/icons/star-filled.svg";

const tile =
  "relative flex flex-col overflow-hidden rounded-[20px] border border-[#e6e6e6] p-5";
const label = "text-[14px] leading-none text-text-secondary";

/** A round arrow button in a tile's corner, like the one in the reference. */
function ArrowButton() {
  return (
    <span
      aria-hidden="true"
      className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-surface-soft"
    >
      <img src={arrowForward} alt="" className="size-[13px] -rotate-[135deg]" />
    </span>
  );
}

/**
 * A bento grid of the workspace: boards, a featured board, reference and comment counts, the hand-off tools, a
 * board's design language and storage, all built from the app's real data.
 */
export function Overview() {
  const boards = useBoards();
  const unsorted = useUnsorted();
  const members = useMembers();
  const { byBoard } = useCommentsUi();

  const references = boards.reduce((sum, b) => sum + b.itemCount, 0);
  const featured = boards.find((b) => b.favourite && b.imageUrl) ?? boards[0];
  const covers = boards.filter((b) => b.imageUrl).slice(0, 3);
  const brief =
    boards.find((b) => b.id === "typography")?.brief ?? featured.brief;

  const allComments = Object.entries(byBoard).flatMap(([boardId, list]) =>
    list.map((c) => ({ ...c, boardId })),
  );
  const open = allComments.filter((c) => !c.resolved);
  const commenters = [...new Set(allComments.map((c) => c.author))];
  const commentBoard = allComments[0]?.boardId ?? featured.id;

  const tools = destinations.slice(0, 4);
  const storagePct = Math.round(
    (WORKSPACE.storageUsedGb / WORKSPACE.storageTotalGb) * 100,
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
        <div className="flex flex-col gap-2">
          <h1 className="text-[27px] font-semibold leading-tight text-ink">
            Overview
          </h1>
          <p className="text-[16px] leading-snug text-text-secondary">
            Your references, team and hand-offs at a glance.
          </p>
        </div>

        <div className="grid auto-rows-[158px] grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Brand */}
          <div
            className={`${tile} justify-between border-transparent bg-ink text-white`}
          >
            <img src={logoMark} alt="" className="size-[40px]" />
            <div className="flex flex-col gap-2">
              <p className="font-logo text-[30px] font-normal leading-none">
                my.Nook
              </p>
              <p className="text-[13px] leading-snug text-white/70">
                Where your references live.
              </p>
            </div>
          </div>

          {/* Boards: a fan of real covers */}
          <Link
            to="/home"
            className={`${tile} col-span-2 justify-between bg-accent-tint !border-transparent`}
          >
            <ArrowButton />
            <p className={label}>Boards</p>
            <div className="flex items-end gap-2">
              <span className="text-[56px] font-semibold leading-none text-ink">
                {boards.length}
              </span>
              <span className="pb-1.5 text-[14px] leading-none text-text-secondary">
                {boards.length === 1 ? "board" : "boards"}
              </span>
            </div>
            <div className="pointer-events-none absolute -bottom-6 right-6 flex">
              {covers.map((b, i) => (
                <img
                  key={b.id}
                  src={b.imageUrl}
                  alt=""
                  style={{
                    transform: `rotate(${(i - 1) * 7}deg) translateY(${Math.abs(i - 1) * 8}px)`,
                  }}
                  className="-ml-6 h-[150px] w-[112px] rounded-[12px] border-[3px] border-white object-cover shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)] first:ml-0"
                />
              ))}
            </div>
          </Link>

          {/* Featured board (tall) */}
          <Link
            to={`/boards/${featured.id}`}
            className={`${tile} row-span-2 justify-end border-transparent p-0 text-white`}
          >
            {featured.imageUrl && (
              <img
                src={featured.imageUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[12px] leading-none text-ink">
              <img src={starFilled} alt="" className="size-[12px]" />
              Favourite
            </span>
            <div className="relative flex flex-col gap-2 p-5">
              <p className="text-[20px] font-semibold leading-none">
                {featured.title}
              </p>
              <p className="text-[13px] leading-none text-white/80">
                {featured.itemCount} items · {featured.updatedLabel}
              </p>
            </div>
          </Link>

          {/* References */}
          <Link to="/unsorted" className={`${tile} justify-between bg-surface`}>
            <p className={label}>References</p>
            <p className="text-[56px] font-semibold leading-none text-ink">
              {references}
            </p>
            <p className="text-[14px] leading-none text-accent">
              {unsorted.length} waiting in Unsorted
            </p>
          </Link>

          {/* Comments */}
          <Link
            to={`/boards/${commentBoard}`}
            className={`${tile} justify-between bg-surface`}
          >
            <ArrowButton />
            <p className={label}>Open comments</p>
            <p className="text-[56px] font-semibold leading-none text-ink">
              {open.length}
            </p>
            <div className="flex">
              {commenters.slice(0, 4).map((name) => (
                <Avatar
                  key={name}
                  name={name}
                  size={30}
                  className="-ml-1.5 border-2 border-white first:ml-0"
                />
              ))}
            </div>
          </Link>

          {/* Hand-off tools (tall) */}
          <Link
            to={`/boards/${featured.id}/handoff`}
            className={`${tile} row-span-2 gap-4 bg-surface lg:col-start-3 lg:row-start-2`}
          >
            <p className="text-[20px] font-semibold leading-snug text-ink">
              Hand off your boards to any AI tool
            </p>
            <div className="grid flex-1 grid-cols-2 gap-3">
              {tools.map((t, i) => (
                <div
                  key={t.id}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-[12px] border ${
                    i === 0 ? "border-accent" : "border-[#e6e6e6]"
                  }`}
                >
                  <span
                    className={`absolute right-1.5 top-1.5 flex size-[12px] items-center justify-center rounded-full text-[8px] leading-none ${
                      i === 0
                        ? "bg-accent text-white"
                        : "border border-[#cfcfcf] bg-white"
                    }`}
                  >
                    {i === 0 && "✓"}
                  </span>
                  <img
                    src={t.logo}
                    alt=""
                    className="size-[34px] object-contain"
                  />
                  <span className="text-[12px] leading-none text-ink">
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </Link>

          {/* Design language (wide) */}
          <div
            className={`${tile} col-span-2 flex-row justify-between gap-6 bg-surface lg:col-start-1 lg:row-start-3`}
          >
            <div className="flex min-w-0 flex-col justify-between">
              <p className={label}>Design language · Typography</p>
              <div className="flex gap-2">
                {(brief?.palette ?? []).slice(0, 5).map((c) => (
                  <span
                    key={c}
                    className="size-[30px] rounded-full border border-border"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(brief?.mood ?? []).map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-border px-3 py-1.5 text-[12px] leading-none text-ink"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end justify-between">
              <span className="text-[64px] font-semibold leading-none text-ink">
                Aa
              </span>
              <span className="text-[13px] leading-none text-text-secondary">
                {brief?.typography}
              </span>
            </div>
          </div>

          {/* Team + storage */}
          <div
            className={`${tile} justify-between border-transparent bg-ink text-white lg:col-start-4 lg:row-start-3`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[14px] leading-none text-white/70">Storage</p>
              <p className="text-[12px] leading-none text-white/70">
                {members.filter((m) => m.status === "active").length} active
                members
              </p>
            </div>
            <p className="text-[30px] font-semibold leading-none">
              {WORKSPACE.storageUsedGb} GB{" "}
              <span className="text-[14px] font-normal text-white/70">
                of {WORKSPACE.storageTotalGb} GB
              </span>
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${storagePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
