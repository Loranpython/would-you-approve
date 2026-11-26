// Introduction, research connection, teacher note and credits.

export const SITE_TITLE = 'Would You Approve This?';
export const SITE_SUBTITLE = 'Review an AI-generated project proposal';

export const INTRO = {
  lead:
    'A project team has used an AI assistant to draft a proposal for CourseHub, a pilot learning platform. The proposal reads well. Would you approve it, and could you justify your decision?',
  steps: [
    'Read a short case briefing.',
    'Review six claims from the proposal. Some are sound; some need revision.',
    'Judge each claim first, then check the details and compare with the feedback.',
    'Finish with an independent challenge.',
  ],
  practical: 'About 10–15 minutes. No account needed. Your answers stay in this browser.',
  /** The only disclaimer on the start page; the full text is on the About page and in the case file. */
  fictional: 'A fictional teaching case.',
  scope:
    'This is a practice activity, not a test. It does not measure your overall learning or your competence as a project manager.',
};

export const REFLECTION_PROMPT =
  'Which claim initially sounded convincing, and what evidence changed your judgement?';

/** “Why this activity?” Concise; refers to report sections, never to individual interviews. */
export const RESEARCH = {
  title: 'Why this activity?',
  paragraphs: [
    'Our group’s interview study explored TPK5100 students’ reported experiences of using generative AI in the course. Some accounts distinguished between following an AI explanation and being able to work on one’s own: an explanation could make sense while reading it, yet be hard to repeat or explain later (Section 4.2). Some accounts described handing decisions such as choosing work packages or ranking stakeholders to AI (Section 4.1).',
    'In the discussion we separate checking an answer (does it fit the case and the course material?) from checking understanding (can you explain or apply it without the AI response?) (Section 5.1). Section 5.3 suggests small teaching changes: comparing an AI answer with the original case, identifying a weak assumption and explaining a correction with course concepts, a short task without AI, and clear examples of acceptable AI assistance.',
    'This prototype puts those suggestions into practice. The guided tasks ask you to check AI-style claims against case evidence; Task 6 is an example of useful AI assistance; and the independent challenge asks you to apply the same concepts on your own.',
    'Limits: our study describes students’ reported experiences, not measured learning (Section 8.1). This prototype was developed afterwards, based on our findings and recommendations. Its educational effectiveness has not been tested.',
  ],
};

/** Optional note for teachers. Keep under about 150 words. */
export const TEACHERS = {
  title: 'For teachers',
  paragraphs: [
    'In a 15-minute seminar slot, students could work in pairs on two or three tasks (for example Tasks 3, 4 and 6) for about eight minutes, then complete Part A of the independent challenge on their own. Use the remaining time for a short plenary discussion. The activity runs in the browser, works offline and sends no data anywhere.',
  ],
  questions: [
    'Which claim sounded most convincing at first, and what in the case changed your view?',
    'Task 6 was sound. How do you decide when an AI suggestion is good enough to accept, and how would you acknowledge that you used it?',
  ],
};

export const CREDIT =
  'Developed by Group 35 for TPK5100 Applied Project Management. Content designed and reviewed by the group; code written with AI assistance (Claude Code).';

export const NOT_ENDORSED =
  'A student prototype. It is not an official NTNU resource, and its model answers are not official course answers.';

export const SOURCE_NOTE =
  'Course concepts are paraphrased from the TPK5100 lecture handouts and cited by PDF page and slide number. Slides are not reproduced here.';
