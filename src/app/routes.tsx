
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

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
      <span className="text-sm text-slate-500 dark:text-slate-400">
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
        <Route path="*" element={<AssistantPage />} />
      </Routes>
    </Suspense>
  );
}
