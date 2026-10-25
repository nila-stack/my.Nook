export function PaletteDots({ colors }: { colors: string[] }) {
  return (
    <div className="flex h-6 items-center gap-1.5">
      {colors.map((color) => (
        <span key={color} className="size-4 rounded-full border border-border" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}
