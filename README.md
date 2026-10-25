# my.Nook

**A reference manager for creatives that turns scattered inspiration into a clear brief for AI.**

my.Nook lets designers collect visual references into boards, add context to them (mood, colour palette, typography, notes), mark the references that matter most, and hand the whole board to an AI tool as a ready-to-use prompt.

**Live prototype:** https://my-nook-three.vercel.app

> This is a front-end prototype built from a Figma design system. There is no backend: everything you do (favourites, comments, shares, trash and so on) is kept in memory for the session and resets when you reload the page.

## Why it exists

Creatives save references everywhere (Pinterest, screenshots, Instagram, Figma, bookmarks), but saving isn't the same as finding, and a pile of images doesn't carry the intent behind it. my.Nook keeps the context with the reference, all the way into creation.

## Features

- **Boards and library:** boards, projects, favourites, unsorted references, archive and trash.
- **Capture:** add references by link, file upload or extension (Import Links), plus an unsorted inbox per board.
- **Board brief:** mood, colour palette, typography and notes for each board, editable in place.
- **Curate:** star the essential references, filter and sort, select many at once.
- **Collaborate:** share a whole board or only its essentials (view or edit access), comment on references, a shared-with-me view and a team workspace with roles.
- **AI hand-off:** choose what to send (entire board or essentials only), pick a target tool (Claude, ChatGPT, Antigravity, Loveable, Cursor or your own), choose a one-time export or a live reference, and generate a prompt written for that tool.
- **AI integrations:** connect, manage and remove AI tools, with suggestions for more (Perplexity, Gemini, Windsurf, Replit, v0, Bolt).
- **Hand-off history** and a **settings** area (account, preferences, storage, plans and more).
- **Onboarding:** splash, product walkthrough, role selection, sign up and permissions.

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (design tokens in `src/index.css`) |
| Routing | React Router v7 |
| Linting | Oxlint |
| Hosting | Vercel |

Fonts: **Libre Franklin** for the interface and **Londrina Solid** for the my.Nook wordmark only.

## Getting started

You need a recent LTS version of Node.js (20.19+ or 22.12+).

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

Other scripts:

```bash
npm run build      # type-check (tsc) and create a production build in dist/
npm run preview    # serve the production build locally
npm run lint       # run Oxlint
```

## Project structure

```
src/
  App.tsx            Routes
  index.css          Design tokens (colour, fonts, radii) and global styles
  pages/             One file per screen (Home, BoardDetail, AiHandoff*, Settings, ...)
    onboarding/      Welcome, walkthrough, role, sign up, permissions, ready
  components/
    ui/              Reusable pieces (Button, Chip, Menu, ReferenceCard, ...)
    layout/          Shells, sidebars, dialogs, splash
    build/           Editing fields and prototype preview
  data/              Sample data and small in-memory stores (favourites, comments, shares, ...)
  lib/               Helpers (prompt and token generation, links, reference attributes)
  assets/            Icons, images, videos
public/              Favicons
vercel.json          Rewrites all routes to index.html so deep links work
```

Shared state lives in small stores built on React's `useSyncExternalStore`, with a little `sessionStorage` for navigation context. Swapping them for an API would not require changing the screens.

## Design system

- **Accent** `#FE4C02`, **accent tint** `#FFE1D5`, black text with greys `#5C5C5C` and `#8C8C8C`, and a white canvas with a soft peach glow.
- Pill-shaped buttons and chips; cards use a 20px radius with a 1px outline and no drop shadow.
- Main action buttons are 43px tall and toolbar controls are 40px.
- Page padding on content screens is 134px.

## Deployment

The site is deployed on Vercel. `vercel.json` rewrites every path to `index.html`, so direct links such as `/boards/typography` work after a refresh.

`index.html` contains a Microsoft Clarity snippet for usage analytics. If you fork this project, replace it with your own project ID or remove it.

## How it was built

Designed in Figma, then built in code with AI assistance (Claude Code): the design tokens came from the Figma design system, the screens were built section by section, and each one was checked against Figma in the browser and refined.

## Credits and notes

- The reference images and sample boards are used for demonstration only. They belong to their original creators and are not licensed for reuse.
- Third-party names and logos (Claude, ChatGPT, Cursor, Figma and others) are trademarks of their respective owners and appear only to show integrations.
- Names and email addresses in `src/data/` are sample data.
