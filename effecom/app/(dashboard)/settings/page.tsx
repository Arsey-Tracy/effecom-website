import type { Metadata } from "next";
import { SettingsWorkspace } from "@/components/settings-workspace";

export const metadata: Metadata = { title: "Settings" };
export const instant = false;

export default function SettingsPage() {
  return <main id="main-content" className="dashboard-page"><div className="dashboard-inner"><header className="dashboard-heading"><div><p className="landing-kicker">YOUR WORKSPACE</p><h1>Settings</h1></div></header><SettingsWorkspace /></div></main>;
}