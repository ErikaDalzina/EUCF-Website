import FeaturedStory from "@/components/FeaturedStory";

export default function Home() {
  return (
    <>
    <section
      aria-label="Esports at UCF hero"
      className="relative w-full min-h-[70vh] -mt-6 overflow-hidden bg-black"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 600"
      >
        <defs>
          <linearGradient id="heroBase" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="12%" stopColor="#3B2F1C" />
            <stop offset="28%" stopColor="#B49758" />
            <stop offset="100%" stopColor="#B49758" />
          </linearGradient>

          <filter id="softBlend" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>

        <rect width="1440" height="600" fill="url(#heroBase)" />

        <g filter="url(#softBlend)" opacity="0.85">
          <path
            d="M-100,160 C260,80 600,260 900,200 C1200,140 1320,220 1540,170 L1540,0 L-100,0 Z"
            fill="#000000"
            fillOpacity="0.28"
          />
          <path
            d="M-100,320 C240,260 540,420 840,360 C1140,300 1320,400 1540,360 L1540,560 L-100,560 Z"
            fill="#D9B873"
            fillOpacity="0.55"
          />
          <path
            d="M-100,440 C260,380 580,520 880,470 C1180,420 1320,500 1540,470 L1540,600 L-100,600 Z"
            fill="#FFFFFF"
            fillOpacity="0.18"
          />
        </g>
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-44 md:pt-56 pb-24 md:pb-32">
        <h1 className="font-(family-name:--font-archivo-black) text-5xl md:text-7xl lg:text-8xl text-black tracking-tight">
          Esports at UCF
        </h1>
        <p className="mt-6 max-w-2xl text-base md:text-lg text-black/80">
          Competitive gaming at the University of Central Florida — placeholder
          tagline you can edit later.
        </p>
      </div>
    </section>
    <FeaturedStory />
    </>
  );
}
