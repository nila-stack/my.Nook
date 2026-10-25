import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { unsortedActions, useUnsorted } from "../../data/unsorted";
import { openCreateDialog } from "../../data/createdBoards";
import { SidebarFooter } from "./SidebarFooter";
import { SearchField } from "../ui";
import logoMark from "../../assets/icons/logo-mark.svg";
import plusWhite from "../../assets/icons/plus-white.svg";
import plusBlack from "../../assets/icons/plus-black.svg";
import navImportLinks from "../../assets/icons/nav-import-links.svg";
import navUploadFile from "../../assets/icons/nav-upload-file.png";
import navBoards from "../../assets/icons/nav-boards.svg";
import navProjects from "../../assets/icons/nav-projects2.svg";
import navFavourites from "../../assets/icons/nav-favourites.svg";
import navHandoffHistory from "../../assets/icons/nav-handoff-history.svg";
import navShared from "../../assets/icons/nav-shared.svg";
import navTeam from "../../assets/icons/nav-team.svg";
import navAiIntegrations from "../../assets/icons/nav-ai-integrations.svg";
import navTrash from "../../assets/icons/nav-trash.svg";
import navArchive from "../../assets/icons/nav-archive.png";
import navUnsorted from "../../assets/icons/nav-unsorted-tray.png";

type NavItem = {
  label: string;
  icon: string;
  to?: string;
  /** Match only the exact path (default); set false to stay active on nested routes. */
  end?: boolean;
};

const navigationItems: NavItem[] = [
  { label: "Boards", icon: navBoards, to: "/home" },
  { label: "Projects", icon: navProjects, to: "/projects" },
  { label: "Favourites", icon: navFavourites, to: "/favourites" },
];

const collaborationItems: NavItem[] = [
  { label: "Shared with me", icon: navShared, to: "/shared" },
  { label: "Team / Workspace", icon: navTeam, to: "/team" },
];

function NavRow({ label, icon, to, end = true, fullWidth = true }: NavItem & { fullWidth?: boolean }) {
  const widthClass = fullWidth ? "w-[240px]" : "w-fit";
  const content = (isActive: boolean) => (
    <span
      className={`flex ${widthClass} items-center gap-[15px] rounded-[32px] px-3 py-2 text-[14px] leading-none ${
        isActive ? "bg-accent-tint font-semibold text-ink" : "font-normal text-ink hover:bg-surface-soft"
      }`}
    >
      <img src={icon} alt="" className="size-[19px] shrink-0" />
      {label}
    </span>
  );

  if (to) {
    return (
      <NavLink to={to} end={end} className={`block ${widthClass}`}>
        {({ isActive }) => content(isActive)}
      </NavLink>
    );
  }

  return (
    <button type="button" className={`block ${widthClass} text-left`}>
      {content(false)}
    </button>
  );
}

function SectionCaption({ children }: { children: string }) {
  return <p className="px-3 text-[12px] font-medium leading-none text-text-muted">{children}</p>;
}

function NewMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const uploaded = (files: FileList | null) => {
    const list = [...(files ?? [])].filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    const stamp = Date.now();
    unsortedActions.add(
      list.map((f, i) => ({
        id: `upload-${stamp}-${i}`,
        title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        domain: "From this device",
        imageUrl: URL.createObjectURL(f),
        boardId: "moodboards",
        essential: false,
        tags: [],
      })),
    );
    navigate("/unsorted");
  };

  const rows = [
    { id: "board", label: "New board", icon: plusBlack },
    { id: "link", label: "Add link", icon: navImportLinks },
    { id: "upload", label: "Upload files", icon: navUploadFile },
  ] as const;

  const choose = (id: (typeof rows)[number]["id"]) => {
    setOpen(false);
    if (id === "board") openCreateDialog("board");
    else if (id === "link") openCreateDialog("link");
    else fileRef.current?.click();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-[43px] w-[240px] items-center gap-2 rounded-full bg-accent px-3 text-[14px] font-medium leading-none text-white transition-colors hover:bg-accent-hover"
      >
        <img src={plusWhite} alt="" className="size-[17px]" />
        New
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          uploaded(e.target.files);
          e.target.value = "";
          setOpen(false);
        }}
      />
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-[240px] rounded-[8px] border border-border bg-surface py-[6px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.1)]"
        >
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              role="menuitem"
              onClick={() => choose(r.id)}
              className="flex h-[40px] w-full items-center gap-3 px-[14px] text-left text-[14px] leading-none text-ink hover:bg-surface-soft"
            >
              <img src={r.icon} alt="" className="size-[16px] object-contain" />
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const unsortedCount = useUnsorted().length;

  return (
    <aside className="sticky top-0 flex h-screen w-[320px] shrink-0 flex-col gap-[22px] overflow-y-auto bg-surface py-6 pl-[31px] pr-5 shadow-panel">
      <Link to="/home" aria-label="my.Nook home" className="flex w-fit items-center gap-[5px]">
        <img src={logoMark} alt="" className="size-6" />
        <p className="font-logo font-normal text-[20px] leading-none text-ink-soft">my.Nook</p>
      </Link>

      <div className="flex flex-col gap-[10px]">
        <SearchField containerClassName="w-[240px]" iconTone="neutral" />
        <NewMenu />
      </div>

      <nav className="flex flex-col gap-1">
        <SectionCaption>NAVIGATION</SectionCaption>
        {navigationItems.map((item) => (
          <NavRow key={item.label} {...item} />
        ))}
      </nav>

      <hr className="w-[250px] border-border" />

      <nav className="flex flex-col gap-1">
        <SectionCaption>COLLABORATION</SectionCaption>
        {collaborationItems.map((item) => (
          <NavRow key={item.label} {...item} />
        ))}
      </nav>

      <hr className="w-[250px] border-border" />

      <nav className="flex flex-col gap-1">
        <SectionCaption>LIBRARY</SectionCaption>
        <NavLink to="/unsorted" className="block w-[240px]">
          {({ isActive }) => (
            <span
              className={`flex w-[240px] items-center gap-[15px] rounded-[32px] px-3 py-2 text-[14px] leading-none text-ink ${
                isActive ? "bg-accent-tint font-semibold" : "font-normal hover:bg-surface-soft"
              }`}
            >
              <img src={navUnsorted} alt="" className="size-[19px] shrink-0" />
              <span className="flex-1">Unsorted</span>
              <span className="flex h-[19px] min-w-[31px] items-center justify-center rounded-full bg-[#0b2639] px-2 text-[11px] font-medium leading-none text-white">
                {unsortedCount}
              </span>
            </span>
          )}
        </NavLink>
        <NavRow label="Archive" icon={navArchive} to="/archive" />
        <NavRow label="Trash" icon={navTrash} to="/trash" />
      </nav>

      <SidebarFooter heading="ACCOUNT">
        <NavRow label="AI Integrations" icon={navAiIntegrations} to="/ai-integrations" />
        <NavRow label="Hand-off History" icon={navHandoffHistory} to="/handoff-history" />
      </SidebarFooter>
    </aside>
  );
}
