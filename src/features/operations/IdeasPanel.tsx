import { Lightbulb } from "lucide-react";

import Card from "../../components/ui/Card";

type IdeasPanelProps = {
  ideas: string[];
};

export default function IdeasPanel({ ideas }: IdeasPanelProps) {
  return (
    <section aria-label="Event ideas" className="mt-8">
      <Card
        title="Personalized ideas"
        description="AI-generated suggestions tailored to your event type, location and guest count."
      >
        {ideas.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No ideas were saved for this event.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {ideas.map((idea) => (
              <li
                key={idea}
                className="flex items-start gap-3 rounded-xl border border-slate-100 dark:border-slate-700 p-3"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Lightbulb size={15} aria-hidden="true" />
                </span>
                <span className="text-sm leading-6 text-slate-700 dark:text-slate-300">{idea}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
