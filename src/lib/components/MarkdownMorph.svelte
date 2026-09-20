<script lang="ts">
	let { active = false }: { active?: boolean } = $props();

	// The counter on the right is a real Svelte component, not a picture of one.
	// That is the whole pitch of Sveltepress, so the demo had better be honest.
	let count = $state(0);
</script>

<div class="morph" class:active>
	<div class="pane src">
		<div class="tab">docs/index.md</div>
		<pre><code
				><span class="l" style="--i:0"><span class="h">#</span> <span class="hd">Getting started</span></span
				><span class="l" style="--i:1"></span><span class="l" style="--i:2"
					>Write Svelte right here:</span
				><span class="l" style="--i:3"></span><span class="l" style="--i:4"
					><span class="p">&lt;script&gt;</span></span
				><span class="l" style="--i:5">  let count = <span class="k">$state</span>(0)</span
				><span class="l" style="--i:6"><span class="p">&lt;/script&gt;</span></span
				><span class="l" style="--i:7"></span><span class="l" style="--i:8"
					><span class="p">&lt;button</span> <span class="a">onclick</span>=<span class="s"
						>&#123;() =&gt; count++&#125;</span
					><span class="p">&gt;</span></span
				><span class="l" style="--i:9">  &#123;count&#125;</span><span class="l" style="--i:10"
					><span class="p">&lt;/button&gt;</span></span
				></code
			></pre>
	</div>

	<div class="beam" aria-hidden="true">
		<svg viewBox="0 0 48 24" role="presentation">
			<path d="M2 12 H40" />
			<path d="M33 5 L41 12 L33 19" />
		</svg>
		<span class="beam-label">build</span>
	</div>

	<div class="pane out">
		<div class="tab">sveltepress.site</div>
		<div class="rendered">
			<h4>Getting started</h4>
			<p>Write Svelte right here:</p>
			<button onclick={() => (count += 1)}>{count}</button>
			<span class="hint">really clickable</span>
		</div>
	</div>
</div>

<style>
	.morph {
		display: grid;
		/* The source pane gets the extra room: its longest line is wider than
		   anything the rendered pane holds, and clipped code looks broken. */
		grid-template-columns: minmax(0, 1.35fr) auto minmax(0, 0.85fr);
		align-items: stretch;
		gap: 0.65rem;
	}

	.pane {
		background: var(--bg-soft);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		min-width: 0;
		opacity: 0;
		transform: translateY(0.9rem);
		transition:
			opacity 0.6s var(--ease),
			transform 0.6s var(--ease);
	}

	.active .pane {
		opacity: 1;
		transform: none;
	}

	.active .out {
		transition-delay: 0.5s;
	}

	.tab {
		font-family: var(--mono);
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		color: var(--fg-faint);
		padding: 0.5rem 0.8rem;
		border-bottom: 1px solid var(--line-soft);
		background: var(--surface);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	pre {
		margin: 0;
		padding: 0.85rem 0.9rem;
		overflow-x: auto;
	}

	code {
		font-family: var(--mono);
		font-size: clamp(0.64rem, 0.56rem + 0.28vw, 0.74rem);
		line-height: 1.85;
		color: var(--fg-dim);
	}

	.l {
		display: block;
		min-height: 1.85em;
		opacity: 0;
	}

	.active .l {
		animation: line-in 0.4s var(--ease) forwards;
		animation-delay: calc(var(--i) * 55ms);
	}

	.h {
		color: var(--accent);
	}
	.hd {
		color: var(--fg);
	}
	.p {
		color: var(--accent-soft);
	}
	.k {
		color: var(--data);
	}
	.a {
		color: var(--fg);
	}
	.s {
		color: var(--data-dim);
	}

	.beam {
		display: grid;
		place-items: center;
		gap: 0.3rem;
		align-self: center;
		color: var(--fg-faint);
	}

	.beam svg {
		width: 2.6rem;
		fill: none;
		stroke: var(--accent);
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 60;
		stroke-dashoffset: 60;
	}

	.active .beam svg {
		animation: draw 0.55s var(--ease) 0.35s forwards;
	}

	.beam-label {
		font-family: var(--mono);
		font-size: 0.6rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		opacity: 0;
	}

	.active .beam-label {
		animation: line-in 0.4s var(--ease) 0.8s forwards;
	}

	.rendered {
		padding: 1.1rem 1.1rem 1.3rem;
		display: grid;
		gap: 0.65rem;
		justify-items: start;
	}

	.rendered h4 {
		font-size: 1.05rem;
		color: var(--fg);
	}

	.rendered p {
		color: var(--fg-dim);
		font-size: 0.85rem;
	}

	button {
		font-family: var(--mono);
		font-size: 0.95rem;
		min-width: 3.4rem;
		padding: 0.42rem 0.9rem;
		color: var(--bg);
		background: var(--data);
		border: 0;
		border-radius: 8px;
		cursor: pointer;
		transition: transform 0.18s var(--ease);
	}

	button:hover {
		transform: translateY(-1px);
	}

	button:active {
		transform: translateY(1px);
	}

	.hint {
		font-family: var(--mono);
		font-size: 0.6rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-faint);
	}

	@keyframes line-in {
		to {
			opacity: 1;
		}
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@media (max-width: 52rem) {
		.morph {
			grid-template-columns: 1fr;
		}

		.beam svg {
			rotate: 90deg;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pane,
		.l,
		.beam-label {
			opacity: 1;
			transform: none;
		}

		.beam svg {
			stroke-dashoffset: 0;
		}
	}
</style>
