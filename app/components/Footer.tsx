export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>
          © {new Date().getFullYear()} Boggur. All rights reserved.
        </span>
        <span className="sm:text-right">
          Boggur 2.0 — modern real estate presentation built with Next.js 14 &amp; Tailwind CSS.
        </span>
      </div>
    </footer>
  );
}
