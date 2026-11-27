import { useId } from 'react';
import { REFLECTION_PROMPT } from '../content/about';
import { AUTO_CHECK_LABEL, SELF_CHECK_LABEL } from '../content/shared';
import type { CaseStudy } from '../content/types';
import { buildSummary, confidenceLabel, judgementLabel, summaryText } from '../logic/summary';
import { ensureCase } from '../state/progress';
import { href } from '../state/router';
import { FitBadge, PageHeading, useProgressState, useStore } from './common';

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SummaryView({ caseStudy }: { caseStudy: CaseStudy }) {
  const store = useStore();
  const progress = useProgressState();
  const s = buildSummary(caseStudy, progress);
  const reflectionId = useId();
  const submittedTasks = s.tasks.filter((t) => t.initialJudgement);

  return (
    <div className="stack-lg">
      <div>
        <p className="eyebrow">{caseStudy.title}</p>
        <PageHeading>Your review</PageHeading>
        <p>
          A record of your own review: your judgements, revisions, hints and explanations. It is not a grade and does not
          measure your overall learning.
        </p>
        <div className="btn-row no-print">
          <button type="button" className="btn" onClick={() => window.print()}>
            Print
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => download(`review-summary-${caseStudy.id}.txt`, summaryText(caseStudy, progress))}
          >
            Download as text file
          </button>
          <span className="small muted">Created in your browser. Nothing is uploaded.</span>
        </div>
      </div>

      <section className="rule-section" aria-labelledby="sum-review">
        <h2 id="sum-review">Review summary</h2>
        {submittedTasks.length < s.tasks.length && (
          <p className="small muted">
            {submittedTasks.length} of {s.tasks.length} claims submitted.{' '}
            {submittedTasks.length === 0 && <a href={href.case(caseStudy.id)}>Start with the proposal.</a>}
          </p>
        )}
        <div className="table-wrap">
          <table className="data summary-table">
            <thead>
              <tr>
                <th scope="col">Claim</th>
                <th scope="col">Initial judgement</th>
                <th scope="col">Initial reasoning</th>
                <th scope="col">After feedback</th>
                <th scope="col" className="num">Revisions</th>
                <th scope="col" className="num">Hints used</th>
                <th scope="col">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {s.tasks.map((t) => (
                <tr key={t.number}>
                  <th scope="row">
                    <a href={href.task(caseStudy.id, caseStudy.tasks[t.number - 1].id)}>
                      {t.number}. {t.title}
                    </a>
                  </th>
                  {t.initialJudgement ? (
                    <>
                      <td data-label="Initial judgement">
                        {judgementLabel(t.initialJudgement)}
                        <br />
                        <FitBadge fit={t.initialFit!} />
                      </td>
                      <td className="reasoning-cell" data-label="Initial reasoning">
                        {t.initialReasoning?.answer}
                      </td>
                      <td data-label="After feedback">
                        {t.revisions > 0 ? (
                          <>
                            {judgementLabel(t.latestJudgement)}
                            <br />
                            <FitBadge fit={t.latestFit!} />
                            {t.revisionNote && (
                              <span className="cell-note">
                                <span className="fact-label">What changed</span>
                                {t.revisionNote}
                              </span>
                            )}
                          </>
                        ) : t.latestJudgement ? (
                          <span className="muted">Judgement not changed</span>
                        ) : (
                          <span className="muted">Details not submitted yet</span>
                        )}
                      </td>
                      <td className="num" data-label="Revisions">
                        {t.revisions}
                      </td>
                      <td className="num" data-label="Hints used">
                        {t.hintsUsed}
                      </td>
                      <td data-label="Confidence">{confidenceLabel(t.firstConfidence)}</td>
                    </>
                  ) : (
                    <td colSpan={6} className="muted">
                      Not submitted yet
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 8, marginBottom: 0 }}>
          Initial judgement and reasoning were recorded before the details and feedback. Confidence is the level you gave at that point, for reflection only.
        </p>
      </section>

      <section className="rule-section stack" aria-labelledby="sum-practice">
        <div>
          <h2 id="sum-practice">Practice results</h2>
          <span className="label-tag">{AUTO_CHECK_LABEL}</span>
          <p className="small muted" style={{ marginTop: 8 }}>
            Structured questions from the guided review, compared with the model answers. Written explanations are
            listed separately below.
          </p>
        </div>
        {submittedTasks.length === 0 && <p className="muted">No claims submitted yet.</p>}
        {s.tasks
          .filter((t) => t.auto.length)
          .map((t) => (
            <div key={t.number}>
              <h3>
                Claim {t.number}: {t.title}
              </h3>
              <ul className="part-results">
                {t.auto.map((a) => (
                  <li key={a.label}>
                    {t.revisions > 0 ? (
                      <>
                        <strong>{a.label}</strong>: first attempt <FitBadge fit={a.first.fit} label={a.first.text} />, after
                        revision <FitBadge fit={a.latest.fit} label={a.latest.text} />
                      </>
                    ) : (
                      <FitBadge fit={a.first.fit} label={`${a.label}: ${a.first.text}`} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </section>

      <section className="rule-section stack" aria-labelledby="sum-texts">
        <div>
          <h2 id="sum-texts">Your explanations</h2>
          <span className="label-tag">{SELF_CHECK_LABEL}</span>
        </div>
        {s.tasks.flatMap((t) =>
          [...(t.initialReasoning ? [t.initialReasoning] : []), ...t.texts].map((x) => (
            <div key={`${t.number}-${x.prompt}`}>
              <h3 className="small" style={{ fontSize: '0.95rem' }}>
                Claim {t.number}: {x.prompt}
              </h3>
              <div className="answer-box">{x.answer.trim() || '(no answer written)'}</div>
              {x.total > 0 && (
                <p className="small muted">
                  Your checklist: {x.ticked} of {x.total} points ticked.
                </p>
              )}
            </div>
          )),
        )}
        {submittedTasks.length === 0 && <p className="muted">No explanations submitted yet.</p>}
      </section>

      <section className="rule-section stack" aria-labelledby="sum-transfer">
        <div>
          <h2 id="sum-transfer">Independent challenge</h2>
          <p className="small muted">Completed without hints. Reported separately from the guided review.</p>
        </div>
        {s.transfer.map((t) => (
          <div key={t.title} className="stack">
            <h3>{t.title}</h3>
            {!t.submitted ? (
              <p className="muted">
                Not submitted yet. <a href={href.challenge(caseStudy.id)}>Go to the challenge.</a>
              </p>
            ) : (
              <>
                <p className="small">Confidence: {confidenceLabel(t.confidence)}</p>
                {t.auto.length > 0 && (
                  <div>
                    <span className="label-tag">{AUTO_CHECK_LABEL}</span>
                    <ul className="part-results">
                      {t.auto.map((a) => (
                        <li key={a.label}>
                          <FitBadge fit={a.fit} label={`${a.label}: ${a.text}`} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {t.texts.map((x) => (
                  <div key={x.prompt}>
                    <p className="fact-label">{x.prompt}</p>
                    <div className="answer-box">{x.answer.trim() || '(no answer written)'}</div>
                    {x.total > 0 && (
                      <p className="small muted">
                        Self-assessed: {x.ticked} of {x.total} checklist points ticked.
                      </p>
                    )}
                  </div>
                ))}
                {t.partTotal > 0 && (
                  <p className="small muted">
                    Self-assessed: {t.partTicked} of {t.partTotal} checklist points ticked for this part.
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </section>

      <section className="rule-section" aria-labelledby="sum-reflect">
        <h2 id="sum-reflect">Reflection</h2>
        <div className="field">
          <label className="field__label" htmlFor={reflectionId}>
            {REFLECTION_PROMPT}
          </label>
          <textarea
            id={reflectionId}
            rows={4}
            value={s.reflection}
            onChange={(e) => store.update((d) => void (ensureCase(d, caseStudy.id).reflection = e.target.value))}
          />
          <span className="field__hint">Saved in this browser and included in the print and download.</span>
        </div>
      </section>
    </div>
  );
}
