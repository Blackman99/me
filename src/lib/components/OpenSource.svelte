<script lang="ts">
	import type { Lang, Project, SiteContent } from '$lib/content';
	import { splitWords } from '$lib/text';
	import MarkdownMorph from './MarkdownMorph.svelte';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();

	const [press, calendar, json] = $derived(c.oss.projects);

	// A month of days for the calendar panel; each ripples on its own delay.
	const days = Array.from({ length: 35 }, (_, i) => {
		const x = i % 7;
		const y = Math.floor(i / 7);
		return { d: (Math.hypot(x - 3, y - 2) * 0.22).toFixed(2), today: i === 17 };
	});
</script>

{#snippet body(p: Project)}
	<div class="p-body">
		<div class="p-title">
			<h3><a href={p.href} target="_blank" rel="noopener noreferrer" data-cursor={c.cursor.open}>{p.name}</a></h3>
			{#if p.stars}<span class="stars mono">★ {p.stars}</span>{/if}
		</div>
		{#if p.tagline}<p class="tagline">{p.tagline}</p>{/if}
		<p>{p.blurb}</p>
		<div class="p-meta mono">
			<span>{p.role} · {p.tech}</span>
			{#if p.links?.length}
				<span class="p-links">
					{#each p.links as l (l.href)}<a href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>{/each}
				</span>
			{/if}
		</div>
	</div>
{/snippet}

<!-- Scrolling down moves this track sideways. Below 800px it is a plain column. -->
<section class="process" id="oss">
	<div class="hz-sticky">
		<div class="hz-head">
			<div>
				<span class="mono label kick">(05) {c.oss.kicker}</span>
				<h2 class="h2" data-split>{@html splitWords(c.oss.title, lang)}</h2>
			</div>
			<div class="hz-side">
				<p class="lead">{c.oss.lede}</p>
				<div class="hz-meter mono" aria-hidden="true">
					<span><b id="hzNum">01</b> / 04</span><span class="bar"><i id="hzBar"></i></span>
				</div>
			</div>
		</div>

		<div class="hz-track" id="hzTrack">
			<article class="panel">
				<span class="p-num" aria-hidden="true">01</span>
				<div class="p-vis vis-grid" aria-hidden="true">
					<div class="sun-glow"></div>
					<div class="sun"></div>
					<div class="floor"></div>
					<div class="horizon"></div>
				</div>
				{@render body(press)}
			</article>

			<article class="panel wide">
				<span class="p-num" aria-hidden="true">02</span>
				<div class="p-vis"><MarkdownMorph clickable={c.oss.demo.clickable} /></div>
				<div class="p-body">
					<h3>{c.oss.demo.title}</h3>
					<p>{c.oss.demo.body}</p>
				</div>
			</article>

			<article class="panel">
				<span class="p-num" aria-hidden="true">03</span>
				<div class="p-vis" aria-hidden="true">
					<div class="days">
						{#each days as day, i (i)}<i class:today={day.today} style="--d:{day.d}"></i>{/each}
					</div>
				</div>
				{@render body(calendar)}
			</article>

			<article class="panel">
				<span class="p-num" aria-hidden="true">04</span>
				<div class="p-vis" aria-hidden="true">
					<div class="cube"><i></i><i></i><i></i><i></i><i></i><i></i></div>
					<div class="cube inner"><i></i><i></i><i></i><i></i><i></i><i></i></div>
				</div>
				{@render body(json)}
			</article>
		</div>
	</div>
</section>
