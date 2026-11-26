import { describe, expect, it } from 'vitest';
import { CASE_SCHEDULE } from '../content/coursehub/case';
import { computeSchedule, isCriticalPath, ScheduleError, withDuration } from './schedule';
import { fillSchedule as fill, scenarioResult as result } from './scenarios';

const NETWORK = CASE_SCHEDULE.network;
const fillSchedule = (t: string) => fill(t, CASE_SCHEDULE);
const scenarioResult = (id: string) => result(CASE_SCHEDULE, id);

const timings = (r: ReturnType<typeof computeSchedule>) =>
  Object.fromEntries(r.activities.map((a) => [a.id, [a.es, a.ef, a.ls, a.lf, a.float]]));

describe('baseline network', () => {
  const r = computeSchedule(NETWORK);

  it('matches the hand calculation for every activity (ES, EF, LS, LF, float)', () => {
    expect(timings(r)).toEqual({
      A: [0, 2, 0, 2, 0],
      B: [2, 5, 3, 6, 1],
      C: [2, 6, 2, 6, 0],
      D: [6, 8, 6, 8, 0],
      E: [8, 11, 8, 11, 0],
    });
  });

  it('takes 11 working days with the single critical path A → C → D → E', () => {
    expect(r.projectDuration).toBe(11);
    expect(r.criticalPaths).toEqual([['A', 'C', 'D', 'E']]);
  });

  it('gives B one day of float, equal to both LS − ES and LF − EF', () => {
    const b = r.byId.B;
    expect(b.float).toBe(1);
    expect(b.ls - b.es).toBe(b.lf - b.ef);
    expect(b.critical).toBe(false);
  });

  it('sets D’s ES to the later of B’s and C’s EF (merge point)', () => {
    expect(r.byId.D.es).toBe(Math.max(r.byId.B.ef, r.byId.C.ef));
  });
});

describe('derived scenarios come from the same function', () => {
  it('B = 4 days: duration stays 11, B has no float, two critical paths', () => {
    const r = computeSchedule(withDuration(NETWORK, 'B', 4));
    expect(r.projectDuration).toBe(11);
    expect(r.byId.B.float).toBe(0);
    expect(r.criticalPaths).toHaveLength(2);
    expect(isCriticalPath(r, ['A', 'B', 'D', 'E'])).toBe(true);
    expect(isCriticalPath(r, ['A', 'C', 'D', 'E'])).toBe(true);
  });

  it('B = 5 days: duration 12, critical path A → B → D → E, C has one day of float', () => {
    const r = computeSchedule(withDuration(NETWORK, 'B', 5));
    expect(r.projectDuration).toBe(12);
    expect(r.criticalPaths).toEqual([['A', 'B', 'D', 'E']]);
    expect(r.byId.C.float).toBe(1);
  });

  it('named scenarios agree with direct calculation', () => {
    expect(scenarioResult('baseline').projectDuration).toBe(11);
    expect(scenarioResult('bPlus1').projectDuration).toBe(11);
    expect(scenarioResult('bPlus2').projectDuration).toBe(12);
  });

  it('does not mutate the baseline network', () => {
    withDuration(NETWORK, 'B', 5);
    expect(NETWORK.find((a) => a.id === 'B')!.duration).toBe(3);
  });
});

describe('invalid networks are rejected', () => {
  it('detects cycles', () => {
    expect(() =>
      computeSchedule([
        { id: 'X', name: 'x', duration: 1, predecessors: ['Y'] },
        { id: 'Y', name: 'y', duration: 1, predecessors: ['X'] },
      ]),
    ).toThrow(ScheduleError);
  });

  it('detects unknown predecessors and invalid durations', () => {
    expect(() => computeSchedule([{ id: 'X', name: 'x', duration: 1, predecessors: ['Q'] }])).toThrow(ScheduleError);
    expect(() => computeSchedule([{ id: 'X', name: 'x', duration: -1, predecessors: [] }])).toThrow(ScheduleError);
  });
});

describe('schedule placeholders in content text', () => {
  it('fills values from the calculation', () => {
    expect(fillSchedule('{duration:baseline} days; B float {float:baseline:B|days}; {paths:baseline}')).toBe(
      '11 days; B float 1 working day; A → C → D → E',
    );
    expect(fillSchedule('{paths:bPlus1}')).toBe('A → B → D → E and A → C → D → E');
    expect(fillSchedule('{float:baseline:C|days}')).toBe('0 working days');
  });

  it('throws on unknown scenarios, activities or fields', () => {
    expect(() => fillSchedule('{duration:nope}')).toThrow();
    expect(() => fillSchedule('{float:baseline:Z}')).toThrow();
    expect(() => fillSchedule('{colour:baseline:B}')).toThrow();
  });
});
