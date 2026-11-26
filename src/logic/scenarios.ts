import type { CaseSchedule } from '../content/types';
import { computeSchedule, formatPath, withDuration, type ActivityInput, type ScheduleResult } from './schedule';

export function scenarioNetwork(schedule: CaseSchedule, scenarioId: string): ActivityInput[] {
  const scenario = schedule.scenarios[scenarioId];
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);
  const change = scenario.change;
  return change ? withDuration(schedule.network, change.activity, change.duration) : schedule.network;
}

const cache = new WeakMap<CaseSchedule, Map<string, ScheduleResult>>();

export function scenarioResult(schedule: CaseSchedule, scenarioId: string): ScheduleResult {
  let perCase = cache.get(schedule);
  if (!perCase) cache.set(schedule, (perCase = new Map()));
  let result = perCase.get(scenarioId);
  if (!result) {
    result = computeSchedule(scenarioNetwork(schedule, scenarioId));
    perCase.set(scenarioId, result);
  }
  return result;
}

function days(n: number): string {
  return `${n} working ${n === 1 ? 'day' : 'days'}`;
}

const PLACEHOLDER = /\{([a-zA-Z]+):([a-zA-Z0-9]+)(?::([A-Z0-9]+))?(\|days)?\}/g;

/**
 * Fills schedule placeholders in content text, so wording cannot drift from
 * the calculation. Supported placeholders:
 *
 *   {duration:SCENARIO}            project duration, e.g. 11
 *   {paths:SCENARIO}               all critical paths, e.g. "A → C → D → E"
 *   {FIELD:SCENARIO:ACTIVITY}      FIELD = es | ef | ls | lf | float | duration
 *
 * Add "|days" to a numeric placeholder to get "1 working day" / "2 working days".
 * Unknown placeholders throw, so mistakes show up in tests.
 */
export function fillSchedule(text: string, schedule: CaseSchedule | undefined): string {
  return text.replace(PLACEHOLDER, (whole, field, scenarioId, activity, daysFlag) => {
    if (!schedule) throw new Error(`Placeholder ${whole} used in a case without a schedule`);
    if (!(scenarioId in schedule.scenarios)) throw new Error(`Unknown scenario in ${whole}`);
    const result = scenarioResult(schedule, scenarioId);
    let value: number | string;
    if (field === 'paths') {
      value = result.criticalPaths.map(formatPath).join(' and ');
    } else if (field === 'duration' && !activity) {
      value = result.projectDuration;
    } else {
      const a = activity ? result.byId[activity] : undefined;
      if (!a) throw new Error(`Unknown activity in ${whole}`);
      const fields: Record<string, number> = {
        es: a.es, ef: a.ef, ls: a.ls, lf: a.lf, float: a.float, duration: a.duration,
      };
      if (!(field in fields)) throw new Error(`Unknown field in ${whole}`);
      value = fields[field];
    }
    if (daysFlag) {
      if (typeof value !== 'number') throw new Error(`|days needs a number in ${whole}`);
      return days(value);
    }
    return String(value);
  });
}
