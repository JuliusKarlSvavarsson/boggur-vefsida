import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

const primaryWorkshopImage = {
  src: "/images/blikksmidi/Blikkvel1.jpg",
  alt: "Blikksmíðavél með skurðar- og beygjubúnaði",
};

const secondaryWorkshopImages = [
  {
    src: "/images/blikksmidi/Blikkvel2.jpg",
    alt: "Skurðarvél fyrir blikk í verkstæði",
  },
  {
    src: "/images/blikksmidi/Blikkvel3.jpg",
    alt: "Beygjuvél fyrir blikk í notkun",
  },
];

type OtherServiceProduct = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
};

async function fetchProducts(): Promise<OtherServiceProduct[]> {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/other_services`, { cache: "no-store" });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function OnnurThjonustaPage() {
  const products = await fetchProducts();
  return (
    <div
      className="flex flex-col"
      style={{ paddingTop: "var(--header-height)" }}
    >
      {/* Hero / intro */}
      <section className="bg-[#F4F3F1]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <header className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              ÖNNUR ÞJÓNUSTA
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Blikksmíði og sérsmíði
            </h1>
            <p className="text-sm text-slate-700 sm:text-base sm:leading-relaxed">
              Sérsmíði og framleiðsla úr blikki fyrir byggingarframkvæmdir og sérverkefni.
            </p>
          </header>
        </div>
      </section>

      {/* Blikksmíði fyrir byggingar */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)] lg:items-start">
            <div className="max-w-xl space-y-5 text-sm text-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Blikksmíði fyrir byggingar
              </h2>
              <p>
                Við tökum að okkur skurð, beygju og smíði úr blikki fyrir þök, klæðningar,
                innréttingar og sérlausnir í tengslum við byggingarframkvæmdir.
              </p>
              <p>
                Unnið er fyrir verktaka, húsfélög og fyrirtæki með teikningar eða einfaldar
                lýsingar.
              </p>
              <ul className="mt-4 space-y-1.5">
                <li>Skurður og beygja á blikki</li>
                <li>Sérsmíði eftir teikningum</li>
                <li>Lausnir fyrir klæðningar og flasningar</li>
                <li>Smærri og stærri sérverkefni</li>
              </ul>
            </div>

            <div className="mt-1 grid gap-3 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                <Image
                  src={primaryWorkshopImage.src}
                  alt={primaryWorkshopImage.alt}
                  fill
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 100vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid gap-3 sm:grid-rows-2">
                {secondaryWorkshopImages.map((image) => (
                  <div
                    key={image.src}
                    className="relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-slate-100"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 14rem, (min-width: 640px) 50vw, 100vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="border-t border-slate-200 bg-[#F6F5F2]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <header className="max-w-3xl space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Vörur til sölu
            </h2>
            <p className="text-sm text-slate-700 sm:text-base sm:leading-relaxed">
              Við framleiðum einnig staðlaðar lausnir sem nýtast í byggingum.
            </p>
          </header>
          {products.length === 0 ? (
            <p className="mt-4 text-xs text-slate-600">
              Engar vörur skráðar enn í "Vörur til sölu". Hægt er að bæta þeim við í
              admin undir Önnur þjónusta.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const imageSrc = product.image || "/images/thjonusta/H12 gluggar.jpg";
                return (
                  <article
                    key={product.id}
                    className="space-y-2 text-sm text-slate-700"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {product.title}
                      </h3>
                      <p>{product.description}</p>
                    </div>
                    <div className="relative h-32 overflow-hidden rounded-md border border-slate-200 bg-slate-100 sm:h-36">
                      <Image
                        src={imageSrc}
                        alt={product.title}
                        fill
                        sizes="(min-width: 1024px) 14rem, (min-width: 640px) 50vw, 100vw"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <p className="mt-6 text-xs text-slate-600">
            <Link
              href="/hafa-samband"
              className="underline-offset-4 hover:underline"
            >
              Hafa samband fyrir nánari upplýsingar um vörur eða sérsmíði.
            </Link>
          </p>
        </div>
      </section>

      {/* Contact bridge */}
      <section className="border-t border-slate-200 bg-[#f3f1eb]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Hafa samband
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Hafðu samband fyrir sérsmíði eða nánari upplýsingar um vörur.
          </p>
          <div className="mt-3 text-sm text-slate-800">
            <Link
              href="/hafa-samband"
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Opna fyrirspurnarform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
