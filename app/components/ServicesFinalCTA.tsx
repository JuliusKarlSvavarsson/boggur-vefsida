import Link from "next/link";

export default function ServicesFinalCTA() {
  return (
    <section className="bg-[#ece9e2] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Segðu okkur frá verkefninu
          </h2>
          <p className="text-sm text-slate-600 sm:text-base sm:leading-snug">
            Við svörum fljótt og setjum fram skýra áætlun.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-6">
            <Link
              href="/hafa-samband"
              className="font-semibold text-primary underline-offset-4 hover:underline hover:text-primary-dark transition-colors duration-200"
            >
              Hafa samband
            </Link>
            <Link
              href="/onnur-thjonusta"
              className="text-slate-600 underline-offset-4 hover:underline hover:text-slate-800 transition-colors duration-200"
            >
              Skoða aðra þjónustu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
