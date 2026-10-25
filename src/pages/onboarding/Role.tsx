import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingShell } from "../../components/layout/OnboardingShell";
import roleDesigner from "../../assets/images/role-designer.png";
import roleArchitect from "../../assets/images/role-architect.png";
import roleIllustrator from "../../assets/images/role-illustrator.png";
import roleMarketer from "../../assets/images/role-marketer.png";
import roleOther from "../../assets/images/role-other.png";

const roles = [
  { id: "designer", label: "Designer", image: roleDesigner, left: 0, top: 0 },
  { id: "illustrator", label: "Illustrator / Artist", image: roleIllustrator, left: 381.5, top: 0 },
  { id: "architect", label: "Architect / Interior Designer", image: roleArchitect, left: 0, top: 136.67 },
  { id: "marketer", label: "Marketer / Creative Strategist", image: roleMarketer, left: 381.5, top: 136.67 },
  { id: "other", label: "Other", image: roleOther, left: 0, top: 273.33 },
];

export function Role() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <OnboardingShell>
      <div
        className="relative mx-auto h-[858px] w-[1512px]"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #ffeae2, #ffffff 75%)",
        }}
      >
        <div className="absolute left-1/2 top-[129px] flex -translate-x-1/2 flex-col items-center gap-[13px] text-center">
          <h1 className="whitespace-nowrap text-[30px] font-semibold text-ink">What do you do?</h1>
          <p className="whitespace-nowrap text-[20px] font-medium text-text-secondary">This helps us tailor a few things for you.</p>
        </div>

        <div className="absolute left-1/2 top-[258.5px] h-[386px] w-[739px] -translate-x-1/2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelected(role.id)}
              style={{ left: role.left, top: role.top }}
              className={`absolute flex h-[112.67px] w-[357.5px] items-center gap-2 overflow-hidden rounded-[21px] border bg-white text-left ${
                selected === role.id ? "border-2 border-accent" : "border-2 border-transparent"
              }`}
            >
              <img src={role.image} alt="" className="h-full w-[140px] shrink-0 object-cover object-left" />
              <span
                className={`text-[14px] font-semibold text-ink ${
                  // The right-hand column's labels sit a further 5px to the left.
                  role.id === "illustrator" || role.id === "marketer" ? "-ml-[8px]" : "-ml-[3px]"
                }`}
              >
                {role.label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("/onboarding/signup")}
          className="absolute left-1/2 top-[686px] flex h-[50px] w-60 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-[20px] font-semibold text-white hover:bg-accent-hover"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={() => navigate("/onboarding/signup")}
          className="absolute left-1/2 top-[756px] -translate-x-1/2 text-[16px] text-ink underline"
        >
          Skip for now
        </button>
      </div>
    </OnboardingShell>
  );
}
