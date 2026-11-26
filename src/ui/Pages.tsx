import { CREDIT, INTRO, NOT_ENDORSED, RESEARCH, SITE_SUBTITLE, SITE_TITLE, SOURCE_NOTE, TEACHERS } from '../content/about';
import { CASES } from '../content/cases';
import { formatSource, SOURCES } from '../content/sources';
import { caseOf, taskOf, taskStatus } from '../state/progress';
import { endSentence } from '../logic/check';
import { href } from '../state/router';
import { PageHeading, useProgressState } from './common';

export function HomePage() {
  const p = useProgressState();
  return (
    <main id="main" className="page page--narrow">
      <div className="hero">
        <p className="eyebrow">{SITE_SUBTITLE}</p>
        <PageHeading>{SITE_TITLE}</PageHeading>
        <p className="hero__lead">{INTRO.lead}</p>
      </div>
      <div className="stack">
        <ol className="steps">
          {INTRO.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="muted">{INTRO.practical}</p>
        {CASES.map((c) => {
          const started = c.tasks.some((t) => taskStatus(taskOf(p, c.id, t.id)) !== 'not-started') ||
            Object.keys(caseOf(p, c.id).transfer).length > 0;
          return (
            <section key={c.id} className="card" aria-labelledby={`case-${c.id}-title`}>
              <h2 id={`case-${c.id}-title`}>{c.title}</h2>
              <p>{c.summary}</p>
              <p className="disclaimer" style={{ marginBottom: 14 }}>
                {INTRO.fictional}
              </p>
              <a className="btn btn--primary" href={started ? href.case(c.id) : href.briefing(c.id)}>
                {started ? 'Continue the review' : 'Start the review'}
              </a>
            </section>
          );
        })}
        <p className="small">
          <a href={href.about()}>Why this activity? Sources, credits and a note for teachers</a>
        </p>
      </div>
    </main>
  );
}

export function AboutPage() {
  const handouts = Object.values(SOURCES).filter((s) => s.file === 'Full-sett-of-handouts-.pdf');
  const report = Object.values(SOURCES).filter((s) => s.file === 'Final_Report.pdf');
  return (
    <main id="main" className="page page--narrow stack-lg">
      <div>
        <p className="eyebrow">About</p>
        <PageHeading>About this activity</PageHeading>
      </div>

      <section aria-labelledby="about-why">
        <h2 id="about-why">{RESEARCH.title}</h2>
        {RESEARCH.paragraphs.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </section>

      <section aria-labelledby="about-teachers">
        <h2 id="about-teachers">{TEACHERS.title}</h2>
        {TEACHERS.paragraphs.map((t) => (
          <p key={t}>{t}</p>
        ))}
        <p style={{ marginBottom: 4 }}>Discussion questions:</p>
        <ol>
          {TEACHERS.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="about-sources" className="stack">
        <h2 id="about-sources">Sources and credits</h2>
        <p>{INTRO.scope}</p>
        {CASES.map((c) => (
          <p key={c.id}>
            <strong>{endSentence(c.title)}</strong> {c.disclaimer} {c.credit}
          </p>
        ))}
        <p>{SOURCE_NOTE}</p>
        <details className="more">
          <summary>Lecture handouts cited ({handouts.length})</summary>
          <ul className="small">
            {handouts.map((s) => (
              <li key={s.id}>
                {formatSource(s)}: {s.topic}
              </li>
            ))}
          </ul>
        </details>
        <details className="more">
          <summary>Sections of our report cited ({report.length})</summary>
          <ul className="small">
            {report.map((s) => (
              <li key={s.id}>
                {formatSource(s)}: {s.topic}
              </li>
            ))}
          </ul>
        </details>
        <p>{NOT_ENDORSED}</p>
        <p>Privacy: the activity runs entirely in your browser. There is no tracking, and no answers are sent anywhere.</p>
        <p>
          <strong>{CREDIT}</strong>
        </p>
      </section>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main id="main" className="page page--narrow">
      <PageHeading>Page not found</PageHeading>
      <p>
        This link does not match a page in the activity. <a href={href.home()}>Go to the start page.</a>
      </p>
    </main>
  );
}
