import type { Proposal } from '../types';

// The simulated AI-generated proposal: teaching content with deliberately
// chosen strengths and errors, prepared by the project group. Some claims are
// sound, some need revision.

export const PROPOSAL: Proposal = {
  label: 'Simulated AI-generated proposal',
  note: 'Simulated proposal with deliberately chosen strengths and errors, prepared by the project group.',
  title: 'Project proposal: CourseHub pilot',
  intro:
    'CourseHub will bring course information for one department together in one place, so that students and staff no longer need to search several systems. This proposal sets out the expected results, how success will be judged, stakeholder engagement, the schedule, resources and readiness, and next steps.',
  sections: [
    {
      id: 'p-results',
      taskId: 't1',
      heading: '1. Expected results',
      before: 'The pilot will be delivered for one department before the next teaching period, within the approved budget.',
      claim: 'Our main outcome is a configured platform, a staff guide and a completed training session.',
      verification: 'derived-from-brief',
    },
    {
      id: 'p-success',
      taskId: 't2',
      heading: '2. Success criteria',
      claim: 'Our success criteria are early stakeholder involvement, clear responsibilities and regular communication.',
      after: 'They will be presented to the faculty sponsor for approval.',
      verification: 'derived-from-brief',
    },
    {
      id: 'p-stakeholders',
      taskId: 't3',
      heading: '3. Stakeholder engagement',
      before:
        'The faculty sponsor will receive monthly status updates. Teaching staff, student representatives and students with accessibility requirements will take part in usability testing.',
      claim: 'IT has limited interest in the pilot, so it should only be monitored and contacted shortly before launch.',
      verification: 'derived-from-brief',
    },
    {
      id: 'p-schedule',
      taskId: 't4',
      heading: '4. Schedule',
      before: 'The plan has five activities with finish-to-start dependencies, shown in the network in the case file.',
      claim: 'Training is essential for success, so activity B is critical. Any delay in B will delay the whole project.',
      verification: 'derived-from-brief',
    },
    {
      id: 'p-resources',
      taskId: 't5',
      heading: '5. Resources and readiness',
      claim: 'IT has confirmed that the required staff will be available during configuration.',
      after: 'Configuration can therefore start as soon as the requirements are defined.',
      verification: 'derived-from-brief',
    },
    {
      id: 'p-next',
      taskId: 't6',
      heading: '6. Beyond the pilot',
      claim:
        'Before any institution-wide rollout, the team should evaluate pilot use and benefits and obtain approval for the additional scope.',
      verification: 'derived-from-brief',
    },
  ],
};
