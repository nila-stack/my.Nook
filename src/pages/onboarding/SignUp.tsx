import { Link, useNavigate } from "react-router-dom";
import onboarding10Video from "../../assets/videos/onboarding-10.mp4";
import logoMark from "../../assets/icons/logo-mark.svg";
import iconGoogle from "../../assets/images/icon-google.png";
import iconApple from "../../assets/images/icon-apple.png";

/** Onboarding 4 — no standalone top-left wordmark; the logo overlays the video instead. */
export function SignUp() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto h-[858px] w-[1512px] bg-white">
      <div className="absolute left-[60px] top-[60px] h-[738px] w-[619px] overflow-hidden rounded-[24px]">
        <video
          src={onboarding10Video}
          autoPlay
          muted
          loop
          playsInline
          className="size-full object-cover"
        />
        <Link to="/home" aria-label="my.Nook home" className="absolute left-[35px] top-[23px] z-10 flex items-center gap-[6px]">
          <img src={logoMark} alt="" className="size-[33px]" />
          <p className="font-logo font-normal text-[28px] leading-none text-ink">my.Nook</p>
        </Link>
      </div>

      <button
        type="button"
        className="absolute left-[1269px] top-[41px] flex h-[43px] w-[184px] items-center justify-center rounded-full bg-ink text-[16px] font-semibold text-white"
      >
        Sign In
      </button>

      <div className="absolute left-[851px] top-[155px] w-[490px]">
        <h1 className="text-[30px] font-semibold text-ink">Get Started!</h1>
        <p className="mt-[9px] text-[19px] text-text-secondary">Welcome to my.Nook - Let's get started.</p>

        <hr className="mt-[25px] border-border" />

        <div className="mt-[34px] flex flex-col gap-[21px]">
          <div className="flex flex-col gap-[11px]">
            <label className="text-[17px] text-text-secondary">Your email</label>
            <input type="email" className="h-[45px] rounded-lg border border-[#e0e0e0] px-4 text-[13px]" />
          </div>
          <div className="flex flex-col gap-[11px]">
            <label className="text-[17px] text-text-secondary">Password</label>
            <input type="password" className="h-[45px] rounded-lg border border-[#e0e0e0] px-4 text-[13px]" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/onboarding/permissions")}
          className="mt-[42px] flex h-[43px] w-full items-center justify-center rounded-full bg-accent text-[17px] font-semibold text-white hover:bg-accent-hover"
        >
          Get Started
        </button>

        <div className="mt-[27px] flex items-center gap-5 text-[14px] font-medium text-text-secondary">
          <hr className="flex-1 border-border" />
          or continue with
          <hr className="flex-1 border-border" />
        </div>

        <div className="mt-[30px] flex gap-7">
          <button
            type="button"
            className="flex h-[58px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] text-[14px] font-medium text-text-secondary"
          >
            <img src={iconGoogle} alt="" className="size-[32px]" />
            Continue with Google
          </button>
          <button
            type="button"
            className="flex h-[58px] flex-1 items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] text-[14px] font-medium text-text-secondary"
          >
            <img src={iconApple} alt="" className="h-[32px] w-[26px]" />
            Continue with Apple ID
          </button>
        </div>
      </div>
    </div>
  );
}
