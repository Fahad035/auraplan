import { Heart } from "lucide-react";

import PageHeader from "../../components/shared/PageHeader";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import { features } from "./content";
import EventCreationForm from "./EventCreationForm";
import HeroSection from "./HeroSection";
import PlanningSidebar from "./PlanningSidebar";

export default function AssistantPage() {
  useDocumentTitle("Plan your event");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:py-12">
      <PageHeader
        eyebrow="AuraPlan · AI event planner"
        title="Every celebration, beautifully planned."
        description="From the first idea to the final detail, create a thoughtful event plan with personalized AI recommendations, budget estimates, and a practical planning timeline."
      />

      <HeroSection />

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

          <PlanningSidebar />
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