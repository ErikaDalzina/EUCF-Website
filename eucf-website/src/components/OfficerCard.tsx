import Image from "next/image";

export interface Officer {
  name: string;
  position: string;
  image: string;
  isActive?: boolean;
  onTap?: () => void;
}

export default function OfficerCard({ name, position, image, isActive, onTap }: Officer) {
  return (
    <div
      onClick={onTap}
      className={`shrink-0 transition-transform duration-300 hover:scale-105 border-2
                  hover:border-black rounded-lg overflow-hidden cursor-pointer
                  ${isActive ? "scale-105 border-black" : "border-transparent"}`}
    >
      <div className="overflow-hidden">
        <div className="relative w-65 sm:w-85 md:w-100 aspect-3/4 bg-amber-400">
          <Image
            src={image}
            alt={`${name}, ${position} of EUCF`}
            fill
            loading="lazy"
            className="object-cover"
          />
        </div>
      </div>
      <div className="bg-black text-white p-3">
        <p className="text-sm font-bold uppercase tracking-wide text-[#B49758]">
          {position}
        </p>
        <p className="text-lg font-semibold">{name}</p>
      </div>
    </div>
  );
}
