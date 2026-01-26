import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            <Image
              src="/images/logo/logo.png"
              alt="Boggur logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide uppercase text-slate-900">
              Boggur
            </span>
            <span className="text-xs text-muted">Construction & Real Estate</span>
          </div>
        </Link>
        <Navbar />
      </div>
    </header>
  );
}
