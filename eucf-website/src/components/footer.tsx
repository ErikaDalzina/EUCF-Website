import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-zinc-900 text-white font-roboto">
      <div className="max-w-7xl mx-auto px-1 py-24">
        <div className="grid grid-cols-2 gap-16">
          <div className="flex flex-col justify-between space-y-10">
            <div>
              <Image
                src="/UCFlogo.svg"
                alt="UCF Logo"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h2 className="text-3xl leading-9.5 font-normal text-left">
              University of Central Florida
            </h2>
            <p className="text-3xl leading-9.5 font-normal">
              4000 Central Florida Blvd
              <br />
              Orlando, FL 32816
            </p>
          </div>
          <div className="flex flex-col justify-between space-y-20 text-left">
            <p className="text-3xl leading-9.5 font-normal">
              Copyright © 2025, University of Central Florida. All rights reserved.
            </p>
            <p className="text-3xl leading-9.5 font-normal max-w-md">
              This website is created and maintained by EUCF’s website developer team.
            </p>
            <p className="text-3xl leading-9.5 font-normal">
              For inquiries, reach us at:{" "}
              <a
                href="mailto:esportsatucf@gmail.com"
                className="underline hover:opacity-60 transition"
              >
                esportsatucf@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}