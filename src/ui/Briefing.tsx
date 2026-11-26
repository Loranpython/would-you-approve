import type { CaseStudy } from '../content/types';
import { scenarioResult } from '../logic/scenarios';
import { href } from '../state/router';
import { PageHeading } from './common';
import { NetworkDiagram, ScheduleTable } from './Schedule';

/** The case as a readable full-width page, before the proposal. */
export function Briefing({ caseStudy }: { caseStudy: CaseStudy }) {
  const sections = caseStudy.briefing.sectionIds
    .map((id) => caseStudy.sections.find((s) => s.id === id))
    .filter((s) => s !== undefined);
  const schedule = caseStudy.schedule;

  return (
    <div className="stack-lg briefing">
      <div>
        <p className="eyebrow">Case briefing</p>
        <PageHeading>{caseStudy.title}</PageHeading>
        <p className="disclaimer">{caseStudy.disclaimer}</p>
        <p className="briefing__intro">{caseStudy.briefing.intro}</p>
      </div>

      <div className="briefing__grid">
        {sections.map((s) => (
          <section key={s.id} className="card" aria-labelledby={`brief-${s.id}`}>
            <h2 id={`brief-${s.id}`}>{s.title}</h2>
            {s.facts.some((f) => f.label) ? (
              <dl className="fact-dl">
                {s.facts.map((f) => (
                  <div key={f.id}>
                    <dt>{f.label}</dt>
                    <dd>{f.text}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <ul className="fact-list fact-list--bullets">
                {s.facts.map((f) => (
                  <li key={f.id}>{f.text}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {schedule && (
        <section className="card stack" aria-labelledby="brief-schedule">
          <h2 id="brief-schedule">{schedule.title}</h2>
          <NetworkDiagram
            result={scenarioResult(schedule, schedule.baseline)}
            showResults={false}
            title={`${schedule.title}: baseline plan`}
          />
          <ScheduleTable
            result={scenarioResult(schedule, schedule.baseline)}
            showResults={false}
            caption="Activities, durations and predecessors (baseline plan)"
          />
          <div>
            <p className="fact-label">Assumptions</p>
            <ul className="small" style={{ marginBottom: 0 }}>
              {schedule.assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="btn-row">
        <a className="btn btn--primary" href={href.case(caseStudy.id)}>
          Continue to the proposal
        </a>
        <span className="small muted">The case file stays available beside the proposal and every task.</span>
      </div>
    </div>
  );
}
