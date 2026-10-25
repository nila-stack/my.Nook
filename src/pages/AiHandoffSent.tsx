import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BoardShell } from "../components/layout/BoardShell";
import { Breadcrumb, Button } from "../components/ui";
import { boards } from "../data/boards";
import arrowBack from "../assets/icons/arrow-back.svg";
import handoffVideo from "../assets/videos/handoff-gradient.mp4";

/** People who ask their system for less motion get the first frame of the video, standing still. */
const prefersLessMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
import { findDestination } from "../data/destinations";
import { useBoardOrigin } from "../data/boardOrigin";

export function AiHandoffSent() {
  const origin = useBoardOrigin();
  const { boardId } = useParams();
  const board = boards.find((b) => b.id === boardId) ?? boards[0];
  const navigate = useNavigate();
  // The tool picked on the review page ("?to=cursor"); falls back to Claude when opened directly.
  const [params] = useSearchParams();
  const picked = findDestination(params.get("to"));
  const customName = params.get("name");
  // "Other" with a tool chosen in the integrations dialog is named after that tool.
  const tool =
    picked.id === "other" && customName
      ? { ...picked, inSentence: customName, cta: `Go to ${customName}` }
      : picked;

  return (
    <BoardShell board={board} hideBrief>
      <div className="relative isolate flex min-h-screen flex-col items-center overflow-hidden pl-10 pr-10 pt-[27px] xl:pr-[134px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 overflow-hidden opacity-70"
        >
          <video
            src={handoffVideo}
            autoPlay={!prefersLessMotion}
            muted
            loop
            playsInline
            tabIndex={-1}
            className="absolute inset-0 size-full object-fill"
          />
        </div>

        <div className="self-start">
          <Breadcrumb
            items={[
              { label: origin.label, to: origin.to },
              { label: board.title, to: `/boards/${board.id}` },
              { label: "AI Hand-Off", to: `/boards/${board.id}/handoff` },
              {
                label: "Build from this board",
                to: `/boards/${board.id}/handoff/review`,
              },
              { label: "Handed Off" },
            ]}
          />
        </div>

        {/* The button and card are one group: the button sits above the card's top-left corner. The group is centred
            both ways in the whole area right of the sidebar (the layer spans the full page, so the 134px free
            strip on the right doesn't pull it off-centre). */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[30px]">
          <div className="pointer-events-auto flex w-[420px] max-w-full flex-col items-start gap-4">
            <button
              type="button"
              className="flex h-[31px] items-center gap-2 rounded-full border border-border px-[11.5px] text-[14px] font-medium text-ink"
            >
              <img src={arrowBack} alt="" className="size-[13px] rotate-180" />
              View past sends
            </button>

            <div className="flex w-full flex-col items-center gap-5 rounded-xl border border-border bg-surface px-8 py-10 text-center">
              <img
                src={tool.logo}
                alt=""
                className="size-[60px] object-contain"
              />
              <div className="flex flex-col gap-2">
                <h1 className="text-[20px] font-medium text-ink">
                  Handed off to {tool.inSentence}
                </h1>
                <p className="text-[14px] text-ink">
                  Your board is ready in {tool.inSentence}. Go ahead and build.
                </p>
              </div>

              <div className="flex w-[196px] flex-col gap-3">
                <Button variant="primary" className="h-[43px] !text-[15px]">
                  {tool.cta}
                </Button>
                <Button
                  variant="secondary"
                  className="h-[43px]"
                  onClick={() => navigate("/home")}
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BoardShell>
  );
}
