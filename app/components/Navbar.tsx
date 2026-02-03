"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/building", label: "Íbúðir" },
  { href: "/services", label: "Þjónusta" },
  { href: "/onnur-thjonusta", label: "Önnur þjónusta" },
  { href: "/um-boggur", label: "Um Bögg" },
];

type NavbarProps = {
  variant?: "onHero" | "onLight";
};

export default function Navbar({ variant = "onLight" }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const desktopLinkClasses = (href: string) => {
    const active = isActive(href);
    const base =
      "border-b-2 border-transparent pb-0.5 text-base font-semibold transition-colors underline-offset-8 decoration-2";

    if (variant === "onHero") {
      return `${base} ${
        active
          ? "text-white border-white"
          : "text-white/80 hover:text-white hover:border-white/60"
      }`;
    }

    return `${base} ${
      active
        ? "text-slate-900 border-slate-900"
        : "text-slate-700 hover:text-slate-900 hover:border-slate-900/40"
    }`;
  };

  const burgerClasses = `inline-flex items-center justify-center rounded-full border p-2 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden ${
    variant === "onHero"
      ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  }`;

  const burgerBarBase =
    "absolute inset-x-0 h-0.5 rounded-full transition-transform transition-opacity";
  const burgerBarColor =
    variant === "onHero" ? "bg-white" : "bg-slate-700";

  const desktopCtaClasses =
    variant === "onHero"
      ? "relative text-[15px] font-bold tracking-wide text-amber-300/90 hover:text-amber-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-amber-300 after:transition-all after:duration-300 hover:after:w-full"
      : "relative text-[15px] font-bold tracking-wide text-amber-600 hover:text-amber-600 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-amber-600 after:transition-all after:duration-300 hover:after:w-full";

  return (
    <>
      <div className="flex items-center gap-3 md:gap-6">
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={desktopLinkClasses(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Link href="/hafa-samband" className={desktopCtaClasses}>
            Hafa samband
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={burgerClasses}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="relative block h-4 w-4">
            <span
              className={`${burgerBarBase} top-0 ${burgerBarColor} ${
                open ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`${burgerBarBase} top-1.5 ${burgerBarColor} ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`${burgerBarBase} top-3 ${burgerBarColor} ${
                open ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>
      {open && (
        <nav className="absolute inset-x-0 top-full z-30 border-b border-slate-200 bg-white/95 shadow-md md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-sm font-medium">
            <Link
              href="/hafa-samband"
              onClick={() => setOpen(false)}
              className="mb-2 text-[15px] font-bold tracking-wide text-amber-600 hover:text-amber-600"
            >
              Hafa samband
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
