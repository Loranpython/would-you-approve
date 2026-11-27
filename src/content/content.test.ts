import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as about from './about';
import { CASES } from './cases';
import { caseFileSections } from '../ui/CaseFile';
import { SOURCES } from './sources';
import { fillSchedule } from '../logic/scenarios';
import type { CaseStudy, ChoiceOption, TaskPart } from './types';

/** Collects every string in the content, however deeply nested. */
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => allStrings(v, out));
  return out;
}

const siteStrings = allStrings({ about, SOURCES, CASES });

describe('case registry', () => {
  it('has unique, URL-safe case ids', () => {
    const ids = CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
  });
});

describe.each(CASES.map((c) => [c.id, c] as [string, CaseStudy]))('content integrity: %s', (_id, c) => {
  const strings = allStrings(c);
  const scenarioIds = new Set(Object.keys(c.schedule?.scenarios ?? {}));

  it('links every proposal section to one task', () => {
    expect(c.proposal.sections.map((s) => s.taskId)).toEqual(c.tasks.map((t) => t.id));
    expect(new Set(c.tasks.map((t) => t.id)).size).toBe(c.tasks.length);
  });

  it('includes at least one claim that should be approved', () => {
    expect(c.tasks.some((t) => t.expectedJudgement === 'approve')).toBe(true);
  });

  it('uses unique ids for parts, options, items and checklist entries', () => {
    for (const t of [...c.tasks, ...c.transfer.parts]) {
      const ids: string[] = [];
      for (const p of t.parts) {
        ids.push(`part:${p.id}`);
        if (p.kind === 'single' || p.kind === 'multi') p.options.forEach((o) => ids.push(`opt:${p.id}:${o.id}`));
        if (p.kind === 'classify') p.items.forEach((i) => ids.push(`item:${p.id}:${i.id}`));
        if (p.kind === 'text') p.checklist?.forEach((x) => ids.push(`check:${p.id}:${x.id}`));
      }
      expect(new Set(ids).size, `duplicate id in ${t.id}`).toBe(ids.length);
    }
  });

  it('gives every single-choice part a model answer and every classify item a valid category', () => {
    for (const t of [...c.tasks, ...c.transfer.parts]) {
      for (const p of t.parts) {
        if (p.kind === 'single') expect(p.options.some((o) => o.fit === 'expected')).toBe(true);
        if (p.kind === 'classify') {
          const cats = new Set(p.categories.map((x) => x.id));
          p.items.forEach((i) => expect(cats.has(i.correct), `${t.id}/${i.id}`).toBe(true));
        }
      }
    }
  });

  it('only refers to schedule scenarios that exist', () => {
    const used = [...c.tasks, ...c.transfer.parts].flatMap((t) => [
      ...('scenario' in t && t.scenario ? [t.scenario] : []),
      ...t.parts.flatMap((p) =>
        p.kind === 'number' || p.kind === 'path' ? [p.scenario] : p.kind === 'delay' ? [p.scenario, p.compareWith] : [],
      ),
      ...('feedback' in t ? t.feedback.showSchedule ?? [] : []),
    ]);
    used.forEach((s) => expect(scenarioIds.has(s), s).toBe(true));
  });

  it('only cites sources that exist', () => {
    const cited = [...c.tasks.flatMap((t) => t.feedback.conceptSources), ...c.transfer.parts.flatMap((p) => p.sources)];
    cited.forEach((id) => expect(SOURCES[id], id).toBeDefined());
  });

  it('only points to case file sections that exist', () => {
    const valid = new Set(caseFileSections(c).map((s) => s.id));
    c.tasks.forEach((t) => t.evidenceSections.forEach((s) => expect(valid.has(s), `${t.id}: ${s}`).toBe(true)));
  });

  it('resolves every schedule placeholder', () => {
    for (const s of strings) expect(() => fillSchedule(s, c.schedule), s).not.toThrow();
    for (const s of strings) expect(fillSchedule(s, c.schedule)).not.toMatch(/\{[a-z]+:[a-zA-Z0-9]+/);
  });

  it('gives every task a Stage 1 model answer and at least one Stage 2 question', () => {
    for (const t of c.tasks) {
      expect(t.initialReasoning.modelAnswer.length, t.id).toBeGreaterThan(40);
      expect(t.initialReasoning.checklist.length, t.id).toBeGreaterThan(0);
      expect(t.parts.some((p) => p.kind !== 'text'), t.id).toBe(true);
    }
  });

  it('starts Stage 1 model reasoning with the reasoning, not the judgement word', () => {
    for (const t of c.tasks) expect(t.initialReasoning.modelAnswer, t.id).not.toMatch(/^(Approve|Revise|Need more information)\b/);
  });

  it('gives every question a short, unique label for the results', () => {
    for (const t of [...c.tasks, ...c.transfer.parts]) {
      const labels = t.parts.map((p) => p.label);
      labels.forEach((l) => expect(l.length, `${t.id}: "${l}"`).toBeLessThanOrEqual(40));
      expect(new Set(labels).size, t.id).toBe(labels.length);
    }
  });

  it('opens the briefing with existing case sections', () => {
    c.briefing.sectionIds.forEach((id) => expect(c.sections.some((s) => s.id === id), id).toBe(true));
  });

  it('gives the independent challenge no hints', () => {
    c.transfer.parts.forEach((p) => expect('hints' in p).toBe(false));
  });
});

describe('nothing gives the answer away before submission', () => {
  type ChoicePart = Extract<TaskPart, { kind: 'single' | 'multi' }>;
  const choiceParts = CASES.flatMap((c) =>
    [...c.tasks, ...c.transfer.parts].flatMap((t) =>
      t.parts.filter((p): p is ChoicePart => p.kind === 'single' || p.kind === 'multi').map((p) => ({ name: `${c.id}/${t.id}/${p.id}`, p })),
    ),
  );
  /** Single choice: expected or acceptable answers. Multi choice: options that should be selected. */
  const isCorrect = (p: ChoicePart, o: ChoiceOption) => o.fit === 'expected' || (p.kind === 'single' && o.fit === 'acceptable');
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const hasLabel = (text: string) => /^[A-Z][^:]{0,30}: /.test(text);

  it('has choice parts to check', () => {
    expect(choiceParts.length).toBeGreaterThan(5);
  });

  it.each(choiceParts.map(({ name, p }) => [name, p] as const))(
    '%s: no correct option is more than 1.5× the average length of the other options',
    (_name, p) => {
      for (const o of p.options.filter((o) => isCorrect(p, o))) {
        // For multi-choice, compare with the options that should not be selected.
        const others = p.options.filter((x) => x !== o && (p.kind === 'single' || !isCorrect(p, x)));
        const ratio = o.text.length / mean(others.map((x) => x.text.length));
        expect(ratio, `"${o.text}" is ${ratio.toFixed(2)}× the average of the others`).toBeLessThanOrEqual(1.5);
      }
    },
  );

  it.each(choiceParts.map(({ name, p }) => [name, p] as const))(
    '%s: options share one structure (all "Label: definition" or all plain)',
    (_name, p) => {
      const labelled = p.options.map((o) => hasLabel(o.text));
      expect(new Set(labelled).size, p.options.map((o) => o.text).join(' | ')).toBe(1);
    },
  );

  it('does not make a model answer the longest option in most parts', () => {
    const longestIsCorrect = choiceParts.filter(({ p }) => {
      const max = Math.max(...p.options.map((o) => o.text.length));
      return p.options.filter((o) => o.text.length === max).every((o) => o.fit === 'expected');
    });
    expect(longestIsCorrect.length, longestIsCorrect.map((x) => x.name).join(', ')).toBeLessThanOrEqual(choiceParts.length / 2);
  });

  it.each(CASES.map((c) => [c.id, c] as [string, CaseStudy]))('%s: task titles are the neutral proposal headings', (_id, c) => {
    for (const t of c.tasks) {
      const section = c.proposal.sections.find((s) => s.taskId === t.id)!;
      expect(section.heading.replace(/^\d+\.\s*/, '')).toBe(t.title);
    }
  });

  it.each(CASES.map((c) => [c.id, c] as [string, CaseStudy]))(
    '%s: proposal headings, intro and neutral sentences do not name the flaw',
    (_id, c) => {
      const flaw = /assumption|risk|error|mistake|wrong|flaw|sound|critical|output|outcome|factor/i;
      const neutral = [c.proposal.intro, ...c.proposal.sections.flatMap((s) => [s.heading, s.before ?? '', s.after ?? ''])];
      for (const text of neutral) expect(text).not.toMatch(flaw);
    },
  );
});

describe('site-wide wording', () => {
  const text = siteStrings.join('\n');

  it('uses the lecturer’s stakeholder strategy labels', () => {
    for (const label of ['G1 Collaborate', 'G2 Satisfy', 'G3 Inform', 'G4 Monitor']) expect(text).toContain(label);
    expect(text).not.toMatch(/manage closely|keep satisfied|keep informed/i);
  });

  it('uses plain hyphens only: no en dash, em dash or minus sign', () => {
    const dashed = siteStrings.filter((x) => /[–—−]/.test(x));
    expect(dashed).toEqual([]);
  });

  it('contains no doubled full stop', () => {
    const doubled = siteStrings.filter((x) => /\.\./.test(x));
    expect(doubled).toEqual([]);
  });

  it('does not use "free float"', () => {
    expect(text).not.toMatch(/free float/i);
  });

  it('contains no interview ids or banned claims', () => {
    expect(text).not.toMatch(/\bI(0[1-9]|1[0-6])\b/);
    expect(text).not.toMatch(/exam[- ]ready|exam readiness|learning score|certified|mastered/i);
  });

  it('does not show the slide 221 wording note on the site (kept in docs only)', () => {
    expect(text).not.toMatch(/EF for successor/);
  });

  it('keeps the teacher note to about 150 words', () => {
    const words = allStrings(about.TEACHERS).join(' ').split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThanOrEqual(160);
  });

  it('labels the proposal accurately, here and in the README and report drafts', () => {
    for (const c of CASES) {
      expect(c.proposal.note).toBe(
        'Simulated proposal with deliberately chosen strengths and errors, prepared by the project group.',
      );
    }
    // REPORT_DRAFTS.md is kept locally only (not in the repository), so check it when present.
    const docs = ['README.md', 'docs/REPORT_DRAFTS.md']
      .filter((f) => existsSync(f))
      .map((f) => readFileSync(f, 'utf8'))
      .join('\n');
    for (const t of [text, docs]) expect(t).not.toMatch(/not (the )?output (from|of) (a|any) real AI|written by the project group/i);
  });

  it('does not say how the site was built (the group will add its own note later)', () => {
    const readme = readFileSync('README.md', 'utf8');
    for (const t of [text, readme]) {
      expect(t).not.toMatch(/claude|with AI assistance|drafted with AI|written with AI|AI-assisted|code written/i);
    }
  });

  it('includes the agreed credit lines', () => {
    expect(about.CREDIT).toBe(
      'Developed by Group 35 for TPK5100 Applied Project Management.',
    );
    expect(text).toContain("Case inspired by the lecturer's illustration example (handouts PDF p. 47, slides 109-110).");
  });
});
