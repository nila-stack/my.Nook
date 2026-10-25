/** Light placeholder tile for a pasted link (no real page preview in the prototype). */
export function linkTile(host: string) {
  const letter = host.replace(/^www\./, "")[0]?.toUpperCase() ?? "L";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="420"><rect width="560" height="420" fill="#FFE1D5"/><text x="280" y="250" font-family="sans-serif" font-size="150" font-weight="600" text-anchor="middle" fill="#FE4C02">${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function parseUrl(raw: string): URL | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.includes(".") ? url : null;
  } catch {
    return null;
  }
}

/** A readable title from the last path segment, falling back to the site name. */
export function titleFromUrl(u: URL) {
  const host = u.hostname.replace(/^www\./, "");
  const last = u.pathname.split("/").filter(Boolean).pop();
  if (!last) return host;
  try {
    return decodeURIComponent(last).replace(/[-_]+/g, " ");
  } catch {
    return last;
  }
}
