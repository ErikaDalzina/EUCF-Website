"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { AboutSection } from "@/data/about";

const PANEL_ID = "about-panel";
const tabId = (index: number) => `about-tab-${index}`;

export default function AboutPillars({ sections }: { sections: AboutSection[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (sections.length === 0) {
    return null;
  }

  const lastIndex = sections.length - 1;
  const active = sections[Math.min(activeIndex, lastIndex)];

  // WAI-ARIA tabs with automatic activation: arrows move focus and select in one
  // step. A panel is text plus one image, so there is nothing worth deferring
  // behind manual activation.
  const selectTab = (index: number) => {
    setActiveIndex(index);
    // Safe synchronously: only the panel is keyed, so the tab buttons never
    // remount and the ref already points at the live node.
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        selectTab(activeIndex === lastIndex ? 0 : activeIndex + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        selectTab(activeIndex === 0 ? lastIndex : activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        selectTab(0);
        break;
      case "End":
        e.preventDefault();
        selectTab(lastIndex);
        break;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-16">
      {/* The scroller must not carry the hairline: overflow clips at the padding
          box, so a child can never paint over its own scroller's border. Border
          on the tablist, scrolling on the wrapper. The px-1/-mx-1/py-1 gives the
          global focus ring (outline-offset: 2px) room inside the mobile clip. */}
      <div className="mt-2 px-1 -mx-1 py-1 overflow-x-auto overflow-y-hidden scrollbar-hide md:overflow-visible">
        <div
          role="tablist"
          aria-label="What the club is built on"
          onKeyDown={handleKeyDown}
          className="flex w-max min-w-full md:w-full border-b border-zinc-200"
        >
          {sections.map((section, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={tabId(i)}
                ref={(node) => {
                  tabRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                id={tabId(i)}
                aria-controls={PANEL_ID}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveIndex(i)}
                className={`flex flex-none md:flex-1 flex-col cursor-pointer font-heading text-lg md:text-xl font-semibold transition-colors ${
                  isActive ? "text-heading" : "text-zinc-600 hover:text-heading"
                }`}
              >
                {/* Padding sits on the label, not the button, so the indicator
                    below stretches the full tab width in both layouts. */}
                <span className="px-4 pt-3.5 pb-2.5 text-center">{section.title}</span>
                {/* Always in flow so the row never shifts; mt-auto pins it to the
                    bottom of a stretched tab; -mb-px drops its last pixel row
                    onto the tablist hairline so 3px reads as 3px. */}
                <span
                  aria-hidden="true"
                  className={`mt-auto -mb-px h-0.75 ${
                    isActive ? "bg-gold-deep" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={activeIndex}
        role="tabpanel"
        id={PANEL_ID}
        aria-labelledby={tabId(activeIndex)}
        tabIndex={0}
        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-11 pb-20 md:min-h-110"
      >
        <div>
          {active.eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-deep">
              {active.eyebrow}
            </p>
          )}

          <h2 className="mt-2 font-heading text-4xl font-semibold text-heading">{active.title}</h2>

          <p className="mt-4 text-lg leading-relaxed text-zinc-800 whitespace-pre-line">
            {active.description}
          </p>

          {active.tags && active.tags.length > 0 && (
            <ul role="list" className="mt-6 flex flex-wrap gap-2">
              {active.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-zinc-300 px-3 py-1.5 text-[11px] uppercase tracking-wide text-gold-deep"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* object-contain, not cover: sync-images.ts uploads with fit: inside, so
            aspect ratios vary, Overview is a logo, and Connect/Give back are
            top/bottom composites whose alt text describes both halves. */}
        <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden">
          <Image
            src={active.image}
            alt={active.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            loading={activeIndex === 0 ? "eager" : "lazy"}
            fetchPriority={activeIndex === 0 ? "high" : undefined}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
