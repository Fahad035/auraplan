import { useState, type FormEvent } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";

import { inputClass as baseInputClass } from "../../components/ui/fieldStyles";
import ProgressBar from "../../components/ui/ProgressBar";
import { budgetUsedPercent, calculateBudget } from "../../domain/budget";
import type { BudgetItem } from "../../domain/schema";
import { formatCurrency } from "../../lib/format";

interface BudgetPanelProps {
  totalBudget: number;
  contingencyPercent: number;
  items: BudgetItem[];
  onChange: (items: BudgetItem[]) => void;
}

const MAX_CATEGORY_NAME_LENGTH = 100;

const inputClass = `${baseInputClass} min-w-0`;

export default function BudgetPanel({
  totalBudget,
  contingencyPercent,
  items,
  onChange,
}: BudgetPanelProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const budget = calculateBudget(totalBudget, contingencyPercent, items);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const parsedAmount = Number(amount);

    if (!cleanName) {
      setError("Enter an expense category name.");
      return;
    }

    if (
      amount.trim() === "" ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount < 0
    ) {
      setError("Enter a valid, non-negative amount.");
      return;
    }

    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        name: cleanName,
        amount: parsedAmount,
      },
    ]);

    setName("");
    setAmount("");
  }

  function updateAmount(id: string, value: string) {
    if (value.trim() === "") {
      onChange(
        items.map((item) => (item.id === id ? { ...item, amount: 0 } : item)),
      );
      return;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) return;

    onChange(
      items.map((item) =>
        item.id === id ? { ...item, amount: parsed } : item,
      ),
    );
  }

  function updateName(id: string, value: string) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, name: value } : item)),
    );
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  const allocationPercent = budgetUsedPercent(budget);

  const summaryTiles = [
    { label: "Total budget", value: budget.totalBudget },
    { label: `Reserve (${contingencyPercent}%)`, value: budget.contingency },
    { label: "Planned expenses", value: budget.allocated },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <Wallet size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Budget planner</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add expenses and adjust amounts to keep your event on budget.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {summaryTiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{tile.label}</p>
            <p className="mt-2 font-semibold text-slate-900">
              {formatCurrency(tile.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
          <span className="text-slate-500">Available after reserve</span>
          <span
            className={`font-semibold ${
              budget.isOverBudget
                ? "text-red-600 dark:text-red-300"
                : "text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {formatCurrency(budget.remaining)}
          </span>
        </div>

        <ProgressBar
          label="Budget allocation"
          percentage={allocationPercent}
          barClassName={budget.isOverBudget ? "bg-red-500" : "bg-violet-600"}
        />

        {budget.isOverBudget && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            Your expenses exceed the available budget by{" "}
            {formatCurrency(-budget.remaining)}.
          </p>
        )}
      </div>

      <div className="mt-7 border-t border-slate-100 pt-5">
        <h3 className="text-sm font-semibold text-slate-800">
          Expense categories
        </h3>

        {items.length === 0 ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No expenses yet. Add your first category below.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="hidden grid-cols-[minmax(0,1fr)_150px_40px] gap-2 px-1 sm:grid">
              <span className="text-xs font-medium text-slate-500">
                Category name
              </span>
              <span className="text-xs font-medium text-slate-500">
                Amount (₹)
              </span>
              <span aria-hidden="true" />
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 items-end gap-3 rounded-xl border border-slate-100 p-3 sm:grid-cols-[minmax(0,1fr)_150px_40px] sm:items-center sm:gap-2 sm:border-0 sm:p-0"
              >
                <label className="block min-w-0">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 sm:hidden">
                    Category name
                  </span>
                  <input
                    aria-label={`Name for ${item.name}`}
                    maxLength={MAX_CATEGORY_NAME_LENGTH}
                    value={item.name}
                    onChange={(event) =>
                      updateName(item.id, event.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <label className="block min-w-0">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 sm:hidden">
                    Amount (₹)
                  </span>
                  <input
                    aria-label={`Amount for ${item.name}`}
                    type="number"
                    min={0}
                    step={1}
                    value={item.amount}
                    onChange={(event) =>
                      updateAmount(item.id, event.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <button
                  type="button"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => removeItem(item.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={addItem}
        className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-[minmax(0,1fr)_150px_auto]"
      >
        <label className="block min-w-0">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
            Category name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Photography"
            maxLength={MAX_CATEGORY_NAME_LENGTH}
            className={inputClass}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
            Amount (₹)
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="15000"
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={17} />
          Add expense
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
