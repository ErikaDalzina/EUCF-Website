"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/about", label: "ABOUT US" },
  { href: "/officers", label: "OFFICERS" },
  { href: "/titles", label: "TITLES" },
  { href: "/sponsors", label: "SPONSORS" },
  { href: "/connect", label: "CONNECT" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black w-full py-1 mb-6">
      <nav className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="relative w-32 h-10 md:w-40 md:h-12 shrink-0">
          <Link href="/">
            <Image
              src="/esportsLogo.png"
              alt="EUCF Esports Logo"
              fill
              className="object-contain object-left"
            />
          </Link>
        </div>

        {/* Desktop nav links */}
        <div
          className="hidden md:flex items-center gap-6 lg:gap-8"
          role="navigation"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-(family-name:--font-roboto-condensed) italic font-bold text-white text-sm lg:text-base tracking-wide hover:text-[#B49758] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger button (mobile) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              isMenuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              isMenuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-black ${
          isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col px-4 pb-4 gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="font-(family-name:--font-roboto-condensed) italic font-bold text-white text-base py-2 tracking-wide hover:text-[#B49758] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
