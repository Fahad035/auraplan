import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
};

export default function Card({
  title,
  description,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm sm:p-6 ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="mb-5">
          {title && (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
