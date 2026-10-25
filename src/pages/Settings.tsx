import { useState } from "react";
import { SettingsSidebar } from "../components/layout/SettingsSidebar";
import { AiFab } from "../components/layout/AiFab";
import { BackLink } from "../components/ui/BackLink";
import { Checkbox, Toggle } from "../components/ui";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[13px] font-medium text-text-secondary">{label}</p>
      <div className="w-[420px] rounded-md border border-border px-3 py-2 text-[14px] text-ink">
        {value}
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[18px] font-bold text-ink">{title}</p>
      <p className="text-[13px] text-text-secondary">{subtitle}</p>
    </div>
  );
}

function ToggleRow({
  label,
  detail,
  defaultChecked,
}: {
  label: string;
  detail: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <p className="text-[14px] text-ink">{label}</p>
        <p className="text-[12px] text-text-secondary">{detail}</p>
      </div>
      <Toggle
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    </div>
  );
}

const themes = ["Light", "Dark", "System"] as const;

export function Settings() {
  const [theme, setTheme] = useState<(typeof themes)[number]>("Light");

  return (
    <div className="flex min-h-screen bg-surface">
      <SettingsSidebar />
      <main className="content-wash min-h-screen flex-1 pl-11 pr-11 pb-16 pt-[52px] xl:pr-[134px]">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <BackLink to="/home" label="Back to Boards" />
            <h1 className="text-[27px] font-semibold leading-tight text-ink">
              Settings
            </h1>
          </div>
          <p className="text-[16px] leading-snug text-text-secondary">
            Manage your account and app preferences.
          </p>
        </div>

        <div className="mt-6 ml-[5px] flex max-w-[976px] flex-col gap-8 rounded-[20px] border border-[#e6e6e6] bg-surface p-8 pl-[37px]">
          <div className="flex flex-col gap-4">
            <SectionHeading
              title="General"
              subtitle="Basic information about your workspace."
            />
            <Field label="Workspace name" value="My Workspace" />
            <Field label="Language" value="English (US)" />
            <Field label="Time zone" value="GMT+05:30 (Kolkata)" />
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-4">
            <SectionHeading
              title="Appearance"
              subtitle="Customize how the app looks for you."
            />
            <div className="flex items-center gap-4">
              <p className="text-[13px] font-medium text-text-secondary">
                Theme
              </p>
              <div className="flex gap-3">
                {themes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`flex h-11 w-[67px] items-center justify-center rounded-md border text-[12px] font-bold ${
                        t === "Dark"
                          ? `bg-[#1a1a1a] text-white ${theme === t ? "border-transparent" : "border-border"}`
                          : theme === t
                            ? "border-transparent bg-accent-tint text-ink"
                            : "border-border bg-surface text-ink"
                      }`}
                    >
                      Aa
                    </span>
                    <span
                      className={`text-[14px] text-ink ${theme === t ? "font-semibold" : ""}`}
                    >
                      {t}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-4">
            <SectionHeading
              title="Notifications"
              subtitle="Choose what you get notified about."
            />
            <ToggleRow
              label="Email notifications"
              detail="Board activity and mentions"
              defaultChecked
            />
            <hr className="border-border" />
            <ToggleRow
              label="Push notifications"
              detail="Real-time alerts on this device"
              defaultChecked={false}
            />
            <hr className="border-border" />
            <ToggleRow
              label="Weekly digest email"
              detail="A summary of activity every Monday"
              defaultChecked
            />
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-4">
            <SectionHeading
              title="Privacy & Security"
              subtitle="Control account access and visibility."
            />
            <label className="flex items-center gap-2 text-[14px] text-ink">
              <Checkbox defaultChecked />
              Two-factor authentication
            </label>
            <label className="flex items-center gap-2 text-[14px] text-ink">
              <Checkbox />
              Make my profile private
            </label>
            <button
              type="button"
              className="rounded-full border border-border px-6 py-2.5 text-[14px] font-medium text-ink hover:bg-surface-soft"
            >
              Change Password
            </button>
          </div>

          <hr className="border-border" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading
              title="Delete account"
              subtitle="This action is permanent and irreversible."
            />
            <button
              type="button"
              className="shrink-0 rounded-full bg-ink px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#333333]"
            >
              Delete Account
            </button>
          </div>
        </div>
      </main>
      <AiFab />
    </div>
  );
}
