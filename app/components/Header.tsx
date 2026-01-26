import Link from "next/link";
import Image from "next/image";
import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-slate-900">
            <Image
              src="/images/logo/logo.png"
              alt="Boggur logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide uppercase text-slate-100">
              Boggur
            </span>
            <span className="text-xs text-slate-400">Construction & Real Estate</span>
          </div>
        </Link>
        <Navbar />
      </div>
    </header>
  );
}
