<script lang="ts">
	import { base } from '$app/paths';
	import type { Lang, SiteContent } from '$lib/content';
	import { BLOG, EMAIL, GITHUB } from '$lib/content';
	import { splitWords } from '$lib/text';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();
</script>

<section class="cta" id="contact">
	<p class="mono label">(08) {c.contact.kicker}</p>
	<h2 class="cta-title" data-split>{@html splitWords(c.contact.title, lang, { dimRest: false })}</h2>
	<p class="cta-lede" data-reveal>{c.contact.lede}</p>

	<a class="btn-xl magnetic" id="ctaBtn" href="mailto:{EMAIL}" data-strength=".45" data-cursor={c.cursor.write}
		><span class="m-in" id="ctaLabel">{c.contact.cta}</span></a
	>
	<p class="cta-note mono"><a href="mailto:{EMAIL}">{EMAIL}</a></p>

	<p class="cta-avail" data-reveal>
		<span class="beacon"></span><strong>{c.contact.availability}</strong><span>{c.contact.overlap}</span>
	</p>
	<div class="cta-links" data-reveal style="--rd:.08s">
		<a href={GITHUB} target="_blank" rel="noopener noreferrer">{c.contact.githubLabel} ↗</a>
		<a href={BLOG} target="_blank" rel="noopener noreferrer">{c.contact.blogLabel} ↗</a>
		<a href="{base}/{c.contact.cvFile}" download>{c.contact.cvLabel} ↓ <small class="mono">{c.contact.cvNote}</small></a>
	</div>
</section>

<footer id="footer">
	<div class="foot-giant" id="footGiant" aria-hidden="true">{c.footer.giant}</div>
	<div class="foot-row mono">
		<span>{c.contact.footer}</span>
		<span>{c.footer.time} <b id="clock">--:--:--</b> · UTC+8</span>
		<a href="#top">{c.a11y.toTop} ↑</a>
	</div>
</footer>
