type PageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export default function PageHeader({
  title,
  description,
  eyebrow,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
          {eyebrow}
        </p>
      )}

      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
        {title}
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
        {description}
      </p>
    </div>
  );
}
