"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const BANNER_IMAGES = [
  "/images/thjonusta/H12_steypa_3200x1800.jpg",
  "/images/thjonusta/H20_aftan_3200x1800.jpg",
  "/images/thjonusta/hagaskogur12_3200x1800.jpg",
] as const;

export default function ArchitecturalImageBand() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  const isActiveRef = useRef(false);
  const tickingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const maxOffset = 320;

    // Start with the image panned to the bottom when the page loads
    if (imageWrapperRef.current) {
      imageWrapperRef.current.style.transform = `translate3d(0, ${-maxOffset}px, 0)`;
    }

    const update = () => {
      tickingRef.current = false;
      if (!isActiveRef.current) return;

      const el = containerRef.current;
      const wrapper = imageWrapperRef.current;
      if (!el || !wrapper) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight || 1;
      const bandHeight = rect.height || 1;

      // progress = 0 when bottom of viewport hits top of banner
      // progress = 1 when top of viewport hits bottom of banner
      const totalTravel = viewportHeight + bandHeight;
      let progress = (viewportHeight - rect.top) / totalTravel;
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      // Map progress [0,1] to offset [-maxOffset, +maxOffset]
      const rawOffset = -maxOffset + progress * (2 * maxOffset);
      const clamped = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));

      wrapper.style.transform = `translate3d(0, ${clamped}px, 0)`;

       // Slide the image crop from bottom to top as you scroll, so by the
       // time the banner top reaches the top of the viewport, the top of the
       // image is visible.
       const viewportHeightOnly = viewportHeight || 1;
       let cropProgress = (viewportHeightOnly - rect.top) / viewportHeightOnly;
       if (cropProgress < 0) cropProgress = 0;
       if (cropProgress > 1) cropProgress = 1;

       const objectPosY = 100 - cropProgress * 100; // 100% (bottom) -> 0% (top)

       for (const img of imageRefs.current) {
         if (!img) continue;
         img.style.objectPosition = `50% ${objectPosY}%`;
       }
    };

    const handleScroll = () => {
      if (!isActiveRef.current) return;
      if (!tickingRef.current) {
        tickingRef.current = true;
        frameRef.current = window.requestAnimationFrame(update);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== container) return;

          if (entry.isIntersecting) {
            isActiveRef.current = true;
            // Ensure we update position when it first enters view
            handleScroll();
          } else {
            isActiveRef.current = false;
          }
        });
      },
      {
        root: null,
        threshold: 0,
      },
    );

    observer.observe(container);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // Initial position
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (BANNER_IMAGES.length <= 1) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 15000); // 15s per image for a very slow fade

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full my-12 sm:my-16">
      <div ref={containerRef} className="relative h-[320px] w-full overflow-hidden">
        <div
          ref={imageWrapperRef}
          className="absolute inset-0 -top-80 -bottom-80 will-change-transform"
        >
          {BANNER_IMAGES.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt="Arkitektúr í verkum Boggur"
              fill
              className="object-cover transition-opacity duration-[4000ms] ease-in-out"
              sizes="100vw"
              quality={90}
              priority={index === 0}
              ref={(el) => {
                if (!el) return;
                imageRefs.current[index] = el;
              }}
              style={{ opacity: index === activeIndex ? 1 : 0 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
