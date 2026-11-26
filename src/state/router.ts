// Hash routes, so the site works under any sub-path and when opened from disk.

import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'briefing'; caseId: string }
  | { name: 'case'; caseId: string }
  | { name: 'task'; caseId: string; taskId: string }
  | { name: 'challenge'; caseId: string }
  | { name: 'summary'; caseId: string }
  | { name: 'not-found' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { name: 'home' };
  if (parts[0] === 'about' && parts.length === 1) return { name: 'about' };
  if (parts[0] === 'case' && parts[1]) {
    const caseId = parts[1];
    if (parts.length === 2) return { name: 'case', caseId };
    if (parts[2] === 'briefing' && parts.length === 3) return { name: 'briefing', caseId };
    if (parts[2] === 'task' && parts[3] && parts.length === 4) return { name: 'task', caseId, taskId: parts[3] };
    if (parts[2] === 'challenge' && parts.length === 3) return { name: 'challenge', caseId };
    if (parts[2] === 'summary' && parts.length === 3) return { name: 'summary', caseId };
  }
  return { name: 'not-found' };
}

export const href = {
  home: () => '#/',
  about: () => '#/about',
  briefing: (caseId: string) => `#/case/${caseId}/briefing`,
  case: (caseId: string) => `#/case/${caseId}`,
  task: (caseId: string, taskId: string) => `#/case/${caseId}/task/${taskId}`,
  challenge: (caseId: string) => `#/case/${caseId}/challenge`,
  summary: (caseId: string) => `#/case/${caseId}/summary`,
};

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash, () => '');
}

export function navigate(to: string) {
  window.location.hash = to;
}
