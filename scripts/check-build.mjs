// Checks the production builds before sharing them.
// Usage: npm run build && npm run build:single && npm run check:build
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const problems = [];
const fail = (msg) => problems.push(msg);

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

// 1. sources/ must be git-ignored.
const gitignore = existsSync('.gitignore') ? readFileSync('.gitignore', 'utf8') : '';
if (!/^\/?sources\/?$/m.test(gitignore)) fail('.gitignore does not list sources/');

for (const dir of ['dist', 'dist-single']) {
  if (!existsSync(dir)) {
    fail(`${dir}/ is missing: run the builds first`);
    continue;
  }
  const all = files(dir);

  // 2. No course material or report files in the output.
  for (const f of all) {
    const rel = relative(dir, f);
    if (/\.pdf$/i.test(f) || /(^|[\\/])sources([\\/]|$)/.test(rel)) fail(`${dir}: contains ${rel}`);
  }

  for (const f of all.filter((f) => /\.(html|js|css)$/.test(f))) {
    const text = readFileSync(f, 'utf8');
    const rel = relative('.', f);

    // 3. No interview ids in user-facing strings. Minified identifiers are
    //    excluded by only looking inside string literals and HTML text.
    const literals = text.match(/(["'`])(?:\\.|(?!\1)[^\\\n])*\1/g) ?? [];
    const htmlText = f.endsWith('.html') ? text.replace(/<script[\s\S]*?<\/script>/g, '') : '';
    for (const s of [...literals, htmlText]) {
      const m = s.match(/\bI(0[1-9]|1[0-6])\b/);
      if (m) fail(`${rel}: interview id ${m[0]} in "${s.slice(0, 80)}"`);
    }

    // 4. Nothing loaded from the network: no external scripts, styles, fonts or CDNs.
    const external = text.match(/<(?:script|link|img|iframe)[^>]+(?:src|href)=["']?(?:https?:)?\/\/[^"'\s>]+/gi) ?? [];
    external.forEach((e) => fail(`${rel}: external resource ${e}`));
    if (/@import\s+url\(\s*["']?https?:/i.test(text) || /fonts\.googleapis|cdn\.jsdelivr|unpkg\.com|cdnjs/i.test(text)) {
      fail(`${rel}: references a CDN or web font`);
    }
    // 5. No analytics.
    if (/google-analytics|googletagmanager|gtag\(|plausible|matomo/i.test(text)) fail(`${rel}: analytics code`);
  }
}

// 6. The single-file build must be one self-contained HTML file.
if (existsSync('dist-single')) {
  const single = files('dist-single');
  if (single.length !== 1 || !single[0].endsWith('index.html')) fail(`dist-single should contain only index.html, found: ${single.join(', ')}`);
  const html = readFileSync(join('dist-single', 'index.html'), 'utf8');
  if (/<script[^>]+src=/i.test(html) || /<link[^>]+rel=["']?stylesheet[^>]+href=/i.test(html)) fail('dist-single/index.html loads separate files');
}

// 7. The Pages build must load its files from the configured base path
//    (default /would-you-approve/), never from the site root.
if (existsSync('dist/index.html')) {
  const base = process.env.BASE_PATH ?? '/would-you-approve/';
  const html = readFileSync('dist/index.html', 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !u.startsWith('data:'));
  for (const u of refs) if (!u.startsWith(base)) fail(`dist/index.html loads ${u} outside the base path ${base}`);
  if (refs.length === 0) fail('dist/index.html references no assets');
}

if (problems.length) {
  console.error('Build check FAILED:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Build check passed: no sources, no interview ids, no external resources, single file self-contained, Pages base path correct.');
