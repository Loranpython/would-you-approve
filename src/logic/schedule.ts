// Critical path method (CPM) for small activity-on-node networks.
//
// Assumptions (match the activity): finish-to-start dependencies, no lags,
// no resource constraints, project starts at day 0, integer working days.
//
// Rules follow the course handouts (PDF p. 96, slides 220-221), using the
// standard meaning of the merge-point rule: at a merge point the largest EF
// of the predecessors becomes the successor's ES.

export interface ActivityInput {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
}

export interface ActivityTiming {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
  successors: string[];
  es: number;
  ef: number;
  ls: number;
  lf: number;
  /** Float (slack) = LS - ES = LF - EF. */
  float: number;
  critical: boolean;
}

export interface ScheduleResult {
  /** Activities in topological order. */
  activities: ActivityTiming[];
  byId: Record<string, ActivityTiming>;
  projectDuration: number;
  /** Every start-to-end path whose length equals the project duration. */
  criticalPaths: string[][];
  /** Every start-to-end path, with its total duration. */
  allPaths: { path: string[]; length: number }[];
}

export class ScheduleError extends Error {}

function topologicalOrder(activities: ActivityInput[]): ActivityInput[] {
  const byId = new Map(activities.map((a) => [a.id, a]));
  if (byId.size !== activities.length) throw new ScheduleError('Duplicate activity id');
  for (const a of activities) {
    if (!Number.isInteger(a.duration) || a.duration < 0) {
      throw new ScheduleError(`Activity ${a.id} has an invalid duration`);
    }
    for (const p of a.predecessors) {
      if (!byId.has(p)) throw new ScheduleError(`Activity ${a.id} has unknown predecessor ${p}`);
    }
  }
  const ordered: ActivityInput[] = [];
  const state = new Map<string, 'visiting' | 'done'>();
  const visit = (a: ActivityInput) => {
    const s = state.get(a.id);
    if (s === 'done') return;
    if (s === 'visiting') throw new ScheduleError(`Dependency cycle at ${a.id}`);
    state.set(a.id, 'visiting');
    for (const p of a.predecessors) visit(byId.get(p)!);
    state.set(a.id, 'done');
    ordered.push(a);
  };
  activities.forEach(visit);
  return ordered;
}

export function computeSchedule(input: ActivityInput[]): ScheduleResult {
  if (input.length === 0) throw new ScheduleError('Network has no activities');
  const ordered = topologicalOrder(input);

  const successors = new Map<string, string[]>(ordered.map((a) => [a.id, []]));
  for (const a of ordered) for (const p of a.predecessors) successors.get(p)!.push(a.id);

  // Forward pass: ES = largest EF of predecessors (0 at start); EF = ES + duration.
  const es = new Map<string, number>();
  const ef = new Map<string, number>();
  for (const a of ordered) {
    const start = Math.max(0, ...a.predecessors.map((p) => ef.get(p)!));
    es.set(a.id, start);
    ef.set(a.id, start + a.duration);
  }
  const projectDuration = Math.max(...ordered.map((a) => ef.get(a.id)!));

  // Backward pass: LF = smallest LS of successors (project end at finish); LS = LF - duration.
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();
  for (const a of [...ordered].reverse()) {
    const succ = successors.get(a.id)!;
    const finish = succ.length === 0 ? projectDuration : Math.min(...succ.map((s) => ls.get(s)!));
    lf.set(a.id, finish);
    ls.set(a.id, finish - a.duration);
  }

  const activities: ActivityTiming[] = ordered.map((a) => {
    const float = ls.get(a.id)! - es.get(a.id)!;
    return {
      id: a.id,
      name: a.name,
      duration: a.duration,
      predecessors: [...a.predecessors],
      successors: [...successors.get(a.id)!],
      es: es.get(a.id)!,
      ef: ef.get(a.id)!,
      ls: ls.get(a.id)!,
      lf: lf.get(a.id)!,
      float,
      critical: float === 0,
    };
  });
  const byId = Object.fromEntries(activities.map((a) => [a.id, a]));

  // Enumerate all start-to-end paths (fine for teaching-sized networks).
  const allPaths: { path: string[]; length: number }[] = [];
  const walk = (id: string, path: string[], length: number) => {
    const next = [...path, id];
    const total = length + byId[id].duration;
    const succ = byId[id].successors;
    if (succ.length === 0) allPaths.push({ path: next, length: total });
    else succ.forEach((s) => walk(s, next, total));
  };
  activities.filter((a) => a.predecessors.length === 0).forEach((a) => walk(a.id, [], 0));
  const criticalPaths = allPaths.filter((p) => p.length === projectDuration).map((p) => p.path);

  return { activities, byId, projectDuration, criticalPaths, allPaths };
}

/** Returns a copy of the network with one activity's duration changed. */
export function withDuration(network: ActivityInput[], id: string, duration: number): ActivityInput[] {
  if (!network.some((a) => a.id === id)) throw new ScheduleError(`Unknown activity ${id}`);
  return network.map((a) => (a.id === id ? { ...a, duration } : a));
}

export function formatPath(path: string[]): string {
  return path.join(' → ');
}

export function samePath(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/** True when the given sequence is one of the critical paths of the result. */
export function isCriticalPath(result: ScheduleResult, path: string[]): boolean {
  return result.criticalPaths.some((p) => samePath(p, path));
}
