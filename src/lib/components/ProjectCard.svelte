<script lang="ts">
	import type { Project } from '$lib/content';
	import { reveal } from '$lib/reveal';

	let { project, index = 0 }: { project: Project; index?: number } = $props();

	const featured = $derived(!!project.featured);
</script>

<!-- The repo link is stretched over the whole card, so the card still reads
     as one target; the secondary links sit above it and stay clickable. -->
<article class="card" class:featured use:reveal data-reveal style="--i:{index}">
	<header>
		<h3>
			<a class="repo" href={project.href} target="_blank" rel="noopener noreferrer">{project.name}</a>
		</h3>
		{#if project.stars}
			<span class="stars" title="{project.stars} stars on GitHub">
				<svg viewBox="0 0 24 24" aria-hidden="true"
					><path
						d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.45 6.19 20.5l1.11-6.47L2.6 9.45l6.5-.95z"
					/></svg
				>
				{project.stars}
			</span>
		{/if}
	</header>

	{#if featured && project.tagline}
		<p class="tagline">{project.tagline}</p>
	{/if}

	<p class="blurb">{project.blurb}</p>

	{#if featured && project.highlights?.length}
		<ul class="chips">
			{#each project.highlights as h (h)}
				<li>{h}</li>
			{/each}
		</ul>
	{/if}

	<footer>
		<span class="meta">{project.role} · {project.tech}</span>
		<span class="links">
			{#each project.links ?? [] as l (l.href)}
				<a class="ext" href={l.href} target="_blank" rel="noopener noreferrer">
					{l.label}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
				</a>
			{/each}
			<span class="go" aria-hidden="true">
				<svg viewBox="0 0 24 24"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
			</span>
		</span>
	</footer>
</article>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.9rem 1.15rem 0.8rem;
		background: linear-gradient(180deg, var(--surface), var(--bg-soft));
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		transition:
			border-color 0.3s var(--ease),
			transform 0.3s var(--ease),
			box-shadow 0.3s var(--ease),
			opacity var(--dur) var(--ease);
	}

	/* A slim accent rail that fills in on hover. */
	.card::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 2px;
		background: var(--accent);
		scale: 1 0;
		transform-origin: top;
		transition: scale 0.38s var(--ease);
	}

	.card:hover,
	.card:has(:focus-visible) {
		border-color: color-mix(in srgb, var(--accent) 42%, var(--line));
		transform: translateY(-3px);
		box-shadow: 0 22px 44px -28px rgb(255 107 53 / 0.5);
	}

	.card:hover::before,
	.card:has(:focus-visible)::before {
		scale: 1 1;
	}

	/* The ring goes round the whole card, which is what the link covers. */
	.card:has(.repo:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}

	.repo:focus-visible {
		outline: none;
	}

	.repo::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	/* ------------------------------------------------------- featured */
	.featured {
		gap: 0.6rem;
		padding: 1.15rem 1.3rem 0.9rem;
		border-color: color-mix(in srgb, var(--accent) 30%, var(--line));
		background:
			radial-gradient(120% 90% at 100% 0%, rgb(255 107 53 / 0.1), transparent 55%),
			linear-gradient(180deg, var(--surface-2), var(--bg-soft));
	}

	.tagline {
		font-family: var(--display);
		font-size: clamp(1.05rem, 0.95rem + 0.45vw, 1.3rem);
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: -0.015em;
		color: var(--fg);
	}

	.chips {
		list-style: none;
		margin: 0.1rem 0 0.15rem;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.chips li {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.2rem 0.65rem;
		font-family: var(--mono);
		font-size: 0.68rem;
		letter-spacing: 0.02em;
		color: var(--fg-dim);
		border: 1px solid var(--line);
		border-radius: 999px;
		background: rgb(255 255 255 / 0.02);
	}

	.chips li::before {
		content: '';
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--data);
		flex: none;
	}

	/* --------------------------------------------------------- shared */
	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	h3 {
		font-family: var(--mono);
		font-size: clamp(0.95rem, 0.88rem + 0.3vw, 1.1rem);
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--fg);
		word-break: break-word;
	}

	.stars {
		display: inline-flex;
		align-items: center;
		gap: 0.28rem;
		flex: none;
		font-family: var(--mono);
		font-size: 0.75rem;
		color: var(--accent);
	}

	.stars svg {
		width: 0.85em;
		height: 0.85em;
		fill: currentColor;
	}

	.blurb {
		color: var(--fg-dim);
		font-size: 0.84rem;
		line-height: 1.55;
		flex: 1;
	}

	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.4rem;
		border-top: 1px solid var(--line-soft);
	}

	.meta {
		font-family: var(--mono);
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		color: var(--fg-faint);
	}

	.links {
		display: inline-flex;
		align-items: center;
		gap: 0.85rem;
		flex: none;
	}

	.ext {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-family: var(--mono);
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		color: var(--fg-dim);
		border-bottom: 1px solid var(--line);
		transition:
			color 0.25s var(--ease),
			border-color 0.25s var(--ease);
	}

	/* Bigger hit area without moving the text. */
	.ext::before {
		content: '';
		position: absolute;
		inset: -0.6rem -0.35rem;
	}

	.ext:hover,
	.ext:focus-visible {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	.ext svg {
		width: 0.85em;
		height: 0.85em;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.go svg {
		display: block;
		width: 1.05rem;
		height: 1.05rem;
		fill: none;
		stroke: var(--fg-faint);
		stroke-width: 1.7;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition:
			translate 0.3s var(--ease),
			stroke 0.3s var(--ease);
	}

	.card:hover .go svg,
	.card:has(.repo:focus-visible) .go svg {
		translate: 4px 0;
		stroke: var(--accent);
	}

	/* In the side-by-side desktop layout a narrow column means a short
	   laptop screen; the chips are the first thing to give up their room. */
	@media (min-width: 62rem) {
		@container pinned (max-width: 35rem) {
			.chips {
				display: none;
			}
		}
	}

	@media (max-width: 30rem) {
		footer {
			flex-wrap: wrap;
			gap: 0.45rem 1rem;
		}
	}
</style>
