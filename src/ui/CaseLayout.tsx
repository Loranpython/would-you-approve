import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { CaseStudy } from '../content/types';
import { caseOf, taskOf, taskStatus, type Progress, type TaskStatus } from '../state/progress';
import { href, type Route } from '../state/router';
import { CaseFile, caseFileSections } from './CaseFile';
import { CaseFileContext, ScheduleContext, useProgressState } from './common';

export function challengeStatus(p: Progress, c: CaseStudy): TaskStatus {
  const parts = c.transfer.parts.map((part) => caseOf(p, c.id).transfer[part.id]);
  if (parts.every((t) => t?.submitted)) return 'reviewed';
  if (parts.some((t) => t && (t.submitted || Object.keys(t.draft.parts).length > 0))) return 'in-progress';
  return 'not-started';
}

interface NavItem {
  key: string;
  label: string;
  href: string;
  current: boolean;
  done: boolean;
  /** Extra text for screen readers, e.g. the claim title. */
  detail?: string;
}

function navItems(caseStudy: CaseStudy, route: Route, p: Progress): NavItem[] {
  const id = caseStudy.id;
  return [
    { key: 'briefing', label: 'Briefing', href: href.briefing(id), current: route.name === 'briefing', done: false },
    { key: 'case', label: 'Proposal', href: href.case(id), current: route.name === 'case', done: false },
    ...caseStudy.tasks.map((t) => ({
      key: t.id,
      label: `Claim ${t.number}`,
      href: href.task(id, t.id),
      current: route.name === 'task' && route.taskId === t.id,
      done: taskStatus(taskOf(p, id, t.id)) === 'reviewed',
      detail: t.title,
    })),
    {
      key: 'challenge',
      label: 'Challenge',
      href: href.challenge(id),
      current: route.name === 'challenge',
      done: challengeStatus(p, caseStudy) === 'reviewed',
    },
    { key: 'summary', label: 'Summary', href: href.summary(id), current: route.name === 'summary', done: false },
  ];
}

/**
 * One list of plain text links, styled by screen width: a left column from
 * 1280px (GOV.UK side navigation), a row of links above the content below
 * that, and on phones a short "Claim 3 of 6" line with Previous / Next.
 */
function ProgressNav({ caseStudy, route }: { caseStudy: CaseStudy; route: Route }) {
  const p = useProgressState();
  const items = navItems(caseStudy, route, p);
  const reviewed = caseStudy.tasks.filter((t) => taskStatus(taskOf(p, caseStudy.id, t.id)) === 'reviewed').length;
  const index = items.findIndex((i) => i.current);
  const prev = index > 0 ? items[index - 1] : undefined;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : undefined;
  const task = route.name === 'task' ? caseStudy.tasks.find((t) => t.id === route.taskId) : undefined;
  const where = task ? `Claim ${task.number} of ${caseStudy.tasks.length}` : items[index]?.label;

  return (
    <nav className="progress-nav" aria-label="Review progress">
      <p className="sr-only">
        {reviewed} of {caseStudy.tasks.length} claims reviewed.
      </p>
      <ol>
        {items.map((i) => (
          <li key={i.key}>
            <a href={i.href} aria-current={i.current ? 'page' : undefined} title={i.detail}>
              {i.label}
              {i.detail && <span className="sr-only">: {i.detail}</span>}
              {i.done && (
                <span className="nav-done">
                  <span aria-hidden="true">✓</span>
                  <span className="sr-only"> done</span>
                </span>
              )}
            </a>
          </li>
        ))}
      </ol>
      <div className="progress-pager">
        {prev ? <a href={prev.href} aria-label={`Previous: ${prev.label}`}>Previous</a> : <span />}
        <p className="progress-pager__where">{where}</p>
        {next ? <a href={next.href} aria-label={`Next: ${next.label}`}>Next</a> : <span />}
      </div>
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
        <div className="page page--case">
          <div className="case-shell">
            <ProgressNav caseStudy={caseStudy} route={route} />
            <div className="case-shell__content">
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
          </div>
        </div>
      </CaseFileContext.Provider>
    </ScheduleContext.Provider>
  );
}
