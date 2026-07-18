"use client";

export default function BackToTopButton() {
  const handleBackToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleBackToTop}
      className="mt-auto pt-8 text-xl leading-snug font-normal underline hover:opacity-60 transition self-start text-left bg-transparent border-0 p-0 cursor-pointer"
    >
      Back to top
    </button>
  );
}
