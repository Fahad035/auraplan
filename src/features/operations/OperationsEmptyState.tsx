import {
  ArrowRight,
  CalendarDays,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";

import Button from "../../components/ui/Button";

interface OperationsEmptyStateProps {
  onCreateEvent: () => void;
}

export default function OperationsEmptyState({
  onCreateEvent,
}: OperationsEmptyStateProps) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white dark:border-slate-700 dark:bg-slate-900 shadow-sm">
        <div className="bg-linear-to-br from-violet-50 via-white to-indigo-50 dark:from-violet-950 dark:via-slate-900 dark:to-indigo-950 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 ring-8 ring-violet-50 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-slate-900">
            <Sparkles size={28} />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
            Your event journey starts here
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Every celebration,
            <span className="block text-violet-600 dark:text-violet-300">
              beautifully planned.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            Bring your ideas to life with AI-generated recommendations, a
            practical budget, an organized timeline, and vendor tracking in one
            workspace.
          </p>

          <div className="mt-8 flex justify-center">
            <Button onClick={onCreateEvent}>
              Create your first event
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 dark:border-slate-700 p-5 sm:grid-cols-3 sm:p-7">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4">
            <Wallet className="size-5 text-violet-600" />
            <h2 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              Budget planning
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">
              Organize expenses and protect your contingency reserve.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4">
            <CalendarDays className="size-5 text-violet-600" />
            <h2 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              Planning timeline
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">
              Track milestones and stay on top of your tasks.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4">
            <Store className="size-5 text-violet-600" />
            <h2 className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              Vendor management
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">
              Keep vendor details and booking progress organized.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
