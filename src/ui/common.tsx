import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { FIT_LABELS } from '../content/shared';
import { formatSource, getSource } from '../content/sources';
import type { CaseSchedule, Fit } from '../content/types';
import { fillSchedule } from '../logic/scenarios';
import { useProgress, type ProgressStore } from '../state/progress';

export const StoreContext = createContext<ProgressStore | null>(null);

export function useStore(): ProgressStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('StoreContext missing');
  return store;
}

export function useProgressState() {
  return useProgress(useStore());
}

/** Lets components ask the case file panel to show a section. */
export const CaseFileContext = createContext<{ show: (sectionId: string) => void }>({ show: () => {} });

/** Fills schedule placeholders for the current case. */
export const ScheduleContext = createContext<CaseSchedule | undefined>(undefined);
export function useFill(): (text: string) => string {
  const schedule = useContext(ScheduleContext);
  return (text: string) => fillSchedule(text, schedule);
}

export function FitBadge({ fit, label }: { fit: Fit; label?: string }) {
  const f = FIT_LABELS[fit];
  return (
    <span className={`fit fit--${fit}`}>
      <span className="fit__symbol" aria-hidden="true">
        {f.symbol}
      </span>
      {label ?? f.label}
    </span>
  );
}

export function SourceList({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <ul className="source-list" aria-label="Sources">
      {ids.map((id) => {
        const s = getSource(id);
        return (
          <li key={id}>
            {formatSource(s)}: {s.topic}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Page heading that receives focus when it mounts, so screen readers announce
 * the new page. Pages are keyed by route, so this runs on every navigation.
 */
export function PageHeading({ children, id }: { children: ReactNode; id?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1} id={id}>
      {children}
    </h1>
  );
}
