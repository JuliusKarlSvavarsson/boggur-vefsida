export default function ServicesExamplesList() {
  const items = [
    "Dúkur í loft",
    "Nýbyggingar",
    "Viðgerðir og endurbætur á eldri húsum",
    "Parketlögn",
    "Innréttingar",
    "Léttir innveggir",
    "Málun og frágangur",
    "Gólflagnir og frágangur",
  ];

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Dæmi um verkþætti
        </h2>
        <p className="text-sm text-slate-600 sm:text-base">
          Við getum tekið að okkur flest verk innan byggingariðnaðar.
        </p>
      </header>

      <ul className="grid gap-y-1.5 gap-x-6 text-sm text-slate-600 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400/80" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
