import { useContext, useEffect, useId, useRef, useState, type ReactNode, type Ref } from 'react';
import { AUTO_CHECK_LABEL, CONFIDENCE_NOTE, CONFIDENCE_OPTIONS, JUDGEMENT_OPTIONS, STAGE1, STAGE2 } from '../content/shared';
import type { CaseStudy, Confidence, JudgementId, ReviewTask } from '../content/types';
import {
  asString,
  checkJudgement,
  checkPart,
  countWords,
  endSentence,
  isPartAnswered,
  MIN_REASONING_WORDS,
  partResultText,
  type PartValue,
} from '../logic/check';
import { scenarioResult } from '../logic/scenarios';
import { ensureTask, taskOf } from '../state/progress';
import { href } from '../state/router';
import { caseFileSections } from './CaseFile';
import { CaseFileContext, FitBadge, PageHeading, useProgressState, useStore } from './common';
import { FeedbackDetails, FeedbackShort, SelfCheck } from './Feedback';
import { PartView } from './Parts';
import { ClaimExcerpt } from './Proposal';
import { NetworkDiagram } from './Schedule';

/** A task step with a small bold caption such as "Step 1: Your initial judgement". */
function Step({ title, children, headingRef }: { title: string; children: ReactNode; headingRef?: Ref<HTMLHeadingElement> }) {
  const id = useId();
  return (
    <section className="card step" aria-labelledby={id}>
      <h2 className="step__title" id={id} ref={headingRef} tabIndex={headingRef ? -1 : undefined}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ConfidencePicker({ value, onChange, disabled }: { value?: Confidence; onChange: (c: Confidence) => void; disabled?: boolean }) {
  const name = useId();
  return (
    <fieldset>
      <legend>How confident are you?</legend>
      <div className="choice-inline">
        {CONFIDENCE_OPTIONS.map((o) => (
          <label key={o.id} className="choice">
            <input type="radio" name={name} checked={value === o.id} disabled={disabled} onChange={() => onChange(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <p className="field__hint" style={{ marginTop: 6 }}>
        {CONFIDENCE_NOTE}
      </p>
    </fieldset>
  );
}

function JudgementChoice({ value, onChange, legend }: { value?: JudgementId; onChange: (j: JudgementId) => void; legend: string }) {
  const name = useId();
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className="choice-list">
        {JUDGEMENT_OPTIONS.map((o) => (
          <label key={o.id} className="choice">
            <input type="radio" name={name} checked={value === o.id} onChange={() => onChange(o.id)} />
            <span className="choice__text">
              <span>{o.label}</span>
              <span className="choice__desc">{o.description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Problems({ list, innerRef }: { list: string[]; innerRef: Ref<HTMLDivElement> }) {
  if (!list.length) return null;
  return (
    <div ref={innerRef} tabIndex={-1} className="problems" role="alert">
      <p style={{ marginBottom: 4 }}>Before you submit:</p>
      <ul>
        {list.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

const judgementLabel = (j?: JudgementId) => JUDGEMENT_OPTIONS.find((o) => o.id === j)?.label;

/**
 * A guided review task in two stages.
 * Stage 1: initial judgement, own reasoning and confidence; recorded once.
 * Stage 2: the structured details, rendered only after Stage 1 is recorded,
 * so none of its options can hint at the answer beforehand.
 */
export function TaskView({ caseStudy, task }: { caseStudy: CaseStudy; task: ReviewTask }) {
  const store = useStore();
  const progress = useProgressState();
  const { show } = useContext(CaseFileContext);
  const t = taskOf(progress, caseStudy.id, task.id);
  const section = caseStudy.proposal.sections.find((s) => s.taskId === task.id);
  const initial = t.initial;
  const submitted = t.attempts.length > 0 && !t.revising;
  const last = t.attempts[t.attempts.length - 1];
  const answers = submitted ? last.answers : t.draft;
  const [problems1, setProblems1] = useState(false);
  const [problems2, setProblems2] = useState(false);
  const problemsRef = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLHeadingElement>(null);
  const [focusTarget, setFocusTarget] = useState<{ el: 'stage2' | 'feedback' | 'problems'; n: number } | null>(null);
  const uid = useId();
  const index = caseStudy.tasks.findIndex((x) => x.id === task.id);
  const next = caseStudy.tasks[index + 1];
  const sectionTitles = Object.fromEntries(caseFileSections(caseStudy).map((s) => [s.id, s.title]));
  const showsNetwork = task.evidenceSections.includes('schedule') && caseStudy.schedule;

  useEffect(() => {
    if (!focusTarget) return;
    const ref = { stage2: stage2Ref, feedback: feedbackRef, problems: problemsRef }[focusTarget.el];
    ref.current?.focus();
  }, [focusTarget]);

  const update = (fn: (draft: ReturnType<typeof ensureTask>) => void) =>
    store.update((d) => fn(ensureTask(d, caseStudy.id, task.id)));
  const setPart = (partId: string, v: PartValue) => update((x) => void (x.draft.parts[partId] = v));
  const showHint = () => update((x) => void (x.hintsShown = Math.min(task.hints.length, x.hintsShown + 1)));
  const tick = (key: string, v: boolean) => update((x) => void (x.selfCheck[key] = v));

  // --- Stage 1 ---
  const d1 = t.initialDraft;
  const missing1: string[] = [];
  if (!d1.judgement) missing1.push('Choose an initial judgement.');
  // Only the length is checked (at least five words with letters), never the content.
  const reasoningLongEnough = countWords(d1.reasoning) >= MIN_REASONING_WORDS;
  if (!reasoningLongEnough) missing1.push(STAGE1.reasoningTooShort);
  if (!d1.confidence) missing1.push('Say how confident you are.');

  const submitStage1 = () => {
    if (missing1.length) {
      setProblems1(true);
      setFocusTarget({ el: 'problems', n: Date.now() });
      return;
    }
    update((x) => {
      x.initial = {
        at: Date.now(),
        judgement: x.initialDraft.judgement!,
        reasoning: x.initialDraft.reasoning,
        confidence: x.initialDraft.confidence!,
        hintsUsed: x.hintsShown,
      };
      x.draft.judgement = x.initialDraft.judgement;
    });
    setProblems1(false);
    setFocusTarget({ el: 'stage2', n: Date.now() });
  };

  // --- Stage 2 ---
  const missing2: string[] = [];
  if (t.revising && !t.draft.judgement) missing2.push('Choose your judgement.');
  task.parts.forEach((p, i) => {
    if (!isPartAnswered(p, t.draft.parts[p.id])) missing2.push(`Complete question ${i + 1}.`);
  });

  const submitStage2 = () => {
    if (missing2.length) {
      setProblems2(true);
      setFocusTarget({ el: 'problems', n: Date.now() });
      return;
    }
    update((x) => {
      const answers = structuredClone(x.draft);
      if (!x.revising) answers.judgement = x.initial!.judgement; // the first attempt uses the locked judgement
      const note = x.revising ? x.revisionNote?.trim() : undefined;
      x.attempts.push({
        at: Date.now(),
        answers,
        confidence: x.initial?.confidence,
        hintsUsed: x.hintsShown,
        ...(note ? { revisionNote: note } : {}),
      });
      x.revising = false;
      x.revisionNote = undefined;
    });
    setProblems2(false);
    setFocusTarget({ el: 'feedback', n: Date.now() });
  };

  const startRevision = () =>
    update((x) => {
      x.draft = structuredClone(x.attempts[x.attempts.length - 1].answers);
      x.revising = true;
    });
  const cancelRevision = () => update((x) => void (x.revising = false));

  const judgementFit = submitted ? checkJudgement(task, answers.judgement) : null;
  const results = submitted ? task.parts.map((p) => checkPart(p, answers.parts[p.id], caseStudy.schedule)) : [];
  const partResults = task.parts.flatMap((part, i) => (results[i] ? [{ part, result: results[i]! }] : []));

  return (
    <div className="stack">
      <div className="task-head">
        <p className="eyebrow">
          Claim {task.number} of {caseStudy.tasks.length}
        </p>
        <PageHeading>{task.title}</PageHeading>
      </div>

      {section && (
        <section className="stack" aria-labelledby={`${uid}-claim`} style={{ marginTop: 8 }}>
          <h2 className="step__title" id={`${uid}-claim`} style={{ marginBottom: 0 }}>
            Read the claim
          </h2>
          <ClaimExcerpt proposal={caseStudy.proposal} section={section} />
        </section>
      )}

      <Step title="Inspect the evidence">
        <p style={{ marginBottom: 4 }}>Check the claim against the case file. These sections are a good place to start:</p>
        <div className="evidence-links">
          {task.evidenceSections.map((id) => (
            <button key={id} type="button" className="btn btn--small" onClick={() => show(id)}>
              {sectionTitles[id] ?? id}
            </button>
          ))}
        </div>
        {showsNetwork && (
          <div style={{ marginTop: 16 }}>
            <NetworkDiagram
              result={scenarioResult(caseStudy.schedule!, caseStudy.schedule!.baseline)}
              showResults={false}
              title={`${caseStudy.schedule!.title}: baseline plan`}
            />
          </div>
        )}
      </Step>

      <Step title={`Step 1: ${STAGE1.title}`}>
        {!initial ? (
          <div className="stack">
            <JudgementChoice
              legend={STAGE1.question}
              value={d1.judgement}
              onChange={(j) => update((x) => void (x.initialDraft.judgement = j))}
            />
            <div className="field">
              <label className="field__label" htmlFor={`${uid}-reasoning`}>
                {STAGE1.reasoningPrompt}
              </label>
              <textarea
                id={`${uid}-reasoning`}
                rows={3}
                value={d1.reasoning}
                placeholder={STAGE1.reasoningPlaceholder}
                onChange={(e) => update((x) => void (x.initialDraft.reasoning = e.target.value))}
                aria-describedby={reasoningLongEnough ? undefined : `${uid}-reasoning-short`}
              />
              {!reasoningLongEnough && (
                <span className="field__hint" id={`${uid}-reasoning-short`}>
                  {STAGE1.reasoningTooShort}
                </span>
              )}
              <span className="field__hint">Saved in this browser. Written answers are never marked automatically.</span>
            </div>
            <ConfidencePicker value={d1.confidence} onChange={(c) => update((x) => void (x.initialDraft.confidence = c))} />
            {problems1 && <Problems list={missing1} innerRef={problemsRef} />}
            <div className="btn-row">
              <button
                type="button"
                className="btn btn--primary"
                onClick={submitStage1}
                disabled={!reasoningLongEnough}
                aria-describedby={reasoningLongEnough ? undefined : `${uid}-reasoning-short`}
              >
                {STAGE1.submit}
              </button>
            </div>
          </div>
        ) : (
          <div className="stack">
            <dl className="kv">
              <dt>Initial judgement</dt>
              <dd>{judgementLabel(initial.judgement)}</dd>
              <dt>Your reasoning</dt>
              <dd style={{ whiteSpace: 'pre-wrap' }}>{initial.reasoning}</dd>
              <dt>Confidence</dt>
              <dd>{CONFIDENCE_OPTIONS.find((o) => o.id === initial.confidence)?.label}</dd>
            </dl>
            <p className="small muted" style={{ margin: 0 }}>
              {STAGE1.recorded}
            </p>
          </div>
        )}
      </Step>

      {initial && (
        <Step title={`Step 2: ${STAGE2.title}`} headingRef={stage2Ref}>
          <div className="stack">
            {!submitted && <p style={{ margin: 0 }}>{STAGE2.intro}</p>}
            {t.revising && (
              <>
                <p className="notice">You are revising this claim. Your initial judgement and earlier answers stay in your summary.</p>
                <JudgementChoice
                  legend={STAGE2.revisedJudgement}
                  value={t.draft.judgement}
                  onChange={(j) => update((x) => void (x.draft.judgement = j))}
                />
                <div className="field">
                  <label className="field__label" htmlFor={`${uid}-note`}>
                    {STAGE2.revisionNote}
                  </label>
                  <textarea
                    id={`${uid}-note`}
                    rows={2}
                    value={t.revisionNote ?? ''}
                    onChange={(e) => update((x) => void (x.revisionNote = e.target.value))}
                  />
                  <span className="field__hint">{STAGE2.revisionNoteHint}</span>
                </div>
              </>
            )}
            <div>
              {task.parts.map((p, i) => (
                <PartView
                  key={p.id}
                  part={p}
                  value={answers.parts[p.id]}
                  onChange={(v) => setPart(p.id, v)}
                  locked={submitted}
                  result={submitted ? results[i] : null}
                  seed={progress.seed}
                  shuffleKey={`${caseStudy.id}/${task.id}/${p.id}`}
                  schedule={caseStudy.schedule}
                  showProblem={problems2}
                />
              ))}
            </div>
            {!submitted && (
              <>
                {problems2 && <Problems list={missing2} innerRef={problemsRef} />}
                <div className="btn-row">
                  <button type="button" className="btn btn--primary" onClick={submitStage2}>
                    {t.revising ? STAGE2.submitRevised : STAGE2.submit}
                  </button>
                  {t.revising && (
                    <button type="button" className="btn btn--quiet" onClick={cancelRevision}>
                      Cancel revision
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </Step>
      )}

      {!submitted && (
        <section className="hint-box" aria-labelledby={`${uid}-hints`}>
          <h2 id={`${uid}-hints`} style={{ fontSize: '1rem', marginBottom: 4 }}>
            Hints
          </h2>
          {t.hintsShown > 0 ? (
            <ol aria-live="polite">
              {task.hints.slice(0, t.hintsShown).map((h, i) => (
                <li key={i}>{h.text}</li>
              ))}
            </ol>
          ) : (
            <p className="small" style={{ marginBottom: 8 }}>
              Stuck? A hint points you to evidence or a reasoning step, not to the answer. Hint use is shown in your summary.
            </p>
          )}
          {t.hintsShown < task.hints.length && (
            <button type="button" className="btn btn--quiet" onClick={showHint} style={{ marginTop: 8 }}>
              Show a hint ({t.hintsShown + 1} of {task.hints.length})
            </button>
          )}
        </section>
      )}

      {submitted && initial && (
        <section className="feedback stack" aria-labelledby={`${uid}-fb`}>
          <div>
            {t.attempts.length > 1 && <p className="eyebrow">Revised review, attempt {t.attempts.length}</p>}
            <h2 id={`${uid}-fb`} ref={feedbackRef} tabIndex={-1}>
              Feedback
            </h2>
          </div>

          <div className="stack">
            <div>
              <span className="label-tag">{AUTO_CHECK_LABEL}</span>
            </div>
            <div className="result-row">
              <div>
                <strong>{t.attempts.length > 1 ? 'Your judgement after feedback: ' : 'Your judgement: '}</strong>
                {judgementLabel(answers.judgement)} <FitBadge fit={judgementFit!} />
              </div>
              <p className="result-row__note">
                {answers.judgement && task.judgementFeedback[answers.judgement].text}
                {judgementFit !== 'expected' && <> Model judgement: {endSentence(judgementLabel(task.expectedJudgement) ?? '')}</>}
              </p>
              {t.attempts.length > 1 && (
                <p className="result-row__note">
                  Your initial judgement was: {judgementLabel(initial.judgement)}.
                  {last.revisionNote && <> What changed: {endSentence(last.revisionNote)}</>}
                </p>
              )}
            </div>
            {partResults.length > 0 && (
              <ul className="part-results" aria-label="Results for the detail questions">
                {partResults.map(({ part, result }) => (
                  <li key={part.id}>
                    <FitBadge fit={result.fit} label={`${part.label}: ${partResultText(part, result)}`} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="notice">
            <strong>Key point:</strong> {task.lesson}
          </p>

          <FeedbackShort feedback={task.feedback} />

          <SelfCheck
            prompt="Your initial reasoning"
            answer={initial.reasoning}
            modelAnswer={task.initialReasoning.modelAnswer}
            checklist={task.initialReasoning.checklist}
            ticks={t.selfCheck}
            onTick={tick}
            keyPrefix="initial"
          />

          {task.parts.map((p) =>
            p.kind === 'text' ? (
              <SelfCheck
                key={p.id}
                prompt={p.prompt}
                answer={asString(answers.parts[p.id])}
                modelAnswer={p.modelAnswer}
                checklist={p.checklist ?? []}
                ticks={t.selfCheck}
                onTick={tick}
                keyPrefix={p.id}
              />
            ) : null,
          )}

          <FeedbackDetails feedback={task.feedback} schedule={caseStudy.schedule} />

          <div className="btn-row no-print" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <button type="button" className="btn btn--quiet" onClick={startRevision}>
              Revise my judgement or answers
            </button>
            {next ? (
              <a className="btn btn--primary" href={href.task(caseStudy.id, next.id)}>
                Next: claim {next.number}
              </a>
            ) : (
              <a className="btn btn--primary" href={href.challenge(caseStudy.id)}>
                Go to the independent challenge
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
