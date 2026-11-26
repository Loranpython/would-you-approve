import type { ReviewTask } from '../types';

// The six guided review tasks.
//
// Editing notes for the group:
// - Option, item and checklist ids must stay stable; saved answers refer to them.
// - If you change what a task asks, raise CONTENT_VERSION in content/version.ts.
// - Stage 1 (initial judgement + reasoning) is shared by all tasks; `parts`
//   are Stage 2 and stay hidden until Stage 1 has been submitted.
// - Text in curly braces such as {float:baseline:B|days} is filled in from the
//   schedule calculation. See logic/scenarios.ts for the list.

export const TASKS: ReviewTask[] = [
  // -------------------------------------------------------------------------
  {
    id: 't1',
    number: 1,
    title: 'Expected results',
    lesson: 'Outputs are what the project delivers; outcomes are what changes when they are used.',
    evidenceSections: ['background', 'benefits', 'stakeholders'],
    expectedJudgement: 'revise',
    judgementFeedback: {
      approve: {
        fit: 'differs',
        text: 'The three items are useful, but calling them the main outcome mixes up two different things. Compare them with the intended benefits in the case.',
      },
      revise: {
        fit: 'expected',
        text: 'The deliverables are fine. Their classification needs revising.',
      },
      'more-info': {
        fit: 'differs',
        text: 'The case already states what the faculty wants to achieve, which is enough to see that these items are outputs rather than outcomes.',
      },
    },
    initialReasoning: {
      modelAnswer:
        'The configured platform, the guide and the delivered training are outputs: what the project produces. The outcomes are the effects of using them, such as students finding information more easily, and they can be adverse, such as extra maintenance work for teaching staff.',
      checklist: [
        { id: 'c-output', text: 'Says that outputs are what the project produces or delivers.' },
        { id: 'c-outcome', text: 'Says that outcomes are the effects or changes that follow when the outputs are used.' },
        { id: 'c-example', text: 'Uses an example from the CourseHub case.' },
        { id: 'c-adverse', text: 'Recognises that outcomes can be adverse as well as beneficial.' },
      ],
      verification: 'needs-review',
    },
    parts: [
      {
        kind: 'classify',
        id: 'classify',
        label: 'Classification',
        prompt: 'Classify each item as an output or an outcome of the CourseHub pilot.',
        categories: [
          { id: 'output', label: 'Output' },
          { id: 'outcome', label: 'Outcome' },
        ],
        shuffle: true,
        items: [
          {
            id: 'i-platform',
            text: 'A configured CourseHub platform for the department',
            correct: 'output',
            explanation: 'Something the project produces and hands over.',
          },
          {
            id: 'i-guide',
            text: 'A staff guide for updating course pages',
            correct: 'output',
            explanation: 'A deliverable produced by the project.',
          },
          {
            id: 'i-training',
            text: 'A delivered training session for teaching staff',
            correct: 'output',
            explanation:
              'Still an output, even though it is not a physical object. The lecturer lists developing and implementing training programmes as an example of a deliverable.',
          },
          {
            id: 'i-find',
            text: 'Students find current course information more easily',
            correct: 'outcome',
            explanation: 'A change that happens when the platform is used. It is one of the intended benefits.',
          },
          {
            id: 'i-enquiries',
            text: 'Staff receive fewer repetitive administrative questions',
            correct: 'outcome',
            explanation: 'An effect of using the platform. It is one of the intended benefits.',
          },
          {
            id: 'i-workload',
            text: 'Teaching staff spend extra time keeping course pages up to date',
            correct: 'outcome',
            explanation:
              'An adverse outcome: an effect of using the platform that the faculty did not want. Outcomes can be negative as well as positive.',
          },
        ],
        verification: 'needs-review',
      },
    ],
    hints: [
      {
        text: 'Compare the items in the claim with the intended benefits in the case file. What kind of thing is each of them?',
        verification: 'derived-from-brief', // wording supplied by the group
      },
      {
        text: 'For each item, ask: is this something the project hands over, or something that changes once people start using what was handed over?',
        verification: 'needs-review',
      },
    ],
    feedback: {
      summary:
        'The deliverables are sensible. The problem is the label: a configured platform, a staff guide and a delivered training session are outputs, not outcomes.',
      evidence:
        'Given the information in this case, the faculty wants students to find current course information more easily and staff to spend less time on repetitive questions. Those are the outcomes it is paying for. Teaching staff have also raised concerns about the time needed to keep pages up to date, which points to a possible adverse outcome.',
      concept:
        "In the lecturer's terms, the outcome is the potential gains of the project for the organisation, end users and other stakeholders once the results are in use. The output is what the project delivers. Deliverables are the tangible results produced in the project, and developing and implementing training programmes is one of the lecturer's examples. The initiation objectives also ask you to keep outcomes and outputs apart and to recognise adverse effects as well as benefits.",
      conceptSources: ['initiation-objectives', 'charter-contents', 'outcome-definition', 'deliverables'],
      betterProposal:
        '“The project will deliver a configured platform, a staff guide and a training session for teaching staff (outputs). The intended outcomes are that students find current course information more easily and that staff receive fewer repetitive questions. A possible adverse outcome is extra maintenance work for teaching staff, which we will monitor.”',
      more: [
        'Why this matters: a proposal that treats its outputs as the outcome can declare success on launch day, even if nobody uses the platform. Naming the outcomes makes it possible to check later whether the pilot delivered its value.',
        'The lecturer makes the same point about IT projects in general: acquiring an IT system is about changing the way people will work, so the team should pay attention to both output and outcome (PDF p. 6, slide 13).',
      ],
      verification: 'verified-against-handout',
    },
    verification: 'derived-from-brief',
  },

  // -------------------------------------------------------------------------
  {
    id: 't2',
    number: 2,
    title: 'Success criteria',
    lesson: 'Success factors make success more likely; success criteria are how success is judged.',
    evidenceSections: ['constraints', 'benefits', 'stakeholders'],
    expectedJudgement: 'revise',
    judgementFeedback: {
      approve: {
        fit: 'differs',
        text: 'These are sensible practices, but they describe how the team will work, not how anyone will judge whether the pilot succeeded.',
      },
      revise: {
        fit: 'expected',
        text: 'The three items are useful, but they are success factors, not success criteria.',
      },
      'more-info': {
        fit: 'differs',
        text: 'The case gives enough information to see the problem: the items describe conditions for success, not standards for judging it.',
      },
    },
    initialReasoning: {
      modelAnswer:
        'Early involvement, clear responsibilities and regular communication describe how the team will work. They are success factors: they make success more likely, but they do not say how anyone will judge afterwards whether the pilot succeeded.',
      checklist: [
        { id: 'c-factors', text: 'Recognises the items as ways of working or conditions for success (success factors).' },
        { id: 'c-criteria', text: 'Says that success criteria describe how success will be judged afterwards.' },
      ],
      verification: 'needs-review',
    },
    parts: [
      {
        kind: 'single',
        id: 'what-are-they',
        label: 'Type of statement',
        prompt: 'What are “early stakeholder involvement, clear responsibilities and regular communication”?',
        shuffle: true,
        options: [
          {
            id: 'factors',
            text: 'Success factors: conditions or ground rules that make success more likely',
            fit: 'expected',
            feedback: 'Yes. They describe how the team intends to work.',
          },
          {
            id: 'criteria',
            text: 'Success criteria: standards used to judge whether the project succeeded',
            fit: 'differs',
            feedback: 'This is what the proposal claims. A criterion would say what is judged afterwards, by whom, how and when.',
          },
          {
            id: 'outcomes',
            text: 'Outcomes: the effects that follow once students and staff use the platform',
            fit: 'differs',
            feedback: 'Outcomes are effects such as easier access to information. These items are ways of working during the project.',
          },
        ],
        verification: 'verified-against-handout',
      },
      {
        kind: 'classify',
        id: 'dimensions',
        label: 'Success dimensions',
        prompt: 'Match each success criterion to the dimension of success it belongs to.',
        categories: [
          { id: 'pm', label: 'Project management success' },
          { id: 'process', label: 'Process success' },
          { id: 'project', label: 'Project success' },
        ],
        shuffle: true,
        items: [
          {
            id: 'x-budget',
            text: 'The pilot launches within the approved budget and before the teaching period starts.',
            correct: 'pm',
            explanation: 'Was the project delivered according to plan? Time and cost.',
          },
          {
            id: 'x-accessibility',
            text: 'The accessibility requirements in the specification are met at launch.',
            correct: 'pm',
            explanation: 'Meeting the agreed specifications and compliance requirements is part of delivering according to plan.',
          },
          {
            id: 'x-collaboration',
            text: 'Teaching staff, IT operations staff and student representatives collaborated effectively during delivery.',
            correct: 'process',
            explanation: 'Was the work carried out well? Collaboration and communication during the project.',
          },
          {
            id: 'x-overload',
            text: 'Delivering the pilot did not overload the day-to-day work of IT operations.',
            correct: 'process',
            explanation: 'Workload and disruption caused by the work itself belong to process success.',
          },
          {
            id: 'x-adoption',
            text: 'Students and staff successfully use the platform after launch.',
            correct: 'project',
            explanation: 'Did the project create the intended value? Adoption is part of project success.',
          },
          {
            id: 'x-enquiries',
            text: 'Repetitive administrative questions to staff decrease after launch.',
            correct: 'project',
            explanation: 'One of the intended benefits, so it belongs to project success.',
          },
        ],
        verification: 'verified-against-handout',
      },
      {
        kind: 'text',
        id: 'reason',
        label: 'Success criterion',
        prompt:
          'Turn one of the proposal’s three items into a success criterion. Say what would be judged, how it would be measured, who would assess it and when.',
        placeholder: 'Criterion: … Measured by … Assessed by … When: …',
        modelAnswer:
          'Example: “Teaching staff, IT operations staff and student representatives judge that collaboration during delivery was effective (process success). Measured by a short survey and a review of the decision log; assessed by the project manager with the faculty sponsor; at handover.” The practice itself (“regular communication”) stays in the plan as a success factor.',
        checklist: [
          { id: 'c-judged', text: 'Describes something that will be judged, not something the team will do.' },
          { id: 'c-how', text: 'Says how it will be measured or what evidence will be used.' },
          { id: 'c-who', text: 'Says who will assess it.' },
          { id: 'c-when', text: 'Says when it will be assessed.' },
        ],
        verification: 'needs-review',
      },
    ],
    hints: [
      {
        text: 'For each item in the claim, ask: would you use it after the project to judge whether the project succeeded, or is it something the team does during the project?',
        verification: 'needs-review',
      },
      {
        text: 'A success criterion answers four questions: what is judged, who judges, how it is measured and when.',
        verification: 'verified-against-handout',
      },
    ],
    feedback: {
      summary:
        'Early involvement, clear responsibilities and regular communication are good practice, but they are success factors: conditions that make success more likely. They do not say how anyone will judge, afterwards, whether the pilot succeeded.',
      evidence:
        'Given the information in this case, the faculty wants a pilot that is ready before the next teaching period, stays within NOK 400,000, is used by students and staff, and reduces repetitive questions. Criteria should be built from these aims.',
      concept:
        'The lecturer describes success factors as ground rules to follow during planning and execution, and stresses that listing them does not guarantee success: they must be translated into concrete activities and decisions. Success criteria answer which criteria or indicators will be used, who assesses them, how they are measured and when. The success framework separates project management success (was it delivered according to plan?), process success (was the work carried out well?) and project success (did it create the intended value?).',
      conceptSources: [
        'success-factors-objectives',
        'success-factors-definition',
        'success-criteria-questions',
        'success-framework',
      ],
      betterProposal:
        '“Success factors: early stakeholder involvement, clear responsibilities and regular communication, each linked to concrete actions in the plan. Success criteria: delivered within NOK 400,000 before the teaching period (project management success, assessed at handover); stakeholders judge collaboration during delivery to have been effective (process success, assessed at handover); students and staff actively use CourseHub (project success, assessed after launch, with a measure, target and date agreed with the sponsor).”',
      more: [
        'Collaboration can appear on both sides, and that is not a trick. “Hold regular check-ins with IT operations” is a success factor: a practice the team commits to. “IT operations staff and teaching staff judge that collaboration during delivery was effective” is a process-success criterion: a judgement made afterwards. The question is whether you are describing what you will do, or how you will judge what happened.',
        'The criteria in the matching exercise are still broad. “Students and staff use the platform” needs an agreed measure (for example active use or course coverage), a target and an assessment date before anyone can say whether it was met. The lecturer’s own example for a digital learning platform assesses adoption one semester after launch, not at handover (PDF p. 47, slide 110).',
      ],
      verification: 'verified-against-handout',
    },
    verification: 'derived-from-brief',
  },

  // -------------------------------------------------------------------------
  {
    id: 't3',
    number: 3,
    title: 'Stakeholder engagement',
    lesson: 'Small interest does not mean marginal influence.',
    evidenceSections: ['stakeholders', 'planning'],
    expectedJudgement: 'revise',
    judgementFeedback: {
      approve: {
        fit: 'differs',
        text: 'The claim may read IT’s low interest correctly, but it ignores the IT service owner’s influence on the project.',
      },
      revise: {
        fit: 'expected',
        text: 'Interest in IT may be small, but the IT service owner’s influence is critical.',
      },
      'more-info': {
        fit: 'differs',
        text: 'The case already tells you what matters most: the IT service owner must approve the integration and can block the launch.',
      },
    },
    initialReasoning: {
      modelAnswer:
        'IT may show little interest, but the IT service owner must approve the integration and can block the launch, so their influence is critical. Only monitoring IT and contacting it shortly before launch is too little, too late.',
      checklist: [
        { id: 'c-approval', text: 'Mentions the IT service owner’s approval role or ability to block the launch.' },
        { id: 'c-influence', text: 'Separates small interest from the IT service owner’s critical influence.' },
      ],
      verification: 'needs-review',
    },
    parts: [
      {
        kind: 'multi',
        id: 'evidence',
        label: 'Relevant evidence',
        prompt: 'Which case evidence matters most when deciding how to engage IT (the IT service owner and IT operations staff)? Select all that apply.',
        shuffle: true,
        options: [
          {
            id: 'ev-approval',
            text: 'The IT service owner must approve the integration and can block the launch.',
            fit: 'expected',
            feedback: 'This makes the IT service owner’s influence critical.',
          },
          {
            id: 'ev-capacity',
            text: 'IT operations staff have limited capacity and competing operational priorities.',
            fit: 'expected',
            feedback: 'This affects how and when the project can get IT operations time, and how supportive IT is likely to be.',
          },
          {
            id: 'ev-not-following',
            text: 'IT operations staff did not ask for the pilot and are not actively following it.',
            fit: 'expected',
            feedback: 'This is the evidence for small interest. It says nothing about the IT service owner’s influence.',
          },
          {
            id: 'ev-availability',
            text: 'The IT service owner has not confirmed staff availability for configuration.',
            fit: 'expected',
            feedback: 'The project depends on IT operations staff whose time is not yet secured.',
          },
          {
            id: 'ev-budget',
            text: 'The faculty sponsor authorises funding, and the approved budget is NOK 400,000.',
            fit: 'differs',
            feedback: 'Relevant to the project, but it says nothing about the influence or interest of IT.',
          },
          {
            id: 'ev-students',
            text: 'Student representatives provide usability feedback and communicate student needs.',
            fit: 'differs',
            feedback: 'This concerns a different stakeholder.',
          },
          {
            id: 'ev-staff',
            text: 'Some teaching staff worry about the time needed to keep course pages up to date.',
            fit: 'differs',
            feedback: 'Important for adoption, but it concerns teaching staff, not IT.',
          },
        ],
        verification: 'derived-from-brief',
      },
      {
        kind: 'single',
        id: 'strategy',
        label: 'Engagement approach',
        prompt: 'Given this evidence, which engagement approach fits the IT service owner best?',
        options: [
          {
            id: 'g1',
            text: 'G1 Collaborate: critical influence, large interest',
            fit: 'acceptable',
            feedback:
              'Defensible. Closer involvement than the minimum can make sense, because IT operations staff do part of the configuration work. Keep their limited capacity in mind when you ask for their time.',
          },
          {
            id: 'g2',
            text: 'G2 Satisfy: critical influence, small interest',
            fit: 'expected',
            feedback: 'Fits the evidence: the IT service owner can block the launch (critical influence), while IT is not following the pilot (small interest).',
          },
          {
            id: 'g3',
            text: 'G3 Inform: marginal influence, large interest',
            fit: 'differs',
            feedback: 'Inform suits stakeholders with large interest but marginal influence. The IT service owner is the opposite: small interest, critical influence.',
          },
          {
            id: 'g4',
            text: 'G4 Monitor: marginal influence, small interest',
            fit: 'differs',
            feedback: 'This is the position the proposal takes. It underestimates the IT service owner’s influence: they can block the launch.',
          },
        ],
        verification: 'verified-against-handout',
      },
      {
        kind: 'text',
        id: 'action',
        label: 'Practical action',
        prompt: 'What practical action would you take with IT now, and why?',
        placeholder: 'I would … because …',
        modelAnswer:
          'Meet the IT service owner early, before configuration starts, to agree what the integration approval requires and when it can be given, and to confirm and reserve the IT operations staff time needed for configuration. Agree a named contact and short check-ins at agreed points, so that the launch does not depend on a last-minute IT decision.',
        checklist: [
          { id: 'c-approval', text: 'Refers to the IT service owner’s approval role or ability to block the launch.' },
          { id: 'c-early', text: 'Proposes contacting IT early, well before launch.' },
          { id: 'c-concrete', text: 'Includes a concrete action, such as agreeing approval requirements or reserving capacity.' },
          { id: 'c-capacity', text: 'Takes the limited capacity and competing priorities of IT operations staff into account.' },
        ],
        verification: 'needs-review',
      },
    ],
    hints: [
      {
        text: 'The proposal judges “IT” as one group, by its interest. Who in IT appears in the case, and what can each of them do to the project?',
        verification: 'needs-review',
      },
      {
        text: 'The influence axis asks how much the project needs this stakeholder. Can the pilot launch without IT?',
        verification: 'verified-against-handout',
      },
    ],
    feedback: {
      summary:
        'The proposal is right that IT shows little interest, but it treats “IT” as one group whose influence is also marginal, which places it in G4 (Monitor). The case separates the IT service owner, who has critical influence even if interest is small, from IT operations staff, who have limited capacity. Small interest does not mean marginal influence.',
      evidence:
        'Given the information in this case, the IT service owner (head of IT operations) must approve the integration and can block the launch, so their influence is critical even if their interest is small. IT operations staff have limited capacity and competing priorities, did not ask for the pilot and are not following it, and the IT service owner has not yet confirmed their availability for configuration.',
      concept:
        'The lecturer classifies stakeholders by influence (critical or marginal) and interest (small or large) into four groups, with the strategies G1 Collaborate, G2 Satisfy, G3 Inform and G4 Monitor. Influence is about how much the project needs a stakeholder, for example for approvals or resources. Critical influence with small interest is G2, so Satisfy is the natural starting point for the IT service owner. G1 Collaborate is also defensible if you want IT closely involved in configuration.',
      conceptSources: ['stakeholder-mapping', 'stakeholder-classification', 'stakeholder-strategies'],
      betterProposal:
        '“IT shows little interest in the pilot, but the IT service owner has critical influence: they must approve the integration and can block the launch. We will treat the IT service owner as G2 (Satisfy): agree the approval requirements early, reserve configuration capacity with IT operations before configuration starts, and keep IT briefly updated at agreed checkpoints.”',
      more: [
        'The support–sabotage scale adds another angle. Nothing suggests that IT opposes the pilot, but with competing priorities in IT operations its support may be closer to neutrality or “go slowly” than to full support.',
        'On the lecturer’s support × influence grid, a critical stakeholder who is supportive is involved as a key stakeholder, while one who is not supportive calls for reducing dependency. Both point the same way here: agree approval requirements and capacity early, and avoid a plan that relies on a quick IT decision just before launch (PDF p. 27, slide 56; PDF p. 28, slide 57).',
        'Formal authority is only one source of influence. Teaching staff have no approval role, but adoption depends on them, which also gives them influence over whether the pilot creates value.',
      ],
      verification: 'verified-against-handout',
    },
    verification: 'derived-from-brief',
  },

  // -------------------------------------------------------------------------
  {
    id: 't4',
    number: 4,
    title: 'Schedule',
    lesson: 'Business importance is not the same as being on the critical path.',
    evidenceSections: ['schedule'],
    expectedJudgement: 'revise',
    judgementFeedback: {
      approve: {
        fit: 'differs',
        text: 'Importance and criticality are different things. Check the network before accepting the claim.',
      },
      revise: {
        fit: 'expected',
        text: 'B may be important, but in the baseline plan it is not on the critical path.',
      },
      'more-info': {
        fit: 'differs',
        text: 'The network table gives everything needed to check this claim.',
      },
    },
    initialReasoning: {
      modelAnswer:
        'Whether an activity is critical depends on the network, not on how important it is to the business. D cannot start until both B and C have finished; C finishes on day {ef:baseline:C} and B on day {ef:baseline:B}, so C sets D’s start and B has {float:baseline:B|days} of float.',
      checklist: [
        { id: 'c-importance', text: 'Separates business importance from position on the critical path.' },
        { id: 'c-float', text: 'Mentions that B has float in the baseline plan.' },
        { id: 'c-merge', text: 'Explains that D waits for both B and C, and C finishes later.' },
      ],
      verification: 'needs-review',
    },
    parts: [
      {
        kind: 'number',
        id: 'duration',
        label: 'Project duration',
        prompt: 'What is the project duration?',
        unit: 'working days',
        scenario: 'baseline',
        question: { kind: 'duration' },
        verification: 'derived-from-brief',
      },
      {
        kind: 'path',
        id: 'critical-path',
        label: 'Critical path',
        prompt: 'Build the critical path by selecting the activities in order.',
        scenario: 'baseline',
        verification: 'derived-from-brief',
      },
      {
        kind: 'number',
        id: 'float-b',
        label: 'Float of B',
        prompt: 'How much float (slack) does activity B have?',
        unit: 'working days',
        scenario: 'baseline',
        question: { kind: 'float', activity: 'B' },
        verification: 'derived-from-brief',
      },
      {
        kind: 'delay',
        id: 'b-plus-one',
        label: 'Effect of a one-day delay in B',
        prompt: 'If B takes one day longer (4 days instead of 3), is the project’s completion delayed?',
        scenario: 'bPlus1',
        compareWith: 'baseline',
        verification: 'derived-from-brief',
      },
    ],
    hints: [
      {
        text: 'D cannot start until both B and C have finished. Which of the two finishes later?',
        verification: 'needs-review',
      },
      {
        text: 'Float is how far an activity can slip without moving the project end date. Compare B’s latest start with its earliest start.',
        verification: 'verified-against-handout',
      },
    ],
    feedback: {
      summary:
        'Training may well matter for adoption, but whether an activity is critical is a property of the schedule network, not of its business importance. In the baseline plan B has {float:baseline:B|days} of float, so it is not on the critical path, and a one-day delay in B would not delay the project.',
      evidence:
        'From the network table: B ({duration:baseline:B} days) and C ({duration:baseline:C} days) both follow A and both must finish before D can start. D’s earliest start is therefore the later of B’s and C’s earliest finish: day {es:baseline:D}.',
      concept:
        'The critical path is the longest path through the network, and it determines the shortest possible project duration. In the forward pass, EF = ES + duration, and at a merge point the largest EF of the predecessors becomes the successor’s ES. In the backward pass, LS = LF − duration, and at a burst point the smallest LS of the successors becomes the predecessor’s LF. Float (also called slack) = LS − ES = LF − EF.',
      conceptSources: ['critical-path', 'pass-rules', 'float'],
      betterProposal:
        '“Staff training (B) matters for adoption, but in the current plan B has {float:baseline:B|days} of float; the critical path is {paths:baseline}. Because B’s float is the schedule’s only margin on that branch, we will still monitor B closely.”',
      more: [
        'What happens after a one-day increase: with B at 4 days, the project still takes {duration:bPlus1} working days, but B’s float drops to {float:bPlus1:B} and there are two critical paths: {paths:bPlus1}. The end date is unchanged, but the schedule has lost its margin. A further delay in either B or C would now move the launch.'
      ],
      showSchedule: ['baseline', 'bPlus1'],
      verification: 'verified-against-handout',
    },
    verification: 'derived-from-brief',
  },

  // -------------------------------------------------------------------------
  {
    id: 't5',
    number: 5,
    title: 'Resources and readiness',
    lesson: 'An expectation is not a confirmation: an unverified assumption hides a risk.',
    evidenceSections: ['stakeholders', 'planning'],
    expectedJudgement: 'revise',
    judgementFeedback: {
      approve: {
        fit: 'differs',
        text: 'Check the claim against the planning notes in the case. The two do not say the same thing.',
      },
      revise: {
        fit: 'expected',
        text: 'The claim presents something unconfirmed as a fact.',
      },
      'more-info': {
        fit: 'partly',
        text: 'Getting the IT service owner’s confirmation is exactly what is missing. But the claim already says something the case contradicts, so the proposal needs revising now, not only more information.',
      },
    },
    initialReasoning: {
      modelAnswer:
        'The case says the IT service owner has not yet confirmed that IT operations staff will be available, but the proposal presents this as a confirmed fact. It is an assumption, and treating it as a fact hides a risk to configuration and the launch.',
      checklist: [
        { id: 'c-contradicts', text: 'Points out that the case contradicts the claim: availability has not been confirmed.' },
        { id: 'c-assumption', text: 'Calls availability an assumption, or names the risk it hides.' },
      ],
      verification: 'needs-review',
    },
    parts: [
      {
        kind: 'single',
        id: 'statement-type',
        label: 'Type of statement',
        prompt: 'Given the case, what is “IT operations staff will be available during configuration”?',
        shuffle: true,
        options: [
          {
            id: 'assumption',
            text: 'An assumption: relied on by the plan but not yet confirmed',
            fit: 'expected',
            feedback: 'Yes. The project manager expects it, but the IT service owner has not confirmed it.',
          },
          {
            id: 'fact',
            text: 'A confirmed fact: the IT service owner has agreed to provide the staff',
            fit: 'differs',
            feedback: 'This is what the proposal says, but the planning note states that the IT service owner has not yet confirmed it.',
          },
          {
            id: 'risk',
            text: 'A risk: an uncertain event that could affect the project',
            fit: 'differs',
            feedback: 'Close, but the risk is the opposite event: that IT operations staff may not be available when they are needed.',
          },
          {
            id: 'constraint',
            text: 'A constraint: a fixed limit set by the sponsor, like the budget',
            fit: 'differs',
            feedback: 'The sponsor’s constraints are the deadline, budget and scope. Availability is something the plan assumes.',
          },
        ],
        verification: 'needs-review',
      },
      {
        kind: 'single',
        id: 'risk',
        label: 'The risk',
        prompt: 'Which statement best describes the risk that follows from this assumption?',
        shuffle: true,
        options: [
          {
            id: 'risk-capacity',
            text: 'IT operations staff may be unavailable when configuration starts, delaying configuration and the launch.',
            fit: 'expected',
            feedback: 'Yes: an uncertain event with a consequence for the project’s objectives.',
          },
          {
            id: 'risk-interest',
            text: 'IT operations staff are not following the pilot, so they may be unaware of the project’s plans and progress.',
            fit: 'differs',
            feedback: 'This describes IT’s attitude and a mild consequence. It is not the risk that follows from the availability assumption.',
          },
          {
            id: 'risk-budget',
            text: 'Configuration may cost more than planned, so the project could exceed its approved budget of NOK 400,000.',
            fit: 'differs',
            feedback: 'A possible risk, but it does not follow from the assumption about IT availability.',
          },
          {
            id: 'risk-restated',
            text: 'The project manager expects IT operations staff to be available, so configuration can start on time.',
            fit: 'differs',
            feedback: 'This restates the assumption and its intended result. It does not describe what could go wrong.',
          },
        ],
        verification: 'needs-review',
      },
      {
        kind: 'multi',
        id: 'responses',
        label: 'Reasonable responses',
        prompt: 'Which responses are reasonable? Select all that apply.',
        shuffle: true,
        options: [
          {
            id: 'resp-confirm',
            text: 'Ask the IT service owner to confirm and reserve the required staff capacity before configuration starts.',
            fit: 'expected',
            feedback: 'A reduction response: it lowers the probability that the risk occurs.',
          },
          {
            id: 'resp-owner',
            text: 'Give the risk an owner and a date by which the IT service owner must confirm.',
            fit: 'expected',
            feedback: 'Ownership and response timing are what make a response happen.',
          },
          {
            id: 'resp-contingency',
            text: 'Agree a contingency plan in advance, such as limited external support within the budget.',
            fit: 'expected',
            feedback: 'Prepares a fallback in case the risk occurs anyway.',
          },
          {
            id: 'resp-register-only',
            text: 'Record staff availability in the risk register, and close the item once it is recorded.',
            fit: 'differs',
            feedback: 'Recording a risk does not reduce it. It needs a response, an owner, timing and follow-up.',
          },
          {
            id: 'resp-pm-scope',
            text: 'If IT staff are unavailable, let the project manager reduce the pilot scope without approval.',
            fit: 'differs',
            feedback: 'Reducing scope can be a valid fallback, but the faculty sponsor approves major scope changes.',
          },
          {
            id: 'resp-keep-claim',
            text: 'Keep the statement that IT has confirmed, so that the faculty sponsor stays confident in the plan for now.',
            fit: 'differs',
            feedback: 'This hides the risk from the people who need to manage it.',
          },
        ],
        verification: 'needs-review',
      },
      {
        kind: 'text',
        id: 'rewrite',
        label: 'Rewritten statement',
        prompt: 'Rewrite the proposal’s statement so that it is accurate and useful.',
        placeholder: 'We assume that …',
        modelAnswer:
          '“We assume that IT operations staff will be available during configuration; the IT service owner has not yet confirmed this. The project manager will ask the IT service owner to confirm and reserve the capacity by an agreed date before configuration starts. If it is not confirmed by then, we will use the agreed contingency plan, for example limited external support within the budget or, with the faculty sponsor’s approval, a smaller pilot scope.”',
        checklist: [
          { id: 'c-assumption', text: 'States availability as an assumption, not a fact.' },
          { id: 'c-reduce', text: 'Says what will be done to reduce the risk, such as confirming and reserving capacity.' },
          { id: 'c-owner', text: 'Names an owner and a date.' },
          { id: 'c-fallback', text: 'Includes a fallback, and routes any scope reduction through the faculty sponsor.' },
        ],
        verification: 'needs-review',
      },
    ],
    hints: [
      {
        text: 'Compare the proposal’s wording with the planning notes in the case. Do they say the same thing?',
        verification: 'needs-review',
      },
      {
        text: 'A risk is something that may happen and would affect the project’s objectives. What would happen to configuration if IT operations staff were not available?',
        verification: 'needs-review',
      },
    ],
    feedback: {
      summary:
        'The proposal presents an unverified assumption as a confirmed fact. That hides a real risk from the people who need to manage it.',
      evidence:
        'Given the information in this case, the planning note says: “The project manager expects availability, but the IT service owner has not yet confirmed it.” IT operations staff also have limited capacity and competing priorities, which makes the assumption fragile. Configuration depends on IT operations staff.',
      concept:
        'The risk lecture asks you to select and justify a response (acceptance, reduction, sharing, transfer or avoidance) and to keep a risk register with clear ownership, response timing and current status. Here the main response is reduction: confirm and reserve capacity early. A contingency plan prepares for the case where the risk happens anyway. The lecturer also notes that responses should be escalated when they exceed the project’s authority, and in this case the faculty sponsor approves major scope changes.',
      conceptSources: ['risk-objectives', 'threat-responses', 'contingency-plans', 'risk-register'],
      betterProposal:
        '“We assume IT operations staff will be available during configuration, but the IT service owner has not yet confirmed this. The project manager will obtain confirmation and reserve capacity by an agreed date before configuration starts. If capacity is not confirmed, we will use the agreed contingency plan; any reduction in scope will go to the faculty sponsor for approval.”',
      more: [
        'Possible contingency options, each with a trade-off: buy limited external support within the NOK 400,000 budget; reduce the pilot scope, which needs the sponsor’s approval; or re-plan the work. Be careful with re-planning: in the baseline, configuration (C) has {float:baseline:C|days} of float, so any slip in configuration moves the launch unless the IT-dependent work can be rearranged within configuration itself.',
        'Writing the risk in the register does not reduce it. The register is useful because it records who owns the response, when it will happen and its current status, and because those entries are followed up.',
      ],
      verification: 'verified-against-handout',
    },
    verification: 'derived-from-brief',
  },

  // -------------------------------------------------------------------------
  {
    id: 't6',
    number: 6,
    title: 'Beyond the pilot',
    lesson: 'Useful AI assistance: a sound claim, checked against the case, deserves approval.',
    evidenceSections: ['constraints', 'benefits', 'stakeholders'],
    expectedJudgement: 'approve',
    judgementFeedback: {
      approve: {
        fit: 'expected',
        text: 'This recommendation is sound. Recognising a good suggestion is as much a part of review as spotting a weak one.',
      },
      revise: {
        fit: 'differs',
        text: 'There is little to fix here. The recommendation fits the approved scope and recognises that delivery alone does not show that the benefits occurred.',
      },
      'more-info': {
        fit: 'differs',
        text: 'You could ask how the evaluation will be done, but the recommendation is sound as written. That detail belongs in the evaluation plan.',
      },
    },
    initialReasoning: {
      modelAnswer:
        'The recommendation stays within the approved scope and sends any expansion to the sponsor, who approves scope changes. It also recognises that launching the pilot does not by itself show that students and staff benefit, so use and benefits are evaluated first.',
      checklist: [
        { id: 'c-scope', text: 'Mentions that rollout is outside the approved scope and needs approval.' },
        { id: 'c-delivery', text: 'Mentions that delivering the pilot does not show that the benefits occurred.' },
        { id: 'c-link', text: 'Links the evaluation to the intended benefits or to adoption by staff and students.' },
      ],
      verification: 'needs-review',
    },
    parts: [
      {
        kind: 'multi',
        id: 'support',
        label: 'Supporting case facts',
        prompt: 'Which case facts support approving this recommendation? Select all that apply.',
        shuffle: true,
        options: [
          {
            id: 'f-scope',
            text: 'Institution-wide rollout is outside the approved scope.',
            fit: 'expected',
            feedback: 'So a rollout needs new approval, as the recommendation says.',
          },
          {
            id: 'f-sponsor',
            text: 'The faculty sponsor approves major scope changes.',
            fit: 'expected',
            feedback: 'This tells you who must approve the additional scope.',
          },
          {
            id: 'f-benefits',
            text: 'The intended benefits are easier access to information and fewer repeated questions.',
            fit: 'expected',
            feedback: 'These appear only once the platform is in use, so they must be evaluated after launch.',
          },
          {
            id: 'f-staff',
            text: 'Adoption depends on teaching staff, some of whom worry about the upkeep time.',
            fit: 'expected',
            feedback: 'Use and workload in the pilot are exactly what an evaluation should look at before scaling up.',
          },
          {
            id: 'f-duration',
            text: 'Preparing and delivering staff training (activity B) is planned to take three working days.',
            fit: 'differs',
            feedback: 'A planning detail; it does not bear on whether to evaluate before rollout.',
          },
          {
            id: 'f-it-interest',
            text: 'IT operations staff have limited capacity and are not following the pilot.',
            fit: 'differs',
            feedback: 'Relevant to engagement, but not a reason for evaluating before rollout.',
          },
          {
            id: 'f-deadline',
            text: 'The pilot must be ready before the next teaching period starts.',
            fit: 'differs',
            feedback: 'A constraint on the pilot itself. It does not bear on what should happen before a wider rollout.',
          },
        ],
        verification: 'derived-from-brief',
      },
    ],
    hints: [
      {
        text: 'Check the claim against the scope and the stakeholder descriptions. What would a rollout require, and who decides?',
        verification: 'needs-review',
      },
      {
        text: 'Would delivering the pilot on time show that students and staff are better off?',
        verification: 'needs-review',
      },
    ],
    feedback: {
      summary:
        'This is a sound recommendation, and approving it is the right call. It respects the approved scope and recognises that delivering the pilot does not show that the intended benefits occurred.',
      evidence:
        'Given the information in this case: institution-wide rollout is outside the approved scope; the faculty sponsor approves major scope changes; the intended benefits only appear once the platform is used; and adoption depends on teaching staff, some of whom are concerned about the workload.',
      concept:
        'The lecturer argues that the life-cycle view should extend beyond delivery into operation and use, and that the timing of a success assessment can change the conclusion. Evaluating a pilot before deciding on rollout applies both ideas.',
      conceptSources: ['lifecycle-beyond-delivery', 'success-objectives'],
      betterProposal:
        'The claim can stand. A stronger version would add what will be evaluated and when: “Before any institution-wide rollout, evaluate pilot use and benefits (for example active use, staff maintenance workload and repetitive questions) at an agreed point after launch, and ask the faculty sponsor to approve any additional scope.”',
      more: [
        'This is the activity’s example of useful AI assistance. The suggestion is consistent with the case and the course concepts, and you can explain why it holds. Accepting it after checking is good judgement; rejecting it just because an AI wrote it would not be.',
      ],
      verification: 'verified-against-handout',
    },
    verification: 'derived-from-brief',
  },
];
