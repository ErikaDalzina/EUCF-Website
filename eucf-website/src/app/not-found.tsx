import Link from "next/link";
import TitleHeader from "@/components/TitleHeader";

export default function NotFound() {
  return (
    <div>
      <TitleHeader
        title="Page Not Found"
        description="That page doesn’t exist, or it may have moved. Try one of the links below."
      />
      <div className="mx-auto max-w-6xl px-6 md:px-16 pb-20">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto text-center rounded-lg bg-black px-6 py-3 text-lg font-semibold text-white
                       transition-transform duration-300 hover:scale-105"
          >
            Back to home
          </Link>
          <Link
            href="/titles"
            className="w-full sm:w-auto text-center rounded-lg border-2 border-black px-6 py-3 text-lg font-semibold text-heading
                       transition-transform duration-300 hover:scale-105"
          >
            Browse titles
          </Link>
        </div>
      </div>
    </div>
  );
}
