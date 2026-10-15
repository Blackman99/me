import { initHero, initParticles } from './gl';
import { PALETTES, hex2rgb } from './shaders';

/*
 * Every effect on the page, wired onto the markup the Svelte components
 * prerendered. One requestAnimationFrame loop drives all of it, and anything
 * off screen is skipped. `mountFx` returns a teardown that undoes every
 * listener, observer and GL context, so a client-side hop between /en and /zh
 * leaves nothing running behind it.
 */

export interface FxOptions {
	motion: { on: string; off: string };
	cta: { idle: string; sent: string };
}

type RGB = [number, number, number];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
	const t = clamp((v - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};
const damp = (dt: number, k: number) => 1 - Math.exp(-dt * k);

const PALETTE_KEY = 'dz-palette';
const GLYPHS = '!#$%*+-=?^_|/\\[]{}01ABCDEFXZ';
const CLOCK = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'Asia/Shanghai',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false
});

export function mountFx(o: FxOptions): () => void {
	const root = document.documentElement;
	const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
	const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) =>
		Array.from(r.querySelectorAll<T>(s));

	/* ------------------------------------------------------------ teardown */
	const undo: (() => void)[] = [];
	const on = (t: EventTarget, type: string, fn: (e: never) => void, opts?: AddEventListenerOptions) => {
		t.addEventListener(type, fn as EventListener, opts);
		undo.push(() => t.removeEventListener(type, fn as EventListener, opts));
	};
	const observer = (cb: IntersectionObserverCallback, init?: IntersectionObserverInit) => {
		const io = new IntersectionObserver(cb, init);
		undo.push(() => io.disconnect());
		return io;
	};
	const timers = new Set<number>();
	const later = (fn: () => void, ms: number) => {
		const id = window.setTimeout(() => {
			timers.delete(id);
			fn();
		}, ms);
		timers.add(id);
	};
	let alive = true;
	let raf = 0;

	const fine = matchMedia('(pointer: fine)').matches;
	const rmq = matchMedia('(prefers-reduced-motion: reduce)');
	if (fine) root.classList.add('fine');

	const S = {
		motion: !rmq.matches,
		ready: false,
		mx: innerWidth * 0.65,
		my: innerHeight * 0.45,
		moved: false,
		W: innerWidth,
		H: innerHeight,
		dpr: Math.min(devicePixelRatio || 1, 2),
		sy: scrollY,
		vel: 0,
		time: 0,
		fps: 60
	};

	/* ------------------------------------------------------------ palettes */
	let palIdx = 0;
	let pal: RGB[] = PALETTES[0].c.map(hex2rgb);
	const palName = $('#palName');
	function setPalette(i: number) {
		palIdx = i;
		const p = PALETTES[i];
		p.c.forEach((c, k) => root.style.setProperty(`--a${k + 1}`, c));
		pal = p.c.map(hex2rgb);
		if (palName) palName.textContent = p.name;
		try {
			localStorage.setItem(PALETTE_KEY, String(i));
		} catch {
			/* private mode */
		}
	}
	function cyclePalette(e?: MouseEvent) {
		const next = (palIdx + 1) % PALETTES.length;
		if (!document.startViewTransition || !S.motion) return setPalette(next);
		const btn = $('#hueBtn')!.getBoundingClientRect();
		const x = e && e.clientX > 0 ? e.clientX : btn.left + btn.width / 2;
		const y = e && e.clientX > 0 ? e.clientY : btn.top + btn.height / 2;
		const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
		const vt = document.startViewTransition(() => setPalette(next));
		vt.ready
			.then(() => {
				root.animate(
					{ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
					{ duration: 900, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
				);
			})
			.catch(() => {});
	}
	{
		let saved = 0;
		try {
			saved = Number(localStorage.getItem(PALETTE_KEY)) || 0;
		} catch {
			/* private mode */
		}
		setPalette(saved % PALETTES.length);
	}
	on($('#hueBtn')!, 'click', (e: MouseEvent) => cyclePalette(e));
	on(window, 'keydown', (e: KeyboardEvent) => {
		if (e.key === 'p' && !e.metaKey && !e.ctrlKey && !e.altKey) cyclePalette();
	});

	/* ------------------------------------------------------------- canvases */
	const heroSec = $('#top')!;
	const heroTitle = $('#heroTitle')!;
	const heroBottom = $('#heroBottom')!;
	const glCv = $<HTMLCanvasElement>('#gl')!;
	const hero = initHero(glCv);
	if (!hero) glCv.classList.add('nogl');
	const gpuEl = $('#gpu');
	if (gpuEl) gpuEl.textContent = hero ? hero.gpu : 'n/a';
	undo.push(() => hero?.destroy());

	let parts: ReturnType<typeof initParticles> = null;
	const heroChars = $$('.ch', heroTitle).filter((c) => !c.closest('em'));
	const weights = heroChars.map(() => 500);

	const mfSec = $('#manifesto')!;
	const mfWords = $$('.wd', mfSec);

	/* ---------------------------------------------------------------- intro */
	// The particle shapes are sampled off the critical path: the engine is
	// a screen and a half below the fold.
	const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
	idle(
		() => {
			if (!alive) return;
			parts = initParticles($<HTMLCanvasElement>('#pgl')!);
			undo.push(() => parts?.destroy());
		},
		{ timeout: 1500 }
	);
	// The headline rises in the display face, so it waits (briefly) for it
	// rather than swapping fonts mid-flight.
	const fontsReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]);
	fontsReady.then(() => {
		if (!alive) return;
		requestAnimationFrame(() => {
			if (!alive) return;
			root.classList.add('ready');
			S.ready = true;
		});
	});
	undo.push(() => root.classList.remove('ready', 'fine', 'still'));

	/* ---------------------------------------------------------------- cursor */
	const cursor = $('#cursor')!;
	const cDot = $('#cDot')!;
	const cRing = $('#cRing')!;
	const cLabel = $('#cLabel')!;
	const ring = { x: S.mx, y: S.my };
	on(
		window,
		'pointermove',
		(e: PointerEvent) => {
			S.mx = e.clientX;
			S.my = e.clientY;
			S.moved = true;
			cursor.classList.remove('gone');
			cDot.style.transform = `translate3d(${S.mx}px,${S.my}px,0)`;
		},
		{ passive: true }
	);
	on(document, 'pointerleave', () => cursor.classList.add('gone'));
	on(document, 'pointerover', (e: PointerEvent) => {
		const t = (e.target as Element).closest<HTMLElement>('a, button, [data-cursor]');
		cursor.classList.toggle('hover', !!t);
		cLabel.textContent = t?.dataset.cursor ?? '';
	});

	/* ---------------------------------------------------------- text scramble */
	const scrambling = new WeakMap<HTMLElement, number>();
	function scramble(el: HTMLElement, to: string, dur = 900) {
		const from = el.textContent ?? '';
		const len = Math.max(from.length, to.length);
		const q: { f: string; t: string; s: number; e: number }[] = [];
		for (let i = 0; i < len; i++) {
			const s = Math.random() * dur * 0.4;
			q.push({ f: from[i] || '', t: to[i] || '', s, e: s + dur * 0.25 + Math.random() * dur * 0.35 });
		}
		const t0 = performance.now();
		cancelAnimationFrame(scrambling.get(el) ?? 0);
		const step = (now: number) => {
			if (!alive) return;
			const t = now - t0;
			let out = '';
			let done = 0;
			for (const it of q) {
				if (t >= it.e) {
					done++;
					out += it.t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
				} else if (t >= it.s)
					out += `<i class="sg">${GLYPHS[(Math.random() * GLYPHS.length) | 0].replace('\\', '&#92;')}</i>`;
				else out += it.f.replace(/&/g, '&amp;').replace(/</g, '&lt;');
			}
			el.innerHTML = out;
			if (done < q.length) scrambling.set(el, requestAnimationFrame(step));
		};
		scrambling.set(el, requestAnimationFrame(step));
	}

	/* ------------------------------------------------------------------- nav */
	const nav = $('#nav')!;
	const links = $$<HTMLAnchorElement>('#links a');
	const pill = $('#pill')!;
	let activeLink: HTMLAnchorElement | null = null;
	const movePill = (a: HTMLAnchorElement | null) => {
		if (!a) {
			pill.style.opacity = '0';
			return;
		}
		pill.style.opacity = '1';
		pill.style.width = a.offsetWidth + 'px';
		pill.style.transform = `translateX(${a.offsetLeft}px)`;
	};
	for (const a of links) {
		const lbl = $('.lbl', a)!;
		const text = lbl.textContent ?? '';
		on(a, 'pointerenter', () => {
			movePill(a);
			scramble(lbl, text, 500);
		});
	}
	on($('#links')!, 'pointerleave', () => movePill(activeLink));
	const secIO = observer(
		(es) =>
			es.forEach((e) => {
				if (!e.isIntersecting) return;
				activeLink = links.find((a) => a.getAttribute('href') === '#' + e.target.id) ?? null;
				links.forEach((a) => a.classList.toggle('active', a === activeLink));
				movePill(activeLink);
			}),
		{ rootMargin: '-45% 0px -50% 0px' }
	);
	for (const id of ['top', 'manifesto', 'engine', 'production', 'agents', 'oss', 'play', 'domains', 'contact']) {
		const el = document.getElementById(id);
		if (el) secIO.observe(el);
	}

	/* -------------------------------------------------------------- magnetic */
	for (const el of $$('.magnetic')) {
		const inner = $('.m-in', el);
		const k = Number(el.dataset.strength) || 0.3;
		on(el, 'pointermove', (e: PointerEvent) => {
			if (!fine || !S.motion) return;
			const r = el.getBoundingClientRect();
			const x = e.clientX - (r.left + r.width / 2);
			const y = e.clientY - (r.top + r.height / 2);
			el.style.transform = `translate(${x * k}px, ${y * k}px)`;
			if (inner) inner.style.transform = `translate(${x * k * 0.45}px, ${y * k * 0.45}px)`;
		});
		on(el, 'pointerleave', () => {
			el.style.transform = '';
			if (inner) inner.style.transform = '';
		});
	}

	/* --------------------------------------------------- visibility + reveals */
	const vis = new Map<Element, boolean>();
	const visIO = observer((es) => es.forEach((e) => vis.set(e.target, e.isIntersecting)), {
		rootMargin: '120px 0px'
	});
	const isVis = (el: Element | null) => !!el && vis.get(el) !== false;
	const engineSec = $('#engine')!;
	const proc = $('#oss')!;
	const fpsCard = $('#fpsCard');
	const springCard = $('#springCard');
	const footer = $('#footer')!;
	const marquee = $('#marquee')!;
	const decoders = $$('[data-decode]');
	for (const el of [heroSec, engineSec, mfSec, proc, fpsCard, springCard, footer, marquee, ...decoders])
		if (el) visIO.observe(el);

	const onReveal = (el: Element) => {
		if (el.classList.contains('stat')) rollOdo(el);
		if (el.id === 'terminal') runTerminal();
	};
	const revIO = observer(
		(es) =>
			es.forEach((e) => {
				if (!e.isIntersecting) return;
				e.target.classList.add('in');
				revIO.unobserve(e.target);
				onReveal(e.target);
			}),
		{ threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
	);
	$$('[data-reveal], [data-split]').forEach((el) => revIO.observe(el));

	/* -------------------------------------------------------------- odometer */
	function rollOdo(stat: Element) {
		for (const c of $$('.odo-s', stat)) {
			if (!S.motion) c.style.transition = 'none';
			c.style.transform = `translateY(${-Number(c.dataset.to)}em)`;
		}
	}

	/* -------------------------------------------------------------- terminal */
	let termStarted = false;
	async function runTerminal() {
		if (termStarted) return;
		termStarted = true;
		const el = $('#term');
		if (!el) return;
		const caret = document.createElement('span');
		caret.className = 'caret';
		el.appendChild(caret);
		const sleep = (ms: number) => new Promise<void>((r) => later(r, S.motion ? ms : 0));
		const out = (html: string) => caret.insertAdjacentHTML('beforebegin', html);
		const type = async (txt: string) => {
			const s = document.createElement('span');
			s.className = 't-b';
			caret.before(s);
			for (const c of txt) {
				if (!alive) return;
				s.textContent += c;
				await sleep(24 + Math.random() * 46);
			}
		};
		const prompt = () => out('<span class="t-p">❯</span> ');
		const ok = (a: string, b: string) =>
			out(`<span class="t-ok">  ✔</span> <span class="t-b">${a}</span> <span class="t-dim">${b}</span>\n`);
		// codsh's own /ship pipeline, abridged: pre-flight and the design
		// interview happen before anything worth showing.
		prompt();
		await sleep(500);
		await type('/ship add gzip paging to the path endpoint');
		await sleep(420);
		out('\n');
		ok('spec    ', '2 stories · gate 1 passed');
		await sleep(300);
		ok('tickets ', '3 slices · DAG · gate 2 passed');
		await sleep(300);
		ok('landing ', '3 worktrees · TDD in parallel');
		await sleep(380);
		out('<span class="t-acc">  ›</span> <span class="t-b">bash    </span> go test ./internal/path/...\n');
		await sleep(700);
		out('    <span class="t-acc">ok</span>   internal/path   <span class="t-dim">1.284s</span>\n\n');
		await sleep(420);
		out('<span class="t-ok">  ✔ done</span> <span class="t-dim">·</span> 0 regressions <span class="t-dim">·</span> merged back clean\n\n');
		await sleep(300);
		prompt();
	}

	/* ------------------------------------------------------ cards: spotlight */
	for (const group of $$('[data-spot]')) {
		const cards = $$('.card', group);
		on(group, 'pointermove', (e: PointerEvent) => {
			for (const c of cards) {
				const r = c.getBoundingClientRect();
				c.style.setProperty('--mx', `${e.clientX - r.left}px`);
				c.style.setProperty('--my', `${e.clientY - r.top}px`);
			}
		});
	}
	for (const c of $$('.bento .card')) {
		on(c, 'pointermove', (e: PointerEvent) => {
			if (!fine || !S.motion || !c.classList.contains('in')) return;
			const r = c.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width - 0.5;
			const py = (e.clientY - r.top) / r.height - 0.5;
			c.style.transform = `perspective(1100px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
		});
		on(c, 'pointerleave', () => {
			c.style.transform = '';
		});
	}

	/* --------------------------------------------------- live frame-time graph */
	const fpsCv = $<HTMLCanvasElement>('#fpsCv');
	const fctx = fpsCv?.getContext('2d') ?? null;
	const frameTimes: number[] = new Array(150).fill(16.7);
	function drawFps() {
		if (!fpsCv || !fctx) return;
		const w = Math.round(fpsCv.clientWidth * S.dpr);
		const h = Math.round(fpsCv.clientHeight * S.dpr);
		if (fpsCv.width !== w || fpsCv.height !== h) {
			fpsCv.width = w;
			fpsCv.height = h;
		}
		const d = S.dpr;
		fctx.clearRect(0, 0, w, h);
		const yOf = (ms: number) => h - clamp(ms / 40, 0, 1) * h;
		fctx.setLineDash([3 * d, 5 * d]);
		fctx.strokeStyle = 'rgba(255,255,255,.14)';
		fctx.lineWidth = d;
		fctx.font = `${10 * d}px ui-monospace, Menlo, monospace`;
		fctx.fillStyle = 'rgba(255,255,255,.3)';
		for (const [ms, label] of [
			[16.7, '60 FPS · 16.7 MS'],
			[8.3, '120 FPS · 8.3 MS']
		] as const) {
			const y = yOf(ms);
			fctx.beginPath();
			fctx.moveTo(26 * d, y);
			fctx.lineTo(w - 26 * d, y);
			fctx.stroke();
			fctx.fillText(label, w - 26 * d - fctx.measureText(label).width, y - 6 * d);
		}
		fctx.setLineDash([]);
		const cs = getComputedStyle(root);
		const grad = fctx.createLinearGradient(0, 0, w, 0);
		grad.addColorStop(0, cs.getPropertyValue('--a1').trim());
		grad.addColorStop(0.5, cs.getPropertyValue('--a2').trim());
		grad.addColorStop(1, cs.getPropertyValue('--a3').trim());
		fctx.beginPath();
		frameTimes.forEach((ms, i) => {
			const x = 26 * d + (i / (frameTimes.length - 1)) * (w - 52 * d);
			if (i) fctx.lineTo(x, yOf(ms));
			else fctx.moveTo(x, yOf(ms));
		});
		fctx.strokeStyle = grad;
		fctx.lineWidth = 2 * d;
		fctx.lineJoin = 'round';
		fctx.stroke();
		fctx.lineTo(w - 26 * d, h);
		fctx.lineTo(26 * d, h);
		fctx.closePath();
		fctx.globalAlpha = 0.12;
		fctx.fillStyle = grad;
		fctx.fill();
		fctx.globalAlpha = 1;
	}

	/* ------------------------------------------------------------ spring ball */
	const arena = $('#arena');
	const ball = $('#ball');
	const springRead = $('#springRead');
	const sp = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, inside: false };
	if (springCard && arena) {
		on(springCard, 'pointermove', (e: PointerEvent) => {
			const r = arena.getBoundingClientRect();
			sp.inside = true;
			sp.tx = clamp(e.clientX - (r.left + r.width / 2), -r.width / 2 + 20, r.width / 2 - 20);
			sp.ty = clamp(e.clientY - (r.top + r.height / 2), -r.height / 2 + 20, r.height / 2 + 30);
		});
		on(springCard, 'pointerleave', () => {
			sp.inside = false;
		});
	}
	function stepSpring(dt: number) {
		if (!arena || !ball) return;
		const w = arena.clientWidth;
		const h = arena.clientHeight;
		if (!sp.inside) {
			sp.tx = Math.cos(S.time * 1.4) * w * 0.3;
			sp.ty = Math.sin(S.time * 2.3) * h * 0.22;
		}
		const n = 4;
		const h1 = dt / n;
		for (let i = 0; i < n; i++) {
			sp.vx += (170 * (sp.tx - sp.x) - 12 * sp.vx) * h1;
			sp.vy += (170 * (sp.ty - sp.y) - 12 * sp.vy) * h1;
			sp.x += sp.vx * h1;
			sp.y += sp.vy * h1;
		}
		const v = Math.hypot(sp.vx, sp.vy);
		const st = 1 + Math.min(v / 1800, 0.65);
		ball.style.transform = `translate(${sp.x.toFixed(1)}px,${sp.y.toFixed(1)}px) rotate(${Math.atan2(sp.vy, sp.vx).toFixed(3)}rad) scale(${st.toFixed(3)},${(1 / st).toFixed(3)})`;
		if (springRead) springRead.textContent = `k 170 · c 12 · v ${String(Math.round(v)).padStart(4, ' ')}`;
	}

	/* --------------------------------------------------------- decoding text */
	const decode = decoders.map((el) => ({
		el,
		words: (el.dataset.decode ?? '').split('|'),
		i: 0,
		next: 2.6
	}));
	for (const d of decode) {
		const card = d.el.closest<HTMLElement>('.card') ?? d.el;
		on(card, 'pointerenter', () => {
			d.i = (d.i + 1) % d.words.length;
			scramble(d.el, d.words[d.i], 1000);
			d.next = S.time + 3;
		});
	}

	/* ---------------------------------------------------------- motion switch */
	const motionSw = $('#motionSw');
	const motionState = $('#motionState');
	const rmqEl = $('#rmq');
	if (rmqEl) rmqEl.textContent = rmq.matches ? 'reduce' : 'no-preference';
	function setMotion(v: boolean) {
		S.motion = v;
		root.classList.toggle('still', !v);
		motionSw?.setAttribute('aria-checked', String(v));
		if (motionState) motionState.textContent = v ? o.motion.on : o.motion.off;
	}
	if (motionSw) on(motionSw, 'click', () => setMotion(!S.motion));
	on(rmq, 'change', (e: MediaQueryListEvent) => {
		if (rmqEl) rmqEl.textContent = e.matches ? 'reduce' : 'no-preference';
		setMotion(!e.matches);
	});
	setMotion(S.motion);

	/* ------------------------------------------------------------ page weight */
	const kb = $('#kb');
	const weigh = () => {
		if (!kb) return;
		const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
		let bytes = navEntry ? navEntry.encodedBodySize || navEntry.transferSize : 0;
		for (const r of performance.getEntriesByType('resource') as PerformanceResourceTiming[])
			bytes += r.encodedBodySize || r.transferSize || 0;
		if (bytes > 0) kb.textContent = (bytes / 1024).toFixed(1);
	};
	if (document.readyState === 'complete') weigh();
	else on(window, 'load', weigh, { once: true });
	later(weigh, 3000);

	/* ------------------------------------------------------ horizontal panels */
	const track = $('#hzTrack');
	const hzNum = $('#hzNum');
	const hzBar = $('#hzBar');
	const pvis = $$('.panel .p-vis');
	let hzOn = true;
	let hzMax = 0;
	let hz = 0;
	function layoutHz() {
		hzOn = innerWidth > 800 && !!track;
		if (!hzOn || !track) {
			proc.style.height = '';
			return;
		}
		hzMax = Math.max(0, track.scrollWidth - innerWidth);
		proc.style.height = `${hzMax + innerHeight * 1.1}px`;
	}
	undo.push(() => {
		proc.style.height = '';
	});

	/* --------------------------------------------------------- CTA confetti */
	const cf = $<HTMLCanvasElement>('#confetti')!;
	const cctx = cf.getContext('2d')!;
	type Bit = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		r: number;
		vr: number;
		w: number;
		h: number;
		c: string;
		life: number;
	};
	let bits: Bit[] = [];
	function burst(x: number, y: number) {
		cf.width = innerWidth * S.dpr;
		cf.height = innerHeight * S.dpr;
		const cs = getComputedStyle(root);
		const cols = ['--a1', '--a2', '--a3'].map((v) => cs.getPropertyValue(v).trim()).concat('#ffffff');
		for (let i = 0; i < 220; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = 3 + Math.random() * 13;
			bits.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s - 7,
				r: Math.random() * 6,
				vr: (Math.random() - 0.5) * 0.35,
				w: 6 + Math.random() * 7,
				h: 3 + Math.random() * 5,
				c: cols[i % cols.length],
				life: 1
			});
		}
	}
	function stepConfetti() {
		if (!bits.length) return;
		cctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
		cctx.clearRect(0, 0, innerWidth, innerHeight);
		for (const b of bits) {
			b.vy += 0.32;
			b.vx *= 0.985;
			b.vy *= 0.985;
			b.x += b.vx;
			b.y += b.vy;
			b.r += b.vr;
			b.life -= 0.0075;
			cctx.save();
			cctx.translate(b.x, b.y);
			cctx.rotate(b.r);
			cctx.scale(1, Math.cos(b.r * 2.2));
			cctx.globalAlpha = clamp(b.life, 0, 1);
			cctx.fillStyle = b.c;
			cctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
			cctx.restore();
		}
		bits = bits.filter((b) => b.life > 0 && b.y < innerHeight + 40);
		if (!bits.length) cctx.clearRect(0, 0, innerWidth, innerHeight);
	}
	const ctaBtn = $('#ctaBtn');
	const ctaLabel = $('#ctaLabel');
	if (ctaBtn && ctaLabel) {
		// No preventDefault: the mail client still opens; the page celebrates.
		on(ctaBtn, 'click', () => {
			const r = ctaBtn.getBoundingClientRect();
			if (S.motion) burst(r.left + r.width / 2, r.top + r.height / 2);
			scramble(ctaLabel, o.cta.sent, 700);
			later(() => scramble(ctaLabel, o.cta.idle, 700), 2600);
		});
	}

	/* ------------------------------------------------ footer spotlight + clock */
	const footGiant = $('#footGiant')!;
	let footHover = false;
	on(footer, 'pointermove', (e: PointerEvent) => {
		footHover = true;
		const r = footGiant.getBoundingClientRect();
		footGiant.style.setProperty('--fx', `${e.clientX - r.left}px`);
		footGiant.style.setProperty('--fy', `${e.clientY - r.top}px`);
	});
	on(footer, 'pointerleave', () => {
		footHover = false;
	});
	const clock = $('#clock');
	const tickClock = () => {
		if (clock) clock.textContent = CLOCK.format(new Date());
	};
	tickClock();
	const clockId = window.setInterval(tickClock, 1000);
	undo.push(() => clearInterval(clockId));

	/* -------------------------------------------------------------- main loop */
	const fpsEl = $('#fps');
	const fpsBig = $('#fpsBig');
	const resEl = $('#res');
	const progress = $('#progress')!;
	const stages = $$('.stage', engineSec);
	const ticks = $$('#ticks li');
	const rows = $$('.mq-row', marquee).map((row) => ({
		row,
		tr: row.firstElementChild as HTMLElement,
		dir: Number(row.dataset.dir),
		x: row.dataset.dir === '-1' ? -200 : 0
	}));
	const hm = { x: 1.2, y: 0.1 };
	const pm = { x: 0, y: 0 };
	const mo = { m: 0, spin: 0 };
	const heroCam = () => 4 + (1 - clamp(S.W / S.H / 1.7, 0.42, 1)) * 3.2;
	let last = performance.now();
	let fN = 0;
	let fT = 0;
	let lastStage = 0;

	function frame(now: number) {
		if (!alive) return;
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		frameTimes.push(dt * 1000);
		frameTimes.shift();
		fN++;
		fT += dt;
		if (fT >= 0.5) {
			S.fps = fN / fT;
			fN = 0;
			fT = 0;
			const f = String(Math.round(S.fps));
			if (fpsEl) fpsEl.textContent = f;
			if (fpsBig) fpsBig.textContent = f;
			if (hero && isVis(heroSec)) {
				if (S.fps < 48) hero.scale *= 0.86;
				else if (S.fps > 57 && hero.scale < 0.62) hero.scale *= 1.05;
				if (resEl) resEl.textContent = hero.scale.toFixed(2) + '×';
			}
		}
		if (S.motion) S.time += dt;

		const sy = scrollY;
		const dy = sy - S.sy;
		S.sy = sy;
		S.vel = lerp(S.vel, dy, 0.15);
		const maxScroll = root.scrollHeight - innerHeight;
		progress.style.transform = `scaleX(${maxScroll > 0 ? sy / maxScroll : 0})`;
		nav.classList.toggle('scrolled', sy > 40);

		if (fine) {
			ring.x = lerp(ring.x, S.mx, damp(dt, 14));
			ring.y = lerp(ring.y, S.my, damp(dt, 14));
			cRing.style.transform = `translate3d(${ring.x.toFixed(1)}px,${ring.y.toFixed(1)}px,0)`;
		}

		// hero: chrome follows the cursor, the headline thickens near it
		if (isVis(heroSec)) {
			const asp = S.W / S.H;
			let nx: number, ny: number;
			if (S.moved) {
				nx = (S.mx / S.W) * 2 - 1;
				ny = -((S.my / S.H) * 2 - 1);
			} else {
				nx = Math.cos(S.time * 0.5) * 0.45 + 0.35;
				ny = Math.sin(S.time * 0.7) * 0.35;
			}
			const cam = heroCam();
			const k = cam / 3.2;
			hm.x = lerp(hm.x, nx * asp * k, damp(dt, 5));
			hm.y = lerp(hm.y, ny * k, damp(dt, 5));
			const sc = clamp(sy / S.H, 0, 1);
			hero?.render(S.time, hm, sc, cam, pal);
			heroTitle.style.transform = `translate3d(0,${(sy * 0.28).toFixed(1)}px,0)`;
			heroBottom.style.opacity = String(1 - clamp(sc * 1.6, 0, 1));
			if (fine && S.ready && S.moved) {
				const rects = heroChars.map((c) => c.getBoundingClientRect());
				heroChars.forEach((c, i) => {
					const r = rects[i];
					const dist = Math.hypot(r.left + r.width / 2 - S.mx, r.top + r.height / 2 - S.my);
					const nw = lerp(weights[i], lerp(700, 300, smooth(0, 380, dist)), damp(dt, 10));
					if (Math.abs(nw - weights[i]) > 0.5) {
						weights[i] = nw;
						c.style.fontWeight = String(Math.round(nw));
					}
				});
			}
		}

		// marquee: drifts, and leans with scroll velocity
		if (isVis(marquee)) {
			const skew = clamp(S.vel * 0.35, -10, 10);
			for (const r of rows) {
				const span = r.tr.scrollWidth / 4;
				if (S.motion) r.x -= r.dir * (60 + Math.abs(S.vel) * 40) * dt;
				r.x = ((r.x % span) - span) % span;
				r.tr.style.transform = `translate3d(${r.x.toFixed(1)}px,0,0) skewX(${(-skew).toFixed(2)}deg)`;
			}
		}

		// manifesto: words light up as it scrolls through
		if (isVis(mfSec)) {
			const r = mfSec.getBoundingClientRect();
			const p = clamp(-r.top / (r.height - S.H), 0, 1);
			const lit = p * 1.12 * mfWords.length;
			mfWords.forEach((w, i) => {
				const v = clamp(lit - i, 0, 1);
				w.style.opacity = String(0.12 + 0.88 * v);
				if (w.classList.contains('hl')) w.classList.toggle('on', v > 0.6);
			});
		}

		// particle engine: scroll picks the shape, the cursor orbits it. Without
		// WebGL2 the captions still follow the scroll.
		if (isVis(engineSec)) {
			const r = engineSec.getBoundingClientRect();
			const p = clamp(-r.top / (r.height - S.H), 0, 1);
			const raw = p * 3;
			const fl = Math.min(Math.floor(raw), 2);
			const target = p >= 1 ? 3 : fl + smooth(0.3, 0.8, raw - fl);
			mo.m = lerp(mo.m, target, damp(dt, 4.5));
			// Each shape has its own camera: the artboard head-on, the stack from
			// above at three quarters, the lens swaying, the rocket rolling.
			if (S.motion) mo.spin += dt * 0.45 * smooth(2.3, 3, mo.m);
			if (mo.m < 2.3) mo.spin -= Math.atan2(Math.sin(mo.spin), Math.cos(mo.spin)) * damp(dt, 3);
			const tilts = [0, -0.72, 0.04, 0.14];
			const yaws = [0, 0.55, 0, 0];
			const sways = [0, 0.16, 0.34, 0];
			const i0 = Math.min(Math.floor(mo.m), 2);
			const e = smooth(0, 1, mo.m - i0);
			const tilt = lerp(tilts[i0], tilts[i0 + 1], e);
			const yaw =
				lerp(yaws[i0], yaws[i0 + 1], e) + Math.sin(S.time * 0.5) * lerp(sways[i0], sways[i0 + 1], e) + mo.spin;
			pm.x = lerp(pm.x, S.moved ? S.mx / S.W - 0.5 : 0, damp(dt, 3));
			pm.y = lerp(pm.y, S.moved ? S.my / S.H - 0.5 : 0, damp(dt, 3));
			const look = 0.35 + 0.65 * smooth(0, 1, mo.m);
			parts?.render({
				m: mo.m,
				spin: yaw + pm.x * 1.1 * look,
				tilt: tilt + pm.y * 0.6 * look,
				time: S.time,
				dpr: S.dpr,
				pal
			});
			const st = Math.round(mo.m);
			if (st !== lastStage) {
				lastStage = st;
				stages.forEach((s, i) => s.classList.toggle('on', i === st));
				ticks.forEach((t, i) => t.classList.toggle('on', i === st));
			}
		}

		// live demos inside the cards
		if (isVis(fpsCard)) drawFps();
		if (isVis(springCard)) stepSpring(S.motion ? dt : 0);
		if (S.motion)
			for (const d of decode) {
				if (!isVis(d.el) || S.time < d.next) continue;
				d.i = (d.i + 1) % d.words.length;
				scramble(d.el, d.words[d.i], 1000);
				d.next = S.time + 3;
			}

		// open source: vertical scroll drives the horizontal track
		if (hzOn && track && isVis(proc)) {
			const r = proc.getBoundingClientRect();
			const p = clamp(-r.top / (r.height - S.H), 0, 1);
			hz = lerp(hz, p, damp(dt, 9));
			track.style.transform = `translate3d(${(-hz * hzMax).toFixed(1)}px,0,0)`;
			if (hzNum) hzNum.textContent = String(Math.min(pvis.length, Math.floor(p * pvis.length) + 1)).padStart(2, '0');
			if (hzBar) hzBar.style.transform = `scaleX(${hz.toFixed(4)})`;
			for (const v of pvis) {
				const pr = v.parentElement!.getBoundingClientRect();
				const off = (pr.left + pr.width / 2 - S.W / 2) / S.W;
				v.style.transform = `translateX(${(off * -70).toFixed(1)}px)`;
			}
		}

		// footer: the spotlight wanders when nobody is steering it
		if (isVis(footer) && !footHover) {
			footGiant.style.setProperty('--fx', `${50 + Math.cos(S.time * 0.6) * 32}%`);
			footGiant.style.setProperty('--fy', `${50 + Math.sin(S.time * 0.9) * 30}%`);
		}

		stepConfetti();
		raf = requestAnimationFrame(frame);
	}

	function onResize() {
		S.W = innerWidth;
		S.H = innerHeight;
		S.dpr = Math.min(devicePixelRatio || 1, 2);
		layoutHz();
	}
	on(window, 'resize', onResize);
	onResize();
	// fonts change the track's width once they arrive
	fontsReady.then(() => alive && layoutHz());
	raf = requestAnimationFrame(frame);

	return () => {
		alive = false;
		cancelAnimationFrame(raf);
		timers.forEach((id) => clearTimeout(id));
		undo.reverse().forEach((fn) => fn());
	};
}
