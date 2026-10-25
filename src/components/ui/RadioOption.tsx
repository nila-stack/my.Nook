import radioSelected from "../../assets/icons/radio-selected.svg";
import radioUnselected from "../../assets/icons/radio-unselected.svg";

export function RadioOption({
  label,
  detail,
  selected,
  onClick,
}: {
  label: string;
  detail: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-start gap-0.5 text-left">
      <span className="flex items-center gap-2">
        <img src={selected ? radioSelected : radioUnselected} alt="" className="size-3.5" />
        <span className="text-[14px] text-ink">{label}</span>
      </span>
      <span className="text-[12px] text-text-secondary">{detail}</span>
    </button>
  );
}
