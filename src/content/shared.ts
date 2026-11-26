import type { Confidence, Fit, JudgementId } from './types';

// Interface wording shared by all cases.

export const JUDGEMENT_OPTIONS: { id: JudgementId; label: string; description: string }[] = [
  { id: 'approve', label: 'Approve', description: 'The claim is sound as written.' },
  { id: 'revise', label: 'Revise', description: 'The claim needs to be changed.' },
  { id: 'more-info', label: 'Need more information', description: 'The case does not let me judge this yet.' },
];

export const STAGE1 = {
  title: 'Your initial judgement',
  question: 'Would you approve this claim as written?',
  reasoningPrompt: 'In one or two sentences, explain your judgement.',
  reasoningPlaceholder: 'I would … because …',
  submit: 'Submit initial judgement',
  reasoningTooShort: 'Write one or two sentences in your own words before you continue.',
  recorded: 'Recorded. You can still change your judgement after the feedback; this first judgement stays in your summary.',
};

export const STAGE2 = {
  title: 'Check the details',
  intro: 'Now work through the details of the claim. Then submit to compare your review with the feedback.',
  submit: 'Submit and see feedback',
  submitRevised: 'Submit revised review',
  revisedJudgement: 'Your judgement after feedback',
  revisionNote: 'What changed your judgement?',
  revisionNoteHint: 'Optional. A sentence or two for your own reflection; it appears in your summary.',
};

export const CONFIDENCE_OPTIONS: { id: Confidence; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
];

export const CONFIDENCE_NOTE = 'For your own reflection only. It does not affect any result.';

/** How a result is described. Always shown as text with a symbol, never by colour alone. */
export const FIT_LABELS: Record<Fit, { symbol: string; label: string }> = {
  expected: { symbol: '✓', label: 'Matches the model answer' },
  acceptable: { symbol: '✓', label: 'A defensible alternative' },
  partly: { symbol: '◐', label: 'Partly matches' },
  differs: { symbol: '✗', label: 'Differs from the model answer' },
};

export const AUTO_CHECK_LABEL = 'Checked automatically';
export const SELF_CHECK_LABEL = 'Self-assessed: not checked automatically';
export const SELF_CHECK_NOTE =
  'Compare your answer with the model explanation and tick the points your answer covers. Different wording can be just as good.';

export const FEEDBACK_HEADINGS = {
  summary: 'What was sound or problematic',
  evidence: 'Which case evidence matters',
  concept: 'Course concept',
  betterProposal: 'What a better proposal would say',
  details: 'Evidence, course concept and sources',
  more: 'More detail',
};
