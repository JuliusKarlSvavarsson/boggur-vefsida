"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/Button";

const slides = [
  {
    id: 1,
    title: "Projects that shape modern Reykjavik",
    subtitle:
      "Explore current and future residential and mixed-use developments in the Boggur pipeline.",
    imageSrc: "/images/hero/hopur1.jpg",
    primaryCta: { label: "View projects", href: "/projects" },
    secondaryCta: { label: "About Boggur", href: "/about" },
  },
  {
    id: 2,
    title: "Priority services for developers and buyers",
    subtitle:
      "From concept to completion, Boggur coordinates design, planning, and sales.",
    imageSrc: "/images/hero/hopur2.jpg",
    primaryCta: { label: "View services", href: "/services" },
    secondaryCta: { label: "Contact us", href: "/contact" },
  },
  {
    id: 3,
    title: "Experienced team, focused on long-term value",
    subtitle:
      "Meet the owners behind Boggur and the projects they stand behind.",
    imageSrc: "/images/hero/hopur3.jpg",
    primaryCta: { label: "Meet the team", href: "/team" },
    secondaryCta: { label: "Contact Boggur", href: "/contact" },
  },
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
      <div className="relative h-[24rem] w-full overflow-hidden sm:h-[28rem] lg:h-[34rem]">
        {/* Image track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="relative h-full w-full shrink-0">
              <Image
                src={slide.imageSrc}
                alt={slide.title}
                fill
                className="object-cover object-[center_top]"
                sizes="100vw"
                priority={slide.id === 1}
              />
            </div>
          ))}
        </div>

        {/* Dark overlay for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

        {/* Text content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
              Boggur 2.0
            </p>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {activeSlide.title}
            </h1>
            <p className="max-w-xl text-sm text-slate-100/90 sm:text-base lg:text-lg lg:leading-relaxed">
              {activeSlide.subtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
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
            <div className="mt-4 flex items-center gap-2">
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
                    aria-label={`Go to slide ${i + 1}`}
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
