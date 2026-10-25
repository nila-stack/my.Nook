/** Up to five thumbnails, with a sixth blurred tile saying how many more references are going ("+3 More"). */
export function ReferenceThumbs({
  images,
  size = "md",
}: {
  images: string[];
  size?: "md" | "sm";
}) {
  const small = size === "sm";
  const tile = small ? "size-[48px]" : "size-24";
  const shown = images.slice(0, 5);
  const more = images.length - shown.length;
  return (
    <div className={`flex flex-wrap ${small ? "gap-1.5" : "gap-2.5"}`}>
      {shown.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className={`${tile} rounded-md bg-placeholder object-cover`}
        />
      ))}
      {more > 0 && (
        <div className={`relative ${tile} overflow-hidden rounded-md`}>
          <img
            src={images[5]}
            alt=""
            className="size-full scale-110 object-cover blur-[2px]"
          />
          <span
            className={`absolute inset-0 flex items-center justify-center font-semibold text-ink ${small ? "text-[12px]" : "text-[13px]"}`}
          >
            +{more} More
          </span>
        </div>
      )}
    </div>
  );
}
