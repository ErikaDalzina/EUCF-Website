export default function TitleHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <h1 className="font-heading text-5xl md:text-6xl font-semibold text-heading text-center">
        {title}
      </h1>
      <p className="text-xl text-zinc-900 text-center px-8 m-1 mx-auto p-6">
        {description}
      </p>
    </>
  );
}
