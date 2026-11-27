// Builds the review summary and its plain-text export from saved progress.

import { REFLECTION_PROMPT, SITE_TITLE } from '../content/about';
import { CONFIDENCE_OPTIONS, FIT_LABELS, JUDGEMENT_OPTIONS } from '../content/shared';
import type { CaseStudy, Confidence, Fit, JudgementId, TaskPart } from '../content/types';
import { caseOf, taskOf, taskStatus, transferOf, type Progress, type TaskStatus } from '../state/progress';
import { asString, checkJudgement, checkPart, partResultText, type AnswerSet } from './check';

export interface AutoPartSummary {
  /** Short name of the question, e.g. "Critical path". */
  label: string;
  first: { fit: Fit; matched: number; total: number; text: string };
  latest: { fit: Fit; matched: number; total: number; text: string };
}

export interface TextSummary {
  prompt: string;
  answer: string;
  ticked: number;
  total: number;
}

export interface TaskSummary {
  number: number;
  title: string;
  status: TaskStatus;
  /** Stage 1, recorded before any details or feedback. */
  initialJudgement?: JudgementId;
  initialFit?: Fit;
  initialReasoning?: TextSummary;
  /** Judgement in the latest submission after feedback, if the student revised. */
  latestJudgement?: JudgementId;
  latestFit?: Fit;
  /** The student's note on what changed their judgement, from the latest revision. */
  revisionNote?: string;
  revisions: number;
  hintsUsed: number;
  firstConfidence?: Confidence;
  auto: AutoPartSummary[];
  texts: TextSummary[];
}

export interface TransferSummary {
  title: string;
  submitted: boolean;
  confidence?: Confidence;
  auto: { label: string; fit: Fit; text: string }[];
  texts: TextSummary[];
  /** Part-level checklist ticks. */
  partTicked: number;
  partTotal: number;
}

export interface CaseSummary {
  tasks: TaskSummary[];
  transfer: TransferSummary[];
  reflection: string;
}

function autoFor(part: TaskPart, answers: AnswerSet, c: CaseStudy) {
  const r = checkPart(part, answers.parts[part.id], c.schedule);
  return r && { fit: r.fit, matched: r.matched, total: r.total, text: partResultText(part, r) };
}

function textFor(part: Extract<TaskPart, { kind: 'text' }>, answers: AnswerSet, ticks: Record<string, boolean>): TextSummary {
  const list = part.checklist ?? [];
  return {
    prompt: part.prompt,
    answer: asString(answers.parts[part.id]),
    ticked: list.filter((i) => ticks[`${part.id}:${i.id}`]).length,
    total: list.length,
  };
}

export function buildSummary(c: CaseStudy, p: Progress): CaseSummary {
  const tasks = c.tasks.map((task): TaskSummary => {
    const t = taskOf(p, c.id, task.id);
    const first = t.attempts[0];
    const latest = t.attempts[t.attempts.length - 1];
    const initial = t.initial;
    const reasoningList = task.initialReasoning.checklist;
    const auto: AutoPartSummary[] = [];
    const texts: TextSummary[] = [];
    if (first && latest) {
      for (const part of task.parts) {
        if (part.kind === 'text') texts.push(textFor(part, latest.answers, t.selfCheck));
        else {
          const f = autoFor(part, first.answers, c);
          const l = autoFor(part, latest.answers, c);
          if (f && l) auto.push({ label: part.label, first: f, latest: l });
        }
      }
    }
    return {
      number: task.number,
      title: task.title,
      status: taskStatus(t),
      initialJudgement: initial?.judgement,
      initialFit: initial ? checkJudgement(task, initial.judgement) : undefined,
      initialReasoning: initial && {
        prompt: 'Initial reasoning',
        answer: initial.reasoning,
        ticked: reasoningList.filter((i) => t.selfCheck[`initial:${i.id}`]).length,
        total: reasoningList.length,
      },
      latestJudgement: latest?.answers.judgement,
      latestFit: latest ? checkJudgement(task, latest.answers.judgement) : undefined,
      revisionNote: [...t.attempts].reverse().find((a) => a.revisionNote)?.revisionNote,
      revisions: Math.max(0, t.attempts.length - 1),
      hintsUsed: t.hintsShown,
      firstConfidence: initial?.confidence,
      auto,
      texts,
    };
  });

  const transfer = c.transfer.parts.map((part): TransferSummary => {
    const t = transferOf(p, c.id, part.id);
    const s = t.submitted;
    return {
      title: part.title,
      submitted: !!s,
      confidence: s?.confidence,
      auto: s
        ? part.parts.flatMap((q) => {
            const r = checkPart(q, s.answers.parts[q.id], c.schedule);
            return r ? [{ label: q.label, fit: r.fit, text: partResultText(q, r) }] : [];
          })
        : [],
      texts: s ? part.parts.flatMap((q) => (q.kind === 'text' ? [textFor(q, s.answers, t.selfCheck)] : [])) : [],
      partTicked: part.checklist.filter((i) => t.selfCheck[`part:${i.id}`]).length,
      partTotal: part.checklist.length,
    };
  });

  return { tasks, transfer, reflection: caseOf(p, c.id).reflection };
}

export const judgementLabel = (j?: JudgementId) => JUDGEMENT_OPTIONS.find((o) => o.id === j)?.label ?? '-';
export const confidenceLabel = (c?: Confidence) => CONFIDENCE_OPTIONS.find((o) => o.id === c)?.label ?? '-';
export const fitText = (f?: Fit) => (f ? FIT_LABELS[f].label.toLowerCase() : '-');

/** Plain-text version of the summary for download. Built locally; never sent anywhere. */
export function summaryText(c: CaseStudy, p: Progress, now = new Date()): string {
  const s = buildSummary(c, p);
  const L: string[] = [];
  const rule = '-'.repeat(60);
  L.push(`Review summary: ${SITE_TITLE}`, `Case: ${c.title}`, `Saved: ${now.toLocaleString('en-GB')}`, '');
  L.push('This summary records your own review. It is not a grade and does not measure overall learning.', '');

  L.push('REVIEW SUMMARY', rule);
  for (const t of s.tasks) {
    L.push(`Claim ${t.number}: ${t.title}`);
    if (t.status === 'not-started' || !t.initialJudgement) {
      L.push('  Not submitted yet.', '');
      continue;
    }
    L.push(`  Initial judgement: ${judgementLabel(t.initialJudgement)} (${fitText(t.initialFit)})`);
    L.push(`  Initial reasoning: ${t.initialReasoning?.answer.trim() || '(none)'}`);
    if (t.revisions > 0) L.push(`  Judgement after feedback: ${judgementLabel(t.latestJudgement)} (${fitText(t.latestFit)})`);
    if (t.revisionNote) L.push(`  What changed your judgement: ${t.revisionNote}`);
    else if (!t.latestJudgement) L.push('  Details not submitted yet.');
    L.push(`  Revisions: ${t.revisions}   Hints used: ${t.hintsUsed}   Confidence (before feedback): ${confidenceLabel(t.firstConfidence)}`);
    L.push('');
  }

  L.push('PRACTICE RESULTS (checked automatically)', rule);
  for (const t of s.tasks) {
    if (!t.auto.length) continue;
    L.push(`Claim ${t.number}: ${t.title}`);
    for (const a of t.auto) {
      L.push(`  ${a.label}: ${a.first.text}${t.revisions ? ` (first attempt); ${a.latest.text} (latest)` : ''}`);
    }
    L.push('');
  }

  L.push('YOUR EXPLANATIONS (self-assessed, not checked automatically)', rule);
  for (const t of s.tasks) {
    const r = t.initialReasoning;
    if (r && r.total) L.push(`Claim ${t.number}, initial reasoning. Your checklist: ${r.ticked} of ${r.total} points ticked.`, '');
    for (const x of t.texts) {
      L.push(`Claim ${t.number}: ${x.prompt}`, `  ${x.answer.trim() || '(no answer written)'}`);
      if (x.total) L.push(`  Your checklist: ${x.ticked} of ${x.total} points ticked`);
      L.push('');
    }
  }

  L.push('INDEPENDENT CHALLENGE (reported separately)', rule);
  for (const t of s.transfer) {
    L.push(t.title);
    if (!t.submitted) {
      L.push('  Not submitted yet.', '');
      continue;
    }
    L.push(`  Confidence: ${confidenceLabel(t.confidence)}`);
    for (const a of t.auto) L.push(`  ${a.label}: ${a.text} (checked automatically)`);
    for (const x of t.texts) {
      L.push(`  ${x.prompt}`, `    ${x.answer.trim() || '(no answer written)'}`);
      if (x.total) L.push(`    Your checklist: ${x.ticked} of ${x.total} points ticked`);
    }
    if (t.partTotal) L.push(`  Your checklist for this part: ${t.partTicked} of ${t.partTotal} points ticked`);
    L.push('');
  }

  L.push('REFLECTION', rule, REFLECTION_PROMPT, `  ${s.reflection.trim() || '(not answered)'}`, '');
  return L.join('\n');
}
