export default function ContactPage() {
  return (
    <section className="space-y-6 max-w-xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Contact
        </h1>
        <p className="text-sm text-slate-300 sm:text-base">
          Placeholder contact form for Boggur 2.0. This will eventually submit
          to an API route or external service.
        </p>
      </header>
      <form className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-200">Name</label>
          <input
            className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-200">Email</label>
          <input
            className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-200">Message</label>
          <textarea
            rows={4}
            className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Tell us about your project"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:bg-primary-dark"
        >
          Send (placeholder)
        </button>
      </form>
    </section>
  );
}
