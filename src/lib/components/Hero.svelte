<script lang="ts">
	import type { Lang, SiteContent } from '$lib/content';
	import { EMAIL } from '$lib/content';
	import { PALETTES } from '$lib/fx/shaders';
	import { plain, splitChars } from '$lib/text';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();
</script>

<section class="hero" id="top">
	<canvas id="gl" aria-hidden="true"></canvas>
	<div class="scrim" aria-hidden="true"></div>
	<div class="hud mono" aria-hidden="true">
		<div>{c.hero.hud.fps} <b id="fps">--</b></div>
		<div>{c.hero.hud.scale} <b id="res">--</b></div>
		<div>{c.hero.hud.gpu} <b id="gpu">--</b></div>
		<div>{c.hero.hud.palette} <b id="palName">{PALETTES[0].name}</b></div>
	</div>

	<p class="eyebrow mono" data-in style="--d:.35s"><span class="dot"></span>{c.hero.eyebrow}</p>
	<h1 class="hero-title" id="heroTitle" aria-label={plain(c.hero.headline)}>
		{@html splitChars(c.hero.headline, lang)}
	</h1>

	<div class="hero-bottom" id="heroBottom">
		<div class="hero-copy" data-in style="--d:.9s">
			<p class="hero-role mono">{c.hero.title}</p>
			<p class="hero-sub">{c.hero.sub}</p>
			<p class="hero-avail">
				<span class="beacon"></span><strong>{c.hero.availability}</strong><span class="place">{c.hero.place}</span>
			</p>
			<p class="hero-hint mono">{c.hero.hint}</p>
		</div>
		<div class="hero-ctas" data-in style="--d:1.05s">
			<a class="btn primary magnetic" href="#production"
				><span class="m-in"
					>{c.hero.ctaPrimary}
					<svg class="arr" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"
						><path d="M3 8h10M9 4l4 4-4 4" /></svg
					></span
				></a
			>
			<a class="btn ghost magnetic" href="mailto:{EMAIL}"><span class="m-in">{c.hero.ctaSecondary}</span></a>
		</div>
	</div>
</section>
