import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="fixed inset-0 -z-10 bg-[url('/skyBackground.png')] bg-cover bg-center" />
        <div>
          <nav
            className="flex flex-col items-start gap-8 pl-10.5 pt-16 font-(family-name:--font-roboto-condensed) text-7xl italic font-bold text-white text-outline"
          >
            <Link href="/about" className="hover:text-[#B49758] transition">ABOUT US</Link>
            <Link href="/officers" className="hover:text-[#B49758] transition">OFFICERS</Link>
            <Link href="/titles" className="hover:text-[#B49758] transition">TITLES</Link>
            <Link href="/sponsors" className="hover:text-[#B49758] transition">SPONSORS</Link>
            <Link href="/connect" className="hover:text-[#B49758] transition">CONNECT</Link>
          </nav>
        </div>
    </div>
  );
}
