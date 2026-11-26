import { useEffect, useState, type SyntheticEvent } from 'react';
import type { CaseStudy } from '../content/types';
import { scenarioResult } from '../logic/scenarios';
import { ScheduleTable } from './Schedule';

export const caseSectionDomId = (id: string) => `case-${id}`;
const FLASH_MS = 1600;

/** All section ids shown in the case file, in order, including the schedule. */
export function caseFileSections(c: CaseStudy): { id: string; title: string }[] {
  const list = c.sections.map((s) => ({ id: s.id, title: s.title }));
  if (c.schedule) list.push({ id: 'schedule', title: c.schedule.title });
  return list;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The case file panel. It never shows calculated schedule values, critical
 * paths or which facts matter, so it cannot give answers away. The network
 * diagram is shown full width elsewhere; the panel keeps the compact table.
 *
 * `openSections` lists the sections to expand for the current page; the
 * others start collapsed but can be opened. `pointed` asks the panel to open,
 * scroll to and briefly highlight one section.
 */
export function CaseFile({
  caseStudy,
  openSections,
  pointed,
}: {
  caseStudy: CaseStudy;
  openSections: string[];
  pointed: { id: string; n: number } | null;
}) {
  const sections = caseFileSections(caseStudy);
  const openKey = openSections.join('|');
  const initialOpen = () => Object.fromEntries(sections.map((s) => [s.id, openSections.includes(s.id)]));
  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);
  const [flashing, setFlashing] = useState<string | null>(null);

  // Each page decides which sections start open.
  useEffect(() => setOpen(initialOpen()), [openKey]);

  useEffect(() => {
    if (!pointed) return;
    setOpen((o) => ({ ...o, [pointed.id]: true }));
    setFlashing(pointed.id);
    // Wait one frame so the section is open (and, on phones, the panel visible) before scrolling.
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(caseSectionDomId(pointed.id));
      el?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      el?.querySelector('summary')?.focus({ preventScroll: true });
    });
    const timer = setTimeout(() => setFlashing(null), FLASH_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pointed]);

  const toggle = (id: string, isOpen: boolean) => setOpen((o) => (o[id] === isOpen ? o : { ...o, [id]: isOpen }));
  const sectionProps = (id: string) => ({
    id: caseSectionDomId(id),
    open: !!open[id],
    onToggle: (e: SyntheticEvent<HTMLDetailsElement>) => toggle(id, e.currentTarget.open),
    className: flashing === id ? 'is-flashing' : undefined,
  });

  return (
    <section className="card case-file" aria-labelledby="case-file-title">
      <div className="case-file__head">
        <p className="eyebrow">Case file</p>
        <h2 id="case-file-title">{caseStudy.title}</h2>
        <p className="disclaimer">{caseStudy.disclaimer}</p>
      </div>
      {caseStudy.sections.map((s) => (
        <details key={s.id} {...sectionProps(s.id)}>
          <summary>{s.title}</summary>
          <div className="case-file__body">
            <ul className="fact-list">
              {s.facts.map((f) => (
                <li key={f.id}>
                  {f.label && <span className="fact-label">{f.label}</span>}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
      {caseStudy.schedule && (
        <details {...sectionProps('schedule')}>
          <summary>{caseStudy.schedule.title}</summary>
          <div className="case-file__body stack">
            <ScheduleTable
              result={scenarioResult(caseStudy.schedule, caseStudy.schedule.baseline)}
              showResults={false}
              caption="Activities, durations and predecessors (baseline plan)"
            />
            <p className="small muted" style={{ margin: 0 }}>
              {caseStudy.schedule.assumptions.join('. ')}.
            </p>
          </div>
        </details>
      )}
    </section>
  );
}
