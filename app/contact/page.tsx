export default function ContactPage() {
  return (
    <section className="space-y-6 max-w-xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Contact
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Placeholder contact form for Boggur 2.0. This will eventually submit
          to an API route or external service.
        </p>
      </header>
      <form className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">Name</label>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">Email</label>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-800">Message</label>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="Tell us about your project"
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform transition-colors duration-200 hover:-translate-y-0.5 hover:bg-primary-light active:bg-primary-dark"
        >
          Send (placeholder)
        </button>
      </form>
    </section>
  );
}
