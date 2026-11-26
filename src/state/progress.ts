// User progress: data model, persistence and a small store.
// Everything stays in the browser. Nothing is sent anywhere.

import { useSyncExternalStore } from 'react';
import { CONTENT_VERSION } from '../content/version';
import type { Confidence, JudgementId } from '../content/types';
import type { AnswerSet } from '../logic/check';

export interface Attempt {
  at: number;
  answers: AnswerSet;
  /** Asked once, before any feedback (Stage 1 for guided tasks). */
  confidence?: Confidence;
  /** Hints revealed before this submission. */
  hintsUsed: number;
  /** For a revision after feedback: the student's own note on what changed their judgement. */
  revisionNote?: string;
}

/** Stage 1 of a guided task: recorded once and never changed afterwards. */
export interface InitialReview {
  at: number;
  judgement: JudgementId;
  reasoning: string;
  confidence: Confidence;
  hintsUsed: number;
}

export interface TaskProgress {
  /** Stage 1 answers while they are being written. */
  initialDraft: { judgement?: JudgementId; reasoning: string; confidence?: Confidence };
  /** Set when Stage 1 is submitted; Stage 2 appears only after that. */
  initial?: InitialReview;
  /** Stage 2 answers (and the judgement, when revising after feedback). */
  draft: AnswerSet;
  hintsShown: number;
  attempts: Attempt[];
  /** True while the user is changing answers after feedback. */
  revising: boolean;
  /** Draft of "What changed your judgement?" while revising. */
  revisionNote?: string;
  /** Self-assessment ticks, keyed "partId:checklistId". */
  selfCheck: Record<string, boolean>;
}

export interface TransferProgress {
  draft: AnswerSet;
  confidence?: Confidence;
  /** Set once; the independent challenge is submitted only once. */
  submitted?: Attempt;
  selfCheck: Record<string, boolean>;
}

export interface CaseProgress {
  tasks: Record<string, TaskProgress>;
  transfer: Record<string, TransferProgress>;
  reflection: string;
}

export interface Progress {
  contentVersion: string;
  /** Seed for the stable option order. */
  seed: number;
  cases: Record<string, CaseProgress>;
}

export const STORAGE_KEY = 'would-you-approve-this:progress';

export const emptyTask = (): TaskProgress => ({
  initialDraft: { reasoning: '' }, draft: { parts: {} }, hintsShown: 0, attempts: [], revising: false, selfCheck: {},
});
export const emptyTransfer = (): TransferProgress => ({ draft: { parts: {} }, selfCheck: {} });
export const emptyCase = (): CaseProgress => ({ tasks: {}, transfer: {}, reflection: '' });

export function emptyProgress(seed = Math.floor(Math.random() * 2 ** 31)): Progress {
  return { contentVersion: CONTENT_VERSION, seed, cases: {} };
}

// --- Storage --------------------------------------------------------------------

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** localStorage if it works here, otherwise null (private mode, blocked, some file:// setups). */
export function browserStorage(): StorageLike | null {
  try {
    const s = window.localStorage;
    const probe = `${STORAGE_KEY}:probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export type LoadNotice = 'storage-unavailable' | 'old-version' | null;

export interface LoadResult {
  progress: Progress;
  notice: LoadNotice;
  /** Raw saved data from another content version, kept so the user can download it. */
  oldData?: string;
}

function looksLikeProgress(v: unknown): v is Progress {
  return !!v && typeof v === 'object' && 'contentVersion' in v && 'cases' in v && 'seed' in v;
}

export function loadProgress(storage: StorageLike | null): LoadResult {
  if (!storage) return { progress: emptyProgress(), notice: 'storage-unavailable' };
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { progress: emptyProgress(), notice: 'storage-unavailable' };
  }
  if (!raw) return { progress: emptyProgress(), notice: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { progress: emptyProgress(), notice: null }; // unreadable: start again
  }
  if (!looksLikeProgress(parsed)) return { progress: emptyProgress(), notice: null };
  if (parsed.contentVersion !== CONTENT_VERSION) {
    // Never apply answers saved for different content.
    return { progress: emptyProgress(), notice: 'old-version', oldData: raw };
  }
  return { progress: parsed, notice: null };
}

// --- Store ------------------------------------------------------------------------

export interface ProgressStore {
  get(): Progress;
  /** Applies a change to a copy of the state, then saves it. */
  update(change: (draft: Progress) => void): void;
  subscribe(listener: () => void): () => void;
  reset(): void;
  notice(): LoadNotice;
  oldData(): string | undefined;
  /** Removes saved data from an older version and resumes saving. */
  discardOldData(): void;
  isPersistent(): boolean;
}

export function createStore(storage: StorageLike | null): ProgressStore {
  const loaded = loadProgress(storage);
  let state = loaded.progress;
  let notice = loaded.notice;
  let oldData = loaded.oldData;
  // While old-version data is unresolved, do not overwrite it.
  let paused = notice === 'old-version';
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());
  const save = () => {
    if (!storage || paused) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota or access errors: keep working in memory.
    }
  };

  return {
    get: () => state,
    update(change) {
      const next = structuredClone(state);
      change(next);
      state = next;
      save();
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      state = emptyProgress();
      try {
        storage?.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (notice === 'old-version') {
        notice = null;
        oldData = undefined;
        paused = false;
      }
      emit();
    },
    notice: () => notice,
    oldData: () => oldData,
    discardOldData() {
      try {
        storage?.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      notice = null;
      oldData = undefined;
      paused = false;
      save();
      emit();
    },
    isPersistent: () => !!storage && !paused,
  };
}

export function useProgress(store: ProgressStore): Progress {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

// --- Helpers for components --------------------------------------------------------

export function caseOf(p: Progress, caseId: string): CaseProgress {
  return p.cases[caseId] ?? emptyCase();
}

export function taskOf(p: Progress, caseId: string, taskId: string): TaskProgress {
  return caseOf(p, caseId).tasks[taskId] ?? emptyTask();
}

export function transferOf(p: Progress, caseId: string, partId: string): TransferProgress {
  return caseOf(p, caseId).transfer[partId] ?? emptyTransfer();
}

/** Mutable access inside store.update(), creating missing entries. */
export function ensureCase(d: Progress, caseId: string): CaseProgress {
  return (d.cases[caseId] ??= emptyCase());
}
export function ensureTask(d: Progress, caseId: string, taskId: string): TaskProgress {
  return (ensureCase(d, caseId).tasks[taskId] ??= emptyTask());
}
export function ensureTransfer(d: Progress, caseId: string, partId: string): TransferProgress {
  return (ensureCase(d, caseId).transfer[partId] ??= emptyTransfer());
}

export type TaskStatus = 'not-started' | 'in-progress' | 'reviewed';

export function taskStatus(t: TaskProgress): TaskStatus {
  if (t.attempts.length > 0) return t.revising ? 'in-progress' : 'reviewed';
  const d = t.initialDraft;
  const touched = t.initial || d.judgement || d.reasoning || d.confidence || Object.keys(t.draft.parts).length > 0 || t.hintsShown > 0;
  return touched ? 'in-progress' : 'not-started';
}
