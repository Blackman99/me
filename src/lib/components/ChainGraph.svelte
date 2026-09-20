<script lang="ts">
	/**
	 * Multi-hop fund-path tracing, drawn from scratch in SVG.
	 * Nothing here is real customer data — it is a shape, not a screenshot.
	 */
	import type { Lang } from '$lib/content';
	import { GRAPH_CAPTION } from '$lib/content';

	let { active = false, lang = 'en' }: { active?: boolean; lang?: Lang } = $props();
	const caption = $derived(GRAPH_CAPTION[lang]);

	type Node = { id: string; x: number; y: number; label: string; kind: 'src' | 'hop' | 'flag' };

	const nodes: Node[] = [
		{ id: 'a', x: 40, y: 150, label: '0x4f…a21', kind: 'src' },
		{ id: 'b', x: 150, y: 78, label: '0x9c…3de', kind: 'hop' },
		{ id: 'c', x: 150, y: 222, label: '0x1a…7bb', kind: 'hop' },
		{ id: 'd', x: 268, y: 42, label: 'TMx…q4', kind: 'hop' },
		{ id: 'e', x: 268, y: 150, label: '0xb7…05f', kind: 'hop' },
		{ id: 'f', x: 268, y: 258, label: '0x33…e9c', kind: 'hop' },
		{ id: 'g', x: 392, y: 96, label: 'mixer', kind: 'hop' },
		{ id: 'h', x: 392, y: 212, label: 'OFAC hit', kind: 'flag' }
	];

	const edges: [string, string][] = [
		['a', 'b'],
		['a', 'c'],
		['b', 'd'],
		['b', 'e'],
		['c', 'e'],
		['c', 'f'],
		['e', 'g'],
		['f', 'h'],
		['e', 'h']
	];

	/** The hops the engine ends up flagging: a → c → f → h. */
	const tracedPath = ['a', 'c', 'f', 'h'];

	const at = (id: string) => nodes.find((n) => n.id === id)!;
	const pathD = tracedPath
		.map((id, i) => `${i === 0 ? 'M' : 'L'}${at(id).x},${at(id).y}`)
		.join(' ');
</script>

<figure class="wrap" class:active aria-hidden="true">
	<svg viewBox="0 0 460 300" role="presentation">
		<defs>
			<linearGradient id="trace" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="var(--data)" />
				<stop offset="100%" stop-color="var(--flag)" />
			</linearGradient>
			<filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
				<feGaussianBlur stdDeviation="3.2" result="b" />
				<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
			</filter>
		</defs>

		{#each edges as [from, to], i (from + to)}
			<line
				class="edge"
				x1={at(from).x}
				y1={at(from).y}
				x2={at(to).x}
				y2={at(to).y}
				style="--i:{i}"
			/>
		{/each}

		<path class="trace" d={pathD} filter="url(#glow)" />
		<circle class="pulse" r="4.5">
			<animateMotion dur="3.4s" repeatCount="indefinite" path={pathD} keyPoints="0;1" keyTimes="0;1" />
		</circle>

		{#each nodes as n, i (n.id)}
			<g class="node {n.kind}" class:traced={tracedPath.includes(n.id)} style="--i:{i}">
				<circle cx={n.x} cy={n.y} r={n.kind === 'src' ? 11 : n.kind === 'flag' ? 13 : 8} />
				{#if n.kind === 'flag'}
					<circle class="halo" cx={n.x} cy={n.y} r="13" />
				{/if}
				<text x={n.x} y={n.y + (n.y > 200 ? 30 : -19)} text-anchor="middle">{n.label}</text>
			</g>
		{/each}
	</svg>

	<figcaption>
		<span class="verdict">{caption.verdict}</span>
		<span class="detail">{caption.detail}</span>
	</figcaption>
</figure>

<style>
	.wrap {
		margin: 0;
		display: grid;
		gap: 0.9rem;
	}

	svg {
		width: 100%;
		height: auto;
		overflow: visible;
		font-family: var(--mono);
	}

	.edge {
		stroke: var(--line);
		stroke-width: 1.2;
		stroke-dasharray: 260;
		stroke-dashoffset: 260;
	}

	.active .edge {
		animation: draw 0.7s var(--ease) forwards;
		animation-delay: calc(80ms + var(--i) * 38ms);
	}

	.trace {
		fill: none;
		stroke: url(#trace);
		stroke-width: 2.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 520;
		stroke-dashoffset: 520;
	}

	.active .trace {
		animation: draw 1.05s var(--ease) 0.5s forwards;
	}

	.pulse {
		fill: var(--data);
		opacity: 0;
	}

	.active .pulse {
		animation: appear 0.4s linear 1.45s forwards;
	}

	.node circle {
		fill: var(--bg-soft);
		stroke: var(--line);
		stroke-width: 1.5;
	}

	.node text {
		fill: var(--fg-faint);
		font-size: 10px;
		letter-spacing: 0.02em;
	}

	.node.traced circle {
		stroke: var(--data);
	}

	.node.src circle {
		fill: var(--surface-2);
		stroke: var(--data);
		stroke-width: 2;
	}

	.node.flag circle {
		fill: color-mix(in srgb, var(--flag) 18%, var(--bg));
		stroke: var(--flag);
		stroke-width: 2;
	}

	.node.flag text {
		fill: var(--flag);
	}

	.halo {
		fill: none;
		stroke: var(--flag);
		opacity: 0;
	}

	.active .halo {
		animation: ripple 2s ease-out 1.5s infinite;
	}

	.node {
		opacity: 0;
	}

	.active .node {
		animation: appear 0.5s var(--ease) forwards;
		animation-delay: calc(140ms + var(--i) * 48ms);
	}

	figcaption {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		opacity: 0;
	}

	.active figcaption {
		animation: appear 0.6s var(--ease) 1.75s forwards;
	}

	.verdict {
		color: var(--flag);
		border: 1px solid color-mix(in srgb, var(--flag) 45%, transparent);
		background: color-mix(in srgb, var(--flag) 12%, transparent);
		padding: 0.22rem 0.55rem;
		border-radius: 999px;
	}

	.detail {
		color: var(--fg-faint);
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes appear {
		to {
			opacity: 1;
		}
	}

	@keyframes ripple {
		0% {
			r: 13;
			opacity: 0.85;
		}
		100% {
			r: 30;
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.edge,
		.trace {
			stroke-dashoffset: 0;
		}
		.node,
		figcaption,
		.pulse {
			opacity: 1;
		}
		.halo {
			display: none;
		}
	}
</style>
