import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import NotFound from "../components/shared/NotFound";

const AssistantPage = lazy(
  () => import("../features/assistant/AssistantPage"),
);

const OperationsPage = lazy(
  () => import("../features/operations/OperationsPage"),
);

function PageLoader() {
  return (
    <div
      className="flex flex-1 items-center justify-center px-6 py-20"
      role="status"
      aria-live="polite"
    >
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Loading AuraPlan...
      </span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<AssistantPage />} />
        <Route path="/operations" element={<OperationsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}