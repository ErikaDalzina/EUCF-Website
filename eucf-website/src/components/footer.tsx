"use client";

import Image from "next/image";

export default function Footer() {
  const handleBackToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <footer className="relative mt-2 bg-zinc-900 text-white font-roboto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <Image
                src="/UCFlogo.svg"
                alt="UCF Logo"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-bold leading-snug text-left">
              University of Central Florida
            </h2>
            <p className="text-xl leading-snug font-normal">
              4000 Central Florida Blvd
              <br />
              Orlando, FL 32816
            </p>
          </div>
          <div className="flex flex-col text-left">
            <div className="space-y-10">
              <p className="text-xl leading-snug font-normal">
                Copyright © 2026, Esports at UCF (EUCF). All rights reserved.
              </p>
              <p className="text-xl leading-snug font-normal">
                For inquiries, reach us at:{" "}
                <a
                  href="mailto:esportsatucf@gmail.com"
                  className="underline hover:opacity-60 transition"
                >
                  esportsatucf@gmail.com
                </a>
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackToTop}
              className="mt-auto pt-8 text-xl leading-snug font-normal underline hover:opacity-60 transition self-start text-left bg-transparent border-0 p-0 cursor-pointer"
            >
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
