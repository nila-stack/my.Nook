import { useState, type PointerEvent } from "react";
import collage1 from "../../assets/images/collage-1.png";
import collage2 from "../../assets/images/collage-2.png";
import collage3 from "../../assets/images/collage-3.png";
import collage4 from "../../assets/images/collage-4.png";
import collage5 from "../../assets/images/collage-5.png";
import collage6 from "../../assets/images/collage-6.png";

export type CollagePhoto = {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate: number;
};

const defaultSources = [collage1, collage2, collage3, collage4, collage5, collage6];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One photo of the collage. Hovering lifts it (scale + deeper shadow) and it follows the pointer a little:
 * it drifts and rocks (up to ~8° either way) toward where the cursor is, then settles back to its resting rotation on leave.
 * Uses the individual `rotate` / `translate` / `scale` properties so the resting rotation stays intact.
 */
function CollagePhotoCard({ photo, src }: { photo: CollagePhoto; src: string }) {
  const [hover, setHover] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const onMove = (e: PointerEvent<HTMLImageElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    // -1..1 across the photo's on-screen bounds, 0 at its centre.
    setPointer({
      x: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)),
      y: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)),
    });
  };

  const live = hover && !prefersReducedMotion();

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onPointerEnter={() => setHover(true)}
      onPointerMove={onMove}
      onPointerLeave={() => {
        setHover(false);
        setPointer({ x: 0, y: 0 });
      }}
      className={`absolute rounded-2xl object-cover transition-[rotate,translate,scale,box-shadow] duration-300 ease-out ${
        hover
          ? "shadow-[0px_22px_55px_0px_rgba(120,120,120,0.35)]"
          : "shadow-[0px_0px_42px_0px_rgba(170,170,170,0.25)]"
      }`}
      style={{
        top: photo.top,
        left: photo.left,
        width: photo.width,
        height: photo.height,
        rotate: `${photo.rotate + (live ? pointer.x * 8 : 0)}deg`,
        translate: live ? `${-pointer.x * 10}px ${-pointer.y * 10 - 8}px` : "0px 0px",
        scale: live ? 1.05 : 1,
        zIndex: hover ? 5 : undefined,
        cursor: "default",
      }}
    />
  );
}

/** Scattered rotated-photo hero background, reused by both onboarding "bookend" screens. */
export function PhotoCollage({ photos, sources = defaultSources }: { photos: CollagePhoto[]; sources?: string[] }) {
  return (
    <>
      {photos.map((photo, i) => (
        <CollagePhotoCard key={i} photo={photo} src={sources[i]} />
      ))}
    </>
  );
}
