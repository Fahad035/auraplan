import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import AppRoutes from "./app/routes";
import ErrorBoundary from "./components/shared/ErrorBoundary";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem("auraplan-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
  } catch {
    // Continue with the system preference if storage is unavailable.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem("auraplan-theme", theme);
    } catch {
      // The theme still works for the current session if storage is unavailable.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return (
    <BrowserRouter>
      <div
        className={`flex min-h-screen flex-col ${
          theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
        data-theme={theme}
      >
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          Skip to main content
        </a>

        <AppHeader theme={theme} onToggleTheme={toggleTheme} />

        <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>

        <AppFooter />
      </div>
    </BrowserRouter>
  );
}