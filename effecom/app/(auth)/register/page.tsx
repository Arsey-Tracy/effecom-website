import type { Metadata } from "next";
import { AccountForm } from "@/components/account-form";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an EFFECOM account to keep your recent tool activity.",
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="account-page">
        <AccountForm mode="register" />
      </main>
      <SiteFooter />
    </>
  );
}
