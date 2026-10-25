import destClaude from "../assets/images/dest-claude.png";
import destChatgpt from "../assets/images/dest-chatgpt.png";
import destAntigravity from "../assets/images/dest-antigravity.png";
import destLoveable from "../assets/images/dest-loveable.png";
import destCursor from "../assets/images/dest-cursor.png";
import destOther from "../assets/icons/dest-other.svg";

export type Destination = {
  id: string;
  /** Short label shown on the picker card. */
  name: string;
  logo: string;
  /** How the tool is named in sentences ("Handed off to …"). */
  inSentence: string;
  /** Label for the "open the tool" button on the confirmation page. */
  cta: string;
};

export const destinations: Destination[] = [
  {
    id: "claude",
    name: "Claude",
    logo: destClaude,
    inSentence: "Claude",
    cta: "Go to Claude",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    logo: destChatgpt,
    inSentence: "ChatGPT",
    cta: "Go to ChatGPT",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    logo: destAntigravity,
    inSentence: "Google Antigravity",
    cta: "Go to Antigravity",
  },
  {
    id: "loveable",
    name: "Loveable",
    logo: destLoveable,
    inSentence: "Loveable",
    cta: "Go to Loveable",
  },
  {
    id: "cursor",
    name: "Cursor",
    logo: destCursor,
    inSentence: "Cursor",
    cta: "Go to Cursor",
  },
  {
    id: "other",
    name: "Other",
    logo: destOther,
    inSentence: "your AI tool",
    cta: "Go to AI tool",
  },
];

export const defaultDestination = destinations[0];

export const findDestination = (id: string | null | undefined) =>
  destinations.find((d) => d.id === id) ?? defaultDestination;
