<script lang="ts">
	import { base } from '$app/paths';
	import type { Lang, SiteContent } from '$lib/content';
	import { GITHUB } from '$lib/content';
	import { trackSections } from '$lib/reveal';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();

	const sections = $derived([
		{ id: 'production', label: c.nav.work },
		{ id: 'agents', label: c.nav.ai },
		{ id: 'oss', label: c.nav.oss },
		{ id: 'play', label: c.nav.play },
		{ id: 'domains', label: c.nav.domains },
		{ id: 'contact', label: c.nav.contact }
	]);

	let current = $state('top');

	$effect(() => trackSections(['top', ...sections.map((s) => s.id)], (id) => (current = id)));

	const other = $derived(lang === 'en' ? `${base}/zh/` : `${base}/`);
</script>

<div class="progress" aria-hidden="true"></div>

<header class="bar">
	<a class="mark" href="#top">
		<span class="glyph">DZ</span>
		<span class="name">{c.hero.name}</span>
	</a>

	<nav class="links" aria-label={c.a11y.sectionNav}>
		{#each sections as s (s.id)}
			<a href="#{s.id}" class:on={current === s.id}>{s.label}</a>
		{/each}
	</nav>

	<div class="right">
		<a class="icon" href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.9 3.17 9.05 7.57 10.52.55.1.76-.24.76-.53v-1.9c-3.08.67-3.73-1.48-3.73-1.48-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.67.08-.67 1.11.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.5 10.5 0 0 1 5.56 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.07 5.47.4.35.76 1.03.76 2.08v3.08c0 .3.2.64.77.53 4.39-1.47 7.56-5.62 7.56-10.52C23.1 5.33 18.27.5 12 .5Z"
				/>
			</svg>
		</a>
		<a class="lang" href={other} aria-label={c.a11y.langToggle} data-sveltekit-preload-data="tap">
			<span class:on={lang === 'en'}>EN</span>
			<span class="slash">/</span>
			<span class:on={lang === 'zh'}>中文</span>
		</a>
	</div>
</header>

<nav class="dots" aria-label={c.a11y.sectionNav}>
	{#each [{ id: 'top', label: c.hero.name }, ...sections] as s (s.id)}
		<a href="#{s.id}" class:on={current === s.id} aria-label={s.label}><span></span></a>
	{/each}
</nav>

<style>
	/* Scroll-linked progress bar. Pure CSS where the browser supports it;
	   simply absent where it does not, since it is decoration. */
	.progress {
		position: fixed;
		inset: 0 0 auto 0;
		height: 2px;
		z-index: 60;
		transform-origin: left;
		background: linear-gradient(90deg, var(--accent), var(--data));
		scale: 0 1;
	}

	@supports (animation-timeline: scroll()) {
		.progress {
			animation: fill linear both;
			animation-timeline: scroll(root block);
		}
	}

	@keyframes fill {
		to {
			scale: 1 1;
		}
	}

	.bar {
		position: fixed;
		inset: 0 0 auto 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.25rem;
		padding: 0.45rem var(--gutter);
		/* Opaque enough to stay readable over the hero shader; everywhere else
		   the page behind it is flat, so nothing is lost. */
		background: color-mix(in srgb, var(--bg) 93%, transparent);
		backdrop-filter: blur(18px) saturate(140%);
		border-bottom: 1px solid var(--line-soft);
	}

	.mark {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		flex: none;
		min-height: 44px;
	}

	.glyph {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 7px;
		background: var(--accent);
		color: #140700;
		font-family: var(--mono);
		font-size: 0.66rem;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	.name {
		font-family: var(--display);
		font-weight: 600;
		font-size: 0.95rem;
		letter-spacing: -0.015em;
	}

	.links {
		display: flex;
		gap: 1.35rem;
		font-size: 0.82rem;
		color: var(--fg-faint);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.links::-webkit-scrollbar {
		display: none;
	}

	.links a {
		white-space: nowrap;
		padding-block: 0.25rem;
		border-bottom: 1px solid transparent;
		transition:
			color 0.25s var(--ease),
			border-color 0.25s var(--ease);
	}

	.links a:hover {
		color: var(--fg);
	}

	.links a.on {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	.right {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		flex: none;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
	}

	.icon svg {
		width: 1.15rem;
		height: 1.15rem;
		fill: var(--fg-faint);
		transition: fill 0.25s var(--ease);
	}

	.icon:hover svg {
		fill: var(--fg);
	}

	.lang {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-family: var(--mono);
		font-size: 0.72rem;
		color: var(--fg-faint);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0.24rem 0.7rem;
		min-height: 34px;
		transition: border-color 0.25s var(--ease);
	}

	.lang:hover {
		border-color: var(--fg-faint);
	}

	.lang .on {
		color: var(--accent);
	}

	.slash {
		color: var(--line);
	}

	/* ------------------------------------------------- side page dots */
	.dots {
		position: fixed;
		right: clamp(0.6rem, 1.6vw, 1.3rem);
		top: 50%;
		translate: 0 -50%;
		z-index: 40;
		display: grid;
		gap: 0.75rem;
	}

	.dots a {
		display: grid;
		place-items: center;
		width: 1.1rem;
		height: 1.1rem;
	}

	.dots span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--line);
		transition:
			background 0.3s var(--ease),
			scale 0.3s var(--ease);
	}

	.dots a:hover span {
		background: var(--fg-faint);
	}

	.dots a.on span {
		background: var(--accent);
		scale: 1.65;
	}

	@media (max-width: 68rem) {
		.links {
			display: none;
		}
		.dots {
			display: none;
		}
	}

	@media (max-width: 30rem) {
		.name {
			display: none;
		}
	}
</style>
