const baseInput =
  "w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:scheme-dark dark:focus:ring-violet-500/30";

/** Compact text input / select used in the planner panels. */
export const inputClass = `${baseInput} px-3 py-2.5`;

/** Roomier input used in the main creation and refine forms. */
export const roomyInputClass = `${baseInput} px-4 py-3 transition`;

export const labelClass =
  "text-sm font-medium text-slate-700 dark:text-slate-300";
