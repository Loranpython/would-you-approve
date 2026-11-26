import type { ReactNode } from 'react';
import type { CaseStudy, Proposal, ProposalSection } from '../content/types';
import { taskOf, taskStatus } from '../state/progress';
import { href } from '../state/router';
import { PageHeading, useProgressState } from './common';

function ProposalFrame({ proposal, children }: { proposal: Proposal; children: ReactNode }) {
  return (
    <article className="proposal" aria-label={proposal.label}>
      <div className="proposal__label">
        <strong>{proposal.label}</strong>
        <span className="muted">{proposal.note}</span>
      </div>
      <div className="proposal__body">{children}</div>
    </article>
  );
}

function SectionText({ section }: { section: ProposalSection }) {
  return (
    <p>
      {section.before && <>{section.before} </>}
      <mark className="claim">{section.claim}</mark>
      {section.after && <> {section.after}</>}
    </p>
  );
}

/** The whole proposal, as the reader first meets it. */
export function ProposalOverview({ caseStudy }: { caseStudy: CaseStudy }) {
  const p = useProgressState();
  const { proposal } = caseStudy;
  const first = caseStudy.tasks[0];
  return (
    <div className="stack">
      <div className="task-head">
        <p className="eyebrow">The proposal</p>
        <PageHeading>Read the proposal</PageHeading>
        <p>
          Read the proposal as a whole, with the case file beside it. Then review the six highlighted claims one by
          one. Some are sound; some need revision.
        </p>
      </div>
      <ProposalFrame proposal={proposal}>
        <h2>{proposal.title}</h2>
        <p>{proposal.intro}</p>
        {proposal.sections.map((s) => {
          const task = caseStudy.tasks.find((t) => t.id === s.taskId);
          const reviewed = task && taskStatus(taskOf(p, caseStudy.id, task.id)) === 'reviewed';
          return (
            <section key={s.id} className="proposal-section" aria-labelledby={`h-${s.id}`}>
              <div className="proposal-section__head">
                <h3 id={`h-${s.id}`}>{s.heading}</h3>
                {task && (
                  <a className="btn btn--quiet btn--small" href={href.task(caseStudy.id, task.id)}>
                    {reviewed ? 'Reviewed · open' : 'Review this claim'}
                    <span className="sr-only">: claim {task.number}</span>
                  </a>
                )}
              </div>
              <SectionText section={s} />
            </section>
          );
        })}
      </ProposalFrame>
      {first && (
        <div className="btn-row">
          <a className="btn btn--primary" href={href.task(caseStudy.id, first.id)}>
            Start with claim 1
          </a>
        </div>
      )}
    </div>
  );
}

/** One section of the proposal, as shown at the top of a task. */
export function ClaimExcerpt({ proposal, section }: { proposal: Proposal; section: ProposalSection }) {
  return (
    <ProposalFrame proposal={proposal}>
      <h2 className="h3" style={{ fontSize: '1.1rem' }}>
        {section.heading}
      </h2>
      <SectionText section={section} />
    </ProposalFrame>
  );
}
