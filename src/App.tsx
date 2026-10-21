
import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import AppHeader from "./components/layout/AppHeader";
import AppFooter from "./components/layout/AppFooter";
import AppRoutes from "./app/routes";

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
        <AppHeader theme={theme} onToggleTheme={toggleTheme} />

        <div className="flex flex-1 flex-col">
          <AppRoutes />
        </div>

        <AppFooter />
      </div>
    </BrowserRouter>
  );
}
