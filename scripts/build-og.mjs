/**
 * Renders the social preview images (and the Apple touch icon) with headless
 * Chrome, reusing the site's own content and hero shader so the card cannot
 * drift away from the page it represents.
 *
 *   node scripts/build-og.mjs
 *
 * Output is deterministic: the shader is drawn at a fixed time, so rebuilding
 * without changing anything produces identical bytes.
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
const { VERT, FRAG } = await import(join(ROOT, 'src/lib/aurora.ts'));

// Chosen by sampling text-zone luminance across the animation: at this point
// the field is bright overall but dark exactly where the copy sits.
const SHADER_TIME = 126.0;

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

const page = (lang) => {
	const c = content[lang];
	const k = CARD[lang];
	return `<!doctype html><html lang="${c.locale}"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
*{box-sizing:border-box}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{position:relative;background:#08090b;color:#e9ecf1;
  font-family:'Space Grotesk',ui-sans-serif,system-ui,'PingFang SC','Microsoft YaHei',sans-serif}
canvas{position:absolute;inset:0;width:1200px;height:630px;display:block}
.grid{position:absolute;inset:0;
  background-image:linear-gradient(to right,rgb(255 255 255/.045) 1px,transparent 1px),
                   linear-gradient(to bottom,rgb(255 255 255/.045) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 85% 70% at 50% 45%,#000 20%,transparent 78%)}
.wrap{position:absolute;inset:0;padding:56px 64px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:14px;font-family:'JetBrains Mono',monospace;
  font-size:15px;letter-spacing:.06em;color:#8b93a1}
.mark{width:34px;height:34px;border-radius:9px;background:#ff6b35;color:#140700;
  display:grid;place-items:center;font-size:13px;font-weight:600;letter-spacing:.02em}
.mid{margin-top:auto}
.badge{display:inline-flex;align-items:center;gap:11px;font-family:'JetBrains Mono',monospace;
  font-size:16px;letter-spacing:.1em;color:#ff6b35;
  border:1px solid rgb(255 107 53/.36);background:rgb(255 107 53/.09);
  padding:8px 18px;border-radius:999px}
.pip{width:7px;height:7px;border-radius:50%;background:#ff6b35}
h1{margin:20px 0 0;font-size:92px;font-weight:700;letter-spacing:-.045em;line-height:1;
  background:linear-gradient(168deg,#fff 20%,#9aa4b2 96%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.role{margin:16px 0 0;font-family:'JetBrains Mono',monospace;font-size:26px;
  letter-spacing:.01em;color:#5eead4}
.open{margin:22px 0 0;display:flex;align-items:center;gap:11px;font-size:20px;color:#9aa4b2}
.beacon{width:9px;height:9px;border-radius:50%;background:#4ade80;box-shadow:0 0 12px #4ade80}
.bottom{margin-top:auto;padding-top:24px;border-top:1px solid #1a2029;
  display:flex;align-items:flex-end;gap:56px}
.stat dt{font-size:38px;font-weight:600;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.stat dd{margin:4px 0 0;font-family:'JetBrains Mono',monospace;font-size:13px;
  letter-spacing:.09em;text-transform:uppercase;color:#6b7483}
</style></head><body>
<canvas id="gl" width="1200" height="630"></canvas>
<div class="grid"></div>
<div class="wrap">
  <div class="top"><span class="mark">DZ</span><span>${host}</span></div>
  <div class="mid">
    <span class="badge"><span class="pip"></span>${k.badge}</span>
    <h1>${c.hero.name}</h1>
    <p class="role">${k.role}</p>
    <p class="open"><span class="beacon"></span>${k.open}</p>
  </div>
  <div class="bottom">
    ${k.stats.map(([v, l]) => `<dl class="stat"><dt>${v}</dt><dd>${l}</dd></dl>`).join('')}
  </div>
</div>
<script type="module">
const VERT = ${JSON.stringify(VERT)};
const FRAG = ${JSON.stringify(FRAG)};
const cv = document.getElementById('gl');
const gl = cv.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
const mk = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x);
  if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
const pr = gl.createProgram();
gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT));
gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(pr);
if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
gl.useProgram(pr);
const b = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, b);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
const l = gl.getAttribLocation(pr, 'a_pos');
gl.enableVertexAttribArray(l);
gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
gl.viewport(0, 0, cv.width, cv.height);
gl.uniform2f(gl.getUniformLocation(pr, 'u_res'), cv.width, cv.height);
gl.uniform1f(gl.getUniformLocation(pr, 'u_time'), ${SHADER_TIME});
gl.uniform2f(gl.getUniformLocation(pr, 'u_mouse'), 0, 0);
gl.drawArrays(gl.TRIANGLES, 0, 3);
await document.fonts.ready;
window.__ready = true;
</script></body></html>`;
};

const ICON = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:180px;height:180px}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#08090b"/>
  <rect x="4" y="4" width="56" height="56" rx="11" fill="none" stroke="#ff6b35" stroke-width="2.5"/>
  <text x="32" y="43" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
        font-size="26" font-weight="600" fill="#ff6b35">DZ</text>
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
	// JPEG, not PNG: the backdrop is a continuous gradient, where PNG costs
	// ~700 KB against ~100 KB for a visually identical JPEG.
	await p.screenshot({ path: join(ROOT, 'static', `${file}.jpg`), type: 'jpeg', quality: 90 });
	console.log(`wrote static/${file}.jpg  1200x630`);
	await ctx.close();
}

const ictx = await browser.newContext({ viewport: { width: 180, height: 180 } });
const ip = await ictx.newPage();
await ip.setContent(ICON, { waitUntil: 'load' });
await ip.waitForTimeout(150);
await ip.screenshot({ path: join(ROOT, 'static', 'apple-touch-icon.png') });
console.log('wrote static/apple-touch-icon.png  180x180');
await ictx.close();

await browser.close();
