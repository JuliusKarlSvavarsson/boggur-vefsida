import { contactConfig } from "@/app/contactConfig";

export function ContactMap() {
  const { mapEmbedSrc, addressLines } = contactConfig;

  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-4 space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Staðsetning</h2>
          {addressLines && addressLines.length > 0 && (
            <p className="text-xs text-slate-600">
              {addressLines.join(", ")}
            </p>
          )}
        </header>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
          <iframe
            src={mapEmbedSrc}
            title="Staðsetning Böggur"
            className="h-[320px] w-full border-0 sm:h-[360px] lg:h-[400px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
