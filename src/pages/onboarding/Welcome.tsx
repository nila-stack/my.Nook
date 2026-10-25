import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "../../components/layout/OnboardingShell";
import { PhotoCollage, type CollagePhoto } from "../../components/layout/PhotoCollage";

// Native card sizes/rotations derived from the Figma frame (node 915:11090); top values
// scaled by 858/982 to fit this project's shorter onboarding frame (left/width/height untouched).
const photos: CollagePhoto[] = [
  { top: 681, left: 306, width: 242, height: 320, rotate: 30.84 }, // bottom-left, cropped by bottom
  { top: 278, left: -15, width: 242, height: 320, rotate: 22.35 }, // left, cropped by left
  { top: -104, left: 407, width: 242, height: 284, rotate: 22.35 }, // top-center, cropped by top
  { top: -98, left: 929, width: 242, height: 234, rotate: -30.19 }, // top-right, cropped by top/right
  { top: 284, left: 1324, width: 252, height: 333, rotate: -24.93 }, // right, cropped by right
  { top: 688, left: 954, width: 285, height: 280, rotate: -24.93 }, // bottom-right, cropped by bottom
];

export function Welcome() {
  const navigate = useNavigate();

  return (
    <OnboardingShell>
      <div className="relative mx-auto h-[858px] w-[1512px] overflow-hidden">
        <PhotoCollage photos={photos} />

        <div className="absolute left-1/2 top-[321px] -translate-x-1/2 text-center">
          <h1 className="whitespace-nowrap text-[42px] font-semibold leading-[1.5] text-ink">
            For creatives who collect ideas.
          </h1>
          <p className="mx-auto mt-[3px] w-[433px] text-[20px] font-medium leading-[1.45] text-text-secondary">
            A home for the references, inspiration, and visual thinking behind your work.
          </p>
          <button
            type="button"
            onClick={() => navigate("/onboarding/features")}
            className="mx-auto mt-[53px] flex h-[50px] w-60 items-center justify-center rounded-full bg-accent text-[20px] font-semibold text-white hover:bg-accent-hover"
          >
            Get Started
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
