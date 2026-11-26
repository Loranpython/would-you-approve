import type { CaseStudy } from './types';
import { COURSEHUB } from './coursehub';

// All cases offered on the site. To add a case: create a folder like
// coursehub/ that exports a CaseStudy, add it here, and raise CONTENT_VERSION.
export const CASES: CaseStudy[] = [COURSEHUB];

export function getCase(id: string): CaseStudy | undefined {
  return CASES.find((c) => c.id === id);
}
