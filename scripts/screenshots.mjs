// Takes full-page screenshots of the single-file build, e.g. for the report appendix.
// Usage: npm run build:single && npm run screenshots [-- <outDir>]
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import { findChrome } from './chrome.mjs';

const out = resolve(process.argv[2] ?? 'screenshots');
const html = pathToFileURL(resolve('dist-single/index.html')).href;
const pages = [
  ['01-start', '#/', 1280],
  ['02-proposal', '#/case/coursehub', 1280],
  ['03-claim-3', '#/case/coursehub/task/t3', 1280],
  ['04-claim-4', '#/case/coursehub/task/t4', 1280],
  ['05-challenge', '#/case/coursehub/challenge', 1280],
  ['06-summary', '#/case/coursehub/summary', 1280],
  ['07-about', '#/about', 1280],
  ['08-claim-3-phone', '#/case/coursehub/task/t3', 390],
];

mkdirSync(out, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'wyat-'));
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true, userDataDir: profile });
try {
  const page = await browser.newPage();
  for (const [name, hash, width] of pages) {
    await page.setViewport({ width, height: 900 });
    await page.goto(html + hash, { waitUntil: 'load' });
    await page.screenshot({ path: join(out, `${name}.png`), fullPage: true });
    console.log(`saved ${name}.png`);
  }
} finally {
  await browser.close();
  rmSync(profile, { recursive: true, force: true });
}
