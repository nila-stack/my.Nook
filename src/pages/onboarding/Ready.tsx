import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "../../components/layout/OnboardingShell";
import { PhotoCollage, type CollagePhoto } from "../../components/layout/PhotoCollage";
import arrowForward from "../../assets/icons/arrow-forward.svg";
import collageOnb12_1 from "../../assets/images/collage-onb12-1.png";
import collageOnb12_2 from "../../assets/images/collage-onb12-2.png";
import collageOnb12_3 from "../../assets/images/collage-onb12-3.png";
import collageOnb12_4 from "../../assets/images/collage-onb12-4.png";
import collageOnb12_5 from "../../assets/images/collage-onb12-5.png";
import collageOnb12_6 from "../../assets/images/collage-onb12-6.png";

const onboarding12Sources = [
  collageOnb12_1,
  collageOnb12_2,
  collageOnb12_3,
  collageOnb12_4,
  collageOnb12_5,
  collageOnb12_6,
];

// Native card sizes/rotations derived from the Figma frame (node 879:6645); top values
// scaled by 858/982 to fit this project's shorter onboarding frame (left/width/height untouched).
const photos: CollagePhoto[] = [
  { top: 681, left: 306, width: 242, height: 320, rotate: 30.84 }, // bottom-left, cropped by bottom
  { top: 278, left: -15, width: 242, height: 320, rotate: 22.35 }, // left, cropped by left
  { top: -104, left: 407, width: 242, height: 284, rotate: 22.35 }, // top-center, cropped by top
  { top: -98, left: 929, width: 242, height: 234, rotate: -30.19 }, // top-right, cropped by top/right
  { top: 299, left: 1335, width: 233, height: 296, rotate: -24.93 }, // right, cropped by right
  { top: 688, left: 954, width: 285, height: 280, rotate: -24.93 }, // bottom-right, cropped by bottom
];

export function Ready() {
  const navigate = useNavigate();

  return (
    <OnboardingShell>
      <div className="relative mx-auto h-[858px] w-[1512px] overflow-hidden">
        <PhotoCollage photos={photos} sources={onboarding12Sources} />

        <div className="absolute left-1/2 top-[321px] -translate-x-1/2 text-center">
          <h1 className="whitespace-nowrap text-[42px] font-semibold leading-[1.5] text-ink">
            Start building your visual library.
          </h1>
          <p className="mt-[3px] whitespace-nowrap text-[20px] font-medium leading-[1.45] text-text-secondary">
            Collect inspiration from anywhere and bring it all into one place.
          </p>
          <button
            type="button"
            onClick={() => navigate("/onboarding/launching")}
            className="mx-auto mt-[53px] flex h-[50px] w-60 items-center justify-center gap-2 rounded-full bg-accent text-[20px] font-semibold text-white hover:bg-accent-hover"
          >
            Explore my.Nook
            <img src={arrowForward} alt="" className="size-4 -rotate-90" />
          </button>
        </div>
      </div>
    </OnboardingShell>
  );
}
