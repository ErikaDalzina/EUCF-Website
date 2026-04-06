import Image from "next/image";

const sections = [
  {
    title: "Overview",
    text: "The University of Central Florida Esports Club is a vibrant community for competitive and casual gamers alike. Our teams compete in titles like League of Legends, Valorant, and Overwatch, representing UCF at collegiate tournaments nationwide. Beyond competition, Esports at UCF fosters collaboration where students can connect, learn, and grow. From skill workshops and streaming events to social meetups and campus tournaments, there’s something for every gamer. Whether aiming to go pro or just play for fun, EUCF welcomes you.",
  },
  {
    title: "Club History",
    text: "Founded in [Year], EUCF has quickly grown into one of the premier competitive gaming communities at the University of Central Florida. What started as a small group of passionate gamers has evolved into a thriving club that hosts tournaments, fosters teamwork, and connects students across all majors through a shared love of gaming. With a commitment to inclusivity, growth, and competitive excellence, EUCF continues to expand its presence on campus, providing a home for both casual and competitive gamers alike.",
  },
  {
    title: "The Dungeon",
    text: "The Dungeon, UCF’s esports lab, is a hub for gamers to collaborate, learn, and build community. Equipped for various game titles, it supports team practice, campus tournaments, and streaming events. Beyond gameplay, The Dungeon provides workshops, social meetups, and mentoring opportunities, giving students a space to develop skills, connect with peers, and explore esports professionally or recreationally. Whether competing or just hanging out, The Dungeon is at the heart of UCF’s esports experience.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <h1 className="font-(family-name:--font-roboto-condensed) text-6xl italic font-bold text-white text-outline text-center">
        ABOUT US
      </h1>

      <div className="mx-auto max-w-6xl px-6 md:px-16 pt-10 pb-20 space-y-16">
        {sections.map((section) => (
          <section
            key={section.title}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
          >
            <div>
              <h2 className="font-(family-name:--font-roboto-condensed) text-3xl md:text-4xl italic font-bold text-white text-outline mb-4 text-center">
                {section.title}
              </h2>
              <p className="text-lg text-zinc-900">{section.text}</p>
            </div>

            <div className="relative w-full aspect-4/3">
              <Image
                src="/knighto.png"
                alt={section.title}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
