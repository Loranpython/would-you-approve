// Opens the single-file build directly from disk in a real browser (Chrome or
// Edge) and checks the parts that unit tests cannot: file:// loading, real
// localStorage, keyboard focus styles, layout width and network use.
// Usage: npm run build:single && npm run e2e [-- <screenshotDir>]
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { findChrome } from './chrome.mjs';

const CONTENT_VERSION = readFileSync('src/content/version.ts', 'utf8').match(/'([0-9.]+)'/)[1];

const shots = process.argv[2] ? resolve(process.argv[2]) : null;
if (shots) mkdirSync(shots, { recursive: true });
const base = pathToFileURL(resolve('dist-single/index.html')).href;
const routes = ['#/', '#/about', '#/case/coursehub/briefing', '#/case/coursehub', ...[1, 2, 3, 4, 5, 6].map((n) => `#/case/coursehub/task/t${n}`), '#/case/coursehub/challenge', '#/case/coursehub/summary'];

const failures = [];
const check = (ok, msg) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`);
  if (!ok) failures.push(msg);
};

const profile = mkdtempSync(join(tmpdir(), 'wyat-e2e-'));
const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  userDataDir: profile,
  ignoreDefaultArgs: ['--hide-scrollbars'],
});
try {
  const page = await browser.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => requests.push(r.url()));
  const go = async (hash) => {
    await page.goto(base + hash, { waitUntil: 'load' });
    await page.waitForSelector('h1');
  };
  const text = (sel) => page.$eval(sel, (el) => el.textContent.trim());

  // 1. Loads from disk.
  await page.setViewport({ width: 1280, height: 900 });
  await go('#/');
  check((await text('h1')) === 'Would You Approve This?', 'single file opens from disk and renders the start page');

  // 2. Every page renders, shows no interview ids, and fits phone, laptop and wide screens.
  for (const width of [390, 1366, 1920]) {
    await page.setViewport({ width, height: 800 });
    for (const r of routes) {
      await go(r);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(overflow <= 0, `${r} at ${width}px: no horizontal scrolling (${overflow}px)`);
      const body = await page.evaluate(() => document.body.innerText);
      check(!/\bI(0[1-9]|1[0-6])\b/.test(body), `${r} at ${width}px: no interview ids`);
      const aside = await page.evaluate(() => {
        const a = document.querySelector('.workspace__aside');
        if (!a || getComputedStyle(a).display === 'none') return null;
        return { inner: a.scrollHeight - a.clientHeight, overflow: getComputedStyle(a).overflowY, svg: a.querySelectorAll('svg').length };
      });
      if (aside) {
        check(aside.inner <= 1 && aside.overflow === 'visible', `${r} at ${width}px: case panel has no inner scrollbar`);
        check(aside.svg === 0, `${r} at ${width}px: no network diagram squeezed into the case panel`);
      }
    }
  }

  // Layout proportions at 1366 and 1920: wide page, case panel about 40%, same text size.
  for (const width of [1366, 1920]) {
    await page.setViewport({ width, height: 900 });
    await go('#/case/coursehub/task/t3');
    const m = await page.evaluate(() => {
      const main = document.querySelector('.workspace__main').getBoundingClientRect().width;
      const aside = document.querySelector('.workspace__aside').getBoundingClientRect().width;
      const fs = (sel) => parseFloat(getComputedStyle(document.querySelector(sel)).fontSize);
      return {
        share: aside / (main + aside),
        page: document.querySelector('.case-shell__content').getBoundingClientRect().width,
        same: fs('.fact-list li') === fs('body') && fs('.case-file .data') === fs('body'),
      };
    });
    check(m.share > 0.35 && m.share < 0.45, `${width}px: case panel takes ${(m.share * 100).toFixed(0)}% of the workspace`);
    check(m.page <= 1400, `${width}px: content width ${m.page.toFixed(0)}px beside the navigation (max 1400)`);
    check(m.same, `${width}px: case panel text is the same size as the main text`);
    if (shots) await page.screenshot({ path: join(shots, `claim-3-${width}.png`), fullPage: false });
  }

  // Briefing: headings in the same row of the two-column grid line up exactly.
  for (const width of [1366, 1920]) {
    await page.setViewport({ width, height: 900 });
    await go('#/case/coursehub/briefing');
    const tops = await page.evaluate(() =>
      ['constraints', 'benefits', 'stakeholders', 'planning'].map((id) => Math.round(document.getElementById(`brief-${id}`).getBoundingClientRect().top)),
    );
    check(tops[0] === tops[1] && tops[2] === tops[3], `${width}px: briefing headings aligned per row ${JSON.stringify(tops)}`);
  }

  // B. Evidence buttons: open, scroll into view and briefly highlight the section.
  for (const width of [1366, 390]) {
    await page.setViewport({ width, height: 800 });
    await go('#/case/coursehub/task/t5');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      document.getElementById('case-stakeholders').open = false;
    });
    await page.evaluate(() => [...document.querySelectorAll('.evidence-links button')].find((b) => b.textContent === 'Stakeholders').click());
    // Smooth scrolling takes a variable time: wait (up to 2.5 s) until the section has arrived.
    await page
      .waitForFunction(
        () => {
          const top = document.getElementById('case-stakeholders').getBoundingClientRect().top;
          const below = document.querySelector('.pane-toggle')?.getBoundingClientRect().bottom ?? 0;
          return top >= below - 1 && top < window.innerHeight;
        },
        { timeout: 2500 },
      )
      .catch(() => {});
    const st = await page.evaluate(() => {
      const d = document.getElementById('case-stakeholders');
      const rect = d.getBoundingClientRect();
      return {
        open: d.open,
        flashing: d.classList.contains('is-flashing'),
        // Below the sticky phone toggle (if shown) and within the window.
        inView: rect.top >= (document.querySelector('.pane-toggle')?.getBoundingClientRect().bottom ?? 0) - 1 && rect.top < window.innerHeight,
        panelShown: getComputedStyle(document.querySelector('.workspace__aside')).display !== 'none',
      };
    });
    check(st.open && st.flashing && st.inView && st.panelShown, `${width}px: evidence button opens, shows and highlights the section ${JSON.stringify(st)}`);
    if (shots && width === 390) await page.screenshot({ path: join(shots, 'phone-case-file-tab.png'), fullPage: false });
    // The highlight lasts about 1.6 s; wait up to 3 s for it to go.
    await page
      .waitForFunction(() => !document.getElementById('case-stakeholders').classList.contains('is-flashing'), { timeout: 3000 })
      .catch(() => {});
    const still = await page.evaluate(() => document.getElementById('case-stakeholders').classList.contains('is-flashing'));
    check(!still, `${width}px: the highlight is removed again`);
  }
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1366, height: 800 });
  await go('#/case/coursehub/task/t5');
  await page.evaluate(() => [...document.querySelectorAll('.evidence-links button')].find((b) => b.textContent === 'Planning notes').click());
  await new Promise((res) => setTimeout(res, 200));
  const reduced = await page.evaluate(() => {
    const d = document.getElementById('case-planning');
    return { anim: getComputedStyle(d).animationName, flashing: d.classList.contains('is-flashing') };
  });
  check(reduced.flashing && reduced.anim === 'none', `reduced motion: highlighted without animation ${JSON.stringify(reduced)}`);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

  // 3. Keyboard: tabbing reaches the controls, and focus is visible.
  await page.setViewport({ width: 1366, height: 900 });
  await go('#/case/coursehub/task/t4');
  const seen = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    seen.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        const style = getComputedStyle(el);
        return {
          tag: el.tagName,
          label: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('type') || '').trim().slice(0, 30),
          outline: style.outlineStyle,
        };
      }),
    );
  }
  // BODY appears when focus briefly leaves the page for the browser UI; it is not a tab stop.
  const stops = seen.filter((s) => s.tag !== 'BODY');
  check(stops.some((s) => s.tag === 'A' && s.label === 'Skip to content'), 'Tab reaches the skip link');
  check(stops.some((s) => s.label.startsWith('Claim 4')), 'Tab reaches the progress navigation');
  check(stops.some((s) => s.label === 'radio'), 'Tab reaches the judgement radios');
  // Radios draw their focus ring on the surrounding label instead.
  const noRing = stops.filter((s) => s.label !== 'radio' && s.outline === 'none');
  check(noRing.length === 0, `every tab stop shows a visible focus outline ${JSON.stringify(noRing)}`);

  // Answer Task 4 with the keyboard and mouse: Stage 1, then Stage 2.
  const radio = async (name) => {
    const handle = await page.evaluateHandle((n) => [...document.querySelectorAll('label.choice')].find((l) => l.textContent.trim().startsWith(n))?.querySelector('input'), name);
    await handle.asElement().focus();
    await page.keyboard.press('Space');
  };
  const clickButton = (label) => page.evaluate((l) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === l).click(), label);
  check((await page.$$('input[inputmode="numeric"]')).length === 0, 'Stage 2 is not on the page before the initial judgement');
  await radio('Revise');
  await page.type('textarea', 'B has float; C finishes later, so C sets the start of D.');
  await radio('Medium');
  await clickButton('Submit initial judgement');
  await page.waitForSelector('input[inputmode="numeric"]');
  check(await page.evaluate(() => document.activeElement?.textContent.includes('Check the details')), 'focus moves to Stage 2 after the initial judgement');
  const inputs = await page.$$('input[inputmode="numeric"]');
  await inputs[0].type('11');
  await inputs[1].type('1');
  for (const id of ['A', 'C', 'D', 'E']) {
    const b = await page.$(`button[aria-label^="Add ${id}:"]`);
    await b.focus();
    await page.keyboard.press('Enter');
  }
  check((await text('.path-builder__seq')).includes('A → C → D → E'), 'critical path built with the keyboard');
  await radio('No, it is not delayed');
  await clickButton('Submit and see feedback');
  await page.waitForSelector('.feedback');
  check(await page.evaluate(() => document.activeElement?.textContent === 'Feedback'), 'focus moves to the feedback after submitting');
  const fb = await page.evaluate(() => document.querySelector('.feedback').innerText);
  for (const line of ['Project duration: correct', 'Critical path: correct', 'Float of B: correct', 'Effect of a one-day delay in B: correct']) {
    check(fb.includes(line), `feedback shows "${line}"`);
  }
  check(await page.evaluate(() => [...document.querySelectorAll('.feedback details')].every((d) => !d.open)), 'evidence, concept and sources start collapsed');
  // Diagram labels render at about body-text size (16px) in the main column.
  const labelPx = await page.evaluate(() => {
    const svg = document.querySelector('.workspace__main .network svg');
    const name = svg.querySelector('.net-name');
    return parseFloat(getComputedStyle(name).fontSize) * svg.getScreenCTM().a;
  });
  // At 1366px the left navigation column narrows the task column, so labels are smaller.
  check(labelPx >= 12, `diagram node labels render at ${labelPx.toFixed(1)}px in Task 4 at 1366px (min 12)`);
  await page.setViewport({ width: 1920, height: 900 });
  const labelPxWide = await page.evaluate(() => {
    const svg = document.querySelector('.workspace__main .network svg');
    return parseFloat(getComputedStyle(svg.querySelector('.net-name')).fontSize) * svg.getScreenCTM().a;
  });
  check(labelPxWide >= 15, `diagram node labels render at ${labelPxWide.toFixed(1)}px in Task 4 at 1920px (min 15)`);
  await page.setViewport({ width: 1366, height: 900 });
  check(/self-assessed: not checked automatically/i.test(fb), 'written answer is labelled as self-assessed');
  if (shots) {
    await page.evaluate(() => document.querySelectorAll('details.more').forEach((d) => (d.open = true)));
    await page.screenshot({ path: join(shots, 'claim-4-feedback.png'), fullPage: true });
  }

  // 4. Real localStorage on file:// survives a reload.
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('.feedback');
  check(true, 'submitted review restored after reload');
  await go('#/case/coursehub/summary');
  const summary = await page.evaluate(() => document.body.innerText);
  check(summary.includes('4. Schedule') && summary.includes('Practice results'), 'summary lists the reviewed claim');
  if (shots) {
    await page.setViewport({ width: 390, height: 800 });
    await go('#/case/coursehub/task/t4');
    await page.screenshot({ path: join(shots, 'claim-4-feedback-phone.png'), fullPage: true });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await page.setViewport({ width: 1366, height: 900 });
    await go('#/case/coursehub/briefing');
    await page.screenshot({ path: join(shots, 'briefing-light.png'), fullPage: true });
    await go('#/case/coursehub/task/t3');
    await page.screenshot({ path: join(shots, 'claim-3-light.png'), fullPage: true });
    await go('#/case/coursehub/summary');
    await page.screenshot({ path: join(shots, 'summary-light.png'), fullPage: true });
  }

  // Long unbroken student text in every field, typed but not submitted and then submitted:
  // no route may become wider than the window at any width.
  const LONG = 'kè(rjknrovhefjelqnc'.repeat(15);
  const LONG_SENTENCE = `${LONG} and then a long ordinary sentence that keeps going for quite a while to fill the cell.`;
  const fillStorage = (kind) =>
    page.evaluate(
      (kind, long, version) => {
        const parts = { reason: long, action: long, rewrite: long, duration: long, 'float-b': long };
        const c = { tasks: {}, transfer: {}, reflection: long };
        for (const id of ['t1', 't2', 't3', 't4', 't5', 't6']) {
          c.tasks[id] =
            kind === 'typed'
              ? { initialDraft: { reasoning: long }, draft: { parts }, hintsShown: 2, attempts: [], revising: false, selfCheck: {} }
              : {
                  initialDraft: { reasoning: '' },
                  initial: { at: 1, judgement: 'approve', reasoning: long, confidence: 'low', hintsUsed: 2 },
                  draft: { parts },
                  hintsShown: 2,
                  attempts: [
                    { at: 2, answers: { judgement: 'approve', parts }, hintsUsed: 2 },
                    { at: 3, answers: { judgement: 'revise', parts }, hintsUsed: 2, revisionNote: long },
                  ],
                  revising: false,
                  selfCheck: {},
                };
        }
        const tp = { duration: long, 'critical-path': ['A'], why: long, 'pm-success': long, 'project-success': long, 'evidence-next': long };
        for (const id of ['A', 'B']) {
          c.transfer[id] =
            kind === 'typed'
              ? { draft: { parts: tp }, selfCheck: {} }
              : { draft: { parts: {} }, selfCheck: {}, submitted: { at: 4, answers: { parts: tp }, confidence: 'low', hintsUsed: 0 } };
        }
        localStorage.setItem('would-you-approve-this:progress', JSON.stringify({ contentVersion: version, seed: 1, cases: { coursehub: c } }));
      },
      kind,
      LONG_SENTENCE,
      CONTENT_VERSION,
    );
  // Names the outermost elements that stick out past the window, to point at the cause.
  const widest = () =>
    page.evaluate(() => {
      const vw = window.innerWidth;
      return [...document.querySelectorAll('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const p = el.parentElement?.getBoundingClientRect();
          return r.width > 0 && r.right > vw + 0.5 && !(p && p.right >= r.right - 0.5);
        })
        .slice(0, 3)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
    });
  for (const kind of ['typed', 'submitted']) {
    await go('#/');
    await fillStorage(kind);
    for (const width of [390, 1366, 1920]) {
      await page.setViewport({ width, height: 900 });
      for (const r of routes) {
        await page.goto('about:blank'); // a full reload, so the app reads the stored answers
        await go(r);
        const shown = await page.evaluate((needle) => document.body.innerText.includes(needle) || [...document.querySelectorAll('textarea')].some((t) => t.value.includes(needle)), LONG.slice(0, 20));
        const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        const where = over > 0 ? ` ${JSON.stringify(await widest())}` : '';
        check(over <= 0 && (shown || !/task|challenge|summary/.test(r)), `long text (${kind}) ${r} at ${width}px: no horizontal scrolling (${over}px)${where}`);
      }
      if (shots) {
        await go('#/case/coursehub/summary');
        await page.screenshot({ path: join(shots, `summary-long-${kind}-${width}.png`), fullPage: true });
      }
    }
  }

  // 5. No network use and no errors.
  const external = requests.filter((u) => !u.startsWith('file:') && !u.startsWith('data:') && !u.startsWith('blob:'));
  check(external.length === 0, `no network requests (${external.join(', ') || 'none'})`);
  check(errors.length === 0, `no console errors (${errors.join(' | ') || 'none'})`);
} finally {
  await browser.close();
  rmSync(profile, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll browser checks passed.');
