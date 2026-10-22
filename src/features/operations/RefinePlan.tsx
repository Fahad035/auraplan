import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  applyRecommendations,
  toPreviousPlan,
} from "../../domain/planBuilder";
import type { EventPlan } from "../../domain/schema";
import { generateRecommendations } from "../../lib/api";

type RefinePlanProps = {
  plan: EventPlan;
  onApply: (plan: EventPlan) => void;
};

const MIN_LENGTH = 3;
const MAX_LENGTH = 300;

export default function RefinePlan({ plan, onApply }: RefinePlanProps) {
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDone(false);

    const request = feedback.trim();

    if (request.length < MIN_LENGTH || request.length > MAX_LENGTH) {
      setError(
        `Describe the change in ${MIN_LENGTH} to ${MAX_LENGTH} characters.`,
      );
      return;
    }

    setIsRefining(true);

    try {
      const recommendations = await generateRecommendations({
        eventType: plan.eventType,
        eventDate: plan.eventDate,
        location: plan.location,
        guestCount: plan.guestCount,
        totalBudget: plan.totalBudget,
        feedback: request,
        previousPlan: toPreviousPlan(plan),
      });

      onApply(applyRecommendations(plan, recommendations));
      setFeedback("");
      setDone(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to refine your plan. Please try again.",
      );
    } finally {
      setIsRefining(false);
    }
  }

  return (
    <section aria-label="Refine your plan" className="mt-8 print:hidden">
      <Card
        title="Refine your plan"
        description="Ask for changes in plain words, such as “make it cheaper” or “more eco-friendly”. Completed tasks and booked vendors are kept."
      >
        <form onSubmit={handleSubmit} aria-busy={isRefining} className="space-y-3">
          <label
            htmlFor="refine-feedback"
            className="text-sm font-medium text-slate-700"
          >
            What would you like to change?
          </label>

          <textarea
            id="refine-feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            maxLength={MAX_LENGTH}
            rows={3}
            aria-describedby={error ? "refine-error" : undefined}
            aria-invalid={Boolean(error)}
            placeholder="e.g. Reduce the decoration cost and add a live music option"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />

          {error && (
            <p id="refine-error" role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          {isRefining && (
            <p role="status" className="text-sm text-slate-600">
              Revising your plan. This may take a few seconds.
            </p>
          )}

          {done && !isRefining && (
            <p role="status" className="text-sm text-emerald-700">
              Your plan was updated.
            </p>
          )}

          <Button type="submit" disabled={isRefining}>
            <Sparkles size={16} aria-hidden="true" />
            {isRefining ? "Refining..." : "Refine plan"}
          </Button>
        </form>
      </Card>
    </section>
  );
}