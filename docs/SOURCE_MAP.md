# Source map

Each row links a concept used in the activity to the lecture handouts (`Full-sett-of-handouts-.pdf`) or our report (`Final_Report.pdf`).

- **PDF p.** is the page number printed at the bottom of the handout page. Each handout page shows two slides.
- **Slide** is the lecturer's slide number printed under the slide.
- **Status**: `verified-against-handout` = we checked the page and slide; `verified-against-report` = we checked it against our report; `derived-from-brief` = taken from the build brief (fictional case data); `needs-review` = written for this prototype, so a group member should check it.
- The wording column shows how the **activity** phrases the concept. Slides are paraphrased, not copied.
- The code version of these citations is in `src/content/sources.ts` (ids in brackets). The case content is in `src/content/coursehub/`.

## Course concepts (lecture handouts)

| # | Concept | Wording used in the activity | File | PDF p. | Slide | Status | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Output vs outcome in IT projects (`it-system-output-outcome`) | Acquiring an IT system is about changing how people will work; attend to both output and outcome. | Handouts | 6 | 13 | verified-against-handout | Used in Task 1, "More detail". |
| 2 | Projects create value (`projects-create-value`) | Projects are not only about delivering output within time and cost. | Handouts | 9 | 19 | verified-against-handout | Background support only. |
| 3 | Initiation objectives (`initiation-objectives`) | Keep rationale, purpose, outcomes and outputs apart; recognise adverse effects as well as benefits. | Handouts | 33 | 78 | verified-against-handout | Slide title: "Lecture 3. part 1: Initiation". Task 1. |
| 4 | Charter: outcome and output (`charter-contents`) | Outcome = potential gains for the organisation, end users and other stakeholders; output = what the project delivers. | Handouts | 35 | 81 | verified-against-handout | The slide defines output as "scope options" with time and cost estimates. The activity simplifies this to "what the project delivers". See OPEN_QUESTIONS Q6. The same list appears again on p. 39, slide 90. |
| 5 | Outcome as intended benefits in operation (`outcome-definition`) | Outcomes are the effects once the results are in use, e.g. fewer inquiries. | Handouts | 37 | 85 | verified-against-handout | The NPRA example includes "a reduction of the number of inquiries", which is close to our CourseHub benefit. |
| 6 | Deliverables (`deliverables`) | Deliverables are the tangible results produced in the project; a training programme is one of the lecturer's examples, so a delivered training session is an output. | Handouts | 39 | 89 | verified-against-handout | Task 1. |
| 7 | Timing of success assessment (`success-objectives`) | The timing of an assessment can change the conclusion. | Handouts | 40 | 92 | verified-against-handout | This slide is a learning objective. Tasks 6 and transfer Part B. |
| 8 | Success is provisional (`success-provisional`) | Separate delivery performance from lasting impact; success depends on time and evidence. | Handouts | 42 | 97 | verified-against-handout | Added by us as extra support for transfer Part B. |
| 9 | Success criteria questions (`success-criteria-questions`) | A criterion says what is judged, who assesses, how it is measured and when. | Handouts | 43 | 101–102 | verified-against-handout | Task 2. |
| 10 | When to assess (`success-when`) | At handover, after a year, or later; reasons for defining criteria up front. | Handouts | 45 | 105–106 | verified-against-handout | Transfer Part B. |
| 11 | Success framework (`success-framework`) | Project management success (delivered according to plan?), process success (was the work carried out well?), project success (did it create the intended value?). | Handouts | 46 | 108 | verified-against-handout | Task 2 matching and transfer Part B. |
| 12 | Lecturer's digital learning platform example (`success-illustration`) | Used to check our Task 2 classifications. Cited in Task 2 "More detail" and in the transfer Part B model explanation: adoption is assessed one semester after launch, and two months is earlier than that. | Handouts | 47 | 109–110 | verified-against-handout | Very close to the CourseHub case. The About page says: "Case inspired by the lecturer's illustration example (handouts PDF p. 47, slides 109–110)." |
| 13 | Success factors vs criteria objective (`success-factors-objectives`) | Distinguish success factors from success criteria. | Handouts | 48 | 111 | verified-against-handout | Slide title: "Lecture 5. Success factors". The objective also mentions performance indicators. |
| 14 | Success factors definition (`success-factors-definition`) | Factors are ground rules for planning and execution; listing them does not guarantee success; they must be turned into concrete activities and decisions. | Handouts | 49 | 113–114 | verified-against-handout | Task 2. |
| 15 | Influence and interest mapping (`stakeholder-mapping`) | Influence = how much the project needs the stakeholder, e.g. for approvals or resources. | Handouts | 25 | 50–51 | verified-against-handout | Added by us. It supports "do not equate formal authority with all forms of influence". |
| 16 | Stakeholder classification (`stakeholder-classification`) | Influence (critical / marginal) × interest (small / large) → G1–G4. | Handouts | 26 | 53 | verified-against-handout | Task 3. |
| 17 | Stakeholder strategies (`stakeholder-strategies`) | G1 Collaborate, G2 Satisfy, G3 Inform, G4 Monitor. | Handouts | 27 | 54 | verified-against-handout | Exact labels used. Covered by an automated test. |
| 18 | Support–sabotage scale (`support-sabotage`) | From full support through neutrality and "go slowly" to deliberate sabotage. | Handouts | 27 | 56 | verified-against-handout | Task 3, "More detail". Our reading that IT is "closer to neutrality or go slowly" is an interpretation (needs-review). |
| 19 | Support × influence (`support-influence`) | Key stakeholders (involve), non-supportive (reduce dependency), supportive (maintain support), marginal (observe). | Handouts | 28 | 57 | verified-against-handout | Task 3, "More detail". |
| 20 | Life cycle beyond delivery (`lifecycle-beyond-delivery`) | The life-cycle view should extend beyond delivery into operation and use. | Handouts | 28 | 59 | verified-against-handout | Slide title: "Lecture 3. Part 1 Project life cycle" (learning objective). Task 6. |
| 21 | Critical path (`critical-path`) | The longest path through the network; it determines the shortest project duration. | Handouts | 96 | 220 | verified-against-handout | Task 4 and transfer Part A. |
| 22 | Forward and backward pass rules (`pass-rules`) | EF = ES + duration; at a merge point the largest predecessor EF becomes the successor's **ES**; LS = LF − duration; at a burst point the smallest successor LS becomes the predecessor's LF. | Handouts | 96 | 221 | verified-against-handout | The slide says "becomes EF for successor". The site states only the correct rule; this note is kept in the docs only (OPEN_QUESTIONS Q1). |
| 23 | Float/slack (`float`) | Float (also called slack) = LS − ES = LF − EF. No "free float". | Handouts | 98 | 225 | verified-against-handout | The slide is a diagram. Its node legend shows slack, and its values equal LS − ES. "Free float" does not appear anywhere in the handouts. |
| 24 | Risk lecture objectives (`risk-objectives`) | Select and justify responses (acceptance, reduction, sharing, transfer, avoidance); a register with clear ownership, response timing and status. | Handouts | 124 | **280** | verified-against-handout | **The brief said slide 279.** Slide 279 (p. 123) is the title slide. |
| 25 | Threat responses (`threat-responses`) | Accept, reduce, transfer/share, avoid; assign an owner, monitor and review; escalate when a response exceeds project authority. | Handouts | 130 | 292–293 | verified-against-handout | Slide 292 says "Minimize"; slide 293 says "Reduce". The activity uses "reduce/reduction". |
| 26 | Contingency plans (`contingency-plans`) | Contingency plans as a risk mitigation method. | Handouts | 131 | **295** | verified-against-handout | **The brief said slide 294.** Slide 294 covers responses to opportunities. Slide 293 also shows a contingency plan in its "Accept" illustration. |
| 27 | Risk register (`risk-register`) | Responsible person, when and what measures, status. | Handouts | 132 | 296 | verified-against-handout | Added by us. Task 5. |

## Scheduling data and results

| # | Item | Value in activity | Source | Status | Notes |
|---|---|---|---|---|---|
| 28 | Network A–E, durations, predecessors | A 2; B 3 (A); C 4 (A); D 2 (B, C); E 3 (D) | Brief §5 | derived-from-brief | `src/content/coursehub/case.ts`. |
| 29 | Baseline results | Duration 11; A→C→D→E; B float 1 | Calculated | derived-from-brief | Calculated by `computeSchedule`; tested in `src/logic/schedule.test.ts`. |
| 30 | B = 4 days | Duration 11; B float 0; two critical paths | Calculated | derived-from-brief | Same function; tested. |
| 31 | B = 5 days | Duration 12; A→B→D→E; C float 1 | Calculated | derived-from-brief | Same function; tested. |

## Our report

| # | Concept | Wording used in the activity | Section | Status | Notes |
|---|---|---|---|---|---|
| 32 | Handing decisions to AI (`report-4-1`) | Some accounts described handing decisions such as choosing work packages or ranking stakeholders to AI. | 4.1 | verified-against-report | No interview ids or quotations used. |
| 33 | Explanations vs lasting understanding (`report-4-2`) | An explanation could make sense while reading, yet be hard to repeat or explain later. | 4.2 | verified-against-report | |
| 34 | Students' suggestions (`report-4-5`) | More own-reasoning exercises; examples of acceptable AI help; comparing an AI answer with the case. | 4.5 | verified-against-report | Cited in docs only. |
| 35 | Checking an answer vs checking understanding (`report-5-1`) | Does it fit the case and course material, versus can you explain or apply it without the AI response. | 5.1 | verified-against-report | |
| 36 | Small teaching changes (`report-5-3`) | Compare an AI answer with the case, identify a weak assumption, explain a correction; a short task without AI; examples of acceptable AI assistance. | 5.3 | verified-against-report | The report says their effectiveness was not tested. |
| 37 | Perceived, not measured, learning (`report-8-1`) | Our study describes reported experiences, not measured learning. | 8.1 | verified-against-report | |

## Case facts and proposal claims

| # | Item | Status | Notes |
|---|---|---|---|
| 38 | CourseHub background, constraints, benefits, stakeholders, planning note | derived-from-brief | Fictional. The planning note quotes the brief exactly. |
| 39 | Six proposal claims | derived-from-brief | Claims quoted from the brief. The neutral sentences around them were written by us (needs-review). |
| 40 | Expected judgements (Revise ×5, Approve ×1) | derived-from-brief | |
| 41 | Classification items, answer options, distractors, hints, model answers, checklists | needs-review / verified-against-handout | Status is marked on each part and hint in `src/content/coursehub/tasks.ts`. The items still to check are listed in OPEN_QUESTIONS. |
