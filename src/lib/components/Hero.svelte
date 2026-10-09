<script lang="ts">
	import type { Action } from 'svelte/action';
	import type { SiteContent } from '$lib/content';
	import { EMAIL } from '$lib/content';
	import type { Aurora } from '$lib/aurora';

	let { c }: { c: SiteContent } = $props();

	let heroEl: HTMLElement;
	let backdrop: HTMLElement;
	let canvas = $state<HTMLCanvasElement>();
	let glOn = $state(false);
	let aurora: Aurora | null = null;

	/** CSS rings for when the shader is not running (touch screens, mostly). */
	let rings = $state<{ id: number; x: number; y: number }[]>([]);
	let ringId = 0;

	let hint = $state<'stir' | 'tap' | null>(null);
	let spent = $state(false);

	const reduced = () =>
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	/**
	 * The shader is for pointer-driven desktops only. Phones and tablets keep
	 * the CSS backdrop: it looks close enough and costs nothing on a battery.
	 */
	function wantsShader() {
		if (typeof matchMedia === 'undefined' || reduced()) return false;
		if (!matchMedia('(min-width: 62rem)').matches) return false;
		if (!matchMedia('(pointer: fine)').matches) return false;
		return (navigator.hardwareConcurrency ?? 4) >= 4;
	}

	$effect(() => {
		const el = canvas;
		if (!el || !wantsShader()) return;

		let io: IntersectionObserver | null = null;
		let cancelled = false;
		let intro = 0;

		async function boot() {
			const { startAurora } = await import('$lib/aurora');
			if (cancelled) return;
			aurora = startAurora(el!);
			if (!aurora) return;
			glOn = true;
			hint = 'stir';
			aurora.play();
			// One ring out in the open field as the shader fades in, so the
			// backdrop shows it can move before anyone has thought to try.
			intro = window.setTimeout(() => {
				const r = heroEl.getBoundingClientRect();
				if (!spent) aurora?.ripple(r.left + r.width * 0.74, r.top + r.height * 0.36, 0.7);
			}, 1300);
			// Stop drawing the moment the hero leaves the screen — there are six
			// more sections below and none of them need a GPU.
			io = new IntersectionObserver(
				([entry]) => (entry.isIntersecting ? aurora?.play() : aurora?.pause()),
				{ threshold: 0.02 }
			);
			io.observe(heroEl);
		}

		// Wait for load so the shader never competes with the largest paint.
		const kick = () => requestAnimationFrame(boot);
		if (document.readyState === 'complete') kick();
		else window.addEventListener('load', kick, { once: true });

		return () => {
			cancelled = true;
			clearTimeout(intro);
			window.removeEventListener('load', kick);
			io?.disconnect();
			aurora?.stop();
			aurora = null;
			glOn = false;
		};
	});

	/**
	 * The parts of the backdrop that answer the pointer without a GPU: a patch
	 * of grid that lights up under it, and — where the shader is not running —
	 * a ring wherever the backdrop is clicked or tapped.
	 */
	$effect(() => {
		if (reduced()) return;

		if (!matchMedia('(pointer: fine)').matches) hint = 'tap';

		let raf = 0;
		let fade = 0;
		let lx = 0;
		let ly = 0;

		const place = (e: PointerEvent) => {
			const r = backdrop.getBoundingClientRect();
			// Measured against the untransformed box: the backdrop scales up as
			// the hero scrolls away, and the mask lives in its own coordinates.
			lx = ((e.clientX - r.left) / r.width) * backdrop.offsetWidth;
			ly = ((e.clientY - r.top) / r.height) * backdrop.offsetHeight;
			if (raf) return;
			raf = requestAnimationFrame(() => {
				raf = 0;
				backdrop.style.setProperty('--px', `${lx}px`);
				backdrop.style.setProperty('--py', `${ly}px`);
			});
		};

		const light = (on: boolean) => backdrop.style.setProperty('--spot', on ? '1' : '0');

		const onMove = (e: PointerEvent) => {
			place(e);
			light(true);
		};

		// A finger "leaves" the moment it lifts; its patch fades on a timer instead.
		const onLeave = (e: PointerEvent) => {
			if (e.pointerType !== 'touch') light(false);
		};

		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			// Buttons and links do their own thing; everything else is backdrop.
			if ((e.target as Element).closest('a, button')) return;
			place(e);
			light(true);
			spent = true;
			if (aurora) {
				aurora.ripple(e.clientX, e.clientY);
			} else {
				rings.push({ id: ++ringId, x: lx, y: ly });
				if (rings.length > 4) rings.shift();
			}
			if (e.pointerType === 'touch') {
				clearTimeout(fade);
				fade = window.setTimeout(() => light(false), 900);
			}
		};

		heroEl.addEventListener('pointermove', onMove, { passive: true });
		heroEl.addEventListener('pointerleave', onLeave, { passive: true });
		heroEl.addEventListener('pointerdown', onDown, { passive: true });

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(fade);
			heroEl.removeEventListener('pointermove', onMove);
			heroEl.removeEventListener('pointerleave', onLeave);
			heroEl.removeEventListener('pointerdown', onDown);
		};
	});

	/** Ticks a stat up to its final value without ever changing its width. */
	const countUp: Action<HTMLElement, string> = (node, value) => {
		const target = Number.parseInt(value ?? '', 10);
		if (!Number.isFinite(target) || reduced()) {
			node.textContent = value ?? '';
			return;
		}

		let raf = 0;
		const start = performance.now();
		const DUR = 1100;

		const step = (now: number) => {
			const t = Math.min((now - start) / DUR, 1);
			const eased = 1 - Math.pow(1 - t, 4);
			node.textContent = String(Math.round(target * eased));
			if (t < 1) raf = requestAnimationFrame(step);
		};

		node.textContent = '0';
		raf = requestAnimationFrame(step);
		return { destroy: () => cancelAnimationFrame(raf) };
	};
</script>

<section class="section hero" id="top" bind:this={heroEl}>
	<div class="backdrop" class:gl={glOn} aria-hidden="true" bind:this={backdrop}>
		<canvas bind:this={canvas}></canvas>
		<span class="blob b1"></span>
		<span class="blob b2"></span>
		<span class="blob b3"></span>
		<span class="grid"></span>
		<span class="spot"></span>
		{#each rings as r (r.id)}
			<span
				class="ring"
				style="left:{r.x}px;top:{r.y}px"
				onanimationend={() => (rings = rings.filter((x) => x.id !== r.id))}
			></span>
		{/each}
	</div>

	<div class="shell">
		<p class="eyebrow" style="--i:0">
			<span class="pip"></span>{c.hero.eyebrow}
		</p>

		<span class="name" style="--i:1">
			<h1>{c.hero.name}</h1>
			<span class="sheen" aria-hidden="true">{c.hero.name}</span>
		</span>
		<p class="role" style="--i:2">{c.hero.title}</p>
		<p class="lede hero-lede" style="--i:3">{c.hero.lede}</p>

		<p class="availability" style="--i:4">
			<span class="beacon"></span>
			<strong>{c.hero.availability}</strong>
			<span class="sep">·</span>
			<span class="place">{c.hero.place}</span>
		</p>

		<div class="ctas" style="--i:5">
			<a class="btn primary" href="#production">
				{c.hero.ctaPrimary}
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v13M5 12l7 7 7-7" /></svg>
			</a>
			<a class="btn ghost" href="mailto:{EMAIL}">
				{c.hero.ctaSecondary}
				<svg viewBox="0 0 24 24" aria-hidden="true"
					><path d="M3 6.5h18v11H3zM3 7l9 6.5L21 7" /></svg
				>
			</a>
		</div>

		<dl class="stats" style="--i:6">
			{#each c.hero.stats as stat (stat.label)}
				<div>
					<dt style="--len:{stat.value.length}"><span use:countUp={stat.value}>{stat.value}</span></dt>
					<dd>{stat.label}</dd>
				</div>
			{/each}
		</dl>
	</div>

	<span class="scroll-hint" aria-hidden="true">
		<span class="rail"><span class="bead"></span></span>
		{c.hero.scroll}
	</span>

	{#if hint}
		<span class="play-hint" aria-hidden="true">
			<span class="hint-body" class:spent>
				<svg viewBox="0 0 24 24"
					><path d="M5 3.5 18.5 10l-6 1.6L9.6 17.5z" /><path
						d="M15.5 15.5a5 5 0 0 0 4-4M17 19.5a9 9 0 0 0 6.5-6.5"
					/></svg
				>
				{hint === 'stir' ? c.hero.hint.stir : c.hero.hint.tap}
			</span>
		</span>
	{/if}
</section>

<style>
	.hero {
		justify-content: center;
		overflow: hidden;
		padding-block: clamp(5rem, 11vh, 7rem) clamp(4rem, 9vh, 5.5rem);
	}

	/* ------------------------------------------------------- backdrop */
	.backdrop {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

	canvas {
		position: absolute;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 1.2s var(--ease);
	}

	.gl canvas {
		opacity: 1;
	}

	/* Once the shader is painting, the CSS blobs would only muddy it. */
	.gl .blob {
		opacity: 0;
	}

	.gl .grid {
		opacity: 0.6;
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(90px);
		opacity: 0.4;
		will-change: transform;
		transition: opacity 1.2s var(--ease);
	}

	.b1 {
		width: 46vmax;
		height: 46vmax;
		top: -16vmax;
		left: -10vmax;
		background: radial-gradient(circle, rgb(255 107 53 / 0.55), transparent 68%);
		animation: drift-a 22s ease-in-out infinite alternate;
	}

	.b2 {
		width: 38vmax;
		height: 38vmax;
		bottom: -14vmax;
		right: -8vmax;
		background: radial-gradient(circle, rgb(94 234 212 / 0.4), transparent 68%);
		animation: drift-b 27s ease-in-out infinite alternate;
	}

	.b3 {
		width: 30vmax;
		height: 30vmax;
		top: 34%;
		left: 48%;
		background: radial-gradient(circle, rgb(120 90 255 / 0.34), transparent 70%);
		animation: drift-c 19s ease-in-out infinite alternate;
	}

	.grid {
		transition: opacity 1.2s var(--ease);
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(to right, rgb(255 255 255 / 0.045) 1px, transparent 1px),
			linear-gradient(to bottom, rgb(255 255 255 / 0.045) 1px, transparent 1px);
		background-size: 64px 64px;
		mask-image: radial-gradient(ellipse 85% 70% at 50% 45%, #000 20%, transparent 78%);
	}

	/* A warmer patch of grid under the pointer. Its position and visibility
	   are custom properties the script sets on the backdrop. */
	.spot {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(to right, rgb(255 178 140 / 0.2) 1px, transparent 1px),
			linear-gradient(to bottom, rgb(255 178 140 / 0.2) 1px, transparent 1px);
		background-size: 64px 64px;
		mask-image: radial-gradient(
			circle 14rem at var(--px, 50%) var(--py, 50%),
			#000,
			transparent 72%
		);
		opacity: var(--spot, 0);
		transition: opacity 0.6s var(--ease);
	}

	/* Without the shader there is no lantern, so the patch brings its own. */
	.backdrop:not(.gl) .spot::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			circle 12rem at var(--px, 50%) var(--py, 50%),
			rgb(255 107 53 / 0.18),
			transparent 70%
		);
	}

	.ring {
		position: absolute;
		translate: -50% -50%;
		border-radius: 50%;
		border: 1.5px solid rgb(255 150 105 / 0.9);
		box-shadow:
			0 0 26px rgb(255 107 53 / 0.45),
			inset 0 0 22px rgb(94 234 212 / 0.25);
		animation: ring-out 1.5s var(--ease) forwards;
	}

	.shell,
	.scroll-hint {
		position: relative;
		z-index: 1;
	}

	/* --------------------------------------------------------- content */
	.shell > * {
		opacity: 0;
		animation: rise 0.85s var(--ease) forwards;
		animation-delay: calc(140ms + var(--i) * 95ms);
	}

	.eyebrow {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--mono);
		font-size: clamp(0.7rem, 0.66rem + 0.2vw, 0.8rem);
		letter-spacing: 0.1em;
		color: var(--accent);
		border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
		background: color-mix(in srgb, var(--accent) 9%, transparent);
		padding: 0.38rem 0.9rem;
		border-radius: 999px;
		margin: 0;
	}

	.eyebrow::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		padding: 1px;
		background: conic-gradient(
			from var(--spin),
			transparent 0deg,
			var(--accent) 32deg,
			rgb(255 255 255 / 0.9) 46deg,
			transparent 82deg,
			transparent 360deg
		);
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask-composite: exclude;
		animation: spin 4.2s linear infinite;
		pointer-events: none;
	}

	.pip {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 60%, transparent);
		animation: pulse 2.4s ease-out infinite;
	}

	.name {
		position: relative;
		display: block;
		margin-top: 0.9rem;
	}

	/* The sheen is a second copy of the name sitting exactly on top of the
	   first, so both need identical metrics. */
	.name h1,
	.name .sheen {
		font-family: var(--display);
		font-size: clamp(2.8rem, 1.3rem + 7.4vw, 7rem);
		font-weight: 700;
		line-height: 1.08;
		letter-spacing: -0.045em;
		margin: 0;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.name h1 {
		background-image: linear-gradient(170deg, #fff 22%, #9aa4b2 96%);
		clip-path: inset(0 100% 0 0);
		animation: wipe 1.15s var(--ease) 0.22s forwards;
	}

	.name .sheen {
		position: absolute;
		inset: 0;
		pointer-events: none;
		user-select: none;
		background-image: linear-gradient(
			100deg,
			transparent 42%,
			rgb(255 255 255 / 0.95) 50%,
			transparent 58%
		);
		background-size: 260% 100%;
		background-position: 155% 0;
		opacity: 0;
		animation: sheen 1.4s var(--ease) 0.72s forwards;
	}

	.role {
		font-family: var(--mono);
		font-size: clamp(0.85rem, 0.75rem + 0.45vw, 1.1rem);
		letter-spacing: 0.02em;
		color: var(--data);
		margin-top: 0.55rem;
	}

	.hero-lede {
		margin-top: 1.2rem;
		max-width: 56ch;
	}

	.availability {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.55rem;
		margin-top: 1.3rem;
		font-size: 0.88rem;
		color: var(--fg-dim);
	}

	.availability strong {
		color: var(--fg);
		font-weight: 500;
	}

	.beacon {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #4ade80;
		box-shadow: 0 0 12px #4ade80;
		animation: breathe 2.6s ease-in-out infinite;
	}

	.sep {
		color: var(--line);
	}

	.place {
		font-family: var(--mono);
		font-size: 0.78rem;
		color: var(--fg-faint);
	}

	/* ------------------------------------------------------------ ctas */
	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.7rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.78rem 1.4rem;
		border-radius: 999px;
		font-weight: 500;
		font-size: 0.93rem;
		border: 1px solid transparent;
		transition:
			transform 0.25s var(--ease),
			box-shadow 0.25s var(--ease),
			background 0.25s var(--ease),
			border-color 0.25s var(--ease);
	}

	.btn svg {
		width: 1.05em;
		height: 1.05em;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.primary {
		background: var(--accent);
		color: #140700;
		box-shadow: 0 16px 34px -18px rgb(255 107 53 / 0.85);
	}

	.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 22px 44px -18px rgb(255 107 53 / 0.95);
	}

	.primary:hover svg {
		animation: nudge 0.9s var(--ease) infinite;
	}

	.ghost {
		border-color: var(--line);
		color: var(--fg);
		background: rgb(255 255 255 / 0.02);
	}

	.ghost:hover {
		border-color: var(--fg-faint);
		transform: translateY(-2px);
	}

	/* ----------------------------------------------------------- stats */
	.stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, max-content));
		gap: clamp(1.4rem, 4vw, 3.4rem);
		margin: 2.1rem 0 0;
		padding-top: 1.35rem;
		border-top: 1px solid var(--line-soft);
	}

	dt {
		font-family: var(--display);
		font-size: clamp(1.45rem, 1rem + 1.6vw, 2.2rem);
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--fg);
		font-variant-numeric: tabular-nums;
	}

	dt span {
		display: inline-block;
		min-width: calc(var(--len, 1) * 1ch);
	}

	dd {
		margin: 0.15rem 0 0;
		font-family: var(--mono);
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-faint);
	}

	/* ----------------------------------------------------- scroll hint */
	.scroll-hint {
		position: absolute;
		left: 50%;
		bottom: clamp(1.4rem, 4vh, 2.6rem);
		translate: -50% 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--mono);
		font-size: 0.6rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--fg-faint);
		opacity: 0;
		animation: rise 1s var(--ease) 1.3s forwards;
	}

	.rail {
		width: 1px;
		height: 2.6rem;
		background: var(--line);
		position: relative;
		overflow: hidden;
	}

	.bead {
		position: absolute;
		inset-inline: 0;
		height: 40%;
		background: linear-gradient(to bottom, transparent, var(--accent));
		animation: fall 1.9s var(--ease) infinite;
	}

	/* ------------------------------------------------ interaction hint */
	/* The entrance and the exit live on different elements, so dismissing
	   the hint halfway through its entrance can never make it flash. */
	.play-hint {
		position: absolute;
		z-index: 1;
		/* Lines up with the right edge of the content column. */
		right: max(var(--gutter), calc((100% - var(--maxw)) / 2));
		bottom: clamp(1.4rem, 4vh, 2.6rem);
		pointer-events: none;
		opacity: 0;
		animation: rise 1s var(--ease) 2.4s forwards;
	}

	.hint-body {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		font-family: var(--mono);
		font-size: 0.6rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-faint);
		transition: opacity 0.6s var(--ease);
	}

	.hint-body.spent {
		opacity: 0;
	}

	.play-hint svg {
		width: 1.15rem;
		height: 1.15rem;
		fill: none;
		stroke: var(--accent);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* -------------------------------------------------------- keyframes */
	@keyframes ring-out {
		from {
			width: 0;
			height: 0;
			opacity: 1;
		}
		to {
			width: 26rem;
			height: 26rem;
			opacity: 0;
		}
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translate3d(0, 1.6rem, 0);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes wipe {
		to {
			clip-path: inset(0 -0.12em 0 0);
		}
	}

	@keyframes sheen {
		0% {
			background-position: 155% 0;
			opacity: 0;
		}
		14% {
			opacity: 1;
		}
		86% {
			opacity: 1;
		}
		100% {
			background-position: -75% 0;
			opacity: 0;
		}
	}

	@keyframes spin {
		to {
			--spin: 360deg;
		}
	}

	@keyframes hero-exit {
		to {
			opacity: 0;
			transform: translateY(-3.25rem) scale(0.955);
		}
	}

	@keyframes backdrop-exit {
		to {
			opacity: 0.3;
			transform: scale(1.1);
		}
	}

	@keyframes drift-a {
		to {
			transform: translate3d(14vmax, 7vmax, 0) scale(1.15);
		}
	}

	@keyframes drift-b {
		to {
			transform: translate3d(-12vmax, -9vmax, 0) scale(1.2);
		}
	}

	@keyframes drift-c {
		to {
			transform: translate3d(-16vmax, 10vmax, 0) scale(0.85);
		}
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 55%, transparent);
		}
		70%,
		100% {
			box-shadow: 0 0 0 9px transparent;
		}
	}

	@keyframes breathe {
		50% {
			opacity: 0.45;
		}
	}

	@keyframes nudge {
		50% {
			transform: translateY(2px);
		}
	}

	@keyframes fall {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(250%);
		}
	}

	/* The hero drifts away as it is scrolled off. Scroll-linked animation is
	   still patchy across browsers, so this is enhancement, never structure. */
	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.hero .shell {
				animation: hero-exit linear both;
				animation-timeline: view();
				animation-range: exit 0% exit 88%;
			}

			.hero .backdrop {
				animation: backdrop-exit linear both;
				animation-timeline: view();
				animation-range: exit 0% exit 100%;
			}
		}
	}

	/* -------------------------------------------------------- responsive */
	@media (max-width: 44rem) {
		/* The availability line wraps here, which would strand the separator. */
		.sep {
			display: none;
		}

		.availability {
			gap: 0.35rem 0.55rem;
		}

		.place {
			flex-basis: 100%;
		}

		.stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1.3rem 1rem;
		}

		.btn {
			flex: 1 1 auto;
			justify-content: center;
		}
	}

	/* On phones the hero fills the screen on its own; the hint would sit on
	   top of the stats. */
	@media (max-width: 48rem), (max-height: 44rem) {
		.scroll-hint,
		.play-hint {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shell > *,
		.scroll-hint {
			opacity: 1;
			animation: none;
		}

		.spot,
		.ring {
			display: none;
		}

		.blob,
		.pip,
		.beacon,
		.bead,
		.eyebrow::after {
			animation: none;
		}

		.name h1 {
			clip-path: none;
			animation: none;
		}

		.name .sheen,
		.eyebrow::after {
			display: none;
		}

		.bead {
			display: none;
		}
	}
</style>
