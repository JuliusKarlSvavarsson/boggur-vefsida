"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) {
    return null;
  }

  const onHero = pathname === "/" && !scrolled;

  const headerClasses = `fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
    onHero
      ? "bg-transparent text-white"
      : "bg-white/95 text-slate-900 shadow-sm backdrop-blur"
  }`;

  return (
    <header className={headerClasses}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo/logo.png"
            alt="Boggur logo"
            width={80}
            height={80}
            className={`h-20 w-20 object-contain transition duration-300 ${
              onHero ? "invert" : ""
            }`}
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-wide uppercase">
              BÖGGUR
            </span>
            <span
              className={`text-xs ${
                onHero ? "text-slate-200" : "text-muted"
              }`}
            >
              Byggingar og fasteignaþróun
            </span>
          </div>
        </Link>
        <Navbar variant={onHero ? "onHero" : "onLight"} />
      </div>
    </header>
  );
}
