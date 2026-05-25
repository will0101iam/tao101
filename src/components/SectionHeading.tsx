type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-[0.68rem] uppercase tracking-[0.34em] text-stone-500">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-[1.02] text-stone-100 md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
