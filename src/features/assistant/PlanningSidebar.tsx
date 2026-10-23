import { ShieldCheck } from "lucide-react";

import { planningSteps } from "./content";

export default function PlanningSidebar() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">
          Your planning journey
        </h3>

        <div className="mt-5 space-y-5">
          {planningSteps.map((step, index) => (
            <div key={step.number} className="flex gap-3">
              <div className="flex shrink-0 flex-col items-center">
                <div className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-xs font-bold text-violet-700">
                  {step.number}
                </div>

                {index < planningSteps.length - 1 && (
                  <div className="mt-2 min-h-5 w-px flex-1 bg-violet-100" />
                )}
              </div>

              <div className="pb-1">
                <h4 className="text-sm font-semibold text-slate-800">
                  {step.title}
                </h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50 to-indigo-50 p-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
          <ShieldCheck size={20} />
        </div>

        <h3 className="mt-3 text-sm font-bold text-slate-900">
          Plan with confidence
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          AI-generated costs are estimates, not vendor quotes. Review prices for
          your location and keep your budget flexible.
        </p>
      </div>
    </aside>
  );
}
