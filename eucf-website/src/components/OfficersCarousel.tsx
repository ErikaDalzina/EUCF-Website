"use client";

import { useRef, useState } from "react";
import OfficerCard from "./OfficerCard";
import type { Officer } from "./OfficerCard";

const officers: Officer[] = [
  { name: "Gavin Groth", position: "President", image: "/gavinGroth.jpg" },
  { name: "Yasser Ouazran", position: "Vice President", image: "/knighto.png" },
  { name: "Aleksandra Hila", position: "Treasurer", image: "/knighto.png" },
  { name: "Grady Roberts", position: "General Manager", image: "/knighto.png" },
  { name: "Serena Tranchino", position: "Event Coordinator", image: "/knighto.png" },
  { name: "Isabella Marrero", position: "Marketing Director", image: "/knighto.png" },
  { name: "Andrea Herrera", position: "Secretary/Content Coordinator", image: "/andrea.jpg" },
];

const LOOP_SECONDS = 90;
const IDLE_MS = 600;

export default function OfficersCarousel() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isHoveredRef = useRef(false);
  const isUserScrollingRef = useRef(false);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const accumulatedScrollRef = useRef(0);
  const containerNodeRef = useRef<HTMLDivElement | null>(null);

  const handleTap = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const containerRefCallback = (node: HTMLDivElement | null) => {
    containerNodeRef.current = node;
    if (!node)
    {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const step = () => {
      if (!isHoveredRef.current && !isUserScrollingRef.current && !reducedMotion) {
        const halfWidth = node.scrollWidth / 2;
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
      if (rafIdRef.current) 
      {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (idleTimeoutRef.current)
      {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  };

  const scrollByTwo = (direction: 2 | -2) => {
    const node = containerNodeRef.current;
    if (!node)
    {
      return;
    } 
    const halfWidth = node.scrollWidth / 2;
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
    isUserScrollingRef.current = true;
    if (idleTimeoutRef.current)
    {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, IDLE_MS);
  };

  return (
    <div
      className="relative group"
      aria-roledescription="carousel"
      aria-label="Officers"
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      <div
        ref={containerRefCallback}
        role="region"
        aria-label="Officers list"
        tabIndex={0}
        onPointerDown={markUserScrolling}
        onTouchStart={markUserScrolling}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide"
      >
        <div className="flex w-max gap-8 sm:gap-10 py-6">
          {[...officers, ...officers].map((officer, i) => (
            <OfficerCard
              key={i}
              {...officer}
              isActive={activeIndex === i}
              onTap={() => handleTap(i)}
              hidden={i >= officers.length}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollByTwo(-2)}
        aria-label="Previous officers"
        className="hidden md:flex absolute left-0 top-6 bottom-6 z-10 items-center justify-center w-12 bg-black/60 text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 hover:bg-black/80"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => scrollByTwo(2)}
        aria-label="Next officers"
        className="hidden md:flex absolute right-0 top-6 bottom-6 z-10 items-center justify-center w-12 bg-black/60 text-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 hover:bg-black/80"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
