import { render, type ComponentChild } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { track } from '../../lib/analytics';

// Wait for a pause in typing before the polite live region is updated.
const RESULT_DELAY_MS = 600;

interface Options {
  /** Id of the static `role="status"` element (in ToolShell's result slot) that shows the result. */
  resultId: string;
  /** Tool name sent with the `calculator_used` event. */
  tool: string;
  /** Memoised calculation result. The live region is only rewritten when this changes. */
  result: unknown;
  /** What to show for `result`, or null while the form is untouched (the static placeholder stays). */
  view: ComponentChild | null;
  /** True once `result` holds a real figure. The first time, one `calculator_used` event is sent. */
  hasFigure: boolean;
}

/**
 * Writes a calculator's result into ToolShell's polite live region, which sits outside the island.
 * role="status" is atomic, so the whole region is read out on every change. To keep a screen reader
 * quiet the update is debounced until typing pauses, the untouched start state keeps the static
 * placeholder (nothing is announced on load), and the placeholder is restored on unmount.
 */
export function useLiveResult({ resultId, tool, result, view, hasFigure }: Options): void {
  const placeholder = useRef<string | null>(null);
  const showingPlaceholder = useRef(true);
  const reportedUse = useRef(false);

  function restorePlaceholder(target: HTMLElement) {
    if (showingPlaceholder.current) return;
    render(null, target);
    target.innerHTML = placeholder.current ?? '';
    showingPlaceholder.current = true;
  }

  useEffect(() => {
    const target = document.getElementById(resultId);
    if (!target) return;
    placeholder.current ??= target.innerHTML;
    const timer = setTimeout(() => {
      if (view === null) {
        restorePlaceholder(target);
        return;
      }
      if (showingPlaceholder.current) {
        target.textContent = '';
        showingPlaceholder.current = false;
      }
      render(view, target);
      // Count a use once per page view, the first time a real figure is shown.
      if (!reportedUse.current && hasFigure) {
        reportedUse.current = true;
        track('calculator_used', { tool });
      }
    }, RESULT_DELAY_MS);
    return () => clearTimeout(timer);
    // `view` and `hasFigure` are derived from `result`, so only a new result rewrites the region.
  }, [result, resultId]);

  useEffect(() => {
    return () => {
      const target = document.getElementById(resultId);
      if (target) restorePlaceholder(target);
    };
  }, [resultId]);
}
