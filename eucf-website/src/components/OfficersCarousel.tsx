"use client";

import { useEffect, useRef, useState } from "react";
import OfficerCard from "./OfficerCard";
import type { Officer } from "./OfficerCard";

const LOOP_SECONDS = 90;
const IDLE_MS = 600;
// Cards visible above the fold at md (w-100 + gap-10); the rest lazy-load.
const EAGER_COUNT = 3;

export default function OfficersCarousel({ officers }: { officers: Officer[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const userScrollingUntilRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const accumulatedScrollRef = useRef(0);
  const halfWidthRef = useRef(0);
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const hasActiveCard = activeIndex !== null;

  const handleTap = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const node = containerNodeRef.current;
    if (!node)
    {
      return;
    }

    const measure = () => { halfWidthRef.current = node.scrollWidth / 2; };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);
    if (node.firstElementChild)
    {
      resizeObserver.observe(node.firstElementChild);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    {
      return () => resizeObserver.disconnect();
    }

    const step = () => {
      const isUserScrolling = Date.now() < userScrollingUntilRef.current;
      if (!isHoveredRef.current && !isFocusedRef.current && !isUserScrolling) {
        const halfWidth = halfWidthRef.current;
        if (halfWidth > 0)
        {
          accumulatedScrollRef.current += halfWidth / (LOOP_SECONDS * 60);
          const whole = Math.floor(accumulatedScrollRef.current);
          if (whole > 0)
          {
            node.scrollLeft += whole;
            accumulatedScrollRef.current -= whole;
            if (node.scrollLeft >= halfWidth) node.scrollLeft -= halfWidth;
          }
        }
      }
      rafIdRef.current = requestAnimationFrame(step);
    };
    rafIdRef.current = requestAnimationFrame(step);

    return () => {
      resizeObserver.disconnect();
      if (rafIdRef.current)
      {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasActiveCard)
    {
      return;
    }
    const dismissOutside = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node))
      {
        setActiveIndex(null);
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    return () => document.removeEventListener("pointerdown", dismissOutside);
  }, [hasActiveCard]);

  const scrollByTwo = (direction: 2 | -2) => {
    const node = containerNodeRef.current;
    if (!node)
    {
      return;
    } 
    const halfWidth = halfWidthRef.current;
    if (halfWidth > 0 && node.scrollLeft >= halfWidth)
    {
      node.scrollLeft -= halfWidth;
    }
    const firstCard = node.firstElementChild?.firstElementChild as HTMLElement | undefined;
    const stepPx = firstCard ? firstCard.offsetWidth + 40 : 400;
    node.scrollBy({ left: direction * stepPx, behavior: "smooth" });
    markUserScrolling();
  };

  const markUserScrolling = () => {
    userScrollingUntilRef.current = Date.now() + IDLE_MS;
  };

  return (
    <div
      ref={wrapperRef}
      className="relative group"
      aria-roledescription="carousel"
      aria-label="Officers"
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        setActiveIndex(null);
      }}
      onFocus={(e) => {
        if ((e.target as HTMLElement).matches(":focus-visible")) {
          isFocusedRef.current = true;
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          isFocusedRef.current = false;
          setActiveIndex(null);
        }
      }}
    >
      <div
        ref={containerNodeRef}
        role="region"
        aria-label="Officers list"
        tabIndex={0}
        onPointerDown={markUserScrolling}
        onTouchStart={markUserScrolling}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide"
      >
        <div className="flex w-max gap-8 sm:gap-10 py-6 pr-8 sm:pr-10">
          {[...officers, ...officers].map((officer, i) => {
            // Clones share a src with their original, so they mirror its loading value.
            const realIndex = i % officers.length;
            return (
              <OfficerCard
                key={i}
                {...officer}
                isActive={activeIndex === i}
                onTap={() => handleTap(i)}
                hidden={i >= officers.length}
                loading={realIndex < EAGER_COUNT ? "eager" : "lazy"}
                fetchPriority={realIndex === 0 ? "high" : undefined}
              />
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollByTwo(-2)}
        aria-label="Previous officers"
        className="hidden md:flex absolute left-0 top-6 bottom-6 z-10 items-center justify-center w-12 bg-black/60 text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto pointer-coarse:opacity-100 pointer-coarse:pointer-events-auto transition-opacity duration-200 hover:bg-black/80"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => scrollByTwo(2)}
        aria-label="Next officers"
        className="hidden md:flex absolute right-0 top-6 bottom-6 z-10 items-center justify-center w-12 bg-black/60 text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto pointer-coarse:opacity-100 pointer-coarse:pointer-events-auto transition-opacity duration-200 hover:bg-black/80"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
