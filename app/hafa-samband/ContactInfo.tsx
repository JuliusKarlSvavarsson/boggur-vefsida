import { ReactNode } from "react";
import { contactConfig } from "@/app/contactConfig";

type ContactInfoProps = {
  children?: ReactNode;
};

export function ContactInfo({ children }: ContactInfoProps) {
  const { phone, email, addressLines, note } = contactConfig;

  return (
    <section className="bg-[#F6F5F2]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] md:items-start">
          {/* Left: contact details */}
          <div className="space-y-6 text-sm text-slate-700">
            <header className="space-y-1">
              <h2 className="text-base font-semibold tracking-[0.18em] text-slate-500">
                UPPLÝSINGAR
              </h2>
              <p className="text-lg font-semibold text-slate-900">
                Hafðu samband beint við Böggur.
              </p>
            </header>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Sími
                </dt>
                <dd className="text-sm font-medium text-slate-900">
                  <a href={`tel:${phone}`} className="hover:underline">
                    {phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Netfang
                </dt>
                <dd className="text-sm font-medium text-slate-900">
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Heimilisfang
                </dt>
                <dd className="text-sm font-medium text-slate-900">
                  {addressLines.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </dd>
              </div>
            </dl>

            {note && (
              <p className="text-xs text-slate-600">{note}</p>
            )}
          </div>

          {/* Right: form column */}
          <div className="md:pl-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
