import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "../../components/layout/OnboardingShell";
import featureOrganise1 from "../../assets/images/feature-organise-1-real.png";
import featureOrganise2 from "../../assets/images/feature-organise-2-real.jpg";
import featureCuratePhoto from "../../assets/images/feature-curate-photo.jpg";
import featureHandoff from "../../assets/images/feature-handoff-phone.png";
import logoMark from "../../assets/icons/logo-mark.svg";
import destClaude from "../../assets/images/dest-claude.png";
import destChatgpt from "../../assets/images/dest-chatgpt.png";
import destAntigravity from "../../assets/images/dest-antigravity.png";
import destLoveable from "../../assets/images/dest-loveable.png";
import { boards } from "../../data/boards";
import { referencesByBoard } from "../../data/references";

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5s-7.5-4.6-10-9.2C.5 8 2 4.5 5.5 4c2-.3 3.8.6 5 2.2C11.7 4.6 13.5 3.7 15.5 4 19 4.5 20.5 8 19 11.3c-2.5 4.6-10 9.2-10 9.2Z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.6 5.1A10.9 10.9 0 0 1 12 5c5 0 9 4 10.5 7-.6 1.2-1.5 2.5-2.7 3.6M6.2 6.6C4 8 2.3 10 1.5 12c1.5 3 5.5 7 10.5 7 1.4 0 2.7-.3 3.9-.8"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 10a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function CardHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2 px-7 pt-8">
      <p className="text-[22px] font-semibold text-ink">{title}</p>
      <p className="w-[236px] text-[15px] leading-[22px] text-text-secondary">{description}</p>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/** Cursor-responsive tilt (max ~2deg) + normalized --mx/--my vars for parallax on child layers. */
function TiltCard({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ref.current.style.setProperty("--tilt-x", `${((0.5 - py) * 4).toFixed(2)}deg`);
    ref.current.style.setProperty("--tilt-y", `${((px - 0.5) * 4).toFixed(2)}deg`);
    ref.current.style.setProperty("--mx", ((px - 0.5) * 2).toFixed(2));
    ref.current.style.setProperty("--my", ((py - 0.5) * 2).toFixed(2));
  }

  function reset() {
    if (!ref.current) return;
    ref.current.style.setProperty("--tilt-x", "0deg");
    ref.current.style.setProperty("--tilt-y", "0deg");
    ref.current.style.setProperty("--mx", "0");
    ref.current.style.setProperty("--my", "0");
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={`${className} motion-reduce:transition-none motion-reduce:hover:scale-100`}
      style={
        reducedMotion
          ? undefined
          : { transform: "perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))" }
      }
    >
      {children}
    </div>
  );
}

/** Board cards that scroll sideways inside the Organise card: the two from the design, then boards from the home page. */
const organiseCards = [
  { title: "UI/UX Reference", meta: "30 items · Updated 1d ago", image: featureOrganise1 },
  { title: "Freelance Project 1", meta: "11 items · Updated 3d ago", image: featureOrganise2 },
  ...["typography", "portfolio-reference", "illustration", "client-fintech-app", "moodboards", "branding"].flatMap((id) => {
    const b = boards.find((x) => x.id === id);
    return b?.imageUrl
      ? [{ title: b.title, meta: `${b.itemCount} items · ${b.updatedLabel}`, image: b.imageUrl }]
      : [];
  }),
];
const ORGANISE_PITCH = 197 + 18;

/** The Capture card's pictures, all from the Assignment Project board: tall cards with rounded tops that run off the
 *  bottom of the card, 16px apart, each starting a little higher or lower than its neighbours. They sit still until
 *  the card is hovered, then scroll sideways. */
const captureTiles = (() => {
  const all = referencesByBoard["assignment-project"] ?? [];
  const shape = [
    { w: 200, lift: 20 },
    { w: 150, lift: 0 },
    { w: 190, lift: 30 },
    { w: 160, lift: 8 },
    { w: 205, lift: 24 },
    { w: 150, lift: 2 },
    { w: 195, lift: 34 },
    { w: 165, lift: 10 },
    { w: 200, lift: 18 },
    { w: 150, lift: 4 },
  ];
  // The first two are the default thumbnail (the blue halftone poster, then the vase); the rest follow.
  const order = [6, 8, 0, 2, 4, 10, 12, 14, 16, 18];
  return shape
    .map((t, i) => ({ ...t, image: all[order[i]]?.imageUrl }))
    .flatMap((t) => (t.image ? [{ w: t.w, lift: t.lift, src: t.image }] : []));
})();
const CAPTURE_GAP = 16;
/** One full set of tiles including the gap after the last, which is how far the strip travels before it repeats. */
const CAPTURE_SET_W = captureTiles.reduce((sum, t) => sum + t.w + CAPTURE_GAP, 0);

/** The Curate photo stack, rebuilt as separate photos: three from the boards behind, the hiker photo in front. Each has
 *  its resting tilt and a slightly wider one for hover. */
const curateStack = (() => {
  const cover = (id: string) => boards.find((b) => b.id === id)?.imageUrl;
  const back = [
    { src: cover("moodboards"), rest: "rotate(-15deg) translate(-4px, 3px)", hover: "rotate(-20deg) translate(-6px, 4px)" },
    { src: cover("branding"), rest: "rotate(11deg) translate(8px, -2px)", hover: "rotate(17deg) translate(13px, -3px)" },
    { src: cover("illustration"), rest: "rotate(-7deg) translate(-2px, 1px)", hover: "rotate(-11deg) translate(-4px, 2px)" },
  ];
  return back.flatMap((c) => (c.src ? [{ ...c, src: c.src }] : []));
})();

/** Soft oval around the figure in the Build card's picture. */
const FIGURE_MASK = "radial-gradient(ellipse 30% 32% at 44% 38%, #000 45%, transparent 100%)";

const CARD_BASE =
  "group relative h-[414px] w-[306px] overflow-hidden rounded-[21px] border border-[#ffe7dd] bg-white shadow-[0px_16px_16px_0px_rgba(187,187,187,0.25)] transition-all duration-300 ease-out hover:scale-[1.05]";

export function Features() {
  const navigate = useNavigate();

  return (
    <OnboardingShell>
      <style>{`
        @keyframes fw-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(254,76,2,0.35); }
          50% { box-shadow: 0 0 0 4px rgba(254,76,2,0.12); }
        }
        @keyframes fw-scroll-capture {
          from { transform: translateX(0); }
          to { transform: translateX(-${CAPTURE_SET_W}px); }
        }
        @keyframes fw-scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-${ORGANISE_PITCH * organiseCards.length}px); }
        }
        @keyframes fw-dream {
          0% { filter: blur(0.6px) hue-rotate(0deg) saturate(1.05) brightness(1.02); transform: translate(0, 0) scale(1.01); }
          100% { filter: blur(1.8px) hue-rotate(10deg) saturate(1.3) brightness(1.06); transform: translate(2px, -3px) scale(1.05); }
        }
        .fw-selected-pulse { animation: none; }
        @media (prefers-reduced-motion: no-preference) {
          .group:hover .fw-cap-scroll { animation: fw-scroll-capture 22s linear infinite; }
          .group:hover .fw-org-scroll { animation: fw-scroll-left 14s linear infinite; }
          .group:hover .fw-dream-img { animation: fw-dream 3.4s ease-in-out infinite alternate; }
        }
        .group:hover .fw-selected-pulse { animation: fw-pulse-ring 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .group:hover .fw-selected-pulse { animation: none; }
        }
      `}</style>
      <div
        className="relative mx-auto h-[858px] w-[1512px]"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #ffeae2, #ffffff 75%)",
        }}
      >
        <h1 className="absolute left-1/2 top-[92px] -translate-x-1/2 whitespace-nowrap text-[30px] font-semibold text-ink">
          Make more of what inspires you.
        </h1>
        <p className="absolute left-1/2 top-[150px] -translate-x-1/2 whitespace-nowrap text-[20px] font-medium text-text-secondary">
          Bring your references together, make sense of them, and turn them into something you can build with.
        </p>

        <div className="absolute left-[114px] top-[228px] flex gap-5">
          {/* Capture */}
          <TiltCard className={CARD_BASE}>
            <CardHeader title="Capture" description="From anywhere, without losing the source." />
            {/* The original shot, then pictures from the Illustration board; on hover the strip scrolls sideways,
                clipped inside the card, and loops (the set is repeated so there is no jump). */}
            <div className="absolute inset-x-0 bottom-0 top-[160px] overflow-hidden rounded-b-[21px]">
              <div className="fw-cap-scroll flex h-full w-max pl-[19px]">
                {[0, 1].map((copy) => (
                  <div key={copy} aria-hidden={copy === 1 ? true : undefined} className="flex h-full shrink-0 items-start gap-4 pr-4">
                    {captureTiles.map((tile) => (
                      <img
                        key={tile.src}
                        src={tile.src}
                        alt=""
                        draggable={false}
                        style={{ marginTop: tile.lift, width: tile.w }}
                        className="h-[300px] shrink-0 rounded-t-[19px] object-cover"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="absolute left-3 top-[168px] z-10 flex w-[126px] flex-col gap-1.5 rounded-lg bg-white px-3 py-2 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out"
              style={{ transform: "translate(calc(var(--mx, 0) * -4px), calc(var(--my, 0) * -3px))" }}
            >
              <div className="flex items-center gap-1.5 text-ink">
                <span className="size-3">
                  <HeartIcon />
                </span>
                <p className="text-[10.5px]">See more</p>
              </div>
              <div className="flex items-center gap-1.5 text-ink">
                <span className="size-3">
                  <EyeOffIcon />
                </span>
                <p className="text-[10.5px]">See less</p>
              </div>
              <div className="flex items-center gap-1.5 text-ink">
                <span className="size-3">
                  <DownloadIcon />
                </span>
                <p className="text-[10.5px]">Download image</p>
              </div>
              <div className="flex items-center gap-1.5 text-ink">
                <img src={logoMark} alt="" className="size-3" />
                <p className="text-[10.5px] font-medium">Save to my.Nook</p>
              </div>
            </div>
          </TiltCard>

          {/* Organise */}
          <TiltCard className={CARD_BASE}>
            <CardHeader title="Organise" description="Turn a pile of references into a structured project." />
            {/* Category chips (the last one runs off the card edge, as in the design). */}
            <span className="absolute left-[32px] top-[171px] flex h-[27px] w-[77px] items-center justify-center rounded-full border-[1.5px] border-[#fc9e79] bg-[#ffe3d8] text-[14px] leading-none text-ink transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
              Portfolio
            </span>
            <span className="absolute left-[122px] top-[172px] flex h-[27px] w-[75px] items-center justify-center rounded-full border-[1.5px] border-[#e1e0e3] bg-[#fdfaff] text-[14px] leading-none text-ink transition-transform delay-[40ms] duration-300 ease-out group-hover:-translate-y-0.5">
              Projects
            </span>
            <span className="absolute left-[210px] top-[171px] flex h-[27px] w-[94px] items-center justify-center rounded-full border-[1.5px] border-[#e1e1df] bg-[#fffef8] text-[14px] leading-none text-ink transition-transform delay-[80ms] duration-300 ease-out group-hover:-translate-y-0.5">
              References
            </span>

            {/* Board cards. On hover the strip scrolls sideways, clipped inside the card, and loops (the set is
                repeated so the loop has no jump). */}
            <div className="absolute left-0 top-[224px] h-[190px] w-full overflow-hidden">
              <div className="fw-org-scroll flex w-max gap-[18px] pl-[31px]">
                {[0, 1].map((copy) =>
                  organiseCards.map((card) => (
                    <div
                      key={`${copy}-${card.title}`}
                      aria-hidden={copy === 1 ? true : undefined}
                      className="h-[162px] w-[197px] shrink-0 overflow-hidden rounded-[16px] bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)]"
                    >
                      <img src={card.image} alt="" className="h-[124px] w-full object-cover object-top" />
                      <div className="px-[14px] pt-[4px]">
                        <p className="truncate text-[14px] font-medium leading-[14px] text-ink">{card.title}</p>
                        <p className="mt-[1px] truncate text-[11px] leading-[12px] text-text-secondary">{card.meta}</p>
                      </div>
                    </div>
                  )),
                )}
              </div>
            </div>
          </TiltCard>

          {/* Curate */}
          <TiltCard className={CARD_BASE}>
            <CardHeader title="Curate" description="Turn a collection of references into a clear direction." />
            {/* The photo stack (rebuilt from whole photos, so nothing is missing between them): on hover the photos
                underneath swing out a little and the front one turns the other way. */}
            <div className="absolute left-[33px] top-[144px] h-[174.5px] w-[148.5px]">
              {curateStack.map((card) => (
                <img
                  key={card.src}
                  src={card.src}
                  alt=""
                  draggable={false}
                  style={{ ["--rest" as string]: card.rest, ["--hover" as string]: card.hover }}
                  className="absolute left-[24px] top-[8px] h-[158px] w-[100px] origin-[50%_85%] rounded-[8px] border-[3px] border-white bg-white object-cover shadow-[0px_3px_10px_0px_rgba(0,0,0,0.16)] [transform:var(--rest)] transition-transform duration-500 ease-out group-hover:[transform:var(--hover)] motion-reduce:transition-none"
                />
              ))}
              <img
                src={featureCuratePhoto}
                alt=""
                draggable={false}
                className="absolute left-[24px] top-[8px] h-[158px] w-[100px] origin-[50%_85%] rounded-[8px] border-[3px] border-white bg-white object-cover shadow-[0px_4px_12px_0px_rgba(0,0,0,0.2)] [transform:rotate(-3deg)] transition-transform duration-500 ease-out group-hover:[transform:rotate(3deg)_translate(4px,-2px)] motion-reduce:transition-none"
              />
            </div>
            <div className="absolute left-[115px] top-[214px] z-10 h-[190px] w-[184px] rounded-[16px] border border-[#f1ece9] bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.07)] transition-transform duration-300 ease-out group-hover:-translate-y-[6px]">
              <p className="absolute left-[15px] top-[21px] text-[11px] leading-[11px] text-text-secondary">Mood</p>
              <div className="absolute left-[15px] top-[37px] flex gap-[5px]">
                <span className="flex h-[22px] items-center rounded-full border border-[#c9d6ee] bg-[#e9f0fe] px-[10px] text-[12px] leading-none text-ink">
                  Minimal
                </span>
                <span className="flex h-[22px] items-center rounded-full border border-[#e2dfc7] bg-[#fef9e0] px-[10px] text-[12px] leading-none text-ink">
                  Editorial
                </span>
              </div>

              <p className="absolute left-[15px] top-[74px] text-[11px] leading-[11px] text-text-secondary">Palette</p>
              <div className="absolute left-[15px] top-[89px] flex items-center gap-[5.6px]">
                {["#fe4d02", "#d2ce60", "#d7cb96", "#99ae65", "#dfeef2"].map((color, i) => (
                  <span
                    key={color}
                    className="size-[19px] rounded-full border border-[#d5d5d5] transition-transform duration-300 ease-out group-hover:scale-110"
                    style={{ backgroundColor: color, transitionDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>

              <p className="absolute left-[15px] top-[123px] text-[11px] leading-[11px] text-text-secondary">Typography</p>
              <div className="absolute left-[15px] top-[139px] flex h-[22px] w-[151px] items-center rounded-md border border-[#d0d0d0] px-[8px] text-[12px] leading-none text-ink">
                Montserrat / Serif
              </div>
            </div>
          </TiltCard>

          {/* Build */}
          <TiltCard className={CARD_BASE}>
            <CardHeader title="Build" description="Hand-off your boards directly to any AI tool to iterate and build." />
            {/* The picture itself stays still and sharp. On hover a soft copy of just the figure (the woman in the
                yellow dress, the part showing beside the Send to panel) drifts and blurs over it, feathered at the edges, so only that part of the image moves. */}
            <div className="absolute left-[34px] top-[158px] h-[149px] w-[97px] overflow-hidden rounded-[10px] drop-shadow-[0px_10px_10px_rgba(187,187,187,0.4)] transition-transform duration-300 ease-out group-hover:-translate-y-1">
              <img src={featureHandoff} alt="" className="size-full object-cover" />
              <img
                src={featureHandoff}
                alt=""
                aria-hidden
                draggable={false}
                className="fw-dream-img absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  WebkitMaskImage: FIGURE_MASK,
                  maskImage: FIGURE_MASK,
                }}
              />
            </div>
            <div className="absolute left-[94px] top-[200px] z-10 flex h-[204px] w-[203px] flex-col gap-2 rounded-[11px] border border-[#eeeeee] bg-white px-[19px] pt-[14px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out group-hover:translate-x-[3px] group-hover:-translate-y-[5px]">
              <div className="grid grid-cols-2 gap-[13px]">
                {[
                  { name: "Claude", logo: destClaude, selected: true },
                  { name: "ChatGPT", logo: destChatgpt },
                  { name: "Antigravity", logo: destAntigravity },
                  { name: "Loveable", logo: destLoveable },
                ].map((dest) => (
                  <div
                    key={dest.name}
                    className={`relative flex h-[80px] flex-col items-center gap-[6px] rounded-lg border pt-[19px] ${
                      dest.selected ? "fw-selected-pulse border-accent" : "border-[#d0d0d0]"
                    }`}
                  >
                    <span
                      className={`absolute right-[6px] top-[5px] flex size-[10px] items-center justify-center rounded-full ${
                        dest.selected ? "bg-accent" : "border border-[#cfcfcf] bg-white"
                      }`}
                    >
                      {dest.selected && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" className="size-[7px]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <img src={dest.logo} alt="" className="size-[30px] object-contain" />
                    <p className="text-[10px] leading-none text-ink">{dest.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>
        </div>

        <button
          type="button"
          onClick={() => navigate("/onboarding/role")}
          className="absolute left-1/2 top-[686px] flex h-[50px] w-60 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-[20px] font-semibold text-white hover:bg-accent-hover"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={() => navigate("/onboarding/role")}
          className="absolute left-1/2 top-[756px] -translate-x-1/2 text-[16px] text-ink underline"
        >
          Skip for now
        </button>
      </div>
    </OnboardingShell>
  );
}
