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
      {/* mb-7 stands in for the old `py-6 m-1`: pages below this component (the
          titles/sponsors grids) have no top padding of their own and relied on
          that bottom spacing, so it has to live here. */}
      <p className="mt-4 mb-7 mx-auto max-w-5xl px-6 text-center text-lg text-zinc-700 text-pretty">
        {description}
      </p>
    </>
  );
}
