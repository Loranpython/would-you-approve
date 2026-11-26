import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { STAGE1 } from '../content/shared';
import { COURSEHUB } from '../content/coursehub';
import type { JudgementId, ReviewTask, TaskPart } from '../content/types';
import { expectedDelay, expectedNumber } from '../logic/check';
import { scenarioResult } from '../logic/scenarios';
import { createStore, STORAGE_KEY, type StorageLike } from '../state/progress';
import { App } from './App';

const C = COURSEHUB;

function memoryStorage(): StorageLike {
  const data: Record<string, string> = {};
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => void (data[k] = v),
    removeItem: (k) => void delete data[k],
  };
}

function go(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

const user = userEvent.setup();
const main = () => screen.getByRole('main');
const JUDGEMENT_NAME: Record<JudgementId, RegExp> = { approve: /^Approve/, revise: /^Revise/, 'more-info': /^Need more information/ };

/** Every text of a Stage 2 part that a student could read: prompt, options, items, categories. */
function stage2Texts(task: ReviewTask): string[] {
  return task.parts.flatMap((p) => [
    p.prompt,
    ...(p.kind === 'single' || p.kind === 'multi' ? p.options.map((o) => o.text) : []),
    ...(p.kind === 'classify' ? p.items.map((i) => i.text) : []),
  ]);
}
/** Case facts are evidence, visible in the case file anyway; an option may quote (part of) one word for word. */
const caseFacts = C.sections.flatMap((s) => s.facts.map((f) => f.text));
const quotesCaseFact = (x: string) => caseFacts.some((f) => f.includes(x));

/** Answers one Stage 2 part with the model answer. */
async function answerPart(part: TaskPart, scope: HTMLElement) {
  const q = within(scope);
  switch (part.kind) {
    case 'single': {
      const opt = part.options.find((o) => o.fit === 'expected')!;
      await user.click(q.getByRole('radio', { name: opt.text }));
      break;
    }
    case 'multi':
      for (const o of part.options.filter((o) => o.fit === 'expected')) await user.click(q.getByRole('checkbox', { name: o.text }));
      break;
    case 'classify':
      for (const item of part.items) {
        const group = q.getByRole('group', { name: item.text });
        const label = part.categories.find((c) => c.id === item.correct)!.label;
        await user.click(within(group).getByRole('radio', { name: label }));
      }
      break;
    case 'number':
      await user.type(q.getByLabelText(part.prompt), String(expectedNumber(part, C.schedule)));
      break;
    case 'path':
      for (const id of scenarioResult(C.schedule!, part.scenario).criticalPaths[0]) {
        await user.click(q.getByRole('button', { name: new RegExp(`^Add ${id}:`) }));
      }
      break;
    case 'delay':
      await user.click(q.getByRole('radio', { name: expectedDelay(part, C.schedule) === 'yes' ? /^Yes/ : /^No/ }));
      break;
    case 'text':
      await user.type(q.getByLabelText(part.prompt), 'My own answer to this question.');
      break;
  }
}

/** Answers one part so that it differs from the model answer, to bring up every "Model answer" line. */
async function answerPartWrongly(part: TaskPart, scope: HTMLElement) {
  const q = within(scope);
  switch (part.kind) {
    case 'single':
      await user.click(q.getByRole('radio', { name: part.options.find((o) => o.fit === 'differs')!.text }));
      break;
    case 'multi':
      for (const o of part.options.filter((o) => o.fit === 'differs')) await user.click(q.getByRole('checkbox', { name: o.text }));
      break;
    case 'classify':
      for (const item of part.items) {
        const group = q.getByRole('group', { name: item.text });
        const wrong = part.categories.find((c) => c.id !== item.correct)!.label;
        await user.click(within(group).getByRole('radio', { name: wrong }));
      }
      break;
    case 'number':
      await user.type(q.getByLabelText(part.prompt), '99');
      break;
    case 'path':
      await user.click(q.getByRole('button', { name: /^Add E:/ }));
      break;
    case 'delay':
      await user.click(q.getByRole('radio', { name: expectedDelay(part, C.schedule) === 'yes' ? /^No/ : /^Yes/ }));
      break;
    case 'text':
      await user.type(q.getByLabelText(part.prompt), 'An answer written in my words');
      break;
  }
}

/** No doubled full stop anywhere in the rendered page (open or collapsed sections). */
const expectNoDoubleStops = (where: string) => {
  const text = document.body.textContent ?? '';
  const i = text.search(/\.\./);
  expect(i, `${where}: "…${text.slice(Math.max(0, i - 40), i + 20)}…"`).toBe(-1);
};

async function submitStage1(judgement: JudgementId, reasoning = 'My first reasoning about this claim.') {
  await user.click(within(main()).getByRole('radio', { name: JUDGEMENT_NAME[judgement] }));
  await user.type(within(main()).getByLabelText(STAGE1.reasoningPrompt), reasoning);
  await user.click(within(main()).getByRole('radio', { name: 'Medium' }));
  await user.click(within(main()).getByRole('button', { name: STAGE1.submit }));
}

async function completeTask(task: ReviewTask, judgement: JudgementId = task.expectedJudgement) {
  go(`#/case/coursehub/task/${task.id}`);
  await submitStage1(judgement);
  for (const p of task.parts) await answerPart(p, main());
  await user.click(within(main()).getByRole('button', { name: 'Submit and see feedback' }));
}

let storage: StorageLike;

beforeEach(() => {
  storage = memoryStorage();
  window.location.hash = '#/';
});
afterEach(cleanup);

describe('user journey', () => {
  it('goes from the start page through the briefing to the proposal', async () => {
    render(<App store={createStore(storage)} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Would You Approve This?' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Start the review' }));
    expect(screen.getByRole('heading', { level: 1, name: C.title })).toBeInTheDocument();
    expect(screen.getByText(C.briefing.intro)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Activity network: baseline plan/ })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Continue to the proposal' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Read the proposal' })).toBeInTheDocument();
  });

  it('completes all six claims in two stages, the independent challenge and the summary', async () => {
    render(<App store={createStore(storage)} />);

    for (const task of C.tasks) {
      go(`#/case/coursehub/task/${task.id}`);
      expect(screen.queryByRole('heading', { name: 'Feedback' })).toBeNull();
      expect(screen.queryByText(task.lesson)).toBeNull();
      expect(screen.queryByText(task.initialReasoning.modelAnswer.slice(0, 40), { exact: false })).toBeNull();

      await completeTask(task);
      expect(screen.getByRole('heading', { name: 'Feedback' })).toBeInTheDocument();
      expect(screen.getAllByText('Checked automatically').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Self-assessed: not checked automatically').length).toBeGreaterThan(0);
      expect(screen.getByText('Your initial reasoning')).toBeInTheDocument();
      expect(screen.getByText(task.lesson)).toBeInTheDocument();
      // One result line per detail question, named by its label.
      const results = screen.getByRole('list', { name: 'Results for the detail questions' });
      for (const p of task.parts.filter((p) => p.kind !== 'text')) {
        expect(within(results).getByText(new RegExp(`^${p.label}: (correct|\\d+ of \\d+ (items correct|choices match the model answer))$`))).toBeInTheDocument();
      }
      // The longer feedback is collapsed by default.
      const details = screen.getByText('Evidence, course concept and sources').closest('details')!;
      expect(details.open).toBe(false);
      expect(details).toHaveTextContent('Course concept');
    }

    // Independent challenge: no hints, no model explanation before submission.
    go('#/case/coursehub/challenge');
    expect(screen.queryByRole('button', { name: /hint/i })).toBeNull();
    expect(screen.queryByText('Hints')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Model explanation' })).toBeNull();
    for (const part of C.transfer.parts) {
      const section = screen.getByRole('region', { name: part.title });
      for (const p of part.parts) await answerPart(p, section);
      await user.click(within(section).getByRole('radio', { name: 'High' }));
      await user.click(within(section).getByRole('button', { name: /^Submit Part/ }));
      expect(within(section).queryByRole('heading', { name: 'Model explanation' })).toBeNull(); // still confirming
      await user.click(within(section).getByRole('button', { name: 'Yes, submit' }));
      expect(within(section).getByRole('heading', { name: 'Model explanation' })).toBeInTheDocument();
      expect(within(section).queryByRole('button', { name: /^Submit/ })).toBeNull();
    }

    go('#/case/coursehub/summary');
    for (const h of ['Review summary', 'Practice results', 'Your explanations', 'Independent challenge', 'Reflection']) {
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
    }
    expect(screen.queryByText(/Not submitted yet/)).toBeNull();
    expect(document.body.textContent).not.toMatch(/learning score|exam readiness|exam-ready|certified|mastered|intelligence/i);
  }, 60_000);

  it.each(C.tasks.map((t) => [t.id, t] as const))(
    '%s: no Stage 2 text is in the DOM before the initial judgement is submitted',
    async (_id, task) => {
      render(<App store={createStore(storage)} />);
      go(`#/case/coursehub/task/${task.id}`);
      const texts = stage2Texts(task).filter((x) => !quotesCaseFact(x));
      expect(texts.length).toBeGreaterThan(0);
      for (const x of texts) expect(document.body.textContent, `found before Stage 1: "${x}"`).not.toContain(x);

      await submitStage1('revise');
      for (const x of texts) expect(document.body.textContent).toContain(x);
      // Stage 1 is now locked: its controls are gone.
      expect(screen.queryByRole('button', { name: STAGE1.submit })).toBeNull();
      expect(screen.queryByLabelText(STAGE1.reasoningPrompt)).toBeNull();
    },
    20_000,
  );

  it('records the initial judgement and reasoning next to the revised judgement', async () => {
    render(<App store={createStore(storage)} />);
    const t1 = C.tasks[0];
    go(`#/case/coursehub/task/${t1.id}`);
    await user.click(screen.getByRole('button', { name: /Show a hint/ }));
    expect(screen.getByText(t1.hints[0].text)).toBeInTheDocument();

    go(`#/case/coursehub/task/${t1.id}`);
    await submitStage1('approve', 'The deliverables in the claim look complete.');
    for (const p of t1.parts) await answerPart(p, main());
    await user.click(screen.getByRole('button', { name: 'Submit and see feedback' }));
    expect(within(main()).getAllByText('Differs from the model answer').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Revise my judgement or answers' }));
    const revised = screen.getByRole('group', { name: 'Your judgement after feedback' });
    await user.click(within(revised).getByRole('radio', { name: /^Revise/ }));
    await user.type(screen.getByLabelText('What changed your judgement?'), 'The intended benefits are effects, not deliverables.');
    await user.click(screen.getByRole('button', { name: 'Submit revised review' }));
    expect(screen.getByText(/attempt 2/)).toBeInTheDocument();
    expect(screen.getByText(/Your initial judgement was: Approve\. What changed: The intended benefits/)).toBeInTheDocument();

    go('#/case/coursehub/summary');
    const row = screen.getByRole('row', { name: /1\. Expected results/ });
    const cells = within(row).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Approve');
    expect(cells[1]).toHaveTextContent('The deliverables in the claim look complete.');
    expect(cells[2]).toHaveTextContent('Revise');
    expect(cells[2]).toHaveTextContent('What changedThe intended benefits are effects, not deliverables.');
    expect(cells[3]).toHaveTextContent('1'); // revisions
    expect(cells[4]).toHaveTextContent('1'); // hints used
    expect(cells[5]).toHaveTextContent('Medium'); // confidence before feedback
  }, 30_000);

  it('shows the model answer for a wrong choice without the "Yes." meant for students who chose it', async () => {
    render(<App store={createStore(storage)} />);
    const t5 = C.tasks.find((t) => t.id === 't5')!;
    go('#/case/coursehub/task/t5');
    await submitStage1('approve');
    for (const p of t5.parts) {
      if (p.id === 'statement-type' && p.kind === 'single') {
        await user.click(within(main()).getByRole('radio', { name: p.options.find((o) => o.id === 'fact')!.text }));
      } else await answerPart(p, main());
    }
    await user.click(screen.getByRole('button', { name: 'Submit and see feedback' }));
    const model = screen.getByText((_, el) => el?.tagName === 'P' && /^Model answer: An assumption/.test(el.textContent ?? ''));
    expect(model.textContent).not.toMatch(/\bYes\b/);
    expect(model).toHaveTextContent('The project manager expects it, but the IT service owner has not confirmed it.');
  }, 20_000);

  it.each(C.tasks.map((t) => [t.id] as const))(
    '%s: Stage 1 needs at least five words of reasoning before it can be submitted',
    async (taskId) => {
      render(<App store={createStore(storage)} />);
      go(`#/case/coursehub/task/${taskId}`);
      const submit = () => screen.getByRole('button', { name: STAGE1.submit });
      const field = screen.getByLabelText(STAGE1.reasoningPrompt);
      await user.click(within(main()).getByRole('radio', { name: /^Revise/ }));
      await user.click(within(main()).getByRole('radio', { name: 'Medium' }));

      // Empty, symbols only, numbers only and four words: not enough.
      for (const text of ['', '----', '!!! ??? ... 123 456 789', 'Four words are here']) {
        await user.clear(field);
        if (text) await user.type(field, text);
        expect(submit(), JSON.stringify(text)).toBeDisabled();
        expect(screen.getByText(STAGE1.reasoningTooShort)).toBeInTheDocument();
      }

      // Five words is enough; the content itself is not judged.
      await user.type(field, ' indeed');
      expect(submit()).toBeEnabled();
      expect(screen.queryByText(STAGE1.reasoningTooShort)).toBeNull();
      await user.click(submit());
      expect(screen.queryByRole('button', { name: STAGE1.submit })).toBeNull(); // Stage 1 recorded
    },
    20_000,
  );

  it('never shows a doubled full stop in feedback, even when every answer differs from the model', async () => {
    render(<App store={createStore(storage)} />);
    for (const task of C.tasks) {
      go(`#/case/coursehub/task/${task.id}`);
      await submitStage1(task.expectedJudgement === 'approve' ? 'revise' : 'approve', 'A first judgement in my words.');
      for (const p of task.parts) await answerPartWrongly(p, main());
      await user.click(screen.getByRole('button', { name: 'Submit and see feedback' }));
      expect(screen.getByRole('heading', { name: 'Feedback' })).toBeInTheDocument();
      expectNoDoubleStops(task.id);

      // A revision note without its own full stop.
      await user.click(screen.getByRole('button', { name: 'Revise my judgement or answers' }));
      await user.type(screen.getByLabelText('What changed your judgement?'), 'I read the case file again');
      await user.click(screen.getByRole('button', { name: 'Submit revised review' }));
      expectNoDoubleStops(`${task.id} after revision`);
    }

    go('#/case/coursehub/challenge');
    for (const part of C.transfer.parts) {
      const section = screen.getByRole('region', { name: part.title });
      for (const p of part.parts) await answerPartWrongly(p, section);
      await user.click(within(section).getByRole('radio', { name: 'Low' }));
      await user.click(within(section).getByRole('button', { name: /^Submit Part/ }));
      await user.click(within(section).getByRole('button', { name: 'Yes, submit' }));
    }
    expectNoDoubleStops('challenge');
    go('#/case/coursehub/summary');
    expectNoDoubleStops('summary');
  }, 90_000);

  it('asks for at least five words in written Stage 2 and challenge answers; the revision note stays optional', async () => {
    render(<App store={createStore(storage)} />);
    const t2 = C.tasks.find((t) => t.id === 't2')!;
    const written = t2.parts.find((p) => p.kind === 'text')!;
    go('#/case/coursehub/task/t2');
    await submitStage1('revise');
    for (const p of t2.parts.filter((p) => p.kind !== 'text')) await answerPart(p, main());

    const field = screen.getByLabelText(written.prompt);
    await user.type(field, '---- ????');
    expect(screen.getByText(STAGE1.reasoningTooShort)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit and see feedback' }));
    expect(screen.queryByRole('heading', { name: 'Feedback' })).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Complete question 3.');

    await user.clear(field);
    await user.type(field, 'Adoption judged one semester after launch');
    expect(screen.queryByText(STAGE1.reasoningTooShort)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Submit and see feedback' }));
    expect(screen.getByRole('heading', { name: 'Feedback' })).toBeInTheDocument();

    // The revision note is optional: resubmitting with it empty works.
    await user.click(screen.getByRole('button', { name: 'Revise my judgement or answers' }));
    await user.click(screen.getByRole('button', { name: 'Submit revised review' }));
    expect(screen.getByText(/attempt 2/)).toBeInTheDocument();

    // Challenge Part B: three words are not enough.
    go('#/case/coursehub/challenge');
    const partB = C.transfer.parts.find((p) => p.id === 'B')!;
    const section = screen.getByRole('region', { name: partB.title });
    for (const p of partB.parts) await user.type(within(section).getByLabelText(p.prompt), 'Too short here');
    await user.click(within(section).getByRole('radio', { name: 'Medium' }));
    await user.click(within(section).getByRole('button', { name: /^Submit Part B/ }));
    expect(within(section).queryByRole('button', { name: 'Yes, submit' })).toBeNull();
    expect(within(section).getAllByText(STAGE1.reasoningTooShort)).toHaveLength(partB.parts.length);
    for (const p of partB.parts) await user.type(within(section).getByLabelText(p.prompt), ' and now long enough');
    await user.click(within(section).getByRole('button', { name: /^Submit Part B/ }));
    expect(within(section).getByRole('button', { name: 'Yes, submit' })).toBeInTheDocument();
  }, 30_000);

  it('blocks each stage until it is complete, and says what is missing', async () => {
    render(<App store={createStore(storage)} />);
    go('#/case/coursehub/task/t4');
    await user.type(screen.getByLabelText(STAGE1.reasoningPrompt), 'C finishes later than B does.');
    await user.click(screen.getByRole('button', { name: STAGE1.submit }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose an initial judgement.');
    expect(screen.getByRole('alert')).toHaveTextContent('Say how confident you are.');
    expect(screen.queryByLabelText('What is the project duration?')).toBeNull();
    await user.clear(screen.getByLabelText(STAGE1.reasoningPrompt));

    await submitStage1('revise');
    await user.type(screen.getByLabelText('What is the project duration?'), 'eleven');
    await user.click(screen.getByRole('button', { name: 'Submit and see feedback' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Complete question 1.');
    expect(screen.getByText('Enter a whole number, for example 7.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Feedback' })).toBeNull();
  });

  it('keeps answers when switching to the case file and back, and after a reload', async () => {
    const { unmount } = render(<App store={createStore(storage)} />);
    go('#/case/coursehub/task/t3');
    await user.type(screen.getByLabelText(STAGE1.reasoningPrompt), 'IT can block the launch');
    await user.click(screen.getByRole('button', { name: 'Case file' }));
    await user.click(screen.getByRole('button', { name: 'Task' }));
    go('#/case/coursehub/task/t2');
    go('#/case/coursehub/task/t3');
    expect(screen.getByLabelText(STAGE1.reasoningPrompt)).toHaveValue('IT can block the launch');

    unmount();
    render(<App store={createStore(storage)} />);
    expect(screen.getByLabelText(STAGE1.reasoningPrompt)).toHaveValue('IT can block the launch');
  });

  it('opens only the linked case sections, and an evidence button opens and highlights its section', async () => {
    render(<App store={createStore(storage)} />);
    go('#/case/coursehub/task/t3'); // linked: stakeholders, planning
    const section = (id: string) => document.getElementById(`case-${id}`) as HTMLDetailsElement;
    expect(section('stakeholders').open).toBe(true);
    expect(section('planning').open).toBe(true);
    expect(section('background').open).toBe(false);
    expect(section('schedule').open).toBe(false);

    act(() => {
      section('stakeholders').open = false;
      section('stakeholders').dispatchEvent(new Event('toggle'));
    });
    await user.click(screen.getByRole('button', { name: 'Stakeholders' }));
    await waitFor(() => expect(section('stakeholders').open).toBe(true));
    expect(section('stakeholders')).toHaveClass('is-flashing');
    expect(screen.getByRole('button', { name: 'Case file' })).toHaveAttribute('aria-pressed', 'true'); // phone tab
    await waitFor(() => expect(section('stakeholders')).not.toHaveClass('is-flashing'), { timeout: 3000 });
  });

  it('keeps the network diagram out of the case panel and shows it full width in Task 4', () => {
    render(<App store={createStore(storage)} />);
    go('#/case/coursehub/task/t4');
    const panel = screen.getByRole('complementary', { name: 'Case file' });
    expect(within(panel).queryByRole('img')).toBeNull();
    expect(within(panel).getByRole('table')).toBeInTheDocument();
    const diagram = within(main()).getByRole('img', { name: /Activity network/ });
    // Every word of every activity name is drawn, so long names are wrapped, not cut off.
    const drawn = diagram.textContent!.replace(/\s+/g, ' ');
    for (const a of C.schedule!.network) for (const w of a.name.split(' ')) expect(drawn, a.name).toContain(w);
    // No calculated values anywhere before submission.
    expect(within(panel).queryByRole('columnheader', { name: 'Float' })).toBeNull();
    expect(document.body.textContent).not.toMatch(/CRITICAL/);
  });

  it('shows the full fictional-case disclaimer once per page', () => {
    render(<App store={createStore(storage)} />);
    expect(document.body.textContent).not.toContain(C.disclaimer);
    expect(screen.getByText('A fictional teaching case.')).toBeInTheDocument();
    for (const hash of ['#/case/coursehub/briefing', '#/case/coursehub', '#/case/coursehub/task/t1', '#/about']) {
      go(hash);
      expect(document.body.textContent!.split(C.disclaimer).length - 1, hash).toBe(1);
    }
  });

  it('resets all progress after confirmation', async () => {
    render(<App store={createStore(storage)} />);
    await completeTask(C.tasks[5]);
    await user.click(screen.getByRole('button', { name: 'Reset progress' }));
    await user.click(screen.getByRole('button', { name: 'Yes, reset' }));
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    go('#/case/coursehub/summary');
    expect(screen.getAllByText('Not submitted yet').length).toBe(C.tasks.length);
  }, 20_000);

  it('can be operated with the keyboard alone', async () => {
    render(<App store={createStore(storage)} />);
    go('#/case/coursehub/task/t4');
    const revise = screen.getByRole('radio', { name: /^Revise/ });
    revise.focus();
    await user.keyboard(' ');
    expect(revise).toBeChecked();
    await submitStage1('revise');
    screen.getByRole('button', { name: /^Add A:/ }).focus();
    await user.keyboard('{Enter}');
    screen.getByRole('button', { name: /^Add B:/ }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: /^Add C:/ })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByText('A → C')).toBeInTheDocument();
  });
});
