<script lang="ts">
	import type { Lang, SiteContent } from '$lib/content';
	import { splitWords } from '$lib/text';
	import ProjectCard from './ProjectCard.svelte';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();
</script>

<section class="section dx" id="agents">
	<div>
		<span class="mono label kick">(04) {c.agents.kicker}</span>
		<h2 class="h2" data-split>{@html splitWords(c.agents.title, lang)}</h2>
		<p class="lead" data-reveal>{c.agents.lede}</p>
		<div class="projects" data-spot>
			{#each c.agents.projects as p, i (p.name)}
				<ProjectCard project={p} index={i} cursor={c.cursor.open} />
			{/each}
		</div>
	</div>

	<!-- codsh's /ship, typed out once the terminal scrolls into view -->
	<div class="term-col">
		<div class="terminal" id="terminal" data-reveal style="--rd:.12s">
			<div class="term-bar"><i></i><i></i><i></i><span>{c.agents.terminal}</span></div>
			<div id="term" aria-hidden="true"></div>
		</div>
	</div>
</section>
