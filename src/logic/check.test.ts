import { describe, expect, it } from 'vitest';
import { CASES } from '../content/cases';
import { COURSEHUB } from '../content/coursehub';
import type { TaskPart } from '../content/types';
import { checkPart, countWords, endSentence, MIN_REASONING_WORDS, parseNumber, shuffled, type PartValue } from './check';

const allParts = CASES.flatMap((c) =>
  [...c.tasks, ...c.transfer.parts].flatMap((t) => t.parts.map((p) => ({ c, t, p }))),
);
const part = (taskId: string, partId: string): TaskPart =>
  [...COURSEHUB.tasks, ...COURSEHUB.transfer.parts].find((t) => t.id === taskId)!.parts.find((p) => p.id === partId)!;

describe('stable shuffle', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];

  it('returns a permutation and the same order for the same seed and key', () => {
    const once = shuffled(ids, 42, 'k');
    expect([...once].sort()).toEqual(ids);
    expect(shuffled(ids, 42, 'k')).toEqual(once);
  });

  it('varies the order between seeds', () => {
    const orders = new Set(Array.from({ length: 20 }, (_, s) => shuffled(ids, s, 'k').join('')));
    expect(orders.size).toBeGreaterThan(5);
  });
});

describe('correctness follows option ids, not display position', () => {
  const shuffledParts = allParts.filter(({ p }) => (p.kind === 'single' || p.kind === 'multi' || p.kind === 'classify') && p.shuffle);

  it('has shuffled parts to test', () => {
    expect(shuffledParts.length).toBeGreaterThan(5);
  });

  it.each(Array.from({ length: 25 }, (_, i) => i))('seed %i: the option shown first keeps its own feedback', (seed) => {
    for (const { c, t, p } of shuffledParts) {
      const key = `${c.id}/${t.id}/${p.id}`;
      if (p.kind === 'single') {
        const firstShown = shuffled(p.options, seed, key)[0];
        const r = checkPart(p, firstShown.id)!;
        expect(r.fit).toBe(firstShown.fit);
        expect(r.details[0].id).toBe(firstShown.id);
      }
      if (p.kind === 'multi') {
        // Select whatever happens to be displayed in the first two positions.
        const picked = shuffled(p.options, seed, key).slice(0, 2).map((o) => o.id);
        const r = checkPart(p, picked)!;
        for (const o of p.options) {
          const shouldSelect = o.fit === 'expected';
          const expected = picked.includes(o.id) === shouldSelect ? 'expected' : 'differs';
          expect(r.details.find((d) => d.id === o.id)!.fit).toBe(expected);
        }
      }
      if (p.kind === 'classify') {
        const shown = shuffled(p.items, seed, key);
        const answer = Object.fromEntries(shown.map((i) => [i.id, i.correct]));
        expect(checkPart(p, answer)!.fit).toBe('expected');
      }
    }
  });
});

describe('model answers score as matching', () => {
  it.each(allParts.filter(({ p }) => p.kind === 'single' || p.kind === 'multi' || p.kind === 'classify').map(({ t, p }) => [`${t.id}/${p.id}`, p] as const))(
    '%s',
    (_name, p) => {
      let value: PartValue;
      if (p.kind === 'single') value = p.options.find((o) => o.fit === 'expected')!.id;
      else if (p.kind === 'multi') value = p.options.filter((o) => o.fit === 'expected').map((o) => o.id);
      else if (p.kind === 'classify') value = Object.fromEntries(p.items.map((i) => [i.id, i.correct]));
      else throw new Error('unexpected');
      expect(checkPart(p, value)!.fit).toBe('expected');
    },
  );
});

describe('schedule questions are checked against the calculation', () => {
  const s = COURSEHUB.schedule;

  it('Task 4: duration 11, path A → C → D → E, B float 1, one-day delay does not move the end', () => {
    expect(checkPart(part('t4', 'duration'), '11', s)!.fit).toBe('expected');
    expect(checkPart(part('t4', 'duration'), '12', s)!.fit).toBe('differs');
    expect(checkPart(part('t4', 'critical-path'), ['A', 'C', 'D', 'E'], s)!.fit).toBe('expected');
    expect(checkPart(part('t4', 'critical-path'), ['A', 'B', 'D', 'E'], s)!.fit).toBe('differs');
    expect(checkPart(part('t4', 'float-b'), '1', s)!.fit).toBe('expected');
    expect(checkPart(part('t4', 'b-plus-one'), 'no', s)!.fit).toBe('expected');
    expect(checkPart(part('t4', 'b-plus-one'), 'yes', s)!.fit).toBe('differs');
  });

  it('Transfer A: duration 12, path A → B → D → E', () => {
    expect(checkPart(part('A', 'duration'), '12', s)!.fit).toBe('expected');
    expect(checkPart(part('A', 'critical-path'), ['A', 'B', 'D', 'E'], s)!.fit).toBe('expected');
    expect(checkPart(part('A', 'critical-path'), ['A', 'C', 'D', 'E'], s)!.fit).toBe('differs');
  });

  it('accepts reasonable number formats and rejects others', () => {
    expect(parseNumber(' 11 ')).toBe(11);
    expect(parseNumber('11 days')).toBe(11);
    expect(parseNumber('11 working days')).toBe(11);
    expect(parseNumber('1,0')).toBe(1);
    expect(parseNumber('eleven')).toBeNull();
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('11-12')).toBeNull();
  });
});

describe('minimum length of the Stage 1 reasoning', () => {
  it('counts only words that contain letters', () => {
    expect(MIN_REASONING_WORDS).toBe(5);
    expect(countWords('')).toBe(0);
    expect(countWords('----')).toBe(0);
    expect(countWords('- - - - - - -')).toBe(0);
    expect(countWords('1 2 3 4 5 6')).toBe(0);
    expect(countWords('  IT can block the launch  ')).toBe(5);
    expect(countWords('B has float; C finishes later.')).toBe(6);
    expect(countWords('Ærlig talt: én, to, tre, fire')).toBe(6);
  });
});

describe('joining sentences', () => {
  it('adds a full stop only when the text does not already end a sentence', () => {
    expect(endSentence('Revise')).toBe('Revise.');
    expect(endSentence('…delaying configuration and the launch.')).toBe('…delaying configuration and the launch.');
    expect(endSentence('Is this confirmed?')).toBe('Is this confirmed?');
    expect(endSentence('“IT has not confirmed it.”')).toBe('“IT has not confirmed it.”');
    expect(endSentence('11 working days  ')).toBe('11 working days.');
  });
});

describe('written answers', () => {
  it('are never checked automatically', () => {
    for (const { p } of allParts.filter(({ p }) => p.kind === 'text')) {
      expect(checkPart(p, 'any answer, even one copying the model answer')).toBeNull();
    }
  });
});
