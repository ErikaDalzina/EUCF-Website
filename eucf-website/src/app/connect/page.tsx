import Image from "next/image";

// Email defaults to the address already used in the site footer.
const SOCIALS = [
  { label: "Discord", iconSrc: "/discordIcon.png", href: "https://discord.com/invite/MhYvsbCqXR", external: true },
  { label: "Instagram", iconSrc: "/instagramIcon.png", href: "https://www.instagram.com/esportsatucf/?hl=en", external: true },
  { label: "TikTok", iconSrc: "/tiktokIcon.png", href: "https://www.tiktok.com/@esportsatucf", external: true },
  { label: "Twitch", iconSrc: "/twitchIcon.png", href: "https://www.twitch.tv/esportsatucf", external: true },
  { label: "X", iconSrc: "/xIcon.png", href: "https://x.com/EsportsatUCF", external: true },
  {
    label: "Email",
    iconSrc: "/email_logo.svg",
    href: "mailto:esportsatucf@gmail.com",
    external: false,
  },
];

export default function Connect() {
  return (
    <div>
      <h1 className="font-heading text-6xl font-semibold text-heading text-center">
        Contact Us
      </h1>
      <p className="text-xl text-zinc-900 text-center px-8 m-1 mx-auto p-6">
        Have a question, want to get involved, or just want to say hi? Reach out to
        Esports at UCF through any of the channels below, we&apos;d love to hear from you.
      </p>

      <div className="mx-auto max-w-6xl px-6 md:px-16 pt-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: 6 social/contact icons, 2 per row -> 3 rows */}
          <ul className="grid grid-cols-2 w-fit gap-x-12 gap-y-2 mx-auto md:mx-0">
            {SOCIALS.map((s) => (
              <li key={s.label} className="flex justify-center">
                <a
                  href={s.href}
                  {...(s.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  aria-label={s.label === "Email" ? "Email EUCF" : `EUCF on ${s.label}`}
                  className="flex items-center justify-center transition-transform duration-200 hover:scale-110 focus-visible:scale-110"
                >
                  <Image
                    src={s.iconSrc}
                    alt=""
                    width={150}
                    height={150}
                    className="object-contain"
                  />
                  {s.external && <span className="sr-only"> (opens in new tab)</span>}
                </a>
              </li>
            ))}
          </ul>

          {/* Right: knighto mascot fills the space */}
          <div className="relative w-full aspect-square">
            <Image
              src="/knighto.png"
              alt="Knighto, the EUCF mascot"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
