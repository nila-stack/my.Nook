import { Link, NavLink } from "react-router-dom";
import logoMark from "../../assets/icons/logo-mark.svg";
import { SidebarFooter } from "./SidebarFooter";
import iconGeneral from "../../assets/icons/settings-general.svg";
import iconAccount from "../../assets/icons/settings-account.svg";
import iconAppearance from "../../assets/icons/settings-appearance.svg";
import iconNotifications from "../../assets/icons/settings-notifications.svg";
import iconPrivacy from "../../assets/icons/settings-privacy.svg";
import iconIntegrations from "../../assets/icons/settings-integrations.svg";
import iconBilling from "../../assets/icons/settings-billing.svg";
import iconPeople from "../../assets/icons/nav-team.svg";
import iconWorkspaces from "../../assets/icons/nav-projects2.svg";
import iconPreferences from "../../assets/icons/settings-preferences.svg";
import iconConnections from "../../assets/icons/nav-import-links.svg";
import iconPlans from "../../assets/icons/star-black.svg";
import iconStorage from "../../assets/icons/settings-storage.svg";

const items = [
  { label: "General", icon: iconGeneral, to: "/settings" },
  { label: "Account", icon: iconAccount },
  { label: "People", icon: iconPeople },
  { label: "Team / Workspaces", icon: iconWorkspaces },
  { label: "Appearance", icon: iconAppearance },
  { label: "Preferences", icon: iconPreferences },
  { label: "Notifications", icon: iconNotifications },
  { label: "Privacy & Security", icon: iconPrivacy },
  { label: "Connections", icon: iconConnections },
  { label: "Integrations", icon: iconIntegrations },
  { label: "Billing", icon: iconBilling },
  { label: "Storage", icon: iconStorage },
  { label: "Explore Plans", icon: iconPlans },
];

export function SettingsSidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-[320px] shrink-0 flex-col gap-[22px] overflow-y-auto border-r border-border bg-surface py-6 pl-[31px] pr-5">
      <Link to="/home" aria-label="my.Nook home" className="flex w-fit items-center gap-[5px]">
        <img src={logoMark} alt="" className="size-6" />
        <p className="font-logo font-normal text-[20px] leading-none text-ink-soft">my.Nook</p>
      </Link>

      <nav className="flex flex-col gap-[9px]">
        <p className="px-3 text-[12px] font-medium text-text-muted">SETTINGS</p>
        {items.map((item) =>
          item.to ? (
            <NavLink key={item.label} to={item.to} end>
              {({ isActive }) => (
                <span
                  className={`flex w-[240px] items-center gap-[15px] rounded-[32px] px-3 py-2 text-[14px] leading-none text-ink ${
                    isActive ? "bg-accent-tint font-semibold" : "hover:bg-surface-soft"
                  }`}
                >
                  <img src={item.icon} alt="" className="size-[19px]" />
                  {item.label}
                </span>
              )}
            </NavLink>
          ) : (
            <button key={item.label} type="button" className="text-left">
              <span className="flex w-[240px] items-center gap-[15px] rounded-[32px] px-3 py-2 text-[14px] leading-none text-ink hover:bg-surface-soft">
                <img src={item.icon} alt="" className="size-[19px]" />
                {item.label}
              </span>
            </button>
          ),
        )}
      </nav>

      <SidebarFooter showSettings={false} showStorage={false} pinToBottom={false} />
    </aside>
  );
}
