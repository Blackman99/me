<script lang="ts">
	import { base } from '$app/paths';
	import { BLOG, CV_FILE, EMAIL, GITHUB, SITE_URL, content, type Lang } from '$lib/content';
	import { reveal } from '$lib/reveal';
	import ChainGraph from './ChainGraph.svelte';
	import Hero from './Hero.svelte';
	import MarkdownMorph from './MarkdownMorph.svelte';
	import Nav from './Nav.svelte';
	import ProjectCard from './ProjectCard.svelte';
	import Section from './Section.svelte';
	import Terminal from './Terminal.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(content[lang]);
	const canonical = $derived(lang === 'en' ? `${SITE_URL}/` : `${SITE_URL}/zh/`);

	// The prerendered HTML already carries the right `lang`; this keeps it
	// correct after a client-side hop between /en and /zh.
	$effect(() => {
		document.documentElement.lang = c.locale;
	});
</script>

<svelte:head>
	<title>{c.meta.title}</title>
	<meta name="description" content={c.meta.description} />
	<meta property="og:title" content={c.meta.title} />
	<meta property="og:description" content={c.meta.description} />
	<meta property="og:type" content="profile" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={lang === 'en' ? 'en' : 'zh_CN'} />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" hreflang="en" href="{SITE_URL}/" />
	<link rel="alternate" hreflang="zh-Hans" href="{SITE_URL}/zh/" />
	<link rel="alternate" hreflang="x-default" href="{SITE_URL}/" />
</svelte:head>

<Nav {c} {lang} />

<main>
	<Hero {c} />

	<!-- ------------------------------------------------ production work -->
	<Section
		id="production"
		kicker={c.production.kicker}
		title={c.production.title}
		lede={c.production.context}
	>
		{#snippet children()}
			<ul class="bullets">
				{#each c.production.bullets as b, i (b.head)}
					<li use:reveal data-reveal style="--i:{i}">
						<h3>{b.head}</h3>
						<p>{b.body}</p>
					</li>
				{/each}
			</ul>
		{/snippet}

		{#snippet aside(active: boolean)}
			<div class="graph-panel">
				<ChainGraph {active} {lang} />
				<div class="callout">
					<h3>{c.production.highlight.head}</h3>
					<p>{c.production.highlight.body}</p>
				</div>
			</div>
		{/snippet}
	</Section>

	<!-- ------------------------------------------------- agent tooling -->
	<Section id="agents" kicker={c.agents.kicker} title={c.agents.title} lede={c.agents.lede}>
		{#snippet children()}
			<div class="cards stack">
				{#each c.agents.projects as p, i (p.name)}
					<ProjectCard project={p} index={i} />
				{/each}
			</div>
		{/snippet}

		{#snippet aside(active: boolean)}
			<Terminal {active} />
		{/snippet}
	</Section>

	<!-- ------------------------------------------------ open source -->
	<Section id="oss" kicker={c.oss.kicker} title={c.oss.title} lede={c.oss.lede}>
		{#snippet children()}
			<div class="cards stack">
				{#each c.oss.projects as p, i (p.name)}
					<ProjectCard project={p} index={i} />
				{/each}
			</div>
		{/snippet}

		{#snippet aside(active: boolean)}
			<MarkdownMorph {active} />
		{/snippet}
	</Section>

	<!-- --------------------------------------------------- playground -->
	<Section id="play" kicker={c.play.kicker} title={c.play.title} lede={c.play.lede}>
		{#snippet children()}
			<div class="cards quad">
				{#each c.play.projects as p, i (p.name)}
					<ProjectCard project={p} index={i} />
				{/each}
			</div>
		{/snippet}
	</Section>

	<!-- ------------------------------------------------------ domains -->
	<Section id="domains" kicker={c.domains.kicker} title={c.domains.title} lede={c.domains.lede}>
		{#snippet children()}
			<ol class="domains">
				{#each c.domains.items as d, i (d.label)}
					<li class:current={d.current} use:reveal data-reveal="left" style="--i:{i}">
						<span class="at">{d.at}</span>
						<h3>{d.label}</h3>
						<p>{d.body}</p>
					</li>
				{/each}
			</ol>

		{/snippet}

		{#snippet aside()}
			<div class="stack-table">
				<h3 class="stack-title">{c.domains.stackTitle}</h3>
				<dl>
					{#each c.domains.stack as row (row.label)}
						<div>
							<dt>{row.label}</dt>
							<dd>{row.items}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/snippet}
	</Section>

	<!-- ------------------------------------------------------ contact -->
	<section class="section contact" id="contact">
		<div class="shell">
			<p class="kicker" use:reveal data-reveal="left">{c.contact.kicker}</p>
			<h2 class="contact-title" use:reveal data-reveal style="--i:1">{c.contact.title}</h2>
			<p class="lede" use:reveal data-reveal style="--i:2">{c.contact.lede}</p>

			<p class="availability" use:reveal data-reveal style="--i:3">
				<span class="beacon"></span>
				<strong>{c.contact.availability}</strong>
			</p>
			<p class="overlap" use:reveal data-reveal style="--i:4">{c.contact.overlap}</p>

			<a class="mailto" href="mailto:{EMAIL}" use:reveal data-reveal="scale" style="--i:5">
				<span class="label">{c.contact.emailLabel}</span>
				<span class="addr">{EMAIL}</span>
			</a>

			<div class="links-row" use:reveal data-reveal style="--i:6">
				<a href={GITHUB} target="_blank" rel="noopener noreferrer">{c.contact.githubLabel}</a>
				<a href={BLOG} target="_blank" rel="noopener noreferrer">{c.contact.blogLabel}</a>
				<a class="cv" href="{base}/{CV_FILE}" download>
					{c.contact.cvLabel}<span class="note">{c.contact.cvNote}</span>
				</a>
			</div>

			<p class="footer" use:reveal data-reveal="fade" style="--i:7">{c.contact.footer}</p>
		</div>
	</section>
</main>

<style>
	/* ------------------------------------------------ production bullets */
	/* Two columns on desktop: six stacked bullets made this section overflow
	   a 14-inch laptop, which broke the full-screen paging. */
	.bullets {
		list-style: none;
		margin: 1.7rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem 1.6rem;
	}

	@media (max-width: 46rem) {
		.bullets,
		.domains {
			grid-template-columns: 1fr;
		}
	}

	.bullets li {
		padding-left: 1.1rem;
		border-left: 1px solid var(--line);
		transition:
			border-color 0.3s var(--ease),
			opacity var(--dur) var(--ease),
			transform var(--dur) var(--ease);
	}

	.bullets li:hover {
		border-left-color: var(--accent);
	}

	.bullets h3 {
		font-size: 0.92rem;
		font-weight: 600;
		color: var(--fg);
	}

	.bullets p {
		margin-top: 0.25rem;
		font-size: 0.81rem;
		line-height: 1.52;
		color: var(--fg-dim);
	}

	.graph-panel {
		display: grid;
		gap: 1.1rem;
		padding: 1.25rem 1.2rem;
		background: linear-gradient(180deg, var(--surface), var(--bg-soft));
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}

	.callout {
		padding-top: 1rem;
		border-top: 1px solid var(--line-soft);
	}

	.callout h3 {
		font-family: var(--mono);
		font-size: 0.76rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--data);
	}

	.callout p {
		margin-top: 0.45rem;
		font-size: 0.86rem;
		color: var(--fg-dim);
	}

	/* ------------------------------------------------------------ cards */
	.cards {
		display: grid;
		gap: 0.7rem;
		margin-top: 1.5rem;
	}

	.cards.quad {
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
	}

	/* -------------------------------------------------------- domains */
	.domains {
		list-style: none;
		counter-reset: dom;
		margin: 1.8rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.1rem 1.8rem;
	}

	.domains li {
		counter-increment: dom;
		position: relative;
		padding-left: 2.5rem;
		transition:
			opacity var(--dur) var(--ease),
			transform var(--dur) var(--ease);
	}

	.domains li::before {
		content: counter(dom, decimal-leading-zero);
		position: absolute;
		left: 0;
		top: 0.1rem;
		font-family: var(--mono);
		font-size: 0.72rem;
		color: var(--fg-faint);
	}

	.domains .at {
		font-family: var(--mono);
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-faint);
	}

	.domains li.current .at {
		color: var(--data);
	}

	.domains h3 {
		margin-top: 0.2rem;
		font-size: 1.02rem;
		color: var(--fg);
	}

	.domains p {
		margin-top: 0.3rem;
		font-size: 0.81rem;
		line-height: 1.52;
		color: var(--fg-dim);
	}

	/* ---------------------------------------------------------- stack */
	.stack-table {
		padding: 1.3rem 1.35rem 1.45rem;
		background: linear-gradient(180deg, var(--surface), var(--bg-soft));
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}

	.stack-title {
		font-family: var(--mono);
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.stack-table dl {
		margin: 0.95rem 0 0;
		display: grid;
		gap: 0.6rem;
	}

	.stack-table dl > div {
		display: grid;
		grid-template-columns: 5rem minmax(0, 1fr);
		gap: 0.7rem;
		align-items: baseline;
	}

	.stack-table dt {
		font-family: var(--mono);
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		color: var(--fg-faint);
	}

	.stack-table dd {
		margin: 0;
		font-size: 0.8rem;
		color: var(--fg-dim);
	}

	/* -------------------------------------------------------- contact */
	.contact {
		text-align: center;
		align-items: center;
		background:
			radial-gradient(ellipse 70% 55% at 50% 100%, rgb(255 107 53 / 0.13), transparent 70%),
			var(--bg);
	}

	.contact .kicker {
		justify-content: center;
	}

	.contact .kicker::after {
		content: '';
		width: 1.75rem;
		height: 1px;
		background: var(--accent);
	}

	.contact-title {
		font-size: clamp(2rem, 1.2rem + 3.6vw, 4rem);
		margin-top: 1.1rem;
	}

	.contact .lede {
		margin-inline: auto;
		max-width: 50ch;
	}

	.availability {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		margin-top: 2rem;
		font-size: 0.95rem;
		color: var(--fg);
	}

	.beacon {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #4ade80;
		box-shadow: 0 0 12px #4ade80;
	}

	.overlap {
		margin-top: 0.4rem;
		font-size: 0.83rem;
		color: var(--fg-faint);
	}

	.mailto {
		display: inline-grid;
		gap: 0.3rem;
		margin-top: 2.2rem;
		padding: 1.1rem 2rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(180deg, var(--surface), var(--bg-soft));
		transition:
			border-color 0.3s var(--ease),
			transform 0.3s var(--ease),
			box-shadow 0.3s var(--ease),
			opacity var(--dur) var(--ease);
	}

	.mailto:hover {
		border-color: color-mix(in srgb, var(--accent) 50%, var(--line));
		transform: translateY(-3px);
		box-shadow: 0 26px 50px -30px rgb(255 107 53 / 0.7);
	}

	.mailto .label {
		font-family: var(--mono);
		font-size: 0.64rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--fg-faint);
	}

	.mailto .addr {
		font-family: var(--mono);
		font-size: clamp(0.85rem, 0.7rem + 0.7vw, 1.3rem);
		color: var(--fg);
		word-break: break-all;
	}

	.links-row {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.6rem 1.6rem;
		margin-top: 1.8rem;
		font-size: 0.88rem;
		color: var(--fg-dim);
	}

	.links-row a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		border-bottom: 1px solid var(--line);
		padding-bottom: 2px;
		transition:
			color 0.25s var(--ease),
			border-color 0.25s var(--ease);
	}

	.links-row a:hover {
		color: var(--fg);
		border-bottom-color: var(--accent);
	}

	.links-row .cv {
		align-items: center;
		gap: 0.5rem;
		color: var(--accent);
		border-bottom-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}

	.links-row .note {
		font-family: var(--mono);
		font-size: 0.64rem;
		letter-spacing: 0.1em;
		color: var(--fg-faint);
	}

	.footer {
		margin-top: 3.4rem;
		font-size: 0.74rem;
		color: var(--fg-faint);
	}

	@media (max-width: 40rem) {
		.stack-table dl > div {
			grid-template-columns: 1fr;
			gap: 0.15rem;
		}
	}
</style>
