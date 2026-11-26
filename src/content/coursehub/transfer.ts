import type { TransferChallenge } from '../types';

// The independent challenge. No hints are offered, and model explanations
// stay hidden until the part has been submitted.

export const TRANSFER: TransferChallenge = {
  title: 'Independent challenge',
  intro:
    'The situation has changed. Apply the same concepts on your own: no hints, and no model answers until you submit. The case file stays available.',
  parts: [
    {
      id: 'A',
      title: 'Part A: A changed schedule',
      situation:
        'Activity B (prepare and deliver staff training) now takes 5 working days instead of 3. All other durations and dependencies stay the same.',
      scenario: 'bPlus2',
      parts: [
        {
          kind: 'number',
          id: 'duration',
          label: 'New project duration',
          prompt: 'What is the new project duration?',
          unit: 'working days',
          scenario: 'bPlus2',
          question: { kind: 'duration' },
          verification: 'derived-from-brief',
        },
        {
          kind: 'path',
          id: 'critical-path',
          label: 'New critical path',
          prompt: 'Build the new critical path by selecting the activities in order.',
          scenario: 'bPlus2',
          verification: 'derived-from-brief',
        },
        {
          kind: 'text',
          id: 'why',
          label: 'Why the path changed',
          prompt: 'Why has the critical path changed?',
          placeholder: 'The critical path changed because …',
          modelAnswer:
            'D cannot start until both B and C have finished. B now finishes on day {ef:bPlus2:B} and C on day {ef:bPlus2:C}, so B’s branch now sets D’s start (day {es:bPlus2:D}). The path {paths:bPlus2} is now the longest path, at {duration:bPlus2} working days, and C now has {float:bPlus2:C|days} of float.',
          checklist: [
            { id: 'c-merge', text: 'Explains that D waits for both B and C.' },
            { id: 'c-later', text: 'Says that B’s branch now finishes later than C’s.' },
            { id: 'c-float', text: 'Notes that C now has float.' },
          ],
          verification: 'derived-from-brief',
        },
      ],
      modelExplanation: [
        'With B at 5 days, the project takes {duration:bPlus2} working days and the critical path is {paths:bPlus2}.',
        'The change is at the merge point before D: B now finishes on day {ef:bPlus2:B}, after C (day {ef:bPlus2:C}), so D’s earliest start moves to day {es:bPlus2:D}. C, which was critical in the baseline, now has {float:bPlus2:C|days} of float.',
      ],
      checklist: [],
      sources: ['critical-path', 'pass-rules', 'float'],
      verification: 'derived-from-brief',
    },
    {
      id: 'B',
      title: 'Part B: Changed evidence about success',
      situation:
        'The platform launched on time and within budget. Two months later, few teaching staff maintain their pages and students still rely on the old channels.',
      parts: [
        {
          kind: 'text',
          id: 'pm-success',
          label: 'Project management success',
          prompt: 'What does this tell us about project management success?',
          placeholder: 'On project management success …',
          verification: 'derived-from-brief',
        },
        {
          kind: 'text',
          id: 'project-success',
          label: 'Project success',
          prompt: 'What remains uncertain or problematic about project success?',
          placeholder: 'On project success …',
          verification: 'derived-from-brief',
        },
        {
          kind: 'text',
          id: 'evidence-next',
          label: 'Evidence to examine next',
          prompt: 'What evidence would you examine next?',
          placeholder: 'I would look at …',
          verification: 'derived-from-brief',
        },
      ],
      modelExplanation: [
        'Project management success looks largely achieved: the pilot was delivered on time and within budget. Scope and specifications are not mentioned, so that part is not yet known.',
        'Project success is currently problematic: few staff maintain their pages and students still use the old channels, so adoption is low. But two months may be too early for a final conclusion: the timing of an assessment can change the conclusion, and two months is earlier than the point at which the lecturer’s own digital learning platform example assesses adoption (one semester after launch; PDF p. 47, slide 110).',
        'Delivery success does not guarantee value. A project can be well managed and still not, or not yet, create the benefits it was meant to.',
        'Evidence to examine next: usage data; teaching staff’s maintenance workload and their reasons for not participating; whether the old channels are still active; feedback from students, including students with accessibility requirements; and whether repetitive questions to staff have changed.',
      ],
      checklist: [
        { id: 'c-pm', text: 'Says that on time and within budget points to project management success, while scope and specifications are not stated.' },
        { id: 'c-adoption', text: 'Says that project success is in doubt because adoption is low.' },
        { id: 'c-timing', text: 'Notes that two months may be too early for a final judgement.' },
        { id: 'c-separate', text: 'Keeps delivery success separate from the value created.' },
        { id: 'c-evidence', text: 'Names concrete evidence to examine next, beyond “ask the users”.' },
      ],
      sources: ['success-framework', 'success-objectives', 'success-when', 'success-provisional', 'success-illustration'],
      verification: 'derived-from-brief',
    },
  ],
};
