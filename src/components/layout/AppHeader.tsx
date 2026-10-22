
import { Link, NavLink } from "react-router-dom";
import {
  CalendarHeart,
  LayoutDashboard,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";

type AppHeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function AppHeader({
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  const isDark = theme === "dark";

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm sm:px-3 font-medium transition-colors ${
      isActive
        ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          aria-label="AuraPlan home"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm sm:size-10">
            <CalendarHeart className="size-5" />
          </span>

          <span className="min-w-0">
            <span className="block text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              AuraPlan
            </span>
            <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Every celebration, beautifully planned.
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              <Sparkles className="size-4 shrink-0" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </NavLink>

            <NavLink to="/operations" className={navClass}>
              <LayoutDashboard className="size-4 shrink-0" />
              <span>Operations</span>
            </NavLink>
          </nav>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-violet-300 dark:hover:border-violet-500 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <Sun className="size-4.5" />
            ) : (
              <Moon className="size-4.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
