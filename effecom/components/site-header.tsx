"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { siteContent } from "@/lib/site-content";

function localHref(href: string, pathname: string) {
  if (!href.startsWith("#")) return href;
  return pathname === "/" ? href : `/${href}`;
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
    <header className="site-header landing-header sticky top-0 z-50">
      <div className="landing-header-inner">
        <Link
          href={siteContent.links.home}
          aria-label={`${siteContent.brand.name} home`}
          className="landing-brand"
          onClick={closeMenu}
        >
          <Image
            src="/effecomlogo.jpeg"
            alt=""
            width={48}
            height={48}
            priority
            className="landing-brand-image"
          />
          <span>
            <span className="landing-brand-name">{siteContent.brand.name}</span>
            <span className="landing-brand-tagline">{siteContent.brand.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="landing-nav">
          <Link
            href="/"
            className="landing-nav-link"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Home
          </Link>
          <details
            className="landing-products-menu"
            data-active={pathname.startsWith("/products/") || undefined}
          >
            <summary>
              Products
              <ChevronDown aria-hidden="true" className="size-4" />
            </summary>
            <div className="landing-products-popover">
              {siteContent.tools.map((tool) => (
                <Link
                  href={`/products/${tool.slug}`}
                  key={tool.slug}
                  className="landing-products-link"
                  aria-current={pathname === `/products/${tool.slug}` ? "page" : undefined}
                >
                  <span>{tool.title}</span>
                  <span>{tool.headline}</span>
                </Link>
              ))}
            </div>
          </details>
          {siteContent.navigation.slice(1).map((item) => {
            const href = localHref(item.href, pathname);
            return (
              <Link
                key={item.label}
                href={href}
                className="landing-nav-link"
                aria-current={pathname === href ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link className="landing-header-cta" href={localHref("#tools", pathname)}>
          Try EFFECOM
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className="landing-menu-toggle"
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
        className="landing-mobile-nav"
      >
        <Link href="/" onClick={closeMenu} aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
        <a href={localHref("#tools", pathname)} onClick={closeMenu}>Products</a>
        <div className="landing-mobile-products">
          {siteContent.tools.map((tool) => (
            <Link
              href={`/products/${tool.slug}`}
              key={tool.slug}
              onClick={closeMenu}
              aria-current={pathname === `/products/${tool.slug}` ? "page" : undefined}
            >
              {tool.title}
            </Link>
          ))}
        </div>
        {siteContent.navigation.slice(1).map((item) => {
          const href = localHref(item.href, pathname);
          return (
            <Link
              href={href}
              key={item.label}
              onClick={closeMenu}
              aria-current={pathname === href ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          className="landing-mobile-cta"
          href={localHref("#tools", pathname)}
          onClick={closeMenu}
        >
          Try EFFECOM
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </nav>
    </header>
  );
}
