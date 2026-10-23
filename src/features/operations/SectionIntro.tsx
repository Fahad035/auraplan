interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function SectionIntro({
  eyebrow,
  title,
  description,
}: SectionIntroProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}