import boardAssignment from "../assets/images/board-assignment-cover.png";
import boardIllustration from "../assets/images/board-illustration.png";
import boardBranding from "../assets/images/board-branding-cover.jpg";
import boardMotion from "../assets/images/board-motion-cover.jpg";
import boardMoodboards from "../assets/images/board-moodboards-cover.jpg";
import boardFintech from "../assets/images/board-fintech-cover.jpg";
import boardPortfolioRef from "../assets/images/board-portfolio-ref.png";
import boardFreelance from "../assets/images/board-freelance-cover.jpg";
import boardTypography from "../assets/images/board-typography-cover.jpg";

export const boardCategories = [
  "References",
  "Projects",
  "Portfolio",
  "Personal",
] as const;
export type BoardCategory = (typeof boardCategories)[number];

export type BoardBrief = {
  mood: string[];
  palette: string[];
  typography: string;
  notes: string;
  /** Real (Google) font families that realise the typography direction. */
  fonts: { heading: string; body: string };
  /** Colour-role overrides the user set on the Build page (role name → hex), layered over the derived palette. */
  colours?: Partial<Record<string, string>>;
  /** "Layout & Visual Language" notes shown on the AI hand-off page (defaults apply until edited). */
  layout?: string[];
  keywords: string[];
  /** One line of sample copy used in generated prototypes. */
  tagline: string;
};

export type Board = {
  id: string;
  title: string;
  itemCount: number;
  updatedLabel: string;
  imageUrl?: string;
  favourite?: boolean;
  project?: boolean;
  /** Home filter categories this board belongs to (a board can sit in several). */
  categories: BoardCategory[];
  brief?: BoardBrief;
};

export const boards: Board[] = [
  {
    id: "typography",
    categories: ["References", "Personal"],
    title: "Typography",
    itemCount: 12,
    updatedLabel: "Updated 30mins ago",
    imageUrl: boardTypography,
    brief: {
      mood: ["Bold", "Expressive", "Hand-cut"],
      palette: ["#E24932", "#E8CDAB", "#1A1A1A", "#2F3FBF", "#F2C21B"],
      typography: "Display / Bengali lettering",
      notes:
        "Chunky hand-cut lettering with bilingual scripts, saturated posters and playful letter-forms",
      fonts: { heading: "Anton", body: "Noto Sans Bengali" },
      layout: [
        "Hand-cut lettering",
        "Bilingual scripts",
        "High-contrast posters",
        "Bold colour blocks",
        "Playful letter-forms",
      ],
      keywords: ["Hand-cut", "Bilingual", "High contrast", "Poster"],
      tagline: "Letters with a loud personality.",
    },
  },
  {
    id: "portfolio-reference",
    categories: ["References", "Portfolio"],
    title: "Portfolio Reference",
    itemCount: 3,
    updatedLabel: "Updated 1d ago",
    imageUrl: boardPortfolioRef,
    favourite: true,
    brief: {
      mood: ["Minimal", "Editorial", "Warm"],
      palette: ["#0B2639", "#FE4C02", "#FFE1D5", "#7FD8C8", "#F2A6B0"],
      typography: "Montserrat / Serif",
      notes:
        "Playful editorial collage with bold typography, retro print textures, cut-out imagery experimental layouts",
      fonts: { heading: "Montserrat", body: "Libre Baskerville" },
      layout: [
        "Experimental graphics",
        "Retro prints",
        "Cut-out imagery",
        "Vibrant colours",
        "Editorial collage",
      ],
      keywords: ["Retro print", "Cut-out", "Collage", "Experimental"],
      tagline: "A portfolio that plays with print.",
    },
  },
  {
    id: "freelance-project-1",
    categories: ["Projects"],
    title: "Freelance Project 1",
    itemCount: 12,
    updatedLabel: "Updated 3d ago",
    imageUrl: boardFreelance,
    project: true,
    brief: {
      mood: ["Calm", "Minimal", "Product"],
      palette: ["#BCC5C4", "#7B6F56", "#4F423D", "#B3A282", "#F1F2F6"],
      typography: "Rounded sans / Serif",
      notes:
        "Soft, content-first interface with muted palettes, book-cover thumbnails and quiet interactions",
      fonts: { heading: "Nunito", body: "Source Serif 4" },
      layout: [
        "Clean product layouts",
        "Generous white space",
        "Soft neutral palette",
        "Modular grids",
        "Quiet, rounded UI",
      ],
      keywords: ["Content-first", "Soft UI", "Muted", "Bookish"],
      tagline: "A calmer way to keep what you love.",
    },
  },
  {
    id: "assignment-project",
    categories: ["Projects"],
    title: "Assignment Project",
    itemCount: 20,
    updatedLabel: "Updated 4d ago",
    imageUrl: boardAssignment,
    project: true,
    brief: {
      mood: ["Poetic", "Pixel", "Textured"],
      palette: ["#AFAD4F", "#E7E8ED", "#2E5B3A", "#7C8A5A", "#C9C7A0"],
      typography: "Handwritten / Mono",
      notes:
        "Soft pixel-edged layouts with handwritten Cyrillic type, muted greens and open compositions",
      fonts: { heading: "Caveat", body: "IBM Plex Mono" },
      layout: [
        "Pixel textures",
        "Handwritten annotations",
        "Layered paper grain",
        "Soft earthy colours",
        "Poetic type placement",
      ],
      keywords: ["Cyrillic", "Pixel edge", "Handwritten", "Open layout"],
      tagline: "Soft pixels, poetic layouts.",
    },
  },
  {
    id: "illustration",
    categories: ["References", "Portfolio"],
    title: "Illustration",
    itemCount: 39,
    updatedLabel: "Updated 5d ago",
    imageUrl: boardIllustration,
    favourite: true,
    brief: {
      mood: ["Textured", "Folk", "Dreamy"],
      palette: ["#FAE4C5", "#AA97C6", "#906076", "#E4685A", "#4C4A78"],
      typography: "Hand-lettered / Serif",
      notes:
        "Grainy, hand-drawn illustration with soft gradients, nature motifs and storybook compositions",
      fonts: { heading: "Caveat", body: "Lora" },
      layout: [
        "Textured illustration",
        "Folk motifs",
        "Dreamy gradients",
        "Hand-drawn linework",
        "Warm paper tones",
      ],
      keywords: ["Grain", "Storybook", "Nature", "Soft gradient"],
      tagline: "Stories drawn by hand.",
    },
  },
  {
    id: "client-fintech-app",
    categories: ["Projects"],
    title: "Client - Fintech App",
    itemCount: 18,
    updatedLabel: "Updated 5d ago",
    imageUrl: boardFintech,
    project: true,
    brief: {
      mood: ["Modern", "Dark UI", "Gradient"],
      palette: ["#202021", "#D6B1A6", "#76697F", "#F26A4B", "#3B5BDB"],
      typography: "Sans / Grotesk",
      notes:
        "Dark mobile screens with glowing gradient accents, rounded cards and clear numeric hierarchy",
      fonts: { heading: "Space Grotesk", body: "Inter" },
      layout: [
        "Dark interface",
        "Soft gradients",
        "Card-based layouts",
        "Clear data hierarchy",
        "Rounded components",
      ],
      keywords: [
        "Dark mode",
        "Glow gradient",
        "Rounded cards",
        "Numeric hierarchy",
      ],
      tagline: "Money, made simple to read.",
    },
  },
  {
    id: "moodboards",
    categories: ["References", "Personal"],
    title: "Moodboards",
    itemCount: 14,
    updatedLabel: "Updated 1w ago",
    imageUrl: boardMoodboards,
    favourite: true,
    brief: {
      mood: ["Editorial", "Calm", "Curated"],
      palette: ["#3C2E29", "#666763", "#A5A498", "#D1C3B5", "#F2EFEA"],
      typography: "Serif / Light sans",
      notes:
        "Quiet photo collages with soft neutrals, generous white space and small editorial captions",
      fonts: { heading: "Playfair Display", body: "Inter" },
      layout: [
        "Editorial spreads",
        "Muted palettes",
        "Curated image grids",
        "Quiet typography",
        "Generous margins",
      ],
      keywords: ["Editorial", "Neutral", "White space", "Photo collage"],
      tagline: "Quiet collections, carefully composed.",
    },
  },
  {
    id: "motion-studies",
    categories: ["References", "Personal"],
    title: "Motion Studies",
    itemCount: 12,
    updatedLabel: "Updated 1w ago",
    imageUrl: boardMotion,
    brief: {
      mood: ["Flat", "Animated", "Warm"],
      palette: ["#BDD8CD", "#D6D378", "#E3664F", "#3A6FD8", "#514E4C"],
      typography: "Geometric sans",
      notes:
        "Flat vector motion frames with limited palettes, bold silhouettes and graphic scene transitions",
      fonts: { heading: "Poppins", body: "DM Sans" },
      layout: [
        "Flat vector shapes",
        "Smooth motion paths",
        "Warm colour pairs",
        "Bold silhouettes",
        "Simple keyframes",
      ],
      keywords: [
        "Flat vector",
        "Silhouette",
        "Limited palette",
        "Scene transitions",
      ],
      tagline: "Flat scenes that move.",
    },
  },
  {
    id: "branding",
    categories: ["References", "Portfolio"],
    title: "Branding",
    itemCount: 10,
    updatedLabel: "Updated 1w ago",
    imageUrl: boardBranding,
    favourite: true,
    brief: {
      mood: ["Playful", "Bold", "Packaging"],
      palette: ["#E0322B", "#2A4BD7", "#1E1E1E", "#EFEFEF", "#F4B6B0"],
      typography: "Condensed serif / Grotesk",
      notes:
        "Colourful packaging systems with flat illustration, strong red-blue contrast and expressive type",
      fonts: { heading: "DM Serif Display", body: "Space Grotesk" },
      layout: [
        "Bold packaging",
        "Playful illustration",
        "Saturated colour pops",
        "Strong logotypes",
        "Print-ready layouts",
      ],
      keywords: ["Packaging", "Flat illustration", "Red & blue", "Playful"],
      tagline: "Packaging people want to unbox.",
    },
  },
];

/** Maximum number of references that can go out in a single AI handoff. */
export const HANDOFF_REFERENCE_LIMIT = 50;
