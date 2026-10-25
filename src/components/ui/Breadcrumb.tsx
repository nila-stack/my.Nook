import { Link } from "react-router-dom";

type Crumb = {
  label: string;
  to?: string;
};

export function Breadcrumb({
  items,
  separator = "/",
  className = "text-[13px]",
}: {
  items: Crumb[];
  separator?: string;
  className?: string;
}) {
  return (
    <nav className={`flex items-center gap-1.5 ${className}`}>
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-text-secondary">{separator}</span>}
          {item.to ? (
            <Link to={item.to} className="text-text-secondary hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-ink" : "text-text-secondary"}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
