import type { CaseSchedule, CaseSection } from '../types';

// The CourseHub case. Everything here is fictional teaching content.

export const CASE_TITLE = 'CourseHub: a pilot learning platform';

export const CASE_DISCLAIMER =
  'A fictional teaching case. All names, numbers and events are invented. They do not describe real NTNU systems or the participants in our study.';

/** Opening paragraph of the case briefing. Paraphrases the Background facts below. */
export const CASE_BRIEFING_INTRO =
  'A university faculty spreads course information across several separate systems. Students struggle to find the latest information about their courses, and staff answer the same administrative questions again and again. The faculty has therefore commissioned a pilot of one digital learning platform, CourseHub, for one department. You are asked to review the project proposal before it goes to the faculty sponsor.';

export const CASE_SECTIONS: CaseSection[] = [
  {
    id: 'background',
    title: 'Background',
    facts: [
      {
        id: 'bg-systems',
        text: 'A university faculty currently spreads course information across several separate systems.',
        verification: 'derived-from-brief',
      },
      {
        id: 'bg-students',
        text: 'Students struggle to find the latest information about their courses.',
        verification: 'derived-from-brief',
      },
      {
        id: 'bg-staff',
        text: 'Staff repeatedly answer the same administrative questions.',
        verification: 'derived-from-brief',
      },
      {
        id: 'bg-pilot',
        text: 'The faculty has commissioned a pilot of one digital learning platform, CourseHub, for one department.',
        verification: 'derived-from-brief',
      },
    ],
  },
  {
    id: 'constraints',
    title: 'Constraints and scope',
    facts: [
      {
        id: 'c-deadline',
        text: 'The pilot must be ready before the next teaching period starts.',
        verification: 'derived-from-brief',
      },
      {
        id: 'c-budget',
        text: 'The approved budget is NOK 400,000.',
        verification: 'derived-from-brief',
      },
      {
        id: 'c-one-department',
        text: 'The project covers one department.',
        verification: 'derived-from-brief',
      },
      {
        id: 'c-no-rollout',
        text: 'Institution-wide rollout is outside the approved scope.',
        verification: 'derived-from-brief',
      },
      {
        id: 'c-includes',
        text: 'The project includes configuration, testing, staff preparation and the pilot launch.',
        verification: 'derived-from-brief',
      },
    ],
  },
  {
    id: 'benefits',
    title: 'Intended benefits',
    facts: [
      {
        id: 'b-find',
        text: 'Students can find current course information more easily.',
        verification: 'derived-from-brief',
      },
      {
        id: 'b-enquiries',
        text: 'Staff spend less time answering repetitive administrative questions.',
        verification: 'derived-from-brief',
      },
    ],
  },
  {
    id: 'stakeholders',
    title: 'Stakeholders',
    facts: [
      {
        id: 's-sponsor',
        label: 'Faculty sponsor',
        text: 'Authorises funding and approves major scope changes.',
        verification: 'derived-from-brief',
      },
      {
        id: 's-it-approval',
        label: 'IT service owner',
        text: 'Must approve the integration and can block the launch.',
        verification: 'derived-from-brief',
      },
      {
        id: 's-it-capacity',
        label: 'IT',
        text: 'Has limited capacity and competing operational priorities. IT did not ask for the pilot and is not actively following it.',
        verification: 'derived-from-brief',
      },
      {
        id: 's-staff',
        label: 'Teaching staff',
        text: 'Must maintain course content after launch; adoption depends on their participation. Some have raised concerns about the extra time needed to keep pages up to date.',
        verification: 'derived-from-brief',
      },
      {
        id: 's-students',
        label: 'Student representatives',
        text: 'Provide usability feedback and communicate student needs.',
        verification: 'derived-from-brief',
      },
      {
        id: 's-accessibility',
        label: 'Students with accessibility requirements',
        text: "Must be included in the pilot's usability work.",
        verification: 'derived-from-brief',
      },
    ],
  },
  {
    id: 'planning',
    title: 'Planning notes',
    facts: [
      {
        id: 'p-it-availability',
        label: 'IT staff for configuration',
        text: '“The project manager expects availability, but IT has not yet confirmed it.”',
        verification: 'derived-from-brief',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Schedule network. All dates, durations, floats and critical paths shown on
// the site are calculated from this data by logic/schedule.ts.

export const CASE_SCHEDULE: CaseSchedule = {
  title: 'Activity network',
  assumptions: [
    'Finish-to-start dependencies',
    'No lags between activities',
    'No resource constraints',
    'The project starts at day 0',
    'Durations are in working days',
  ],
  network: [
    { id: 'A', name: 'Define requirements', duration: 2, predecessors: [] },
    { id: 'B', name: 'Prepare training materials', duration: 3, predecessors: ['A'] },
    { id: 'C', name: 'Configure platform', duration: 4, predecessors: ['A'] },
    { id: 'D', name: 'Conduct pilot testing', duration: 2, predecessors: ['B', 'C'] },
    { id: 'E', name: 'Prepare and complete launch', duration: 3, predecessors: ['D'] },
  ],
  baseline: 'baseline',
  // Changed versions of the network used by the tasks.
  scenarios: {
    baseline: { label: 'Baseline plan' },
    bPlus1: { label: 'B takes 4 days', change: { activity: 'B', duration: 4 } },
    bPlus2: { label: 'B takes 5 days', change: { activity: 'B', duration: 5 } },
  },
};
