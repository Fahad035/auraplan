import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { labelClass, roomyInputClass } from "../../components/ui/fieldStyles";
import { applyRecommendations, toPreviousPlan } from "../../domain/planBuilder";
import { LIMITS } from "../../domain/recommendation";
import type { EventPlan } from "../../domain/schema";
import { generateRecommendations } from "../../lib/api";

type RefinePlanProps = {
  plan: EventPlan;
  onApply: (plan: EventPlan) => void;
};

const { minFeedbackLength, maxFeedbackLength } = LIMITS;

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

    if (
      request.length < minFeedbackLength ||
      request.length > maxFeedbackLength
    ) {
      setError(
        `Describe the change in ${minFeedbackLength} to ${maxFeedbackLength} characters.`,
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
        <form
          onSubmit={handleSubmit}
          aria-busy={isRefining}
          className="space-y-3"
        >
          <label htmlFor="refine-feedback" className={labelClass}>
            What would you like to change?
          </label>

          <textarea
            id="refine-feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            maxLength={maxFeedbackLength}
            rows={3}
            aria-describedby={error ? "refine-error" : undefined}
            aria-invalid={Boolean(error)}
            placeholder="e.g. Reduce the decoration cost and add a live music option"
            className={roomyInputClass}
          />

          {error && (
            <p id="refine-error" role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          {isRefining && (
            <p
              role="status"
              className="text-sm text-slate-600 dark:text-slate-300"
            >
              Revising your plan. This may take a few seconds.
            </p>
          )}

          {done && !isRefining && (
            <p
              role="status"
              className="text-sm text-emerald-700 dark:text-emerald-300"
            >
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
