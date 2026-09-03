import Image from "next/image";
import TitleHeader from "@/components/TitleHeader";

// Email defaults to the address already used in the site footer.
const SOCIALS = [
  { label: "Discord", iconSrc: "/discordIcon.svg", href: "https://discord.com/invite/MhYvsbCqXR", external: true },
  { label: "Instagram", iconSrc: "/instagramIcon.svg", href: "https://www.instagram.com/esportsatucf/?hl=en", external: true },
  { label: "TikTok", iconSrc: "/tiktokIcon.svg", href: "https://www.tiktok.com/@esportsatucf", external: true },
  { label: "Twitch", iconSrc: "/twitchIcon.svg", href: "https://www.twitch.tv/esportsatucf", external: true },
  { label: "X", iconSrc: "/xIcon.svg", href: "https://x.com/EsportsatUCF", external: true },
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
      <TitleHeader
        title="Contact Us"
        description="Have a question, want to get involved, or just want to say hi? Reach out to Esports at UCF through any of the channels below, we’d love to hear from you."
      />

      <div className="mx-auto max-w-6xl px-6 md:px-16 pt-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: 6 social/contact icons, 2 per row -> 3 rows */}
          <ul className="grid grid-cols-2 w-fit gap-8 sm:gap-12 mx-auto md:mx-0">
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
                    className="object-contain w-28 h-28 sm:w-37.5 sm:h-37.5"
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
