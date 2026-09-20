<script lang="ts">
	import type { Project } from '$lib/content';
	import { reveal } from '$lib/reveal';

	let { project, index = 0 }: { project: Project; index?: number } = $props();
</script>

<a
	class="card"
	href={project.href}
	target="_blank"
	rel="noopener noreferrer"
	use:reveal
	data-reveal
	style="--i:{index}"
>
	<header>
		<h3>{project.name}</h3>
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

	<p class="blurb">{project.blurb}</p>

	<footer>
		<span class="meta">{project.role} · {project.tech}</span>
		<span class="go" aria-hidden="true">
			<svg viewBox="0 0 24 24"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
		</span>
	</footer>
</a>

<style>
	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		padding: 0.95rem 1.15rem 0.85rem;
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
	.card:focus-visible {
		border-color: color-mix(in srgb, var(--accent) 42%, var(--line));
		transform: translateY(-3px);
		box-shadow: 0 22px 44px -28px rgb(255 107 53 / 0.5);
	}

	.card:hover::before,
	.card:focus-visible::before {
		scale: 1 1;
	}

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

	.go svg {
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
	.card:focus-visible .go svg {
		translate: 4px 0;
		stroke: var(--accent);
	}
</style>
