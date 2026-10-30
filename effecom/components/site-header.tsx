"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteContent } from "@/lib/site-content";

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 36"
      fill="none"
      className="size-10 shrink-0"
    >
      <rect width="36" height="36" rx="13" fill="currentColor" />
      <path
        d="M10 12.5C10 11.12 11.12 10 12.5 10h11c1.38 0 2.5 1.12 2.5 2.5v7c0 1.38-1.12 2.5-2.5 2.5h-5.3l-5.1 4v-4H12.5c-1.38 0-2.5-1.12-2.5-2.5v-7Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="16" r="1" fill="white" />
      <circle cx="18" cy="16" r="1" fill="white" />
      <circle cx="21" cy="16" r="1" fill="white" />
    </svg>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header sticky top-0 z-50 border-b border-(--line) bg-(--paper)/95 backdrop-blur">
      <div className="mx-auto flex min-h-19 max-w-310 items-center justify-between gap-5 px-5 sm:px-8">
        <Link
          href={siteContent.links.home}
          aria-label={`${siteContent.brand.name} home`}
          className="flex min-w-0 items-center gap-3 rounded-lg text-(--forest) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--forest)"
          onClick={closeMenu}
        >
          <BrandMark />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-heading text-[23px] font-semibold tracking-[-0.04em]">
              {siteContent.brand.name}
            </span>
            <span className="hidden text-xs font-medium text-(--muted) sm:block">
              {siteContent.brand.attribution}
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {siteContent.navigation.map((item) => (
            <a
              key={item.href}
              className="nav-link rounded-sm text-sm font-medium text-(--ink-soft) transition-colors hover:text-(--forest) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--forest)"
              href={
                pathname === "/"
                  ? item.href
                  : `/${item.href}`
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href={
              pathname === "/"
                ? siteContent.links.pilot
                : `/${siteContent.links.pilot}`
            }
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-11 rounded-full bg-(--forest) px-5 text-white hover:bg-(--forest-deep)",
            )}
          >
            {siteContent.hero.primaryAction}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-(--line) bg-(--paper) text-(--ink) transition-colors hover:bg-(--sage-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--forest) lg:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
        className="border-t border-(--line) bg-(--paper) px-5 py-4 lg:hidden sm:px-8"
      >
        <div className="mx-auto flex max-w-310 flex-col gap-1">
          {siteContent.navigation.map((item) => (
            <a
              key={item.href}
              href={
                pathname === "/"
                  ? item.href
                  : `/${item.href}`
              }
              onClick={closeMenu}
              className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-(--ink) hover:bg-(--sage-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--forest)"
            >
              {item.label}
            </a>
          ))}
          <a
            href={
              pathname === "/"
                ? siteContent.links.pilot
                : `/${siteContent.links.pilot}`
            }
            onClick={closeMenu}
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-2 min-h-12 w-full rounded-full bg-(--forest) text-white hover:bg-(--forest-deep)",
            )}
          >
            {siteContent.hero.primaryAction}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </nav>
    </header>
  );
}
