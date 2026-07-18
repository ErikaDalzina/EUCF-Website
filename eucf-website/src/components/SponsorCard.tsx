import Image from "next/image";

export interface SponsorCardProps {
  name: string;
  logo: string;
  website: string;
}

export default function SponsorCard({ name, logo, website }: SponsorCardProps) {
  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${name} (opens in new tab)`}
      className="border-2 border-black rounded-lg overflow-hidden bg-white
                 transition-transform duration-300 hover:scale-105 block
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-deep focus-visible:ring-offset-2"
    >
      <div className="relative w-full aspect-2/1 bg-white">
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          className="object-contain p-6"
        />
      </div>
      <div className="bg-black text-white text-center py-3">
        <p className="text-lg font-semibold">{name}</p>
      </div>
    </a>
  );
}

export function SponsorPlaceholderCard() {
  return (
    <div
      aria-hidden="true"
      className="border-2 border-black rounded-lg overflow-hidden bg-white opacity-60 cursor-default"
    >
      <div className="relative w-full aspect-2/1 bg-white flex items-center justify-center">
        <span className="font-heading text-2xl text-zinc-400">Coming Soon</span>
      </div>
      <div className="bg-black text-white text-center py-3">
        <p className="text-lg font-semibold">Coming Soon</p>
      </div>
    </div>
  );
}
