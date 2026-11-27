// Types for all educational content. The content itself lives in the other
// files in this folder, so that it can be reviewed without reading UI code.
// Each case (e.g. coursehub/) provides one CaseStudy; see cases.ts.

import type { ActivityInput } from '../logic/schedule';

/**
 * How far a piece of content has been checked.
 * - verified-against-handout: checked against Full-sett-of-handouts-.pdf
 * - verified-against-report:  checked against our Final_Report.pdf
 * - derived-from-brief:       taken from the group's build brief (e.g. fictional case facts)
 * - needs-review:             written for this prototype; a group member should check it
 */
export type Verification =
  | 'verified-against-handout'
  | 'verified-against-report'
  | 'derived-from-brief'
  | 'needs-review';

/** A citation of the lecture handouts or our report. */
export interface SourceRef {
  id: string;
  file: 'Full-sett-of-handouts-.pdf' | 'Final_Report.pdf';
  /** PDF page number printed at the bottom of the handout page. */
  pdfPage?: number;
  /** Lecturer's slide number(s) printed under each slide, e.g. "54" or "101-102". */
  slide?: string;
  /** Report section number, e.g. "5.3". */
  section?: string;
  /** Short paraphrase of what the source supports (never a long quotation). */
  topic: string;
  verification: Verification;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Case

export interface CaseFact {
  id: string;
  text: string;
  /** Who or what the fact is about, shown as a label (e.g. "IT service owner"). */
  label?: string;
  verification: Verification;
}

export interface CaseSection {
  id: string;
  title: string;
  facts: CaseFact[];
}

export interface ScheduleScenario {
  label: string;
  /** Change to one activity's duration; omit for the baseline. */
  change?: { activity: string; duration: number };
}

export interface CaseSchedule {
  title: string;
  assumptions: string[];
  network: ActivityInput[];
  /** Must include the id given in `baseline`. */
  scenarios: Record<string, ScheduleScenario>;
  baseline: string;
}

// ---------------------------------------------------------------------------
// Proposal

export interface ProposalSection {
  id: string;
  /** Review task that examines this section. */
  taskId: string;
  heading: string;
  /** Neutral sentences around the reviewed claim (optional). */
  before?: string;
  claim: string;
  after?: string;
  verification: Verification;
}

export interface Proposal {
  label: string;
  note: string;
  title: string;
  intro: string;
  sections: ProposalSection[];
}

// ---------------------------------------------------------------------------
// Tasks

export type JudgementId = 'approve' | 'revise' | 'more-info';
export type Confidence = 'low' | 'medium' | 'high';

/** How well an answer fits the model answer. Shown as text, never colour alone. */
export type Fit = 'expected' | 'acceptable' | 'partly' | 'differs';

export interface JudgementFeedback {
  fit: Fit;
  text: string;
}

export interface ChoiceOption {
  /** Stable id: correctness is tracked by id, never by position. */
  id: string;
  text: string;
  fit: Fit;
  /** Shown after submission next to this option. */
  feedback?: string;
}

export interface ClassifyItem {
  id: string;
  text: string;
  correct: string; // category id
  explanation: string;
}

export type SchedulePartQuestion =
  | { kind: 'duration' }
  | { kind: 'float'; activity: string };

export interface ChecklistItem {
  id: string;
  text: string;
}

export type TaskPart = (
  | {
      kind: 'single';
      id: string;
      prompt: string;
      options: ChoiceOption[];
      shuffle?: boolean;
    }
  | {
      kind: 'multi';
      id: string;
      prompt: string;
      /** fit 'expected' = should be selected; 'differs' = should not be selected. */
      options: ChoiceOption[];
      shuffle?: boolean;
    }
  | {
      kind: 'classify';
      id: string;
      prompt: string;
      categories: { id: string; label: string }[];
      items: ClassifyItem[];
      shuffle?: boolean;
    }
  | {
      kind: 'number';
      id: string;
      prompt: string;
      unit: string;
      /** Scenario id from the case schedule. */
      scenario: string;
      question: SchedulePartQuestion;
    }
  | {
      kind: 'path';
      id: string;
      prompt: string;
      scenario: string;
    }
  | {
      /** Yes/no: does `scenario` finish later than `compareWith`? Answer derived from the schedule. */
      kind: 'delay';
      id: string;
      prompt: string;
      scenario: string;
      compareWith: string;
    }
  | {
      kind: 'text';
      id: string;
      prompt: string;
      placeholder?: string;
      /** Shown after submission. May contain schedule placeholders (see logic/scenarios.ts). */
      modelAnswer?: string;
      /** Self-assessment only: never scored automatically. */
      checklist?: ChecklistItem[];
    }
) & {
  /** Short name used in results, e.g. "Classification" or "Critical path". */
  label: string;
  verification: Verification;
};

export type PartKind = TaskPart['kind'];

export interface Hint {
  text: string;
  verification: Verification;
}

export interface TaskFeedback {
  /** 1. What was sound or problematic? */
  summary: string;
  /** 2. Which case evidence matters? */
  evidence: string;
  /** 3. Which course concept explains the issue? */
  concept: string;
  conceptSources: string[]; // SourceRef ids
  /** 4. What would a better proposal say? */
  betterProposal: string;
  /** Optional expansion ("More detail"). */
  more?: string[];
  /** Show the calculated schedule (table and diagram) for these scenarios with the feedback. */
  showSchedule?: string[];
  verification: Verification;
}

export interface ReviewTask {
  id: string;
  number: number;
  /** Neutral topic, shown before submission. Must not hint at the judgement. */
  title: string;
  /** The point of the task, shown only in the feedback after submission. */
  lesson: string;
  /** Case file sections worth opening (does not say which facts matter). Use 'schedule' for the network. */
  evidenceSections: string[];
  expectedJudgement: JudgementId;
  judgementFeedback: Record<JudgementId, JudgementFeedback>;
  /** Stage 1: model answer and checklist for the student's own reasoning about the judgement. */
  initialReasoning: { modelAnswer: string; checklist: ChecklistItem[]; verification: Verification };
  /** Stage 2: shown only after the initial judgement has been submitted. */
  parts: TaskPart[];
  hints: Hint[];
  feedback: TaskFeedback;
  /** Status of the claim and the expected judgement. */
  verification: Verification;
}

// ---------------------------------------------------------------------------
// Independent transfer challenge

export interface TransferPart {
  id: string;
  title: string;
  /** The changed situation, shown before the questions. */
  situation: string;
  /** Scenario whose network is shown with this part (durations only until submitted). */
  scenario?: string;
  parts: TaskPart[];
  /** Model explanation shown only after submission. May contain schedule placeholders. */
  modelExplanation: string[];
  checklist: ChecklistItem[];
  sources: string[];
  verification: Verification;
}

export interface TransferChallenge {
  title: string;
  intro: string;
  parts: TransferPart[];
}

// ---------------------------------------------------------------------------
// A complete case

export interface CaseStudy {
  /** URL-safe id, used in links and saved progress. */
  id: string;
  title: string;
  /** One or two sentences for the case list on the start page. */
  summary: string;
  disclaimer: string;
  /** The case briefing page: an intro paragraph, then these case sections in order, then the network. */
  briefing: { intro: string; sectionIds: string[] };
  /** Optional acknowledgement shown under Sources and credits. */
  credit?: string;
  sections: CaseSection[];
  schedule?: CaseSchedule;
  proposal: Proposal;
  tasks: ReviewTask[];
  transfer: TransferChallenge;
}
