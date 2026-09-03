"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Player, PlayerSocials } from "@/types/roster";

interface PlayerModalProps {
  player: Player | null;
  onClose: () => void;
}

interface SocialLink {
  key: keyof PlayerSocials;
  label: string;
  iconSvg: React.ReactNode;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    key: "x",
    label: "X",
    iconSvg: (
      <svg viewBox="0 0 16 15" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M12.6 0H15.054L9.694 6.142L16 14.5H11.063L7.196 9.43L2.771 14.5H0.316L6.049 7.93L0 0H5.063L8.558 4.633L12.6 0ZM11.74 13.028H13.1L4.323 1.395H2.865L11.74 13.028Z" />
      </svg>
    ),
  },
  {
    key: "twitch",
    label: "Twitch",
    iconSvg: (
      <svg viewBox="0 0 29 30" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M18 15H21V7.5H18V15ZM10.5 15H13.5V7.5H10.5V15ZM25.5 16.9607V3H4.5V21H10.5V25.4297L14.34 21H21.51L25.5 16.9607ZM20.8605 25.5H14.9895L11.0805 30H7.5V25.5H0V5.21997L1.95 0H28.5V18.2593L20.8605 25.5Z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    iconSvg: (
      <svg viewBox="0 0 16 16" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    iconSvg: (
      <svg viewBox="0 0 16 16" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    iconSvg: (
      <svg viewBox="0 0 16 16" className="w-5 h-5" fill="currentColor" aria-hidden="true">
        <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
      </svg>
    ),
  },
];

export default function PlayerModal({ player, onClose }: PlayerModalProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!player) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const insidePanel = !!active && panelRef.current.contains(active);

        if (e.shiftKey) {
          if (!insidePanel || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!insidePanel || active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [player, onClose]);

  if (!player) return null;

  const socials = player.socials ?? {};
  const activeSocials = SOCIAL_LINKS.filter((s) => socials[s.key]);

  return (
    <>
      <style>{`body { overflow: hidden; }`}</style>
      <div
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-modal-title"
        className="relative bg-white rounded-lg overflow-hidden w-full max-w-225 md:h-140 md:max-h-[85dvh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-black/70 text-white hover:bg-black flex items-center justify-center transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="max-h-[90dvh] md:max-h-[85dvh] md:h-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
        <div className="relative w-full md:w-2/5 md:max-w-105 aspect-3/4 md:h-full md:aspect-auto bg-neutral-900 shrink-0">
          <Image
            key={player.image}
            src={player.image}
            alt={`${player.ign} portrait`}
            fill
            onLoad={() => setImgLoaded(true)}
            className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            sizes="(min-width: 768px) 420px, 100vw"
          />
        </div>

        <div className="p-6 md:p-8 md:flex-1 md:flex md:flex-col md:overflow-hidden md:min-h-0">
          <div className="md:flex-1 md:overflow-y-auto md:pr-1">
            <h2 id="player-modal-title" className="font-heading text-4xl font-semibold text-heading">{player.ign}</h2>
            {player.realName && (
              <p className="text-zinc-500 mt-1">{player.realName}</p>
            )}
            {player.role && (
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide bg-gold-deep text-white">
                {player.role}
              </span>
            )}
            {player.bio && (
              <p className="mt-5 text-zinc-800 leading-relaxed whitespace-pre-line">{player.bio}</p>
            )}
          </div>
          {activeSocials.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-200 shrink-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                Follow
              </p>
              <div className="flex gap-3 flex-wrap">
                {activeSocials.map((s) => (
                  <a
                    key={s.key}
                    href={socials[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${player.ign} on ${s.label}`}
                    className="w-11 h-11 rounded-full bg-zinc-100 hover:bg-gold-deep hover:text-white text-heading flex items-center justify-center transition-colors"
                  >
                    {s.iconSvg}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      </div>
    </>
  );
}
