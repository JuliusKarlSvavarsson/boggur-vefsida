export default function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>
          © {new Date().getFullYear()} Boggur. All rights reserved.
        </span>
        <span className="text-xs sm:text-sm">
          Placeholder layout for Boggur 2.0 — built with Next.js 14 & Tailwind CSS.
        </span>
      </div>
    </footer>
  );
}
