import Image from "next/image";
import Link from "next/link";

export interface TitleCardProps {
  name: string;
  slug: string;
  icon: string;
}

export default function TitleCard({ name, slug, icon }: TitleCardProps) {
  return (
    <Link
      href={`/titles/${slug}`}
      aria-label={`View ${name} page`}
      className="border-2 border-black rounded-lg overflow-hidden bg-white
                 transition-transform duration-300 hover:scale-105 block"
    >
      <div className="relative w-full aspect-square bg-white">
        <Image
          src={icon}
          alt={`${name} icon`}
          fill
          className="object-contain p-6"
        />
      </div>
      <div className="bg-black text-white text-center py-3">
        <p className="text-lg font-semibold">{name}</p>
      </div>
    </Link>
  );
}
