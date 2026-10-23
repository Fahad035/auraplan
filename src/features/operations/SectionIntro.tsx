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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}
