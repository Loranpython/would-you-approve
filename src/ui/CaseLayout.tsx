import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { CaseStudy } from '../content/types';
import { caseOf, taskOf, taskStatus, type Progress, type TaskStatus } from '../state/progress';
import { href, type Route } from '../state/router';
import { CaseFile, caseFileSections } from './CaseFile';
import { CaseFileContext, ScheduleContext, useProgressState } from './common';

const STATUS_TEXT: Record<TaskStatus, string> = {
  'not-started': 'not started',
  'in-progress': 'in progress',
  reviewed: 'reviewed',
};

export function challengeStatus(p: Progress, c: CaseStudy): TaskStatus {
  const parts = c.transfer.parts.map((part) => caseOf(p, c.id).transfer[part.id]);
  if (parts.every((t) => t?.submitted)) return 'reviewed';
  if (parts.some((t) => t && (t.submitted || Object.keys(t.draft.parts).length > 0))) return 'in-progress';
  return 'not-started';
}

function ProgressNav({ caseStudy, route }: { caseStudy: CaseStudy; route: Route }) {
  const p = useProgressState();
  const current = (name: string, taskId?: string) =>
    route.name === name && (!taskId || (route.name === 'task' && route.taskId === taskId)) ? 'page' : undefined;
  const reviewed = caseStudy.tasks.filter((t) => taskStatus(taskOf(p, caseStudy.id, t.id)) === 'reviewed').length;
  const challenge = challengeStatus(p, caseStudy);

  return (
    <nav className="progress-nav" aria-label="Review progress">
      <p className="sr-only">
        {reviewed} of {caseStudy.tasks.length} claims reviewed.
      </p>
      <ol>
        <li>
          <a href={href.briefing(caseStudy.id)} aria-current={current('briefing')}>
            Briefing
          </a>
        </li>
        <li>
          <a href={href.case(caseStudy.id)} aria-current={current('case')}>
            Proposal
          </a>
        </li>
        {caseStudy.tasks.map((t) => {
          const status = taskStatus(taskOf(p, caseStudy.id, t.id));
          return (
            <li key={t.id}>
              <a href={href.task(caseStudy.id, t.id)} aria-current={current('task', t.id)} title={t.title}>
                <span className={`status-dot status-dot--${status}`} aria-hidden="true" />
                Claim {t.number}
                <span className="sr-only">
                  : {t.title}, {STATUS_TEXT[status]}
                </span>
              </a>
            </li>
          );
        })}
        <li>
          <a href={href.challenge(caseStudy.id)} aria-current={current('challenge')}>
            <span className={`status-dot status-dot--${challenge}`} aria-hidden="true" />
            Challenge
            <span className="sr-only">, {STATUS_TEXT[challenge]}</span>
          </a>
        </li>
        <li>
          <a href={href.summary(caseStudy.id)} aria-current={current('summary')}>
            Summary
          </a>
        </li>
      </ol>
    </nav>
  );
}

/**
 * Keeps the case panel in view without an inner scrollbar. A panel shorter
 * than the window sticks near the top; a taller one scrolls with the page
 * until its end is visible, then sticks there.
 */
function useStickyAside(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const gap = 16;
    const update = () => {
      const fits = el.offsetHeight + gap * 2 <= window.innerHeight;
      el.style.setProperty('--aside-top', `${fits ? gap : window.innerHeight - el.offsetHeight - gap}px`);
    };
    update();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref, enabled]);
}

export function CaseLayout({ caseStudy, route, children }: { caseStudy: CaseStudy; route: Route; children: ReactNode }) {
  const [pane, setPane] = useState<'task' | 'case'>('task');
  const [pointed, setPointed] = useState<{ id: string; n: number } | null>(null);

  const show = useCallback((sectionId: string) => {
    setPane('case');
    setPointed((prev) => ({ id: sectionId, n: (prev?.n ?? 0) + 1 }));
  }, []);
  const ctx = useMemo(() => ({ show }), [show]);
  const wide = route.name === 'summary' || route.name === 'briefing';
  const asideRef = useRef<HTMLElement>(null);
  useStickyAside(asideRef, !wide);

  // In a task, open only the sections linked to it; elsewhere open everything.
  const task = route.name === 'task' ? caseStudy.tasks.find((t) => t.id === route.taskId) : undefined;
  const openSections = useMemo(
    () => task?.evidenceSections ?? caseFileSections(caseStudy).map((s) => s.id),
    [task, caseStudy],
  );

  // On small screens, show the task again after moving to another page.
  const routeKey = JSON.stringify(route);
  useEffect(() => {
    setPane('task');
    setPointed(null);
  }, [routeKey]);

  return (
    <ScheduleContext.Provider value={caseStudy.schedule}>
      <CaseFileContext.Provider value={ctx}>
        <div className="page">
          <ProgressNav caseStudy={caseStudy} route={route} />
          {wide ? (
            <main id="main">{children}</main>
          ) : (
            <div className="workspace" data-pane={pane}>
              <div className="pane-toggle" role="group" aria-label="Show">
                <button type="button" className="btn" aria-pressed={pane === 'task'} onClick={() => setPane('task')}>
                  {route.name === 'case' ? 'Proposal' : 'Task'}
                </button>
                <button type="button" className="btn" aria-pressed={pane === 'case'} onClick={() => setPane('case')}>
                  Case file
                </button>
              </div>
              <main id="main" className="workspace__main">
                {children}
              </main>
              <aside ref={asideRef} className="workspace__aside" aria-label="Case file">
                <CaseFile caseStudy={caseStudy} openSections={openSections} pointed={pointed} />
              </aside>
            </div>
          )}
        </div>
      </CaseFileContext.Provider>
    </ScheduleContext.Provider>
  );
}
