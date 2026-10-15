<script lang="ts">
	import type { Lang, Project, SiteContent } from '$lib/content';
	import { splitWords } from '$lib/text';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();

	const find = (name: string) => c.play.projects.find((p) => p.name === name)!;
	const joueur = $derived(find('joueur'));
	const vrap = $derived(find('v-rap'));
	const repl = $derived(find('siyuan-plugin-*-repl'));
	const reditor = $derived(find('reditor'));
	const page = $derived(c.play.page);
</script>

{#snippet title(p: Project)}
	<div class="p-title">
		<h3><a href={p.href} target="_blank" rel="noopener noreferrer" data-cursor={c.cursor.open}>{p.name}</a></h3>
		{#if p.stars}<span class="stars mono">★ {p.stars}</span>{/if}
	</div>
{/snippet}

<section class="section" id="play">
	<div class="sec-head">
		<div>
			<span class="mono label">(06) {c.play.kicker}</span>
			<h2 class="h2" data-split>{@html splitWords(c.play.title, lang)}</h2>
		</div>
		<p class="lead" data-reveal>{c.play.lede}</p>
	</div>

	<!-- Every card is a live toy: the projects, and three about this page itself. -->
	<div class="bento" data-spot>
		<article class="card c-orb" data-reveal>
			<span class="tag mono">01 — {joueur.tech}</span>
			<div class="vis orb-wrap" aria-hidden="true">
				<div class="orb"></div>
				<div class="orb-glass mono">♪ ▶ ❚❚</div>
			</div>
			{@render title(joueur)}
			<p>{joueur.blurb}</p>
		</article>

		<article class="card c-fps" id="fpsCard" data-reveal style="--rd:.08s">
			<span class="tag mono">{page.fps.tag}</span>
			<div class="fps-big"><span id="fpsBig">--</span><small>FPS</small></div>
			<canvas id="fpsCv" aria-hidden="true"></canvas>
			<h3>{page.fps.title}</h3>
			<p>{page.fps.body}</p>
		</article>

		<article class="card" id="springCard" data-reveal style="--rd:.16s" data-cursor={c.cursor.play}>
			<span class="tag mono">02 — {vrap.tech}</span>
			<span class="spring-read mono" id="springRead">k 170 · c 12</span>
			<div class="vis" aria-hidden="true"><div class="arena" id="arena"><div class="ball" id="ball"></div></div></div>
			{@render title(vrap)}
			<p>{vrap.blurb}</p>
		</article>

		<article class="card" data-reveal style="--rd:.24s" data-cursor={c.cursor.decode}>
			<span class="tag mono">03 — {repl.tech}</span>
			<div class="vis" aria-hidden="true">
				<span class="scr" data-decode="VUE-REPL|SVELTE-REPL|REACT-REPL">VUE-REPL</span>
			</div>
			{@render title(repl)}
			<p>{repl.blurb}</p>
		</article>

		<article class="card c-cv" data-reveal>
			<span class="tag mono">04 — {reditor.tech}</span>
			<div class="vis" aria-hidden="true"><div class="sheets"><i></i><i></i><i></i></div></div>
			{@render title(reditor)}
			<p>{reditor.blurb}</p>
		</article>

		<article class="card" data-reveal style="--rd:.08s">
			<span class="tag mono">{page.weight.tag}</span>
			<div class="vis big-vis"><div class="kb"><span id="kb">--</span><small> {page.weight.unit}</small></div></div>
			<h3>{page.weight.title}</h3>
			<p>{page.weight.body}</p>
		</article>

		<article class="card c-motion" data-reveal style="--rd:.16s">
			<span class="tag mono">{page.motion.tag}</span>
			<button class="switch mono" id="motionSw" type="button" role="switch" aria-checked="true" aria-label={page.motion.title}
				><span id="motionState">{page.motion.on}</span><span class="track"></span></button
			>
			<h3>{page.motion.title}</h3>
			<p>{page.motion.body}</p>
			<p class="rmq mono">{page.motion.yours}: <span id="rmq">--</span></p>
		</article>
	</div>
</section>
