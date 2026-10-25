import { useEffect } from "react";
import splashLogo from "../../assets/images/splash-logo.webp";

/** How long the splash stays up before handing over. */
export const SPLASH_MS = 3000;

/**
 * Full-screen splash: the supplied logo animation (the orange circle draws the my.Nook mark, then holds) centred on
 * plain white, about 19% of the size it has in the artwork, until `onDone` fires.
 */
export function Splash({
  onDone,
  duration = SPLASH_MS,
}: {
  onDone: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(timer);
  }, [onDone, duration]);

  return (
    <div
      role="status"
      aria-label="Loading my.Nook"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
    >
      <img
        src={splashLogo}
        alt=""
        className="aspect-square"
        style={{ width: "min(8.9vw, 15.7vh)" }}
      />
    </div>
  );
}
