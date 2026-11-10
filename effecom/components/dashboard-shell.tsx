"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AudioLines,
  Captions,
  House,
  Languages,
  LogOut,
  Settings,
  UserRound,
  Volume2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiRequest } from "@/lib/api";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: House },
  { label: "Speech to text", href: "/tools/speech-to-text", icon: AudioLines },
  { label: "Text to speech", href: "/tools/text-to-speech", icon: Volume2 },
  { label: "Translation", href: "/tools/translation", icon: Languages },
  { label: "Captions", href: "/captions", icon: Captions },
];

const accountNavigation = [
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function ProtectedDashboard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/auth/me/")
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      await apiRequest("/api/v1/auth/logout/", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not sign out.");
      setSigningOut(false);
    }
  }

  function renderLinks(
    items: ReadonlyArray<{ label: string; href: string; icon: LucideIcon }>,
  ) {
    return items.map(({ label, href, icon: Icon }) => {
      const active = href === "/dashboard"
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`);
      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`dashboard-nav-link${active ? " is-active" : ""}`}
        >
          <Icon aria-hidden="true" className="size-4" />
          <span>{label}</span>
        </Link>
      );
    });
  }

  return (
    <div className="dashboard-app">
      <header className="dashboard-topbar">
        <Link href="/dashboard" className="dashboard-wordmark">
          <span className="dashboard-mark" aria-hidden="true">E</span>
          <span>EFFECOM</span>
        </Link>
        <div className="dashboard-topbar-actions">
          <Link href="/" className="dashboard-home-link">Public site</Link>
          <button
            type="button"
            className="dashboard-signout"
            onClick={signOut}
            disabled={signingOut}
          >
            <LogOut aria-hidden="true" className="size-4" />
            <span>{signingOut ? "Signing out…" : "Sign out"}</span>
          </button>
        </div>
      </header>
      {error && <p className="dashboard-shell-error" role="alert">{error}</p>}
      <div className="dashboard-frame">
        <aside className="dashboard-sidebar" aria-label="Workspace navigation">
          <p className="dashboard-nav-label">Workspace</p>
          <nav>{renderLinks(navigation)}</nav>
          <p className="dashboard-nav-label dashboard-account-label">Account</p>
          <nav>{renderLinks(accountNavigation)}</nav>
        </aside>
        <div className="dashboard-main">{children}</div>
      </div>
    </div>
  );
}