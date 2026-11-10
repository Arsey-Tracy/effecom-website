import type { Metadata } from "next";
import { ProfileWorkspace } from "@/components/profile-workspace";

export const metadata: Metadata = { title: "Profile" };
export const instant = false;

export default function ProfilePage() {
  return <main id="main-content" className="dashboard-page"><div className="dashboard-inner"><header className="dashboard-heading"><div><p className="landing-kicker">YOUR ACCOUNT</p><h1>Profile</h1></div></header><ProfileWorkspace /></div></main>;
}