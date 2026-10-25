import radioSelected from "../../assets/icons/radio-selected.svg";
import radioUnselected from "../../assets/icons/radio-unselected.svg";

type DestinationCardProps = {
  name: string;
  logo?: string;
  selected?: boolean;
  onClick?: () => void;
};

export function DestinationCard({ name, logo, selected = false, onClick }: DestinationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-[125px] w-[119px] flex-col items-center justify-end gap-2.5 rounded-lg border bg-surface pb-4 ${
        selected ? "border-accent" : "border-border"
      }`}
    >
      <img
        src={selected ? radioSelected : radioUnselected}
        alt=""
        className="absolute right-1.5 top-1.5 size-4"
      />
      {logo && <img src={logo} alt="" className="size-[64px] object-contain" />}
      <p className="text-[14px] font-medium text-ink">{name}</p>
    </button>
  );
}
