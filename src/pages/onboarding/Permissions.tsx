import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toggle } from "../../components/ui";
import onboarding11Video from "../../assets/videos/onboarding-11.mp4";
import logoMark from "../../assets/icons/logo-mark.svg";

const permissions = [
  {
    id: "extension",
    text: "Allow my.Nook to save references from webpages through the browser extension, including the original source.",
    defaultChecked: true,
  },
  {
    id: "import",
    text: "Allow my.Nook to import screenshots, images and files from your computer.",
    defaultChecked: false,
  },
  {
    id: "export",
    text: "Allow my.Nook to export your curated references and context to your chosen AI workspace for further iteration.",
    defaultChecked: false,
  },
];

/** Onboarding 5 — no standalone top-left wordmark; a white logo overlays the video instead. */
export function Permissions() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto h-[858px] w-[1512px] bg-white">
      <div className="absolute left-[188px] top-[182px] w-[500px]">
        <h1 className="text-[33px] font-semibold text-ink">Almost there</h1>
        <p className="mt-[10px] w-[500px] text-[17px] leading-[1.4] text-text-secondary">
          Choose what my.Nook can access to make collecting and working with your references easier.
        </p>

        <hr className="mt-[24px] border-border" />

        <div className="mt-[26px] flex flex-col gap-[28px]">
          {permissions.map((permission) => (
            <PermissionRow key={permission.id} {...permission} />
          ))}
        </div>

        <div className="mt-[51px] flex items-start gap-2.5">
          <input
            type="checkbox"
            className="mt-0.5 size-[15px] shrink-0 appearance-none rounded border border-[#828282] bg-white bg-center bg-no-repeat checked:border-ink checked:bg-ink checked:bg-[length:11px_11px] checked:bg-[url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27white%27%20stroke-width=%273.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpath%20d=%27M5%2013l4%204L19%207%27/%3E%3C/svg%3E)]"
          />
          <p className="w-[420px] text-[14px] leading-[1.4] text-text-secondary">
            I agree to my.Nook's Terms of Service, Privacy Policy and Data Processing Agreement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/onboarding/ready")}
          className="mt-[38px] flex h-[44px] w-[240px] items-center justify-center rounded-full bg-accent text-[18px] font-semibold text-white hover:bg-accent-hover"
        >
          Finish Up
        </button>
      </div>

      <div className="absolute left-[892px] top-[60px] h-[727px] w-[560px] overflow-hidden rounded-[24px]">
        <video
          src={onboarding11Video}
          autoPlay
          muted
          loop
          playsInline
          className="size-full object-cover"
        />
        <Link to="/home" aria-label="my.Nook home" className="absolute bottom-[34px] right-[33px] z-10 flex items-center gap-[7px]">
          <img src={logoMark} alt="" className="size-[39px]" />
          <p className="font-logo font-normal text-[33px] leading-none text-white">my.Nook</p>
        </Link>
      </div>
    </div>
  );
}

function PermissionRow({
  text,
  defaultChecked,
}: {
  text: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="w-[420px] text-[14px] leading-[1.4] text-text-secondary">{text}</p>
      <Toggle checked={checked} onChange={(e) => setChecked(e.target.checked)} />
    </div>
  );
}
