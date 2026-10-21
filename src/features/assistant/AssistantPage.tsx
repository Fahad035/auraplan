import {
  ArrowDown,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Heart,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import PageHeader from "../../components/shared/PageHeader";
import EventCreationForm from "./EventCreationForm";

const features = [
  {
    icon: Lightbulb,
    title: "Personalized ideas",
    description:
      "Discover celebration ideas tailored to your event, location, and guest count.",
    iconStyle: "bg-violet-100 text-violet-700",
  },
  {
    icon: Wallet,
    title: "Smarter budgeting",
    description:
      "Organize estimated expenses while keeping a contingency reserve in mind.",
    iconStyle: "bg-blue-100 text-blue-700",
  },
  {
    icon: CalendarCheck,
    title: "A clear timeline",
    description:
      "Turn your event date into practical planning tasks and milestones.",
    iconStyle: "bg-emerald-100 text-emerald-700",
  },
];

const planningSteps = [
  {
    number: "01",
    title: "Tell us about your event",
    description: "Choose the occasion, date, location, guest count, and budget.",
  },
  {
    number: "02",
    title: "Generate your plan",
    description: "AuraPlan creates ideas, expense estimates, and planning tasks.",
  },
  {
    number: "03",
    title: "Make it your own",
    description: "Review your plan and manage tasks, expenses, and vendors.",
  },
];

export default function AssistantPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:py-12">
      <PageHeader
        eyebrow="AuraPlan · AI event planner"
        title="Every celebration, beautifully planned."
        description="From the first idea to the final detail, create a thoughtful event plan with personalized AI recommendations, budget estimates, and a practical planning timeline."
      />

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
                <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
                    <Lightbulb size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Celebration ideas
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Inspiration shaped around your event.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Expense breakdown
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Estimates and a contingency reserve.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Planning checklist
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Tasks you can track as your date approaches.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                <ShieldCheck size={16} className="shrink-0 text-violet-600" />
                Your generated plan is saved in your browser.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Event planning features"
        className="mt-8 grid gap-4 md:grid-cols-3"
      >
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-6"
            >
              <div
                className={`flex size-11 items-center justify-center rounded-xl ${feature.iconStyle}`}
              >
                <Icon size={21} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {feature.description}
              </p>
            </article>
          );
        })}
      </section>

      <section
        id="create-event"
        aria-label="Create your event plan"
        className="mt-12 scroll-mt-24"
      >
        <div className="mb-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <Heart size={14} />
            Start with your vision
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Let's plan something wonderful.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Share a few details about your celebration. AuraPlan will use them
            to generate your event ideas, budget estimates, and planning tasks.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
          <div className="min-w-0">
            <EventCreationForm />
          </div>

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
                AI-generated costs are estimates, not vendor quotes. Review
                prices for your location and keep your budget flexible.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="text-sm font-semibold text-slate-700">
          AuraPlan — Every celebration, beautifully planned.
        </p>
        <p className="text-xs leading-5 text-slate-500">
          Thoughtful planning starts with a single idea.
        </p>
      </footer>
    </main>
  );
}