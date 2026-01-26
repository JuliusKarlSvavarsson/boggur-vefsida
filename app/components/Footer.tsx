export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:text-sm">
        <div className="space-y-1">
          <span className="block font-medium">Boggur</span>
          <span className="block text-slate-400">
            © {new Date().getFullYear()} Boggur. All rights reserved.
          </span>
        </div>
        <div className="flex flex-col gap-1 text-slate-400 sm:items-end">
          <span className="text-xs sm:text-sm">
            Placeholder contact info — email and social links will be added later.
          </span>
          <span className="text-xs text-slate-500">
            Boggur 2.0 — built with Next.js 14 &amp; Tailwind CSS.
          </span>
        </div>
      </div>
    </footer>
  );
}
