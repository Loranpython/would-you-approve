# Working rules for this project

*Would You Approve This?* is an educational prototype for TPK5100 Applied Project Management (NTNU, Group 35). It is a static React + TypeScript + Vite site. Every push to `main` deploys it to https://loranpython.github.io/would-you-approve/. See README.md for the commands.

## Content and code

- **All educational content lives in `src/content/` and stays separate from the UI.** Case text, claims, options, hints, feedback, model answers, checklists and source references belong there, never in `src/ui/`. Interface wording shared by all cases goes in `src/content/shared.ts`. Group members without programming experience edit these files, so keep them readable.
- **Never change existing ids.** This covers case, task, part, option, classification item, checklist, source and scenario ids. Saved progress and correctness checks refer to them, and correctness is tracked by id, never by position. To replace an item, add one with a new id.
- **Raise `CONTENT_VERSION` in `src/content/version.ts` whenever task content changes**, for example questions, options, correct answers, Stage 1/Stage 2 structure or ids. Answers saved under an older version are then not applied. Pure wording fixes that keep the meaning do not need a new version.
- **Never type schedule results by hand.** Durations, float, ES/EF/LS/LF and critical paths come from `src/logic/schedule.ts`. Content text uses placeholders such as `{float:baseline:B|days}`.
- Every content item has a `verification` field. Mark anything newly written as `needs-review` and list it in `docs/OPEN_QUESTIONS.md`.
- A new case is a folder like `src/content/coursehub/` exporting a `CaseStudy`, registered in `src/content/cases.ts`.

## Course terminology and sources

- **Course terminology must match the lecture handouts.** Check `docs/SOURCE_MAP.md`, which gives the PDF page and slide number for each concept. Examples:
  - The stakeholder strategies are **G1 Collaborate, G2 Satisfy, G3 Inform, G4 Monitor**, not generic labels such as "keep satisfied".
  - Use "float" (with "slack" as a synonym), never "free float".
  - At a merge point, the largest predecessor EF becomes the successor's ES.
- Paraphrase and cite by file, PDF page and slide. Do not copy slides or long passages. Do not invent citations, lecturer quotations or claims of lecturer approval, and do not present model answers as official course answers.
- Record conflicts between a request and the handouts in `docs/OPEN_QUESTIONS.md` instead of guessing.

## Never commit or publish

- **`sources/`** (lecture handouts and our report) must never be committed, bundled or published. It is in `.gitignore`.
- **`docs/REPORT_DRAFTS.md`** stays local until the report has been submitted. It is also in `.gitignore`.
- **No interview ids** (I01–I16), quotations or details from individual interviews anywhere in the site or the repository. Refer to report sections instead.
- No external fonts, CDNs, analytics, AI calls or network requests. The site must work offline and from the single-file build.

## Claims

- **Make no claims about learning effects.** The prototype has not been tested with students. Never write that it improves learning, measures understanding or exam readiness, or certifies competence. Avoid labels such as "learning score", "exam readiness", "mastered", "certified" and "intelligence".
- Do not frame the activity as "AI is bad". Some claims in the proposal are deliberately sound, and approving a good suggestion is part of the learning goal.
- Written answers are self-assessed and are never marked automatically. Keep that distinction visible.
- Nothing may give an answer away before submission: option length or format, headings, task titles or the layout. Stage 2 is not rendered until Stage 1 is submitted. The tests in `src/content/content.test.ts` and `src/ui/App.test.tsx` check this.

## Before every commit

Run **`npm run verify`** and commit only when it passes. It runs:
- the unit and user-journey tests;
- both builds;
- the build check (no sources, no interview ids, no external resources, correct Pages base path);
- the browser checks against the single-file build. These need a local Chrome or Edge.

Check that `sources/`, `node_modules/`, `dist/`, `dist-single/` and `docs/REPORT_DRAFTS.md` are not staged.
