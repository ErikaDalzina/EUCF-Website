import Image from "next/image";

export default function Header() {
  return (
    <header className="pt-[26px] pl-[41px]">
      <Image
        src="/esportsLogo.png"
        alt="EUCF Esports Logo"
        width={207}
        height={76}
        className="object-contain"
      />
    </header>
  );
}
