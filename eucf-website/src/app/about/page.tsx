import AboutPillars from "@/components/AboutPillars";
import TitleHeader from "@/components/TitleHeader";
import { ABOUT_SECTIONS } from "@/data/about";

export default function About() {
  return (
    <div>
      <TitleHeader
        title="About Us"
        description="Esports at UCF is the official Competitive Gaming Sports Club at the University of Central Florida. Here’s what the club is built on."
      />
      <AboutPillars sections={ABOUT_SECTIONS} />
    </div>
  );
}
