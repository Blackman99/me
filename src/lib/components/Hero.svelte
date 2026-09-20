<script lang="ts">
	import type { Action } from 'svelte/action';
	import type { SiteContent } from '$lib/content';
	import { EMAIL } from '$lib/content';
	import type { Aurora } from '$lib/aurora';

	let { c }: { c: SiteContent } = $props();

	let heroEl: HTMLElement;
	let canvas = $state<HTMLCanvasElement>();
	let glOn = $state(false);

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

		let aurora: Aurora | null = null;
		let io: IntersectionObserver | null = null;
		let cancelled = false;

		async function boot() {
			const { startAurora } = await import('$lib/aurora');
			if (cancelled) return;
			aurora = startAurora(el!);
			if (!aurora) return;
			glOn = true;
			aurora.play();
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
			window.removeEventListener('load', kick);
			io?.disconnect();
			aurora?.stop();
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
	<div class="backdrop" class:gl={glOn} aria-hidden="true">
		<canvas bind:this={canvas}></canvas>
		<span class="blob b1"></span>
		<span class="blob b2"></span>
		<span class="blob b3"></span>
		<span class="grid"></span>
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

	/* -------------------------------------------------------- keyframes */
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
		.scroll-hint {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.shell > *,
		.scroll-hint {
			opacity: 1;
			animation: none;
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
