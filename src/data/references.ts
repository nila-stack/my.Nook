import refCosmo from "../assets/images/board-portfolio-ref.png";
import refDribbble from "../assets/images/ref-dribbble.png";
import refAwwwards from "../assets/images/ref-awwwards.png";

export type Reference = {
  id: string;
  domain: string;
  imageUrl: string;
  favourite?: boolean;
  /** Tags on this reference; when empty the board assigns one from its mood tags. */
  tags?: string[];
};

// Every board folder under assets/references/<boardId>/ is picked up automatically, in filename order.
const referenceImages = import.meta.glob<string>(
  "../assets/references/*/*.{jpg,gif}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const sourcesByBoard: Record<string, string[]> = {
  moodboards: [
    "pinterest.com",
    "are.na",
    "behance.net",
    "dezeen.com",
    "savee.it",
    "mymodernmet.com",
  ],
  branding: [
    "underconsideration.com",
    "behance.net",
    "bpando.org",
    "identitydesigned.com",
    "dribbble.com",
    "abduzeedo.com",
  ],
  "freelance-project-1": [
    "behance.net",
    "dribbble.com",
    "awwwards.com",
    "siteinspire.com",
    "land-book.com",
    "mobbin.com",
  ],
  "motion-studies": [
    "vimeo.com",
    "motionographer.com",
    "dribbble.com",
    "behance.net",
    "lottiefiles.com",
    "youtube.com",
  ],
  "assignment-project": [
    "behance.net",
    "medium.com",
    "pinterest.com",
    "dribbble.com",
    "designspiration.com",
    "are.na",
  ],
  "client-fintech-app": [
    "mobbin.com",
    "dribbble.com",
    "behance.net",
    "pageflows.com",
    "refero.design",
    "stripe.com",
  ],
  illustration: [
    "behance.net",
    "instagram.com",
    "dribbble.com",
    "pinterest.com",
    "artstation.com",
    "illustrationage.com",
  ],
  typography: [
    "typewolf.com",
    "fontsinuse.com",
    "behance.net",
    "pinterest.com",
    "dribbble.com",
    "typographica.org",
  ],
};

function referencesFromFolder(boardId: string): Reference[] {
  const sources = sourcesByBoard[boardId];
  return Object.entries(referenceImages)
    .filter(([path]) => path.includes(`/assets/references/${boardId}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, imageUrl], i) => ({
      id: `${boardId}-${i + 1}`,
      domain: sources[i % sources.length],
      imageUrl,
    }));
}

export const referencesByBoard: Record<string, Reference[]> = {
  ...Object.fromEntries(
    Object.keys(sourcesByBoard).map((id) => [id, referencesFromFolder(id)]),
  ),
  "portfolio-reference": [
    { id: "ref-1", domain: "cosmo.com", imageUrl: refCosmo, favourite: true },
    { id: "ref-2", domain: "dribbble.com", imageUrl: refDribbble },
    { id: "ref-3", domain: "awwwards.com", imageUrl: refAwwwards },
  ],
};
