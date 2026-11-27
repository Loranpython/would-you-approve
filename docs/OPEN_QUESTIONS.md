# Open questions

Status after the group's answers on 26/11/2026. Resolved items are kept as a record of what was decided.

## Still open: content to review on the working site

The group will review these on the working site. The texts are marked `needs-review` in `src/content/coursehub/tasks.ts` (on each part and hint) and in `src/content/about.ts`.

- **Hints**: all hints except Task 2 hint 2, Task 3 hint 2 and Task 4 hint 2, which restate handout concepts. Task 6 hint 1 has already been replaced with the group's wording.
- **Task 1**: the six classification items and their explanations; the model sentence and checklist.
- **Task 2**: the model criterion and checklist. The matching items were checked against slides 108 and 110.
- **Task 3**: the model action and checklist.
- **Task 4**: the model explanation and checklist. All numbers in them come from the calculation.
- **Task 5**: all answer options and distractors, the model rewrite and the checklist. Options were rewritten on 26/11/2026 so they no longer give the answer away (see below).
- **Stage 1 model reasoning and checklists (new, all six tasks)**: `initialReasoning` in each task. For Tasks 2, 3 and 5 these are new texts. For Tasks 1, 4 and 6 they were adapted from the written questions that were merged into Stage 1.
- **Question labels**: the short `label` on each question, used in the per-question results (for example "Float of B: correct").
- **Key point lines**: the `lesson` of each task, shown only in the feedback.
- **Case briefing intro paragraph**: `CASE_BRIEFING_INTRO` in `src/content/coursehub/case.ts`, a paraphrase of the Background facts.
- **New or rewritten distractors (26/11/2026)**: Task 3 `ev-budget`, `ev-students` and the new `ev-staff`; Task 6 `f-duration`, `f-it-interest` and the new `f-deadline`; Task 2 `outcomes`. Check that each is still plausible but wrong.
- **Task 6**: the model reason and checklist.
- **Proposal**: the neutral sentences around each claim (`src/content/coursehub/proposal.ts`). Check that none of them accidentally introduces a second error.
- **About page**: the "Why this activity?" text and the teacher note.

When you change a question, an option id or what a task asks, raise `CONTENT_VERSION` in `src/content/version.ts`. Saved answers from the earlier version will then not be applied to the changed tasks. Wording-only changes do not need a new version.

## Resolved

**Q1. Merge-point rule wording (PDF p. 96, slide 221).** The slide says the largest preceding EF at a merge point "becomes EF for successor". The standard meaning, also used in the worked example on slides 223–224, is that it becomes the successor's **ES**.
*Decision:* the site states only the correct rule. The note about the slide wording is kept in these docs only. A test checks that the slide wording does not appear in the site content.

**Q2. Risk objectives slide number.** The brief cited slide 279. The objectives are on **slide 280** (PDF p. 124); slide 279 is the title slide. *We cite slide 280.*

**Q3. Contingency plans slide number.** The brief cited slide 294, which covers opportunities. "Contingency plans" is on **slide 295** (PDF p. 131). Slide 293 (PDF p. 130) shows the threat responses and the line about escalating when a response exceeds project authority. *We cite slides 292–293 and 295.*

All other page and slide numbers in the brief matched the handouts.

**Q4. The case closely matches the lecturer's example (PDF p. 47, slides 109–110).**
*Decision:* the About page says "Case inspired by the lecturer's illustration example (handouts PDF p. 47, slides 109–110)."

**Q5. "Reschedule configuration within the float."** C has zero float in the baseline. *Accepted as done:* the feedback states this using the calculated value, and the option is not offered as a correct answer.

**Q6–Q11.** *Accepted as done:*
- Q6: output simplified to "what the project delivers".
- Q7: an adverse effect is classified as an outcome.
- Q8: G1 Collaborate is accepted as defensible.
- Q9: the support-level interpretation is hedged and kept in "More detail".
- Q10: we use "reduce/reduction".
- Q11: extra timing sources (slides 97 and 105–106) are cited for Part B.

**Q12. Timing of the adoption assessment.**
*Decision:* the wording is now precise. Task 2 says the lecturer's example assesses adoption one semester after launch (slide 110). The Part B model explanation adds that two months is earlier than that assessment point.

**Dates.** The report has not yet been submitted; the final deadline is 14/12/2026. The draft paragraph is written for the revised report (recommendations section plus an appendix), and the change-log row is dated 26/11/2026. See `docs/REPORT_DRAFTS.md`.

**Layout giving answers away (26/11/2026).** Before submission, three things could give answers away:

- In several parts, only the correct option had a definition, or it was clearly the longest.
- The proposal heading "5. Assumptions" named the issue.
- Task titles and the line under them (for example "A sound recommendation", "An expectation is not a confirmation") stated the lesson.

*Fixed:*

- All choice options are parallel in structure and similar in length.
- Heading 5 is now "Resources and readiness". The other headings were checked; "2. Success criteria" is kept on purpose, as the proposal's own mistaken label.
- Task titles now repeat the neutral proposal headings. Each task's lesson appears only in the feedback.
- Content tests now fail if:
  - a correct option is more than 1.5× the average length of the other options;
  - options in one part mix "Label: definition" and plain styles;
  - the model answer is the longest option in more than half the parts;
  - a task title differs from its proposal heading;
  - a heading names the flaw.
- `CONTENT_VERSION` was raised to 1.1.0.

**Two-stage review and layout (26/11/2026, content version 1.2.0).**

- **Stage 1** asks for a judgement, one or two sentences of reasoning and a confidence rating, and is then locked.
- **Stage 2** (the details) is not rendered until Stage 1 is submitted. A test checks every task for this.
- **Merged questions.** These written questions repeated the Stage 1 reasoning, so they were merged into it:
  - Task 1: "explain output vs outcome"
  - Task 4: "why B's importance does not make it critical"
  - Task 6: "what makes this a useful suggestion"
- **Kept in Stage 2.** These questions ask for task-specific writing:
  - Task 2: write a criterion
  - Task 3: practical action
  - Task 5: rewrite the statement
- **Design choices to confirm:**
  - Confidence is asked once, in Stage 1.
  - A revision after feedback changes the judgement and/or answers, but does not ask for new reasoning.
  - The summary shows the initial judgement and reasoning beside the judgement after feedback.

Other changes:

- A case briefing page now comes before the proposal.
- The case panel takes about 40% of a 1400px layout, scrolls with the page instead of having its own scrollbar, and opens only the sections linked to each task.
- The network diagram is shown full width in the briefing, Task 4 and the challenge, and no longer in the panel.
- The full fictional-case disclaimer appears once per page; the start page has a short line instead.
- The proposal label was corrected; it now reads: "Simulated proposal with deliberately chosen strengths and errors, prepared by the project group."
- Interface font: Aptos with system fallbacks. Georgia is used only for the proposal.

**IT stakeholders and activity B (group review, content version 1.3.0).**

- **Two IT stakeholders.** The case now has an "IT service owner (head of IT operations)", who must approve the integration and can block the launch. Separately, "IT operations staff" have limited capacity and are not following the pilot. The planning note now says the IT service owner has not confirmed availability.
- **Wording updated to match.** Tasks 2, 3, 5 and 6, the hints, the feedback, the case file and the briefing were updated.
- **Proposal claim unchanged.** The claim "IT has limited interest in the pilot…" keeps its vague wording on purpose. Task 3's feedback now says that the IT service owner has critical influence even if interest is small.
- **Activity B renamed** "Prepare and deliver staff training", with the same duration and dependencies. Diagram nodes now grow to fit three-line names.
- **To review on the site:** the rewritten Task 3 and Task 5 options and feedback.

**Proposal neutral sentences (group review, content version 1.4.0).**

- **Intro:** now lists "resources and readiness" instead of "key assumptions", which gave away Task 5.
- **Claim 3, sentence before it:** now includes students with accessibility requirements in usability testing. Leaving them out created an unintended second error.
- **Claim 2, sentence after it:** "The project team will review these at each project meeting" hinted at success factors, the Task 2 answer. It now reads "They will be presented to the faculty sponsor for approval."
- **Other sentences:** checked and unchanged. The Section 5 follow-up ("Configuration can therefore start…") belongs to the flawed claim itself.
- **New test:** the intro and all neutral sentences must not name the flaw.

**Stage 1 minimum and Task 1 hint (group review, content version 1.5.0).**

- **Minimum length:** "Submit initial judgement" stays disabled until the reasoning has at least five words that contain letters. Only the length is checked, never the content. A message under the field says: "Write one or two sentences in your own words before you continue."
- **Task 1 hint 1:** replaced with the group's wording: "Compare the items in the claim with the intended benefits in the case file. What kind of thing is each of them?"

**Claim 2 consistency (group review, content version 1.6.0).**

- **IT wording:** Task 2 already said "IT operations staff" in the matching item, model answer and "More detail" since version 1.3.0, so nothing changed there.
- **Better proposal:** it now says the project-success criterion is "assessed one semester after launch", matching the lecturer's example (PDF p. 47, slide 110) cited in "More detail".

**Claim 3: interest and influence belong to the same stakeholder (group review, content version 1.7.0).**

- **Case file and briefing:** the IT service owner is now the one who did not ask for the pilot and is not following it. IT operations staff keep only "limited capacity and competing operational priorities".
- **Task 3:** the evidence options, G1/G2 feedback, Stage 1 model reasoning, checklist, feedback, better proposal and "More detail" now tie both influence and interest to the IT service owner. Capacity refers to IT operations staff. Option ids are unchanged.
- **Tasks 5 and 6:** the distractors that tied "not following the pilot" to IT operations staff now refer to the IT service owner.
- **Task 2 and the challenge:** checked; they refer to IT operations capacity and work only.
- **Length balance:** one Task 3 distractor was lengthened so that the longer relevant option does not stand out.

**Punctuation and written answers (group review, no content version change).**

- **Doubled full stop:** "Model answer" lines and other joined feedback no longer add a full stop after text that already ends a sentence. Tests check every task and the challenge, with all answers deliberately wrong, plus all content text.
- **Minimum length for written answers:** the five-word rule now also applies to the Stage 2 written questions (Task 2 criterion, Task 3 practical action, Task 5 rewrite) and to the challenge. The same message appears under each field. "What changed your judgement?" stays optional.
- **Why no version change:** no ids, questions or correct answers changed, so saved answers are still applied correctly.

**Wording and credits (group review, no content version change).**

- **Teacher note:** now says the activity "sends no data anywhere; a single-file version also works offline".
- **Task 5:** the scope-reduction option now says "IT operations staff".
- **Task 6:** the better proposal now says "one semester after launch", matching Task 2 and the challenge.
- **Credits:** the site and README no longer mention how the site was built. The credit line reads "Developed by Group 35 for TPK5100 Applied Project Management." The group will add its own note on the About page later.

**Second case.** The content model and navigation support more cases. Each case is a folder such as `src/content/coursehub/` that exports one `CaseStudy` and is listed in `src/content/cases.ts`. Links take the form `#/case/<id>/…`, and saved progress is stored per case. Only CourseHub is built.

## Other notes

- **Verification values.** The brief lists three values. We added a fourth, `verified-against-report`, so citations of our own report are not labelled as handout checks.
- **Report sections used:** 4.1, 4.2, 4.5, 5.1, 5.3 and 8.1. No interview ids, quotations or individual accounts appear. This is checked in the content tests, in the built files (`npm run check:build`) and on every rendered page (`npm run e2e`).
- **Source files.** `sources/` is in `.gitignore`, and the build check confirms that no PDF or `sources/` file is in either build.
