import type { Metadata } from "next";
import { AccountForm } from "@/components/account-form";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your EFFECOM account.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="account-page">
        <AccountForm mode="login" />
      </main>
      <SiteFooter />
    </>
  );
}
