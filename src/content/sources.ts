import type { SourceRef } from './types';

// Every citation used on the site. Page = PDF page printed at the bottom of the
// handout page; slide = lecturer's slide number printed under the slide.
// Topics are paraphrases. Do not paste slide text here.

const H = 'Full-sett-of-handouts-.pdf' as const;
const R = 'Final_Report.pdf' as const;

const list: SourceRef[] = [
  // --- Output and outcome -------------------------------------------------
  {
    id: 'it-system-output-outcome',
    file: H, pdfPage: 6, slide: '13',
    topic: 'Acquiring an IT system is about changing how people will work. Those changes are the outcome. Focus on both output and outcome.',
    verification: 'verified-against-handout',
  },
  {
    id: 'projects-create-value',
    file: H, pdfPage: 9, slide: '19',
    topic: 'Projects are not only about delivering output within time and cost. They are also efforts that create value.',
    verification: 'verified-against-handout',
  },
  {
    id: 'initiation-objectives',
    file: H, pdfPage: 33, slide: '78',
    topic: 'Initiation learning objectives: distinguish rationale, purpose, outcomes and outputs, and recognise both benefits and adverse effects when defining outcomes.',
    verification: 'verified-against-handout',
  },
  {
    id: 'charter-contents',
    file: H, pdfPage: 35, slide: '81',
    topic: 'Charter contents. Outcome: potential tangible and intangible gains for the organisation, end users and other stakeholders. Output: scope options with time and cost estimates.',
    verification: 'verified-against-handout',
    notes: 'The same list is repeated on PDF p. 39, slide 90.',
  },
  {
    id: 'outcome-definition',
    file: H, pdfPage: 37, slide: '85',
    topic: 'Outcome = intended benefits once the project results are in operation. An example outcome is a reduction in the number of inquiries.',
    verification: 'verified-against-handout',
  },
  {
    id: 'deliverables',
    file: H, pdfPage: 39, slide: '89',
    topic: 'Deliverables are the tangible results produced in the project. Developing and implementing training programmes is one of the examples.',
    verification: 'verified-against-handout',
  },

  // --- Success criteria and factors --------------------------------------
  {
    id: 'success-objectives',
    file: H, pdfPage: 40, slide: '92',
    topic: 'Success lecture objectives, including: explain how the timing of an assessment changes the conclusion.',
    verification: 'verified-against-handout',
  },
  {
    id: 'success-provisional',
    file: H, pdfPage: 42, slide: '97',
    topic: 'Case lessons: separate delivery performance from lasting impact. Success is provisional and depends on time and evidence.',
    verification: 'verified-against-handout',
  },
  {
    id: 'success-criteria-questions',
    file: H, pdfPage: 43, slide: '101-102',
    topic: 'Judging success: which criteria or indicators, who assesses, how to measure and when to assess, with typical criteria.',
    verification: 'verified-against-handout',
  },
  {
    id: 'success-when',
    file: H, pdfPage: 45, slide: '105-106',
    topic: 'When to assess success (at handover, after one year, later), and reasons for defining success criteria up front.',
    verification: 'verified-against-handout',
  },
  {
    id: 'success-framework',
    file: H, pdfPage: 46, slide: '108',
    topic: 'Success framework: project management success (delivered according to plan?), process success (was the work carried out well?), project success (did the project create the intended value?).',
    verification: 'verified-against-handout',
  },
  {
    id: 'success-illustration',
    file: H, pdfPage: 47, slide: '109-110',
    topic: "The lecturer's own illustration: success criteria, evidence and timing for a university digital learning platform.",
    verification: 'verified-against-handout',
    notes: 'Close to the CourseHub case. Used to check our classifications, not reproduced on the site.',
  },
  {
    id: 'success-factors-objectives',
    file: H, pdfPage: 48, slide: '111',
    topic: 'Lecture 5 learning outcome: distinguish success factors from success criteria and performance indicators.',
    verification: 'verified-against-handout',
  },
  {
    id: 'success-factors-definition',
    file: H, pdfPage: 49, slide: '113-114',
    topic: 'Success factors are ground rules to follow during planning and execution. Listing them does not guarantee success. They must be translated into concrete activities and decisions.',
    verification: 'verified-against-handout',
  },

  // --- Stakeholders --------------------------------------------------------
  {
    id: 'stakeholder-mapping',
    file: H, pdfPage: 25, slide: '50-51',
    topic: 'Mapping stakeholders by capacity to influence the project (how much you need them) and by interest. Influence can come from approvals, permissions and resources.',
    verification: 'verified-against-handout',
  },
  {
    id: 'stakeholder-classification',
    file: H, pdfPage: 26, slide: '53',
    topic: 'Classification by influence (critical / marginal) and interest (small / large) into groups G1-G4.',
    verification: 'verified-against-handout',
  },
  {
    id: 'stakeholder-strategies',
    file: H, pdfPage: 27, slide: '54',
    topic: 'Strategies: G1 Collaborate, G2 Satisfy, G3 Inform, G4 Monitor.',
    verification: 'verified-against-handout',
  },
  {
    id: 'support-sabotage',
    file: H, pdfPage: 27, slide: '56',
    topic: 'Support-sabotage scale, from full support through neutrality and "go slowly" to deliberate sabotage.',
    verification: 'verified-against-handout',
  },
  {
    id: 'support-influence',
    file: H, pdfPage: 28, slide: '57',
    topic: 'Support × influence: key stakeholders (involve), non-supportive stakeholders (reduce dependency), supportive stakeholders (maintain support), marginal stakeholders (observe).',
    verification: 'verified-against-handout',
  },
  {
    id: 'lifecycle-beyond-delivery',
    file: H, pdfPage: 28, slide: '59',
    topic: 'Life-cycle learning objective: explain why the life-cycle view should extend beyond delivery into operation and use.',
    verification: 'verified-against-handout',
  },

  // --- Scheduling ----------------------------------------------------------
  {
    id: 'critical-path',
    file: H, pdfPage: 96, slide: '220',
    topic: 'Forward and backward pass. The critical path is the longest path through the network and determines the shortest project duration.',
    verification: 'verified-against-handout',
  },
  {
    id: 'pass-rules',
    file: H, pdfPage: 96, slide: '221',
    topic: 'Forward and backward pass rules for ES, EF, LS and LF.',
    verification: 'verified-against-handout',
    notes: 'The activity states the standard merge-point rule. See docs/OPEN_QUESTIONS.md, Q1, for a wording issue on this slide.',
  },
  {
    id: 'float',
    file: H, pdfPage: 98, slide: '225',
    topic: 'Calculating float/slack in the network (shown as LS - ES in the worked example).',
    verification: 'verified-against-handout',
  },

  // --- Risk ------------------------------------------------------------------
  {
    id: 'risk-objectives',
    file: H, pdfPage: 124, slide: '280',
    topic: 'Risk lecture objectives: select and justify responses (acceptance, reduction, sharing, transfer, avoidance), and maintain a risk register with clear ownership, response timing and current status.',
    verification: 'verified-against-handout',
    notes: 'The brief cited slide 279. On PDF p. 124 the objectives are printed as slide 280 (slide 279 is the title slide on p. 123).',
  },
  {
    id: 'threat-responses',
    file: H, pdfPage: 130, slide: '292-293',
    topic: 'Threat responses: accept, reduce (minimise), transfer/share, avoid. Assign an owner, monitor and review responses, and escalate when a response exceeds the project\'s authority.',
    verification: 'verified-against-handout',
  },
  {
    id: 'contingency-plans',
    file: H, pdfPage: 131, slide: '295',
    topic: 'Risk mitigation methods, including contingency plans and having backup.',
    verification: 'verified-against-handout',
    notes: 'The brief cited slide 294, which covers responses to opportunities. "Contingency plans" appears on slide 295.',
  },
  {
    id: 'risk-register',
    file: H, pdfPage: 132, slide: '296',
    topic: 'Risk register: description, responsible person, probability, consequences, when and what measures, status.',
    verification: 'verified-against-handout',
  },

  // --- Our report ------------------------------------------------------------
  {
    id: 'report-4-1',
    file: R, section: '4.1',
    topic: 'Students kept some decisions and handed others, such as choosing work packages or stakeholder priorities, to AI.',
    verification: 'verified-against-report',
  },
  {
    id: 'report-4-2',
    file: R, section: '4.2',
    topic: 'Clear explanations did not always lead to lasting understanding.',
    verification: 'verified-against-report',
  },
  {
    id: 'report-4-5',
    file: R, section: '4.5',
    topic: 'Students suggested more exercises that need their own reasoning, examples of acceptable AI help, and comparing an AI answer with the original case.',
    verification: 'verified-against-report',
  },
  {
    id: 'report-5-1',
    file: R, section: '5.1',
    topic: 'Checking an answer (does it fit the case and course material?) is different from checking understanding (can you explain or apply it without the AI response?).',
    verification: 'verified-against-report',
  },
  {
    id: 'report-5-3',
    file: R, section: '5.3',
    topic: 'Three suggested small teaching changes: a short task without AI, a comparison of an AI answer with the original case (find a weak assumption and explain a correction), and clear examples of acceptable AI assistance. Their effectiveness was not tested.',
    verification: 'verified-against-report',
  },
  {
    id: 'report-8-1',
    file: R, section: '8.1',
    topic: 'Conclusion: findings describe perceived, not measured, learning. Small teaching changes could make the learning goal more visible.',
    verification: 'verified-against-report',
  },
];

export const SOURCES: Record<string, SourceRef> = Object.fromEntries(list.map((s) => [s.id, s]));

/** "Full-sett-of-handouts-.pdf, PDF p. 27, slide 54" or "Final report, Section 5.3". */
export function formatSource(ref: SourceRef): string {
  if (ref.file === 'Final_Report.pdf') return `Final report, Section ${ref.section}`;
  const slideLabel = ref.slide && /[–-]/.test(ref.slide) ? 'slides' : 'slide';
  return `Lecture handouts, PDF p. ${ref.pdfPage}, ${slideLabel} ${ref.slide}`;
}

export function getSource(id: string): SourceRef {
  const ref = SOURCES[id];
  if (!ref) throw new Error(`Unknown source id: ${id}`);
  return ref;
}
