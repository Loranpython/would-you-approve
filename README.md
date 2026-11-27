# Would You Approve This?

*Review an AI-generated project proposal.*

An educational prototype for TPK5100 Applied Project Management at NTNU. Students read a short briefing on a fictional project case (CourseHub, a pilot learning platform). They then review a simulated AI-generated proposal. For each claim they first record an initial judgement with their own reasoning, then check the details and compare their review with structured feedback. A short independent challenge without hints follows. The activity takes about 10–15 minutes.

The proposal is a simulation with deliberately chosen strengths and errors, prepared by the project group.

The prototype is derived from the findings and recommendations of our group's interview study (final report, Sections 5.1 and 5.3). It was developed after the study and is not part of it. Its educational effect has not been tested.

**Developed by Group 35 for TPK5100 Applied Project Management.**

This is a student prototype, not an official NTNU resource. Its model answers are not official course answers.

## Running it

You need [Node.js](https://nodejs.org/) 20 or newer.

```sh
npm install
npm run dev            # local development server
```

## Building

```sh
npm run build          # dist/: the site for GitHub Pages, served under /would-you-approve/
npm run build:single   # dist-single/index.html: one self-contained file that opens straight from disk
```

To share the activity as a single file, send `dist-single/index.html`. It works offline and loads nothing from the internet.

To build for a different location, set `BASE_PATH`, for example `BASE_PATH=./ npm run build`.

## Deployment

The site is published at **https://loranpython.github.io/would-you-approve/**.

Every push to `main` runs `.github/workflows/deploy.yml`. The workflow tests the code, builds both versions, runs the build check and publishes `dist/` to GitHub Pages. Links use hash routing (`#/case/coursehub/task/t4`), so refreshing a page and opening a deep link both work on Pages. Browser checks (`npm run e2e`) need a local Chrome or Edge and are not run in the workflow, so run them before pushing.

## Checking

```sh
npm test               # schedule logic, answer checking, saving, content checks and a full user journey
npm run check:build    # builds contain no sources, no interview ids and no external resources
npm run e2e            # opens the single file from disk in Chrome or Edge: keyboard use, layout, saving
npm run verify         # all of the above, plus both builds
npm run screenshots    # screenshots of the main pages (for the report appendix)
```

`e2e` and `screenshots` use a locally installed Chrome or Edge. Set `CHROME_PATH` if yours is not found.

## Privacy

Progress is saved only in the browser's local storage. If storage is unavailable, the activity still works but keeps answers only in memory. There are no accounts, no analytics, no AI calls and no network requests. The summary can be printed or downloaded as a text file; both are produced in the browser.

## Editing the content

All educational text is in `src/content/`, separate from the interface code:

| File | Contents |
|---|---|
| `coursehub/case.ts` | Case facts and the activity network (durations and predecessors) |
| `coursehub/proposal.ts` | The simulated AI-generated proposal |
| `coursehub/tasks.ts` | The six review tasks: options, hints, model answers, checklists and feedback |
| `coursehub/transfer.ts` | The independent challenge |
| `about.ts` | Introduction, "Why this activity?", teacher note and credits |
| `sources.ts` | Every handout and report citation (PDF page and slide number) |
| `shared.ts` | Interface wording such as the judgement options and result labels |

Notes for editors:

- Every item has a `verification` field: `verified-against-handout`, `verified-against-report`, `derived-from-brief` or `needs-review`.
- Text such as `{float:baseline:B|days}` is filled in from the schedule calculation, so explanations cannot contradict the numbers. Never type schedule results by hand.
- Keep option and item `id`s stable. If you change what a task asks, raise `CONTENT_VERSION` in `version.ts`; saved answers from the earlier version are then not applied.
- Run `npm test` after editing. The content tests catch broken references, unknown placeholders, interview ids and wording the brief rules out.

The supporting documents are in `docs/`:

- `SOURCE_MAP.md`: each concept with its handout page and slide number
- `OPEN_QUESTIONS.md`: decisions taken and content still to review
- `REPORT_DRAFTS.md`: the draft report paragraph and change-log row. Kept locally only and listed in `.gitignore`, so the draft is not public before the report is submitted.

## Adding a second case

Create a folder such as `src/content/newcase/` that exports a `CaseStudy` (see `src/content/types.ts` and `coursehub/index.ts`), add it to `src/content/cases.ts`, and raise `CONTENT_VERSION`. Navigation, saving, the summary and the tests pick it up automatically.

## Source material

`sources/` holds the lecture handouts and our report. It is listed in `.gitignore` and must not be committed, bundled or published. The site paraphrases course concepts and cites them by PDF page and slide number; it does not reproduce slides.
