import Link from "next/link";
import { contactConfig } from "@/app/contactConfig";

export default function Footer() {
  const { phone, email, addressLines } = contactConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 text-sm md:grid-cols-3">
          {/* Company */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              BÖGGUR
            </p>
            <p className="text-sm text-slate-200">Byggingar og fasteignaþróun</p>
            <p className="text-xs text-slate-500">
              © {year} Böggur. Öll réttindi áskilin.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              LEIÐSÖGN
            </p>
            <nav className="space-y-1">
              <Link
                href="/building"
                className="block text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
              >
                Íbúðir
              </Link>
              <Link
                href="/services"
                className="block text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
              >
                Þjónusta
              </Link>
              <Link
                href="/onnur-thjonusta"
                className="block text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
              >
                Önnur þjónusta
              </Link>
              <Link
                href="/um-boggur"
                className="block text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
              >
                Um Bögg
              </Link>
              <Link
                href="/hafa-samband"
                className="block text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
              >
                Hafa samband
              </Link>
            </nav>
          </div>

          {/* Contact info */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              UPPLÝSINGAR
            </p>
            <div className="space-y-1 text-sm">
              <div>
                <p className="text-xs text-slate-400">Sími</p>
                <p>
                  <a
                    href={`tel:${phone}`}
                    className="text-slate-300 underline-offset-4 hover:text-white hover:underline"
                  >
                    {phone}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Netfang</p>
                <p>
                  <a
                    href={`mailto:${email}`}
                    className="text-slate-300 underline-offset-4 hover:text-white hover:underline"
                  >
                    {email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Heimilisfang</p>
                <p className="text-slate-300">
                  {addressLines?.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] text-slate-500 md:text-right">
            Hönnun og þróun: Julius Karl Svavarsson
          </p>
        </div>
      </div>
    </footer>
  );
}
