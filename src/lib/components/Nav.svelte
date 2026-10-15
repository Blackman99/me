<script lang="ts">
	import { base } from '$app/paths';
	import type { Lang, SiteContent } from '$lib/content';
	import { GITHUB } from '$lib/content';

	let { c, lang }: { c: SiteContent; lang: Lang } = $props();

	const sections = $derived([
		{ id: 'production', label: c.nav.work },
		{ id: 'agents', label: c.nav.ai },
		{ id: 'oss', label: c.nav.oss },
		{ id: 'play', label: c.nav.play },
		{ id: 'domains', label: c.nav.domains },
		{ id: 'contact', label: c.nav.contact }
	]);

	const other = $derived(lang === 'en' ? `${base}/zh/` : `${base}/`);
</script>

<header class="nav" id="nav">
	<a class="logo" href="#top" aria-label={c.a11y.toTop}>
		<span class="mark" aria-hidden="true">DZ</span>
		<span class="logo-name">{c.hero.name}</span>
	</a>

	<nav class="links" id="links" aria-label={c.a11y.sectionNav}>
		<span class="pill" id="pill"></span>
		{#each sections as s (s.id)}
			<a href="#{s.id}"><span class="lbl">{s.label}</span></a>
		{/each}
	</nav>

	<div class="nav-r">
		<button class="hue-btn" id="hueBtn" type="button" aria-label={c.a11y.palette} data-cursor={c.cursor.hue}
			><span></span></button
		>
		<a class="icon-btn" href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.9 3.17 9.05 7.57 10.52.55.1.76-.24.76-.53v-1.9c-3.08.67-3.73-1.48-3.73-1.48-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.67.08-.67 1.11.08 1.7 1.15 1.7 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.11-.28-.5-1.41.11-2.94 0 0 .93-.3 3.05 1.14a10.5 10.5 0 0 1 5.56 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.07 5.47.4.35.76 1.03.76 2.08v3.08c0 .3.2.64.77.53 4.39-1.47 7.56-5.62 7.56-10.52C23.1 5.33 18.27.5 12 .5Z"
				/>
			</svg>
		</a>
		<a class="lang" href={other} aria-label={c.a11y.langToggle} data-sveltekit-preload-data="tap">
			<span class:on={lang === 'en'}>EN</span><span>/</span><span class:on={lang === 'zh'}>中文</span>
		</a>
		<a class="btn-sm magnetic" href="{base}/{c.contact.cvFile}" download
			><span class="m-in">{c.nav.cv} ↓</span></a
		>
	</div>
</header>
