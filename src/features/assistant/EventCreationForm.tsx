import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Users, Wallet, Sparkles } from "lucide-react";

import Button from "../../components/ui/Button";
import { labelClass, roomyInputClass } from "../../components/ui/fieldStyles";
import { todayLocalDate } from "../../domain/dates";
import { validateEventInput } from "../../domain/eventInput";
import { buildEventPlan } from "../../domain/planBuilder";
import { LIMITS } from "../../domain/recommendation";
import type { EventType } from "../../domain/schema";
import { generateRecommendations } from "../../lib/api";
import { loadEventPlans, saveEventPlans } from "../../lib/storage";

const inputClass = `mt-2 ${roomyInputClass}`;

export default function EventCreationForm() {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState<EventType>("birthday");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState("50");
  const [totalBudget, setTotalBudget] = useState("50000");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const minimumDate = todayLocalDate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validation = validateEventInput(
      { eventType, eventDate, location, guestCount, totalBudget },
      minimumDate,
    );

    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setIsSaving(true);

    try {
      const recommendations = await generateRecommendations(validation.value);
      const plan = buildEventPlan(validation.value, recommendations);

      saveEventPlans([...loadEventPlans(), plan]);

      navigate("/operations", { state: { eventId: plan.id } });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate your event plan. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isSaving}
      aria-describedby={error ? "form-error" : undefined}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>

        <h2 className="text-xl font-semibold text-slate-900">
          Create your event
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Tell AuraPlan about your celebration. AI will create personalized
          ideas, budget estimates, and planning tasks for you.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="eventType" className={labelClass}>
            Event type
          </label>

          <select
            id="eventType"
            name="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            className={inputClass}
          >
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="community">Community event</option>
          </select>
        </div>

        <div>
          <label htmlFor="eventDate" className={labelClass}>
            <CalendarDays className="mr-2 inline size-4" aria-hidden="true" />
            Event date
          </label>

          <input
            id="eventDate"
            name="eventDate"
            type="date"
            min={minimumDate}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>
            <MapPin className="mr-2 inline size-4" aria-hidden="true" />
            Event location
          </label>

          <input
            id="location"
            name="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Hyderabad, Telangana"
            maxLength={LIMITS.maxLocationLength}
            className={inputClass}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="guestCount" className={labelClass}>
              <Users className="mr-2 inline size-4" aria-hidden="true" />
              Expected guests
            </label>

            <input
              id="guestCount"
              name="guestCount"
              type="number"
              min="1"
              max={LIMITS.maxGuests}
              step="1"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="totalBudget" className={labelClass}>
              <Wallet className="mr-2 inline size-4" aria-hidden="true" />
              Total budget (₹)
            </label>

            <input
              id="totalBudget"
              name="totalBudget"
              type="number"
              min="1"
              max={LIMITS.maxBudget}
              step="1"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <p
          id="form-error"
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-7">
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving
            ? "Generating your AI event plan..."
            : "Generate AI event plan"}
        </Button>
      </div>

      {isSaving && (
        <p className="mt-3 text-center text-sm text-slate-500" role="status">
          AuraPlan is preparing your ideas, budget, and timeline. This may take
          a few seconds.
        </p>
      )}
    </form>
  );
}