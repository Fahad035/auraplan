import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Download,
  FileText,
  Printer,
  Store,
  CheckCircle2,
} from "lucide-react";

import PageHeader from "../../components/shared/PageHeader";
import Button from "../../components/ui/Button";
import { inputClass, labelClass } from "../../components/ui/fieldStyles";
import { calculateBudget } from "../../domain/budget";
import { getVendorProgress } from "../../domain/checklist";
import {
  downloadTextFile,
  planToJson,
  planToMarkdown,
  safeFileName,
} from "../../domain/export";
import type { EventPlan } from "../../domain/schema";
import { getTimelineProgress } from "../../domain/timeline";
import { formatCurrency } from "../../lib/format";
import { loadEventPlans, saveEventPlans } from "../../lib/storage";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import BudgetPanel from "./BudgetPanel";
import BudgetReserveSummary from "./BudgetReserveSummary";
import EventDetailsPanel from "./EventDetailsPanel";
import EventOverview from "./EventOverview";
import IdeasPanel from "./IdeasPanel";
import OperationsEmptyState from "./OperationsEmptyState";
import ProgressSummaryCard from "./ProgressSummaryCard";
import RefinePlan from "./RefinePlan";
import SectionIntro from "./SectionIntro";
import TimelinePanel from "./TimelinePanel";
import VendorChecklist from "./VendorChecklist";

/** Reads the event id passed through router state, if it is a string. */
function getEventIdFromState(state: unknown): string | undefined {
  if (typeof state !== "object" || state === null) return undefined;

  const { eventId } = state as { eventId?: unknown };

  return typeof eventId === "string" ? eventId : undefined;
}

function exportJson(plan: EventPlan): void {
  downloadTextFile(
    `${safeFileName(plan.title)}.json`,
    planToJson(plan),
    "application/json",
  );
}

function exportSummary(plan: EventPlan): void {
  downloadTextFile(
    `${safeFileName(plan.title)}.md`,
    planToMarkdown(plan),
    "text/markdown",
  );
}

export default function OperationsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<EventPlan[]>(() => loadEventPlans());
  const [selectedId, setSelectedId] = useState<string | undefined>(() =>
    getEventIdFromState(location.state),
  );
  const [saveError, setSaveError] = useState("");

  const plan =
    plans.find((item) => item.id === selectedId) ?? plans[plans.length - 1];

  useDocumentTitle(plan ? `${plan.title} · Operations` : "Operations");

  function updatePlan(updatedPlan: EventPlan) {
    const updatedPlans = plans.map((item) =>
      item.id === updatedPlan.id ? updatedPlan : item,
    );

    try {
      saveEventPlans(updatedPlans);
      setPlans(updatedPlans);
      setSaveError("");
    } catch {
      setSaveError(
        "Unable to save your changes. Check that browser storage is available and not full.",
      );
    }
  }

  if (!plan) {
    return <OperationsEmptyState onCreateEvent={() => navigate("/")} />;
  }

  const budget = calculateBudget(
    plan.totalBudget,
    plan.contingencyPercent,
    plan.budgetItems,
  );

  const progress = getTimelineProgress(plan.timeline);
  const vendorProgress = getVendorProgress(plan.vendors);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:py-12">
      <PageHeader
        eyebrow="AuraPlan · Event operations"
        title={plan.title}
        description="Your celebration, organized in one place. Monitor spending, stay on schedule, and keep every vendor on track."
      />

      {saveError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {saveError}
        </p>
      )}

      {plans.length > 1 && (
        <div className="mt-4 max-w-md print:hidden">
          <label
            htmlFor="event-switcher"
            className={`${labelClass} dark:text-slate-300`}
          >
            Your events
          </label>
          <select
            id="event-switcher"
            value={plan.id}
            onChange={(event) => setSelectedId(event.target.value)}
            className={`mt-2 ${inputClass}`}
          >
            {plans.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {item.eventDate} · {item.location}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className="mt-4 flex flex-wrap gap-3 print:hidden"
        role="group"
        aria-label="Export and print plan"
      >
        <Button variant="secondary" onClick={() => exportJson(plan)}>
          <Download size={16} aria-hidden="true" />
          Export JSON
        </Button>
        <Button variant="secondary" onClick={() => exportSummary(plan)}>
          <FileText size={16} aria-hidden="true" />
          Export summary
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} aria-hidden="true" />
          Print plan
        </Button>
      </div>

      <EventDetailsPanel plan={plan} />

      <EventOverview budget={budget} progress={progress} />

      <BudgetReserveSummary
        budget={budget}
        contingencyPercent={plan.contingencyPercent}
      />

      {budget.isOverBudget && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Your event is over budget
            </p>
            <p className="mt-1 text-sm leading-6 text-red-700">
              Expenses exceed the amount available after your reserve by{" "}
              <strong>{formatCurrency(-budget.remaining)}</strong>. Adjust your
              expenses in the budget planner below to bring your spending back
              within the limit.
            </p>
          </div>
        </div>
      )}

      <IdeasPanel ideas={plan.ideas} />
      <RefinePlan plan={plan} onApply={updatePlan} />

      <section aria-label="Budget management" className="mt-8">
        <SectionIntro
          eyebrow="Financial planning"
          title="Manage your budget"
          description="Review your expenses, protect your reserve, and adjust allocations whenever your plans change."
        />

        <BudgetPanel
          totalBudget={plan.totalBudget}
          contingencyPercent={plan.contingencyPercent}
          items={plan.budgetItems}
          onChange={(items) => updatePlan({ ...plan, budgetItems: items })}
        />
      </section>

      <section aria-label="Planning and vendor management" className="mt-8">
        <SectionIntro
          eyebrow="Execution workspace"
          title="Keep everything on track"
          description="Complete your planning tasks and monitor vendor bookings as your event approaches."
        />

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <ProgressSummaryCard
            icon={CheckCircle2}
            iconStyle="bg-violet-100 text-violet-700"
            title="Planning progress"
            detail={`${progress.completed} of ${progress.total} tasks completed`}
            percentage={progress.percentage}
            percentageStyle="text-violet-700 dark:text-violet-300"
            progressLabel="Overall planning progress"
            barStyle="bg-violet-600"
          />

          <ProgressSummaryCard
            icon={Store}
            iconStyle="bg-emerald-100 text-emerald-700"
            title="Vendor bookings"
            detail={`${vendorProgress.booked} of ${vendorProgress.total} vendors booked`}
            percentage={vendorProgress.percentage}
            percentageStyle="text-emerald-700 dark:text-emerald-300"
            progressLabel="Overall vendor booking progress"
            barStyle="bg-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <TimelinePanel
            items={plan.timeline}
            onChange={(timeline) => updatePlan({ ...plan, timeline })}
          />

          <VendorChecklist
            vendors={plan.vendors}
            onChange={(vendors) => updatePlan({ ...plan, vendors })}
          />
        </div>
      </section>

      <footer className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Your event workspace, always within reach.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">
            Changes are saved in this browser. This version does not sync across
            devices.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} />
          Browser storage enabled
        </div>
      </footer>
    </main>
  );
}
