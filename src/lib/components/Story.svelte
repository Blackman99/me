<script lang="ts">
	import type { Lang, SiteContent } from '$lib/content';
	import { MARQUEE } from '$lib/content';
	import { splitManifesto } from '$lib/text';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();

	// Each row holds four copies so it can wrap around without a seam.
	const rows = [MARQUEE, [...MARQUEE].reverse()];
</script>

<!-- The stack in giant type. Decorative: the same names are listed under Domains. -->
<section class="marquee" id="marquee" aria-hidden="true">
	{#each rows as items, r (r)}
		<div class="mq-row" class:outline={r === 1} data-dir={r ? -1 : 1}>
			<div class="mq-track">
				{#each [0, 1, 2, 3] as k (k)}
					{#each items as t (t)}<span class="mq-item">{t}<span class="star">✦</span></span>{/each}
				{/each}
			</div>
		</div>
	{/each}
</section>

<section class="manifesto" id="manifesto">
	<div class="mf-sticky">
		<p class="mono label">(01) {c.manifesto.kicker}</p>
		<p class="mf-text">{@html splitManifesto(c.manifesto.text, lang)}</p>
	</div>
</section>

<section class="engine" id="engine" aria-label={c.engine.kicker}>
	<div class="morph-sticky">
		<canvas id="pgl" aria-hidden="true"></canvas>
		<div class="morph-head mono label"><span>(02) {c.engine.kicker}</span><span>{c.engine.hint}</span></div>
		<div class="morph-copy">
			<div class="stages">
				{#each c.engine.stages as s, i (s.label)}
					<div class="stage" class:on={i === 0}>
						<span class="mono label">{s.label}</span>
						<h3>{s.title}</h3>
						<p>{s.body}</p>
					</div>
				{/each}
			</div>
			<ol class="ticks mono" id="ticks" aria-hidden="true">
				{#each c.engine.stages as s, i (s.label)}
					<li class:on={i === 0}>{s.label.split(' / ')[1]}</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
