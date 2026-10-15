<script lang="ts">
	import type { Lang, SiteContent } from '$lib/content';
	import { splitWords } from '$lib/text';
	import ChainGraph from './ChainGraph.svelte';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();

	const b = $derived(c.production.bullets);
	const tag = (i: number) => `${String(i + 1).padStart(2, '0')} — ${b[i].tag}`;
</script>

<section class="section" id="production">
	<div class="sec-head">
		<div>
			<span class="mono label">(03) {c.production.kicker}</span>
			<h2 class="h2" data-split>{@html splitWords(c.production.title, lang)}</h2>
		</div>
		<p class="lead" data-reveal>{c.production.context}</p>
	</div>

	<div class="bento" data-spot>
		<article class="card c-orb" data-reveal>
			<span class="tag mono">{tag(0)}</span>
			<div class="vis orb-wrap" aria-hidden="true">
				<div class="orb"></div>
				<div class="orb-glass mono">report<br />= llm(risk);</div>
			</div>
			<h3>{b[0].head}</h3>
			<p>{b[0].body}</p>
		</article>

		<article class="card c-graph" data-reveal style="--rd:.08s">
			<span class="tag mono">{tag(1)}</span>
			<div class="vis graph-vis"><ChainGraph {lang} /></div>
			<h3>{b[1].head}</h3>
			<p>{b[1].body}</p>
		</article>

		<article class="card" data-reveal data-cursor={c.cursor.decode}>
			<span class="tag mono">{tag(2)}</span>
			<div class="vis" aria-hidden="true">
				<span class="scr" data-decode="RULESET://DEPOSIT|RULESET://WITHDRAWAL|RULESET://CDD|RULESET://MONITOR"
					>RULESET://DEPOSIT</span
				>
			</div>
			<h3>{b[2].head}</h3>
			<p>{b[2].body}</p>
		</article>

		<article class="card" data-reveal style="--rd:.08s">
			<span class="tag mono">{tag(3)}</span>
			<div class="vis big-vis" aria-hidden="true">
				<div class="kb">v3<small> API</small></div>
				<span class="mono">ETH · TRON · BASE</span>
			</div>
			<h3>{b[3].head}</h3>
			<p>{b[3].body}</p>
		</article>

		<article class="card" data-reveal style="--rd:.16s">
			<span class="tag mono">{tag(4)}</span>
			<span class="num" aria-hidden="true">05</span>
			<h3>{b[4].head}</h3>
			<p>{b[4].body}</p>
		</article>

		<article class="card" data-reveal style="--rd:.24s">
			<span class="tag mono">{tag(5)}</span>
			<span class="num" aria-hidden="true">06</span>
			<h3>{b[5].head}</h3>
			<p>{b[5].body}</p>
		</article>

		<article class="card c-wide" data-reveal>
			<span class="tag mono">✦ {c.production.highlight.tag}</span>
			<div>
				<h3>{c.production.highlight.head}</h3>
				<p>{c.production.highlight.body}</p>
			</div>
			<ul class="chips">
				{#each c.production.highlight.chips as chip (chip)}<li>{chip}</li>{/each}
			</ul>
		</article>
	</div>
</section>
