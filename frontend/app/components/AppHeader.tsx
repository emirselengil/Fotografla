"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItem = { label: string; href: string };

type Props = {
  name: string;
  initials: string;
  subtitle: string;
  navItems: NavItem[];
  children: ReactNode;
};

function LeafLeft() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-sage opacity-40">
      <path d="M8 40 C12 28 24 20 38 18 C36 30 26 38 14 40 Z" fill="currentColor" />
      <path d="M8 40 L22 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function LeafRight() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-sage opacity-40" style={{ transform: "scaleX(-1)" }}>
      <path d="M8 40 C12 28 24 20 38 18 C36 30 26 38 14 40 Z" fill="currentColor" />
      <path d="M8 40 L22 26" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export default function AppHeader({ name, initials, subtitle, navItems, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-cream border-b border-soft-border sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand + Nav */}
          <div className="flex items-center gap-8">
            <span className="font-display text-2xl font-semibold text-foreground tracking-wide">
              Fotografla
            </span>
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                      active
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

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground leading-none">{name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <Link
              href="/"
              className="hidden sm:block text-xs text-slate-500 border border-soft-border rounded-lg px-3 py-1.5 hover:bg-sage-light transition"
            >
              Cikis
            </Link>
          </div>
        </div>
      </header>

      {/* Page hero / title band */}
      <div className="bg-cream border-b border-soft-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center gap-3">
          <LeafLeft />
          <div className="flex-1 text-center">
            <h1 className="font-display text-3xl font-semibold text-foreground">{name}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          <LeafRight />
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
