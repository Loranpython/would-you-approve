import type { CaseStudy } from '../types';
import { CASE_BRIEFING_INTRO, CASE_DISCLAIMER, CASE_SCHEDULE, CASE_SECTIONS, CASE_TITLE } from './case';
import { PROPOSAL } from './proposal';
import { TASKS } from './tasks';
import { TRANSFER } from './transfer';

export const COURSEHUB: CaseStudy = {
  id: 'coursehub',
  title: CASE_TITLE,
  summary:
    'A faculty pilots one learning platform for one department. Review the project proposal before it goes to the sponsor.',
  disclaimer: CASE_DISCLAIMER,
  briefing: { intro: CASE_BRIEFING_INTRO, sectionIds: ['constraints', 'benefits', 'stakeholders', 'planning'] },
  credit: "Case inspired by the lecturer's illustration example (handouts PDF p. 47, slides 109-110).",
  sections: CASE_SECTIONS,
  schedule: CASE_SCHEDULE,
  proposal: PROPOSAL,
  tasks: TASKS,
  transfer: TRANSFER,
};
