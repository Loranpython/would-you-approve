import { useEffect, useRef, useState } from 'react';
import { CREDIT, NOT_ENDORSED, SITE_SUBTITLE, SITE_TITLE } from '../content/about';
import { getCase } from '../content/cases';
import { useProgress, type ProgressStore } from '../state/progress';
import { href, parseHash, useHash } from '../state/router';
import { Briefing } from './Briefing';
import { CaseLayout } from './CaseLayout';
import { StoreContext, useStore } from './common';
import { AboutPage, HomePage, NotFoundPage } from './Pages';
import { ProposalOverview } from './Proposal';
import { SummaryView } from './SummaryView';
import { TaskView } from './TaskView';
import { TransferView } from './TransferView';

function ResetControl() {
  const store = useStore();
  const [confirming, setConfirming] = useState(false);
  const yesRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirming) yesRef.current?.focus();
  }, [confirming]);
  if (!confirming) {
    return (
      <button type="button" className="btn btn--quiet btn--small" onClick={() => setConfirming(true)}>
        Reset progress
      </button>
    );
  }
  return (
    <div role="group" aria-label="Confirm reset" className="btn-row">
      <span className="small">Delete all your answers in this browser?</span>
      <button
        ref={yesRef}
        type="button"
        className="btn btn--small"
        onClick={() => {
          store.reset();
          setConfirming(false);
        }}
      >
        Yes, reset
      </button>
      <button type="button" className="btn btn--quiet btn--small" onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </div>
  );
}

function Notices() {
  const store = useStore();
  useProgress(store); // re-render when notices change
  const notice = store.notice();
  if (notice === 'old-version') {
    const saveOld = () => {
      const blob = new Blob([store.oldData() ?? ''], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'earlier-answers.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    return (
      <div className="page" style={{ paddingBottom: 0 }}>
        <div className="notice notice--warn" role="status">
          <p>
            <strong>Earlier answers were not loaded.</strong> This browser has answers saved for an earlier version of the
            activity. The tasks have changed, so those answers were not applied. Until you decide, new answers are kept only
            while this tab is open.
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn--small" onClick={saveOld}>
              Download earlier answers
            </button>
            <button type="button" className="btn btn--small" onClick={() => store.discardOldData()}>
              Discard them and save from now on
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (notice === 'storage-unavailable') {
    return (
      <div className="page" style={{ paddingBottom: 0 }}>
        <p className="notice" role="status">
          This browser is not allowing the activity to save progress here, so your answers are kept only while this tab is
          open. Use the summary's print or download options to keep a copy.
        </p>
      </div>
    );
  }
  return null;
}

function Routes() {
  const hash = useHash();
  const route = parseHash(hash);

  useEffect(() => {
    window.scrollTo?.(0, 0);
  }, [hash]);

  if (route.name === 'home') return <HomePage />;
  if (route.name === 'about') return <AboutPage />;
  if (route.name === 'not-found') return <NotFoundPage />;

  const caseStudy = getCase(route.caseId);
  if (!caseStudy) return <NotFoundPage />;
  let page;
  if (route.name === 'briefing') page = <Briefing key={hash} caseStudy={caseStudy} />;
  else if (route.name === 'case') page = <ProposalOverview key={hash} caseStudy={caseStudy} />;
  else if (route.name === 'challenge') page = <TransferView key={hash} caseStudy={caseStudy} />;
  else if (route.name === 'summary') page = <SummaryView key={hash} caseStudy={caseStudy} />;
  else {
    const task = caseStudy.tasks.find((t) => t.id === route.taskId);
    if (!task) return <NotFoundPage />;
    page = <TaskView key={hash} caseStudy={caseStudy} task={task} />;
  }
  return (
    <CaseLayout caseStudy={caseStudy} route={route}>
      {page}
    </CaseLayout>
  );
}

export function App({ store }: { store: ProgressStore }) {
  return (
    <StoreContext.Provider value={store}>
      <a className="skip-link" href="#main" onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.querySelector('h1')?.focus();
      }}>
        Skip to content
      </a>
      <header className="app-header">
        <div className="app-header__inner">
          <a className="brand" href={href.home()}>
            <span className="brand__title">{SITE_TITLE}</span>
            <span className="brand__subtitle">{SITE_SUBTITLE}</span>
          </a>
          <div className="header-links">
            <a className="btn btn--quiet btn--small" href={href.about()}>
              About
            </a>
            <ResetControl />
          </div>
        </div>
      </header>
      <Notices />
      <Routes />
      <footer className="app-footer">
        <p style={{ marginBottom: 4 }}>{CREDIT}</p>
        <p style={{ margin: 0 }}>{NOT_ENDORSED}</p>
      </footer>
    </StoreContext.Provider>
  );
}
