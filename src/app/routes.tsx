import { Navigate, Route, Routes } from "react-router-dom";
import AssistantPage from "../features/assistant/AssistantPage";
import OperationsPage from "../features/operations/OperationsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AssistantPage />} />
      <Route path="/operations" element={<OperationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}