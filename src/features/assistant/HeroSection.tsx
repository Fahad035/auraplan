import { ArrowDown, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import { blueprintItems } from "./content";

export default function HeroSection() {
  return (
    <section
      aria-label="AI event planner introduction"
      className="relative mt-6 overflow-hidden rounded-3xl border border-violet-100 bg-linear-to-br from-violet-100 via-white to-indigo-100 shadow-sm"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-violet-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-indigo-200/30 blur-3xl"
      />

      <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-12 lg:p-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
            <Sparkles size={14} />
            Your personal event-planning assistant
          </div>

          <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.12]">
            Less planning stress.
            <span className="mt-1 block text-violet-700">
              More moments to celebrate.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Big day or small gathering, start with your vision. AuraPlan
            helps turn your event details into an organized starting plan
            that you can review, customize, and manage.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#create-event"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200"
            >
              Plan my event
              <ArrowDown size={16} />
            </a>

            <a
              href="#how-it-works"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100"
            >
              How it works
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-slate-600">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Personalized recommendations
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Editable event plan
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="rounded-3xl border border-white/90 bg-white/85 p-5 shadow-xl shadow-violet-200/30 backdrop-blur-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Your event blueprint
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    One organized starting point
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Ready to plan
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {blueprintItems.map(
                ({ icon: Icon, title, description, cardStyle, iconColor }) => (
                  <div
                    key={title}
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${cardStyle}`}
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${iconColor}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              <ShieldCheck size={16} className="shrink-0 text-violet-600" />
              Your generated plan is saved in your browser.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}