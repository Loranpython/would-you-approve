import { useId, type ReactNode } from 'react';
import type { CaseSchedule, ChoiceOption, Fit, TaskPart } from '../content/types';
import { asList, asMap, asString, endSentence, isPartAnswered, partProblem, shuffled, type PartResult, type PartValue } from '../logic/check';
import { formatPath } from '../logic/schedule';
import { FitBadge } from './common';

interface PartProps {
  part: TaskPart;
  value: PartValue | undefined;
  onChange: (value: PartValue) => void;
  /** Read-only after submission. */
  locked: boolean;
  /** Present only after submission. */
  result: PartResult | null;
  seed: number;
  /** Key for the stable shuffle (e.g. "coursehub/t1/classify"). */
  shuffleKey: string;
  schedule?: CaseSchedule;
  showProblem: boolean;
}

/** Option feedback written for students who chose it ("Yes. …"), reworded for use under "Model answer". */
function asModelNote(feedback?: string): string {
  const rest = (feedback ?? '').replace(/^Yes[.:,]?\s*/, '');
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

const ordered = <T extends { id: string }>(items: T[], shuffle: boolean | undefined, seed: number, key: string) =>
  shuffle ? shuffled(items, seed, key) : items;

function Problem({ part, value, show }: { part: TaskPart; value: PartValue | undefined; show: boolean }) {
  // Written answers show their own message under the field (see TextAnswer).
  const problem = show && part.kind !== 'text' ? partProblem(part, value) : null;
  return problem ? <p className="field__problem">{problem}</p> : null;
}

function ResultLine({ fit, label, children }: { fit: Fit; label?: string; children?: ReactNode }) {
  return (
    <div className="result-row" role="group">
      <div>
        <FitBadge fit={fit} label={label} />
      </div>
      {children}
    </div>
  );
}

function SingleChoice({ part, value, onChange, locked, result, seed, shuffleKey }: PartProps & { part: Extract<TaskPart, { kind: 'single' }> }) {
  const name = useId();
  const chosen = asString(value);
  const options = ordered(part.options, part.shuffle, seed, shuffleKey);
  const chosenOpt = part.options.find((o) => o.id === chosen);
  const best = part.options.filter((o) => o.fit === 'expected');
  return (
    <fieldset>
      <legend>{part.prompt}</legend>
      <div className="choice-list">
        {options.map((o) => (
          <label key={o.id} className="choice" aria-disabled={locked || undefined}>
            <input
              type="radio"
              name={name}
              value={o.id}
              checked={chosen === o.id}
              disabled={locked}
              onChange={() => onChange(o.id)}
            />
            <span className="choice__text">{o.text}</span>
          </label>
        ))}
      </div>
      {result && chosenOpt && (
        <div className="stack" style={{ marginTop: 12 }}>
          <ResultLine fit={result.fit}>
            <p className="result-row__answer">
              Your answer: {chosenOpt.text}
            </p>
            {chosenOpt.feedback && <p className="result-row__note">{chosenOpt.feedback}</p>}
          </ResultLine>
          {chosenOpt.fit !== 'expected' &&
            best.map((o) => (
              <p key={o.id} className="small">
                <strong>Model answer:</strong> {endSentence(o.text)} {asModelNote(o.feedback)}
              </p>
            ))}
        </div>
      )}
    </fieldset>
  );
}

function multiLabel(o: ChoiceOption, selected: boolean): { fit: Fit; label: string } {
  const relevant = o.fit === 'expected';
  if (selected && relevant) return { fit: 'expected', label: 'You selected it: matches' };
  if (!selected && !relevant) return { fit: 'expected', label: 'You left it out: matches' };
  if (selected) return { fit: 'differs', label: 'You selected it: the model answer leaves it out' };
  return { fit: 'differs', label: 'You left it out: the model answer includes it' };
}

function MultiChoice({ part, value, onChange, locked, result, seed, shuffleKey }: PartProps & { part: Extract<TaskPart, { kind: 'multi' }> }) {
  const selected = new Set(asList(value));
  const options = ordered(part.options, part.shuffle, seed, shuffleKey);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    // Store in content order so saved answers do not depend on display order.
    onChange(part.options.map((o) => o.id).filter((oid) => next.has(oid)));
  };
  return (
    <fieldset>
      <legend>{part.prompt}</legend>
      {result && (
        <p className="small">
          <FitBadge fit={result.fit} label={`${result.matched} of ${result.total} decisions match the model answer`} />
        </p>
      )}
      <div className="choice-list">
        {options.map((o) => {
          const r = result ? multiLabel(o, selected.has(o.id)) : null;
          return (
            <div key={o.id}>
              <label className="choice" aria-disabled={locked || undefined}>
                <input type="checkbox" checked={selected.has(o.id)} disabled={locked} onChange={() => toggle(o.id)} />
                <span className="choice__text">
                  {o.text}
                  {r && (
                    <span className="choice__desc">
                      <FitBadge fit={r.fit} label={r.label} /> {o.feedback}
                    </span>
                  )}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function Classify({ part, value, onChange, locked, result, seed, shuffleKey }: PartProps & { part: Extract<TaskPart, { kind: 'classify' }> }) {
  const map = asMap(value);
  const baseName = useId();
  const items = ordered(part.items, part.shuffle, seed, shuffleKey);
  const label = (id: string) => part.categories.find((c) => c.id === id)?.label ?? '—';
  return (
    <fieldset>
      <legend>{part.prompt}</legend>
      {result && (
        <p className="small">
          <FitBadge fit={result.fit} label={`${result.matched} of ${result.total} match the model answer`} />
        </p>
      )}
      {items.map((item) => {
        const fit = result?.details.find((d) => d.id === item.id)?.fit;
        return (
          <fieldset key={item.id} className="classify-item">
            <legend>{item.text}</legend>
            <div className="choice-inline">
              {part.categories.map((c) => (
                <label key={c.id} className="choice" aria-disabled={locked || undefined}>
                  <input
                    type="radio"
                    name={`${baseName}-${item.id}`}
                    checked={map[item.id] === c.id}
                    disabled={locked}
                    onChange={() => onChange({ ...map, [item.id]: c.id })}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
            {fit && (
              <div className="result-row" style={{ borderBottom: 0, paddingBottom: 0 }}>
                <div>
                  <FitBadge fit={fit} />
                  {fit !== 'expected' && <span className="small"> Model answer: {endSentence(label(item.correct))}</span>}
                </div>
                <p className="result-row__note" style={{ margin: 0 }}>
                  {item.explanation}
                </p>
              </div>
            )}
          </fieldset>
        );
      })}
    </fieldset>
  );
}

function NumberField({ part, value, onChange, locked, result }: PartProps & { part: Extract<TaskPart, { kind: 'number' }> }) {
  const id = useId();
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {part.prompt}
      </label>
      <div className="number-input">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={asString(value)}
          readOnly={locked}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={`${id}-unit`}
        />
        <span id={`${id}-unit`}>{part.unit}</span>
      </div>
      {result && (
        <ResultLine fit={result.fit}>
          {result.fit !== 'expected' && <p className="result-row__note">Model answer: {endSentence(result.expectedText ?? '')}</p>}
        </ResultLine>
      )}
    </div>
  );
}

function PathBuilder({ part, value, onChange, locked, result, schedule }: PartProps & { part: Extract<TaskPart, { kind: 'path' }> }) {
  const seq = asList(value);
  const id = useId();
  const activities = schedule?.network ?? [];
  return (
    <div className="field path-builder" role="group" aria-labelledby={`${id}-label`}>
      <p className="field__label" id={`${id}-label`} style={{ margin: 0 }}>
        {part.prompt}
      </p>
      <div className="path-builder__seq" aria-live="polite" aria-atomic="true">
        <span className="sr-only">Your path: </span>
        {seq.length ? formatPath(seq) : <span className="muted">No activities selected yet</span>}
      </div>
      {!locked && (
        <>
          <div className="path-builder__buttons">
            {activities.map((a) => (
              <button
                key={a.id}
                type="button"
                className="btn btn--small"
                disabled={seq.includes(a.id)}
                onClick={() => onChange([...seq, a.id])}
                aria-label={`Add ${a.id}: ${a.name}`}
              >
                Add {a.id}
              </button>
            ))}
          </div>
          <div className="btn-row">
            <button type="button" className="btn btn--quiet btn--small" disabled={!seq.length} onClick={() => onChange(seq.slice(0, -1))}>
              Remove last
            </button>
            <button type="button" className="btn btn--quiet btn--small" disabled={!seq.length} onClick={() => onChange([])}>
              Clear
            </button>
          </div>
        </>
      )}
      {result && (
        <ResultLine fit={result.fit}>
          {result.fit !== 'expected' && <p className="result-row__note">Model answer: {endSentence(result.expectedText ?? '')}</p>}
        </ResultLine>
      )}
    </div>
  );
}

function YesNo({ part, value, onChange, locked, result }: PartProps & { part: Extract<TaskPart, { kind: 'delay' }> }) {
  const name = useId();
  const v = asString(value);
  return (
    <fieldset>
      <legend>{part.prompt}</legend>
      <div className="choice-inline">
        {(['yes', 'no'] as const).map((opt) => (
          <label key={opt} className="choice" aria-disabled={locked || undefined}>
            <input type="radio" name={name} checked={v === opt} disabled={locked} onChange={() => onChange(opt)} />
            <span>{opt === 'yes' ? 'Yes, it is delayed' : 'No, it is not delayed'}</span>
          </label>
        ))}
      </div>
      {result && (
        <ResultLine fit={result.fit}>
          {result.fit !== 'expected' && <p className="result-row__note">Model answer: {endSentence(result.expectedText ?? '')}</p>}
        </ResultLine>
      )}
    </fieldset>
  );
}

function TextAnswer({ part, value, onChange, locked }: PartProps & { part: Extract<TaskPart, { kind: 'text' }> }) {
  const id = useId();
  // Same minimum as the Stage 1 reasoning: at least five words with letters. Content is never judged.
  const tooShort = !locked && !isPartAnswered(part, value);
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {part.prompt}
      </label>
      <textarea
        id={id}
        value={asString(value)}
        placeholder={part.placeholder}
        readOnly={locked}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        aria-describedby={tooShort ? `${id}-short` : undefined}
      />
      {tooShort && (
        <span className="field__hint" id={`${id}-short`}>
          {partProblem(part, value)}
        </span>
      )}
      {!locked && <span className="field__hint">Written answers are saved in this browser and are never marked automatically.</span>}
    </div>
  );
}

export function PartView(props: PartProps) {
  const { part } = props;
  let body: ReactNode;
  switch (part.kind) {
    case 'single':
      body = <SingleChoice {...props} part={part} />;
      break;
    case 'multi':
      body = <MultiChoice {...props} part={part} />;
      break;
    case 'classify':
      body = <Classify {...props} part={part} />;
      break;
    case 'number':
      body = <NumberField {...props} part={part} />;
      break;
    case 'path':
      body = <PathBuilder {...props} part={part} />;
      break;
    case 'delay':
      body = <YesNo {...props} part={part} />;
      break;
    case 'text':
      body = <TextAnswer {...props} part={part} />;
      break;
  }
  return (
    <div className="part">
      {body}
      {!props.locked && <Problem part={part} value={props.value} show={props.showProblem} />}
    </div>
  );
}
