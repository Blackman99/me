/**
 * Renders the social preview images (and the Apple touch icon) with headless
 * Chrome, reusing the site's own content and hero shader so the card cannot
 * drift away from the page it represents.
 *
 *   node scripts/build-og.mjs
 *
 * Output is deterministic: the liquid chrome is drawn at a fixed time, with
 * the cursor's blob parked at a fixed spot, so rebuilding without changing
 * anything produces identical bytes.
 */
// Playwright is not a project dependency — these images are committed, so CI
// never renders them. Resolve it from the project or from a global install.
const { chromium } = await (async () => {
	for (const spec of ['playwright', '/opt/homebrew/lib/node_modules/playwright/index.mjs']) {
		try {
			return await import(spec);
		} catch {
			/* try the next one */
		}
	}
	throw new Error('Playwright not found. Install it with: npm i -g playwright');
})();

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { content, SITE_URL } = await import(join(ROOT, 'src/lib/content.ts'));
const { FS_HERO, VS_QUAD, PALETTES } = await import(join(ROOT, 'src/lib/fx/shaders.ts'));

// Chosen by eye: the blobs gather on the right and leave the left, where the
// name sits, dark.
const SHADER_TIME = 7.4;
const MOUSE = [2.15, 0.55];
const [A1, A2, A3] = PALETTES[0].c;

/**
 * Social platforms cache these images hard — LinkedIn can pin one for weeks —
 * so the card carries claims that stay true, while the live page keeps the
 * exact counts.
 */
const CARD = {
	en: {
		badge: 'Creator of Sveltepress',
		role: 'AI Full-Stack Engineer · 9 years',
		open: 'Open to full-time remote or contract · UTC+8',
		stats: [
			['9', 'years shipping'],
			['500+', 'stars on one project'],
			['80', 'public repos']
		]
	},
	zh: {
		badge: 'Sveltepress 作者',
		role: 'AI 全栈工程师 · 9 年经验',
		open: '可接全职远程 / 合同制 · UTC+8',
		stats: [
			['9', '年工程经验'],
			['500+', '单项目 star'],
			['80', '公开仓库']
		]
	}
};

const host = SITE_URL.replace(/^https?:\/\//, '');
const FONTS =
	'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap';

const page = (lang) => {
	const c = content[lang];
	const k = CARD[lang];
	return `<!doctype html><html lang="${c.locale}"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
*{box-sizing:border-box}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{position:relative;background:#060608;color:#f3f3f5;
  font-family:'Space Grotesk',ui-sans-serif,system-ui,'PingFang SC','Microsoft YaHei',sans-serif}
canvas{position:absolute;inset:0;width:1200px;height:630px;display:block}
.scrim{position:absolute;inset:0;
  background:linear-gradient(90deg,rgba(6,6,8,.92) 0%,rgba(6,6,8,.7) 38%,rgba(6,6,8,0) 66%)}
.wrap{position:absolute;inset:0;padding:54px 64px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:14px;font-family:'JetBrains Mono',monospace;
  font-size:15px;letter-spacing:.06em;color:#8b8b97}
.mark{width:34px;height:34px;border-radius:10px;
  background:linear-gradient(135deg,${A1},${A2} 50%,${A3});color:#060608;
  display:grid;place-items:center;font-size:13px;font-weight:700}
.mid{margin-top:auto}
.badge{display:inline-flex;align-items:center;gap:11px;font-family:'JetBrains Mono',monospace;
  font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#c4c4cc}
.dot{width:8px;height:8px;border-radius:50%;background:${A3};box-shadow:0 0 0 5px ${A3}33}
h1{margin:18px 0 0;font-size:${lang === 'zh' ? 104 : 96}px;font-weight:500;
  letter-spacing:${lang === 'zh' ? '-.02em' : '-.055em'};line-height:.95;color:#fff}
.role{margin:20px 0 0;font-family:'JetBrains Mono',monospace;font-size:22px;
  letter-spacing:.04em;text-transform:uppercase;color:${A3}}
.open{margin:18px 0 0;display:flex;align-items:center;gap:11px;font-size:20px;color:#c9c9d1}
.beacon{width:9px;height:9px;border-radius:50%;background:#4ade80;box-shadow:0 0 12px #4ade80}
.bottom{margin-top:auto;padding-top:22px;border-top:1px solid rgba(255,255,255,.08);
  display:flex;align-items:flex-end;gap:56px}
.stat dt{font-size:40px;font-weight:500;letter-spacing:-.05em;font-variant-numeric:tabular-nums}
.stat dd{margin:6px 0 0;font-family:'JetBrains Mono',monospace;font-size:13px;
  letter-spacing:.06em;text-transform:uppercase;color:#8b8b97}
</style></head><body>
<canvas id="gl" width="1200" height="630"></canvas>
<div class="scrim"></div>
<div class="wrap">
  <div class="top"><span class="mark">DZ</span><span>${host}</span></div>
  <div class="mid">
    <span class="badge"><span class="dot"></span>${k.badge}</span>
    <h1>${c.hero.name}</h1>
    <p class="role">${k.role}</p>
    <p class="open"><span class="beacon"></span>${k.open}</p>
  </div>
  <div class="bottom">
    ${k.stats.map(([v, l]) => `<dl class="stat"><dt>${v}</dt><dd>${l}</dd></dl>`).join('')}
  </div>
</div>
<script type="module">
const VS = ${JSON.stringify(VS_QUAD)};
const FS = ${JSON.stringify(FS_HERO)};
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const cv = document.getElementById('gl');
const gl = cv.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: true });
const mk = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x);
  if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
const pr = gl.createProgram();
gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS));
gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(pr);
if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
gl.useProgram(pr);
gl.bindVertexArray(gl.createVertexArray());
gl.viewport(0, 0, cv.width, cv.height);
const u = (n) => gl.getUniformLocation(pr, n);
gl.uniform2f(u('uRes'), cv.width, cv.height);
gl.uniform1f(u('uTime'), ${SHADER_TIME});
gl.uniform1f(u('uScroll'), 0);
gl.uniform1f(u('uCam'), 4);
gl.uniform3f(u('uMouse'), ${MOUSE[0]}, ${MOUSE[1]}, 0);
gl.uniform3fv(u('uA'), rgb(${JSON.stringify(A1)}));
gl.uniform3fv(u('uB'), rgb(${JSON.stringify(A2)}));
gl.uniform3fv(u('uC'), rgb(${JSON.stringify(A3)}));
gl.drawArrays(gl.TRIANGLES, 0, 3);
await document.fonts.ready;
window.__ready = true;
</script></body></html>`;
};

const ICON = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:180px;height:180px;background:#060608}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${A1}"/><stop offset=".5" stop-color="${A2}"/><stop offset="1" stop-color="${A3}"/>
  </linearGradient></defs>
  <rect width="64" height="64" fill="url(#g)"/>
  <text x="32" y="42" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
        font-size="24" font-weight="700" fill="#060608">DZ</text>
</svg>
<script>window.__ready = true;</script></body></html>`;

const browser = await chromium.launch({ channel: 'chrome' });

for (const [lang, file] of [
	['en', 'og'],
	['zh', 'og-zh']
]) {
	const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } });
	const p = await ctx.newPage();
	const errs = [];
	p.on('pageerror', (e) => errs.push(String(e)));
	await p.setContent(page(lang), { waitUntil: 'networkidle' });
	await p.waitForFunction(() => window.__ready, null, { timeout: 15000 });
	await p.waitForTimeout(250);
	if (errs.length) throw new Error(`${lang}: ${errs[0]}`);
	// JPEG, not PNG: the chrome is all soft gradients, where PNG costs several
	// times as much for a visually identical file.
	await p.screenshot({ path: join(ROOT, 'static', `${file}.jpg`), type: 'jpeg', quality: 90 });
	console.log(`wrote static/${file}.jpg  1200x630`);
	await ctx.close();
}

// iOS rounds the corners itself, so the icon is a full square.
const ictx = await browser.newContext({ viewport: { width: 180, height: 180 } });
const ip = await ictx.newPage();
await ip.setContent(ICON, { waitUntil: 'load' });
await ip.waitForTimeout(150);
await ip.screenshot({ path: join(ROOT, 'static', 'apple-touch-icon.png') });
console.log('wrote static/apple-touch-icon.png  180x180');
await ictx.close();

await browser.close();
