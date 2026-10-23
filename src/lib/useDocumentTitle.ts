import { useEffect } from "react";

/** Sets a descriptive document title so each page is announced distinctly. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} | AuraPlan`;
  }, [title]);
}
