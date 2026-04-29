import OfficersCarousel from "@/components/OfficersCarousel";

export default function Officers() {
  return (
    <div className="min-h-screen ">
      <h1 className="font-heading text-6xl font-semibold text-heading text-center">
        Officers
      </h1>
      <p className="text-xl text-zinc-900 text-center px-8 m-1 mx-auto p-6">
        Meet the leaders behind EUCF. Our officers dedicate their time to growing UCF’s 
        Esports scene through competition, collaboration, and community on and off campus, 
        creating opportunities for students to connect and level up together.
      </p>
      <OfficersCarousel />
    </div>
  );
}
