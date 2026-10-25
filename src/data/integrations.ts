import { useSyncExternalStore } from "react";
import logoPerplexity from "../assets/images/ai-logo-perplexity.png";
import logoGemini from "../assets/images/ai-logo-gemini.png";
import logoWindsurf from "../assets/images/ai-logo-windsurf.png";
import logoReplit from "../assets/images/ai-logo-replit.png";
import logoV0 from "../assets/images/ai-logo-v0.png";
import logoBolt from "../assets/images/ai-logo-bolt.png";

/** Logos for the tools we have artwork for, keyed by lower-case name (anything else falls back to a letter tile). */
const toolLogos: Record<string, string> = {
  perplexity: logoPerplexity,
  gemini: logoGemini,
  windsurf: logoWindsurf,
  replit: logoReplit,
  v0: logoV0,
  bolt: logoBolt,
};
export const logoForTool = (name: string) =>
  toolLogos[name.trim().toLowerCase()];

export type ExtraTool = { id: string; name: string };

/** AI tools added through "Integrate more AI tools" (session only), shown on the AI Integrations page and the hand-off picker. */
let tools: ExtraTool[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const suggestedTools = [
  { name: "Perplexity", by: "Perplexity AI" },
  { name: "Gemini", by: "Google" },
  { name: "Windsurf", by: "Codeium" },
  { name: "Replit", by: "Replit Agent" },
  { name: "v0", by: "Vercel" },
  { name: "Bolt", by: "StackBlitz" },
];

export const integrationActions = {
  /** Connects a tool by name; returns the name as stored (an existing match keeps its original spelling). */
  add(name: string) {
    const clean = name.trim().replace(/\s+/g, " ").slice(0, 28);
    const existing = tools.find(
      (t) => t.name.toLowerCase() === clean.toLowerCase(),
    );
    if (existing) return existing.name;
    tools = [
      ...tools,
      { id: `tool-${Date.now()}-${tools.length}`, name: clean },
    ];
    emit();
    return clean;
  },
  remove(id: string) {
    tools = tools.filter((t) => t.id !== id);
    emit();
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useExtraTools = () => useSyncExternalStore(subscribe, () => tools);
