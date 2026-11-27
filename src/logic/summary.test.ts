import { describe, expect, it } from 'vitest';
import { COURSEHUB } from '../content/coursehub';
import { emptyProgress, ensureCase, ensureTask, ensureTransfer } from '../state/progress';
import { buildSummary, summaryText } from './summary';

function sampleProgress() {
  const p = emptyProgress(1);
  const t1 = ensureTask(p, 'coursehub', 't1');
  t1.initial = { at: 0, judgement: 'approve', reasoning: 'The deliverables look complete.', confidence: 'high', hintsUsed: 0 };
  t1.selfCheck['initial:c-output'] = true;
  const classify = { 'i-platform': 'output', 'i-guide': 'output', 'i-training': 'output', 'i-find': 'outcome', 'i-enquiries': 'outcome', 'i-workload': 'output' };
  const answers = { judgement: 'approve' as const, parts: { classify } };
  t1.attempts.push({ at: 1, answers, confidence: 'high', hintsUsed: 0 });
  t1.attempts.push({ at: 2, answers: { ...answers, judgement: 'revise' }, confidence: 'high', hintsUsed: 1 });
  t1.hintsShown = 1;
  ensureTransfer(p, 'coursehub', 'A').submitted = {
    at: 3,
    answers: { parts: { duration: '12', 'critical-path': ['A', 'B', 'D', 'E'], why: 'B now finishes later.' } },
    confidence: 'low',
    hintsUsed: 0,
  };
  ensureCase(p, 'coursehub').reflection = 'Claim 4 sounded convincing.';
  return p;
}

describe('review summary', () => {
  it('keeps the initial judgement, the revision and hint use', () => {
    const s = buildSummary(COURSEHUB, sampleProgress());
    expect(s.tasks[0]).toMatchObject({
      initialJudgement: 'approve', initialFit: 'differs',
      latestJudgement: 'revise', latestFit: 'expected',
      revisions: 1, hintsUsed: 1, firstConfidence: 'high',
    });
    expect(s.tasks[0].initialReasoning).toMatchObject({ answer: 'The deliverables look complete.', ticked: 1, total: 4 });
    expect(s.tasks[0].auto[0].first).toMatchObject({ matched: 5, total: 6 });
    expect(s.transfer[0].auto.every((a) => a.fit === 'expected')).toBe(true);
    expect(s.transfer[1].submitted).toBe(false);
  });

  it('exports a readable text file with the guided and independent results kept apart', () => {
    const text = summaryText(COURSEHUB, sampleProgress(), new Date(2026, 10, 26));
    const guided = text.indexOf('PRACTICE RESULTS');
    const independent = text.indexOf('INDEPENDENT CHALLENGE');
    expect(guided).toBeGreaterThan(0);
    expect(independent).toBeGreaterThan(guided);
    expect(text).toContain('Initial judgement: Approve (differs from the model answer)');
    expect(text).toContain('Initial reasoning: The deliverables look complete.');
    expect(text).toContain('Judgement after feedback: Revise (matches the model answer)');
    expect(text).toContain('Claim 4 sounded convincing.');
    expect(text).toContain('self-assessed, not checked automatically');
    expect(text).not.toMatch(/score|exam|certified|mastered/i);
    expect(text).not.toMatch(/[–—−]/);
  });
});
