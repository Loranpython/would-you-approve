import { useEffect, useId, useRef, useState } from 'react';
import { AUTO_CHECK_LABEL } from '../content/shared';
import type { CaseStudy, Confidence, TransferPart } from '../content/types';
import { asString, checkPart, isPartAnswered, partResultText, type PartValue } from '../logic/check';
import { ensureTransfer, transferOf } from '../state/progress';
import { href } from '../state/router';
import { FitBadge, PageHeading, SourceList, useFill, useProgressState, useStore } from './common';
import { SelfCheck } from './Feedback';
import { PartView } from './Parts';
import { ScenarioView } from './Schedule';
import { ConfidencePicker } from './TaskView';

/**
 * One part of the independent challenge. No hints are offered. The model
 * explanation is not rendered at all until the part has been submitted, and
 * the part can be submitted only once.
 */
function TransferPartView({ caseStudy, part }: { caseStudy: CaseStudy; part: TransferPart }) {
  const store = useStore();
  const progress = useProgressState();
  const fill = useFill();
  const t = transferOf(progress, caseStudy.id, part.id);
  const submitted = t.submitted;
  const answers = submitted ? submitted.answers : t.draft;
  const [confirming, setConfirming] = useState(false);
  const [showProblems, setShowProblems] = useState(false);
  const headingId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);
  useEffect(() => {
    if (justSubmitted) resultRef.current?.focus();
  }, [justSubmitted]);

  const update = (fn: (x: ReturnType<typeof ensureTransfer>) => void) =>
    store.update((d) => fn(ensureTransfer(d, caseStudy.id, part.id)));

  const missing = part.parts.some((p) => !isPartAnswered(p, t.draft.parts[p.id])) || !t.confidence;

  const requestSubmit = () => {
    if (missing) {
      setShowProblems(true);
      return;
    }
    setConfirming(true);
  };
  const submit = () => {
    update((x) => {
      x.submitted = { at: Date.now(), answers: structuredClone(x.draft), confidence: x.confidence!, hintsUsed: 0 };
    });
    setConfirming(false);
    setJustSubmitted(true);
  };

  const results = submitted ? part.parts.map((p) => checkPart(p, answers.parts[p.id], caseStudy.schedule)) : [];
  const partResults = part.parts.flatMap((p, i) => (results[i] ? [{ p, result: results[i]! }] : []));

  return (
    <section className="card stack" aria-labelledby={headingId}>
      <div>
        <h2 id={headingId}>{part.title}</h2>
        <p className="notice">{part.situation}</p>
      </div>
      {part.scenario && caseStudy.schedule && (
        <ScenarioView schedule={caseStudy.schedule} scenarioId={part.scenario} showResults={!!submitted} />
      )}
      <div>
        {part.parts.map((p, i) => (
          <PartView
            key={p.id}
            part={p}
            value={answers.parts[p.id]}
            onChange={(v: PartValue) => update((x) => void (x.draft.parts[p.id] = v))}
            locked={!!submitted}
            result={submitted ? results[i] : null}
            seed={progress.seed}
            shuffleKey={`${caseStudy.id}/transfer/${part.id}/${p.id}`}
            schedule={caseStudy.schedule}
            showProblem={showProblems}
          />
        ))}
      </div>

      {!submitted && (
        <div className="stack">
          <ConfidencePicker value={t.confidence} onChange={(c: Confidence) => update((x) => void (x.confidence = c))} />
          {showProblems && missing && (
            <p className="problems" role="alert">
              Answer every question and say how confident you are before you submit.
            </p>
          )}
          {confirming ? (
            <div className="notice notice--warn" role="group" aria-label="Confirm submission">
              <p>Submit {part.title.split(':')[0]}? You will see the model explanation, and these answers cannot be changed afterwards.</p>
              <div className="btn-row">
                <button ref={confirmRef} type="button" className="btn btn--primary" onClick={submit}>
                  Yes, submit
                </button>
                <button type="button" className="btn" onClick={() => setConfirming(false)}>
                  Keep working
                </button>
              </div>
            </div>
          ) : (
            <div className="btn-row">
              <button type="button" className="btn btn--primary" onClick={requestSubmit}>
                Submit {part.title.split(':')[0]}
              </button>
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div className="stack feedback" style={{ paddingTop: 16 }}>
          <h3 ref={resultRef} tabIndex={-1}>
            Model explanation
          </h3>
          {partResults.length > 0 && (
            <div>
              <span className="label-tag">{AUTO_CHECK_LABEL}</span>
              <ul className="part-results" aria-label="Results for the structured questions">
                {partResults.map(({ p, result }) => (
                  <li key={p.id}>
                    <FitBadge fit={result.fit} label={`${p.label}: ${partResultText(p, result)}`} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {part.modelExplanation.map((m, i) => (
            <p key={i}>{fill(m)}</p>
          ))}
          <SourceList ids={part.sources} />
          {part.parts.map((p) =>
            p.kind === 'text' && (p.modelAnswer || p.checklist?.length) ? (
              <SelfCheck
                key={p.id}
                prompt={p.prompt}
                answer={asString(answers.parts[p.id])}
                modelAnswer={p.modelAnswer}
                checklist={p.checklist ?? []}
                ticks={t.selfCheck}
                onTick={(k, v) => update((x) => void (x.selfCheck[k] = v))}
                keyPrefix={p.id}
              />
            ) : null,
          )}
          {part.checklist.length > 0 && (
            <SelfCheck
              prompt="Your answers to this part"
              answer={part.parts
                .filter((p) => p.kind === 'text')
                .map((p) => `${p.prompt}\n${asString(answers.parts[p.id]) || '(no answer written)'}`)
                .join('\n\n')}
              checklist={part.checklist}
              ticks={t.selfCheck}
              onTick={(k, v) => update((x) => void (x.selfCheck[k] = v))}
              keyPrefix="part"
            />
          )}
        </div>
      )}
    </section>
  );
}

export function TransferView({ caseStudy }: { caseStudy: CaseStudy }) {
  const progress = useProgressState();
  const allDone = caseStudy.transfer.parts.every((p) => transferOf(progress, caseStudy.id, p.id).submitted);
  return (
    <div className="stack">
      <div className="task-head">
        <p className="eyebrow">Independent practice</p>
        <PageHeading>{caseStudy.transfer.title}</PageHeading>
        <p>{caseStudy.transfer.intro}</p>
        <p className="small muted">Your results here are reported separately from the guided review.</p>
      </div>
      {caseStudy.transfer.parts.map((p) => (
        <TransferPartView key={p.id} caseStudy={caseStudy} part={p} />
      ))}
      {allDone && (
        <div className="btn-row">
          <a className="btn btn--primary" href={href.summary(caseStudy.id)}>
            See your review summary
          </a>
        </div>
      )}
    </div>
  );
}
