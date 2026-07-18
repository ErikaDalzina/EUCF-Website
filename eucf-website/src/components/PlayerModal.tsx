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
  iconSrc?: string;
  iconSvg?: React.ReactNode;
}

const SOCIAL_LINKS: SocialLink[] = [
  { key: "x", label: "X", iconSrc: "/xIcon.png" },
  { key: "twitch", label: "Twitch", iconSrc: "/twitchIcon.png" },
  { key: "instagram", label: "Instagram", iconSrc: "/instagramIcon.png" },
  { key: "discord", label: "Discord", iconSrc: "/discordIcon.png" },
  {
    key: "youtube",
    label: "YouTube",
    iconSvg: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
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
                    className="w-11 h-11 rounded-full bg-zinc-100 hover:bg-gold-deep hover:text-white text-zinc-700 flex items-center justify-center transition-colors"
                  >
                    {s.iconSrc ? (
                      <Image src={s.iconSrc} alt="" width={20} height={20} />
                    ) : (
                      s.iconSvg
                    )}
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
