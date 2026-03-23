import Image from "next/image";

export interface Officer {
  name: string;
  position: string;
  image: string;
}

export default function OfficerCard({ name, position, image }: Officer) {
  return (
    <div className="shrink-0 transition-transform duration-300 hover:scale-105 border-2 
                    border-transparent hover:border-black rounded-lg overflow-hidden">
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
