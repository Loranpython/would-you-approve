import { useId } from 'react';
import { FEEDBACK_HEADINGS, SELF_CHECK_LABEL, SELF_CHECK_NOTE } from '../content/shared';
import type { CaseSchedule, ChecklistItem, TaskFeedback } from '../content/types';
import { ScenarioView } from './Schedule';
import { SourceList, useFill } from './common';

/** Model answer and checklist for a written answer. Never marked automatically. */
export function SelfCheck({
  prompt,
  answer,
  modelAnswer,
  checklist,
  ticks,
  onTick,
  keyPrefix,
}: {
  prompt: string;
  answer: string;
  modelAnswer?: string;
  checklist: ChecklistItem[];
  ticks: Record<string, boolean>;
  onTick: (key: string, value: boolean) => void;
  keyPrefix: string;
}) {
  const fill = useFill();
  const headingId = useId();
  const ticked = checklist.filter((c) => ticks[`${keyPrefix}:${c.id}`]).length;
  return (
    <section className="stack" aria-labelledby={headingId}>
      <div>
        <span className="label-tag">{SELF_CHECK_LABEL}</span>
        <h4 id={headingId} style={{ marginTop: 8 }}>
          {prompt}
        </h4>
        <p className="small muted" style={{ marginBottom: 0 }}>
          {SELF_CHECK_NOTE}
        </p>
      </div>
      <div className={modelAnswer ? 'answer-compare' : undefined}>
        <div>
          <p className="fact-label">Your answer</p>
          <div className="answer-box">{answer.trim() || '(no answer written)'}</div>
        </div>
        {modelAnswer && (
          <div>
            <p className="fact-label">Model explanation</p>
            <div className="answer-box">{fill(modelAnswer)}</div>
          </div>
        )}
      </div>
      {checklist.length > 0 && (
        <fieldset>
          <legend className="small">Does your answer…</legend>
          <ul className="checklist">
            {checklist.map((c) => {
              const key = `${keyPrefix}:${c.id}`;
              return (
                <li key={c.id}>
                  <label>
                    <input type="checkbox" checked={!!ticks[key]} onChange={(e) => onTick(key, e.target.checked)} />
                    <span>{fill(c.text)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="small muted" aria-live="polite">
            Your own assessment: {ticked} of {checklist.length} points ticked.
          </p>
        </fieldset>
      )}
    </section>
  );
}

/** The short part of the feedback, shown first: what was sound or problematic, and a better version. */
export function FeedbackShort({ feedback }: { feedback: TaskFeedback }) {
  const fill = useFill();
  return (
    <div>
      <div className="feedback-block">
        <h4>{FEEDBACK_HEADINGS.summary}</h4>
        <p>{fill(feedback.summary)}</p>
      </div>
      <div className="feedback-block">
        <h4>{FEEDBACK_HEADINGS.betterProposal}</h4>
        <blockquote className="better-proposal">{fill(feedback.betterProposal)}</blockquote>
      </div>
    </div>
  );
}

/** The longer part, collapsed by default: evidence, course concept with sources, and more detail. */
export function FeedbackDetails({ feedback, schedule }: { feedback: TaskFeedback; schedule?: CaseSchedule }) {
  const fill = useFill();
  return (
    <div className="stack">
      <details className="more">
        <summary>{FEEDBACK_HEADINGS.details}</summary>
        <div className="feedback-block">
          <h4>{FEEDBACK_HEADINGS.evidence}</h4>
          <p>{fill(feedback.evidence)}</p>
        </div>
        <div className="feedback-block">
          <h4>{FEEDBACK_HEADINGS.concept}</h4>
          <p>{fill(feedback.concept)}</p>
          <SourceList ids={feedback.conceptSources} />
        </div>
      </details>
      {(feedback.more?.length || feedback.showSchedule?.length) && (
        <details className="more">
          <summary>{FEEDBACK_HEADINGS.more}</summary>
          <div className="stack">
            {feedback.more?.map((m, i) => <p key={i}>{fill(m)}</p>)}
            {schedule &&
              feedback.showSchedule?.map((id) => <ScenarioView key={id} schedule={schedule} scenarioId={id} showResults />)}
          </div>
        </details>
      )}
    </div>
  );
}
