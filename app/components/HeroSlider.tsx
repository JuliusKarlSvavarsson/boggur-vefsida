"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/Button";

const slides = [
  {
    id: 1,
    title: "Nýbyggingar til sölu",
    subtitle:
      "Skoðaðu íbúðir sem við erum að byggja og selja.",
    imageSrc: "/images/hero/hero-projects.jpg",
    primaryCta: { label: "Skoða íbúðir", href: "/building" },
    secondaryCta: { label: "Um Bögg", href: "/um-boggur" },
  },
  {
    id: 2,
    title: "Fagmennska og gæði",
    subtitle: "Við tökum að okkur öll byggingarverkefni, stór sem smá, með fagmennsku, öryggi og skýru verklagi frá fyrsta degi.",
    imageSrc: "/images/hero/hopur tough.png",
    primaryCta: { label: "Hafa samband", href: "/hafa-samband" },
    secondaryCta: { label: "Kynntu teymið", href: "/um-boggur" },
  },
  /*{
    id: 3,
    title: "Allt í byggingu og viðhaldi",
    subtitle:
      "Frá nýbyggingum til viðgerða og endurbóta.",
    imageSrc: "/images/projects/Reynihlid.jpg",
    primaryCta: { label: "Þjónusta", href: "/services" },
    secondaryCta: { label: "Hafa samband", href: "/contact" },
  },*/
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 8000);

    return () => clearInterval(id);
  }, []);

  const activeSlide = slides[index];

  return (
    <section className="relative w-full bg-slate-950 text-white">
      <div className="relative h-[110vh] w-full overflow-hidden">
        {/* Image track with fade + continuous slow zoom */}
        <div className="relative h-full w-full">
          {slides.map((slide, i) => {
            const isActive = i === index;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={slide.imageSrc}
                  alt={slide.title}
                  fill
                  className={`object-cover animate-heroZoom ${
                    slide.id === 1 ? "object-[center_top]" : "object-center"
                  }`}
                  sizes="100vw"
                  priority={slide.id === 1}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom-anchored overlay for readability while preserving upper image detail */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Text content */}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6 lg:space-y-8 px-4 pt-10 pb-24 sm:px-6 lg:px-8 lg:pb-32">
            <h1 className="max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white/95 leading-snug">
              {activeSlide.title}
            </h1>
            <p className="max-w-3xl text-base sm:text-lg lg:text-xl text-white/80 lg:leading-relaxed">
              {activeSlide.subtitle}
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {activeSlide.primaryCta && (
                <Button href={activeSlide.primaryCta.href}>
                  {activeSlide.primaryCta.label}
                </Button>
              )}
              {activeSlide.secondaryCta && (
                <Button href={activeSlide.secondaryCta.href} variant="secondary">
                  {activeSlide.secondaryCta.label}
                </Button>
              )}
            </div>

            {/* Slider indicators */}
            <div className="mt-6 flex items-center gap-2">
              {slides.map((slide, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-8 bg-white"
                        : "w-4 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Fara á skyggnu ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
