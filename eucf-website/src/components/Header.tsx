import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="pt-6.5 pl-10.5 mb-9">
      <Link href="/">
        <Image
          src="/esportsLogo.png"
          alt="EUCF Esports Logo"
          width={180}
          height={76}
          className="object-contain"
        />
      </Link>
    </header>
  );
}
