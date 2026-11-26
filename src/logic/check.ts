// Automatic checks for structured answers. Written answers ('text' parts) are
// never checked here: they are self-assessed against a checklist.

import type { CaseSchedule, Fit, JudgementId, ReviewTask, TaskPart } from '../content/types';
import { scenarioResult } from './scenarios';
import { formatPath, isCriticalPath } from './schedule';

/** single/number/delay/text: string; multi/path: string[]; classify: item id → category id. */
export type PartValue = string | string[] | Record<string, string>;

export interface AnswerSet {
  judgement?: JudgementId;
  parts: Record<string, PartValue>;
}

export interface DetailResult {
  id: string;
  fit: Fit;
}

export interface PartResult {
  partId: string;
  fit: Fit;
  /** Number of decisions that match the model answer, out of `total`. */
  matched: number;
  total: number;
  /** Per option or item, for single/multi/classify. */
  details: DetailResult[];
  /** Readable model answer, for number/path/delay. */
  expectedText?: string;
}

// --- Reading values ----------------------------------------------------------

export const asString = (v: PartValue | undefined): string => (typeof v === 'string' ? v : '');
export const asList = (v: PartValue | undefined): string[] => (Array.isArray(v) ? v : []);
export const asMap = (v: PartValue | undefined): Record<string, string> =>
  v && typeof v === 'object' && !Array.isArray(v) ? v : {};

/**
 * Parses a typed number. Accepts "11", " 11 ", "11.0", "11,0" and "11 days";
 * returns null for anything else.
 */
export function parseNumber(raw: string): number | null {
  const m = raw.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*(?:working\s+)?(?:days?|d)?\.?$/i);
  if (!m) return null;
  const n = Number(m[1].replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function isPartAnswered(part: TaskPart, value: PartValue | undefined): boolean {
  switch (part.kind) {
    case 'single':
    case 'delay':
      return asString(value) !== '';
    case 'multi':
    case 'path':
      return asList(value).length > 0;
    case 'classify': {
      const map = asMap(value);
      return part.items.every((i) => map[i.id]);
    }
    case 'number':
      return parseNumber(asString(value)) !== null;
    case 'text':
      return asString(value).trim().length > 0;
  }
}

/** Why a part cannot be submitted yet, or null when it is ready. */
export function partProblem(part: TaskPart, value: PartValue | undefined): string | null {
  if (isPartAnswered(part, value)) return null;
  switch (part.kind) {
    case 'number':
      return asString(value).trim() === '' ? 'Enter a number.' : 'Enter a whole number, for example 7.';
    case 'classify':
      return 'Classify every item.';
    case 'multi':
      return 'Select at least one option.';
    case 'path':
      return 'Select at least one activity.';
    case 'text':
      return 'Write a short answer.';
    default:
      return 'Choose an answer.';
  }
}

// --- Checking ------------------------------------------------------------------

function aggregate(matched: number, total: number): Fit {
  if (matched === total) return 'expected';
  if (matched * 2 >= total) return 'partly';
  return 'differs';
}

function scheduleOf(schedule: CaseSchedule | undefined): CaseSchedule {
  if (!schedule) throw new Error('This part needs a case schedule');
  return schedule;
}

/** Expected numerical answer for a 'number' part, calculated from the schedule. */
export function expectedNumber(part: Extract<TaskPart, { kind: 'number' }>, schedule: CaseSchedule | undefined): number {
  const result = scenarioResult(scheduleOf(schedule), part.scenario);
  if (part.question.kind === 'duration') return result.projectDuration;
  const a = result.byId[part.question.activity];
  if (!a) throw new Error(`Unknown activity ${part.question.activity}`);
  return a.float;
}

/** 'yes' when the scenario finishes later than the comparison scenario. */
export function expectedDelay(part: Extract<TaskPart, { kind: 'delay' }>, schedule: CaseSchedule | undefined): 'yes' | 'no' {
  const s = scheduleOf(schedule);
  return scenarioResult(s, part.scenario).projectDuration > scenarioResult(s, part.compareWith).projectDuration
    ? 'yes'
    : 'no';
}

/** Returns null for text parts, which are never checked automatically. */
export function checkPart(part: TaskPart, value: PartValue | undefined, schedule?: CaseSchedule): PartResult | null {
  switch (part.kind) {
    case 'text':
      return null;

    case 'single': {
      const chosen = part.options.find((o) => o.id === asString(value));
      const fit: Fit = chosen ? chosen.fit : 'differs';
      const ok = fit === 'expected' || fit === 'acceptable';
      return {
        partId: part.id, fit, matched: ok ? 1 : 0, total: 1,
        details: chosen ? [{ id: chosen.id, fit }] : [],
      };
    }

    case 'multi': {
      const selected = new Set(asList(value));
      const details = part.options.map((o) => {
        const shouldSelect = o.fit === 'expected';
        return { id: o.id, fit: (selected.has(o.id) === shouldSelect ? 'expected' : 'differs') as Fit };
      });
      const matched = details.filter((d) => d.fit === 'expected').length;
      return { partId: part.id, fit: aggregate(matched, details.length), matched, total: details.length, details };
    }

    case 'classify': {
      const map = asMap(value);
      const details = part.items.map((i) => ({ id: i.id, fit: (map[i.id] === i.correct ? 'expected' : 'differs') as Fit }));
      const matched = details.filter((d) => d.fit === 'expected').length;
      return { partId: part.id, fit: aggregate(matched, details.length), matched, total: details.length, details };
    }

    case 'number': {
      const expected = expectedNumber(part, schedule);
      const ok = parseNumber(asString(value)) === expected;
      return {
        partId: part.id, fit: ok ? 'expected' : 'differs', matched: ok ? 1 : 0, total: 1, details: [],
        expectedText: `${expected} ${part.unit}`,
      };
    }

    case 'path': {
      const result = scenarioResult(scheduleOf(schedule), part.scenario);
      const ok = isCriticalPath(result, asList(value));
      return {
        partId: part.id, fit: ok ? 'expected' : 'differs', matched: ok ? 1 : 0, total: 1, details: [],
        expectedText: result.criticalPaths.map(formatPath).join(' and '),
      };
    }

    case 'delay': {
      const expected = expectedDelay(part, schedule);
      const ok = asString(value) === expected;
      return {
        partId: part.id, fit: ok ? 'expected' : 'differs', matched: ok ? 1 : 0, total: 1, details: [],
        expectedText: expected === 'yes' ? 'Yes' : 'No',
      };
    }
  }
}

/**
 * Short result text for one part, e.g. "6 of 6 items correct" or "correct".
 * Shown after the part's label: "Classification: 6 of 6 items correct".
 */
export function partResultText(part: TaskPart, r: Pick<PartResult, 'fit' | 'matched' | 'total'>): string {
  if (r.total > 1) {
    return part.kind === 'classify' ? `${r.matched} of ${r.total} items correct` : `${r.matched} of ${r.total} choices match the model answer`;
  }
  if (r.fit === 'acceptable') return 'a defensible alternative';
  return r.fit === 'expected' ? 'correct' : 'differs from the model answer';
}

export function checkJudgement(task: ReviewTask, judgement: JudgementId | undefined): Fit {
  return judgement ? task.judgementFeedback[judgement].fit : 'differs';
}

// --- Shuffling -------------------------------------------------------------------

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic shuffle: the same seed and key always give the same order, so
 * the order stays stable across reloads. Correctness never depends on order.
 */
export function shuffled<T>(items: readonly T[], seed: number, key: string): T[] {
  const out = [...items];
  const rand = mulberry32(hash(`${seed}:${key}`));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
