<script lang="ts">
	import type { Lang, SiteContent } from '$lib/content';
	import { splitWords } from '$lib/text';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();
</script>

<section class="section" id="domains">
	<div class="sec-head">
		<div>
			<span class="mono label">(07) {c.domains.kicker}</span>
			<h2 class="h2" data-split>{@html splitWords(c.domains.title, lang)}</h2>
		</div>
		<p class="lead" data-reveal>{c.domains.lede}</p>
	</div>

	<ol class="doms">
		{#each c.domains.items as d, i (d.label)}
			<li class="dom" class:current={d.current} data-reveal style="--rd:{(i % 2) * 0.08}s">
				<span class="dom-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
				<div>
					<span class="mono label at">{#if d.current}<span class="dot"></span>{/if}{d.at}</span>
					<h3>{d.label}</h3>
					<p>{d.body}</p>
				</div>
			</li>
		{/each}
	</ol>

	<div class="stack" data-reveal>
		<h3 class="mono label">{c.domains.stackTitle}</h3>
		<dl>
			{#each c.domains.stack as row (row.label)}
				<div>
					<dt class="mono">{row.label}</dt>
					<dd>
						<ul class="chips">
							{#each row.items.split(' · ') as item (item)}<li>{item}</li>{/each}
						</ul>
					</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>
