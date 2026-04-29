import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-zinc-900 text-white font-roboto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <Image
                src="/UCFlogo.svg"
                alt="UCF Logo"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-bold leading-snug text-left">
              University of Central Florida
            </h2>
            <p className="text-xl leading-snug font-normal">
              4000 Central Florida Blvd
              <br />
              Orlando, FL 32816
            </p>
          </div>
          <div className="flex flex-col text-left">
            <div className="space-y-10">
              <p className="text-xl leading-snug font-normal">
                Copyright © 2026, University of Central Florida. All rights reserved.
              </p>
              <p className="text-xl leading-snug font-normal">
                For inquiries, reach us at:{" "}
                <a
                  href="mailto:esportsatucf@gmail.com"
                  className="underline hover:opacity-60 transition"
                >
                  esportsatucf@gmail.com
                </a>
              </p>
            </div>
            <a
              href="#top"
              className="mt-auto pt-8 text-xl leading-snug font-normal underline hover:opacity-60 transition self-start"
            >
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
