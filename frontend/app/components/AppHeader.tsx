"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

type NavItem = { label: string; href: string };

type Props = {
  name: string;
  initials?: string;
  subtitle: string;
  navItems: NavItem[];
  children: ReactNode;
  hideProfile?: boolean;
  variant?: "dashboard" | "hero";
};

function LeafLeft() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-auto text-sage opacity-40">
      <path d="M8 40 C12 28 24 20 38 18 C36 30 26 38 14 40 Z" fill="currentColor" />
      <path d="M8 40 L22 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function LeafRight() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-auto text-sage opacity-40" style={{ transform: "scaleX(-1)" }}>
      <path d="M8 40 C12 28 24 20 38 18 C36 30 26 38 14 40 Z" fill="currentColor" />
      <path d="M8 40 L22 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export default function AppHeader({ name, initials, subtitle, navItems, children, hideProfile = false, variant = "hero" }: Props) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-cream border-b border-soft-border sticky top-0 z-[100]">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-6">
          {/* Brand + Desktop Nav */}
          <div className="flex items-center gap-4 md:gap-8">
            <span className="font-display text-xl md:text-2xl font-semibold text-foreground tracking-wide">
              Fotografla
            </span>
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-1.5 rounded-full text-sm transition-all ${active
                        ? "bg-sage-light text-sage-dark font-semibold"
                        : "text-slate-500 hover:text-foreground hover:bg-sage-light/50"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Profile */}
            {!hideProfile && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground leading-none">{name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sage flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                  {initials || "U"}
                </div>
                <Link
                  href="/"
                  className="hidden sm:block text-xs text-slate-500 border border-soft-border rounded-lg px-3 py-1.5 hover:bg-sage-light transition ml-2"
                >
                  Cikis
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            {(!hideProfile || navItems.length > 0) && (
              <button
                className="md:hidden p-2 -mr-2 text-slate-600 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-sage rounded"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menüyü aç"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-[56px] left-0 w-full bg-white border-b border-soft-border shadow-xl z-[999] animate-[fadeSlideDown_0.2s_ease-out]">
            <div className="px-4 py-4 flex flex-col gap-4">
              {/* Mobile Nav */}
              {navItems.length > 0 && (
                <nav className="flex flex-col gap-1 pb-4 border-b border-slate-100">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-xl text-sm transition-all ${active
                            ? "bg-sage-light text-sage-dark font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                          }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              )}

              {/* Mobile Profile Details Options */}
              {!hideProfile && (
                <div className="flex items-center justify-between pt-1 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white text-base font-bold flex-shrink-0 hidden">
                      {/* Avatar already in top nav now, but keeping for structure if needed */}
                      {initials || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
                    </div>
                  </div>
                  <Link
                    href="/"
                    className="text-xs text-rose-500 font-medium px-4 py-2 bg-rose-50 rounded-xl hover:bg-rose-100 transition"
                  >
                    Cikis
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page hero / title band - Sadece variant="hero" ise goster */}
      {variant === "hero" && (
        <div className="bg-cream border-b border-soft-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6 flex items-center justify-center gap-2 md:gap-4">
          <div className="w-8 md:w-12 flex-shrink-0">
            <LeafLeft />
          </div>
          <div className="text-center max-w-[75%] md:max-w-none flex-1">
            <h1 className="font-display text-lg md:text-3xl font-semibold text-foreground leading-snug md:leading-tight line-clamp-2 md:line-clamp-none">
              {name}
            </h1>
            <p className="text-[11px] md:text-sm text-slate-500 mt-1 md:mt-1.5 leading-snug">
              {subtitle}
            </p>
          </div>
          <div className="w-8 md:w-12 flex-shrink-0">
            <LeafRight />
          </div>
        </div>
      </div>
      )}


      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-5 md:py-8">{children}</main>
    </div>
  );
}
