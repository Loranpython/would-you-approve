import { useId } from 'react';
import type { CaseSchedule } from '../content/types';
import { scenarioResult } from '../logic/scenarios';
import { formatPath, type ScheduleResult } from '../logic/schedule';

// Sizes are in SVG units. The diagram is scaled to the card width (at most
// about 320px high), so names render at roughly body-text size on desktop.
const NODE_W = 220;
const GAP_X = 40;
const GAP_Y = 20;
const PAD = 8;
const NAME_LINE = 26;

function layout(result: ScheduleResult, nodeH: number) {
  const layer: Record<string, number> = {};
  for (const a of result.activities) {
    layer[a.id] = a.predecessors.length ? 1 + Math.max(...a.predecessors.map((p) => layer[p])) : 0;
  }
  const columns: string[][] = [];
  for (const a of result.activities) (columns[layer[a.id]] ??= []).push(a.id);
  const rows = Math.max(...columns.map((c) => c.length));
  const height = rows * nodeH + (rows - 1) * GAP_Y + PAD * 2;
  const width = columns.length * NODE_W + (columns.length - 1) * GAP_X + PAD * 2;
  const pos: Record<string, { x: number; y: number }> = {};
  columns.forEach((ids, col) => {
    ids.forEach((id, i) => {
      const offset = (i - (ids.length - 1) / 2) * (nodeH + GAP_Y);
      pos[id] = { x: PAD + col * (NODE_W + GAP_X), y: height / 2 + offset - nodeH / 2 };
    });
  });
  return { pos, width, height };
}

function wrap(text: string, max = 16): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/**
 * Activity-on-node diagram. Before an answer is submitted it shows only
 * activities, durations and dependencies; calculated values and the critical
 * path appear only when `showResults` is true.
 */
export function NetworkDiagram({ result, showResults, title }: { result: ScheduleResult; showResults: boolean; title: string }) {
  const uid = useId();
  // Node height follows the longest name (two or three lines), so no name is cut off.
  const nameLines = Math.max(2, ...result.activities.map((a) => wrap(a.name).length));
  const nodeH = (showResults ? 104 : 80) + nameLines * NAME_LINE;
  const { pos, width, height } = layout(result, nodeH);
  const isCritEdge = (from: string, to: string) =>
    showResults && result.byId[from].critical && result.byId[to].critical && result.byId[from].ef === result.byId[to].es;

  const deps = result.activities
    .filter((a) => a.predecessors.length)
    .map((a) => `${a.id} follows ${a.predecessors.join(' and ')}`)
    .join('; ');
  const desc = showResults
    ? `${deps}. Project duration ${result.projectDuration} working days. Critical path: ${result.criticalPaths.map(formatPath).join(' and ')}.`
    : `${deps}. The same information is in the table.`;

  return (
    <figure className="network" style={{ margin: 0 }}>
      <div className="network__scroll">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMid meet"
        role="img"
        aria-labelledby={`${uid}-t ${uid}-d`}
      >
        <title id={`${uid}-t`}>{title}</title>
        <desc id={`${uid}-d`}>{desc}</desc>
        <defs>
          <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="net-arrow" />
          </marker>
          <marker id={`${uid}-arrow-c`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="net-arrow net-arrow--critical" />
          </marker>
        </defs>
        {result.activities.flatMap((a) =>
          a.predecessors.map((p) => {
            const from = pos[p];
            const to = pos[a.id];
            const x1 = from.x + NODE_W;
            const y1 = from.y + nodeH / 2;
            const x2 = to.x - 2;
            const y2 = to.y + nodeH / 2;
            const mid = (x1 + x2) / 2;
            const crit = isCritEdge(p, a.id);
            return (
              <path
                key={`${p}-${a.id}`}
                d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                className={`net-edge${crit ? ' is-critical' : ''}`}
                markerEnd={`url(#${uid}-arrow${crit ? '-c' : ''})`}
              />
            );
          }),
        )}
        {result.activities.map((a) => {
          const { x, y } = pos[a.id];
          const crit = showResults && a.critical;
          const name = wrap(a.name);
          const cx = x + NODE_W / 2;
          return (
            <g key={a.id} className={`net-node${crit ? ' is-critical' : ''}`} aria-hidden="true">
              <rect x={x} y={y} width={NODE_W} height={nodeH} rx={8} />
              {showResults ? (
                <>
                  <text x={x + 10} y={y + 24} className="net-time">ES {a.es}</text>
                  <text x={x + NODE_W - 10} y={y + 24} className="net-time" textAnchor="end">EF {a.ef}</text>
                  {crit && <text x={cx} y={y + 24} className="net-crit" textAnchor="middle">CRITICAL</text>}
                  <text x={cx} y={y + 56} className="net-id" textAnchor="middle">{a.id} · {a.duration}d</text>
                  {name.map((l, i) => (
                    <text key={i} x={cx} y={y + 84 + i * NAME_LINE} className="net-name" textAnchor="middle">{l}</text>
                  ))}
                  <text x={x + 10} y={y + nodeH - 12} className="net-time">LS {a.ls}</text>
                  <text x={cx} y={y + nodeH - 12} className="net-time" textAnchor="middle">float {a.float}</text>
                  <text x={x + NODE_W - 10} y={y + nodeH - 12} className="net-time" textAnchor="end">LF {a.lf}</text>
                </>
              ) : (
                <>
                  <text x={cx} y={y + 36} className="net-id" textAnchor="middle">{a.id}</text>
                  {name.map((l, i) => (
                    <text key={i} x={cx} y={y + 66 + i * NAME_LINE} className="net-name" textAnchor="middle">{l}</text>
                  ))}
                  <text x={cx} y={y + nodeH - 14} className="net-time" textAnchor="middle">
                    {a.duration} {a.duration === 1 ? 'day' : 'days'}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      </div>
      <figcaption>
        {showResults
          ? 'Activity-on-node diagram. Critical activities have a thick border and the label CRITICAL.'
          : 'Activity-on-node diagram. Arrows show which activity must finish before the next can start.'}
      </figcaption>
    </figure>
  );
}

export function ScheduleTable({ result, showResults, caption }: { result: ScheduleResult; showResults: boolean; caption: string }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Activity</th>
            <th scope="col">Description</th>
            <th scope="col" className="num">Duration (days)</th>
            <th scope="col">Predecessors</th>
            {showResults && (
              <>
                <th scope="col" className="num">ES</th>
                <th scope="col" className="num">EF</th>
                <th scope="col" className="num">LS</th>
                <th scope="col" className="num">LF</th>
                <th scope="col" className="num">Float</th>
                <th scope="col">Critical</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {result.activities.map((a) => (
            <tr key={a.id} className={showResults && a.critical ? 'is-critical' : undefined}>
              <th scope="row">{a.id}</th>
              <td>{a.name}</td>
              <td className="num">{a.duration}</td>
              <td>{a.predecessors.length ? a.predecessors.join(', ') : 'none'}</td>
              {showResults && (
                <>
                  <td className="num">{a.es}</td>
                  <td className="num">{a.ef}</td>
                  <td className="num">{a.ls}</td>
                  <td className="num">{a.lf}</td>
                  <td className="num">{a.float}</td>
                  <td>{a.critical ? 'Yes' : 'No'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Table, diagram and summary for one scenario of a case schedule. */
export function ScenarioView({
  schedule,
  scenarioId,
  showResults,
}: {
  schedule: CaseSchedule;
  scenarioId: string;
  showResults: boolean;
}) {
  const result = scenarioResult(schedule, scenarioId);
  const label = schedule.scenarios[scenarioId].label;
  return (
    <div className="stack">
      <ScheduleTable result={result} showResults={showResults} caption={showResults ? `${label}: calculated values` : label} />
      <NetworkDiagram result={result} showResults={showResults} title={`${schedule.title}: ${label}`} />
      {showResults && (
        <p className="small">
          Project duration: <strong>{result.projectDuration} working days</strong>. Critical{' '}
          {result.criticalPaths.length > 1 ? 'paths' : 'path'}: <strong>{result.criticalPaths.map(formatPath).join(' and ')}</strong>. Float = LS − ES.
        </p>
      )}
    </div>
  );
}
