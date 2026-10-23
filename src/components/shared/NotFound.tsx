import { Link } from "react-router-dom";

import { useDocumentTitle } from "../../lib/useDocumentTitle";
import PageHeader from "./PageHeader";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader
        title="Page not found"
        description="We couldn't find the page you were looking for."
      />
      <Link
        to="/"
        className="inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
      >
        Back to the planner
      </Link>
    </main>
  );
}