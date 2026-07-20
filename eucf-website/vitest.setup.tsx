import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, vi } from "vitest";

// Testing-library only auto-registers its unmount cleanup when test globals
// exist; with explicit vitest imports it must be wired up manually.
afterEach(() => cleanup());

// jsdom has no matchMedia; components (e.g. BackToTopButton) query
// prefers-reduced-motion. Tests override `matches` per-case via mockMatchMedia.
export function mockMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}
mockMatchMedia(false);

// next/image needs the Next runtime; a plain <img> keeps alt-text queries
// working. Next-only props are stripped so React doesn't warn about them.
const NEXT_ONLY_PROPS = [
  "fill", "priority", "sizes", "quality", "placeholder", "blurDataURL", "loader", "unoptimized",
];
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const rest = { ...props };
    for (const key of NEXT_ONLY_PROPS) delete rest[key];
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));
