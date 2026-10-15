<script lang="ts">
	import { BLOG, EMAIL, GITHUB, SITE_URL, SVELTEPRESS, content, type Lang } from '$lib/content';
	import { mountFx } from '$lib/fx';
	import { odometer } from '$lib/text';
	import Agents from './Agents.svelte';
	import Contact from './Contact.svelte';
	import Domains from './Domains.svelte';
	import Hero from './Hero.svelte';
	import Nav from './Nav.svelte';
	import OpenSource from './OpenSource.svelte';
	import Playground from './Playground.svelte';
	import Production from './Production.svelte';
	import Story from './Story.svelte';

	let { lang }: { lang: Lang } = $props();
	const c = $derived(content[lang]);
	const canonical = $derived(lang === 'en' ? `${SITE_URL}/` : `${SITE_URL}/zh/`);
	const ogImage = $derived(`${SITE_URL}/${c.meta.ogImage}`);

	/**
	 * Structured data. A personal site is exactly what schema.org's Person type
	 * is for, and it is the one thing here that search engines read as fact
	 * rather than inferring from prose.
	 */
	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'ProfilePage',
					'@id': `${canonical}#page`,
					url: canonical,
					name: c.meta.title,
					inLanguage: c.locale,
					primaryImageOfPage: ogImage,
					mainEntity: { '@id': `${SITE_URL}/#person` }
				},
				{
					'@type': 'Person',
					'@id': `${SITE_URL}/#person`,
					name: content.en.hero.name,
					alternateName: content.zh.hero.name,
					jobTitle: lang === 'en' ? 'AI Full-Stack Engineer' : 'AI 全栈工程师',
					description: c.meta.description,
					url: `${SITE_URL}/`,
					image: ogImage,
					email: `mailto:${EMAIL}`,
					address: {
						'@type': 'PostalAddress',
						addressLocality: lang === 'en' ? 'Hefei' : '合肥',
						addressCountry: 'CN'
					},
					knowsLanguage: ['zh-CN', 'en'],
					knowsAbout: [
						'Large language model applications',
						'AI agents',
						'TypeScript',
						'Go',
						'Svelte',
						'SvelteKit',
						'React',
						'Next.js',
						'Vue',
						'Web performance'
					],
					alumniOf: {
						'@type': 'CollegeOrUniversity',
						name: lang === 'en' ? 'West Anhui University' : '皖西学院'
					},
					sameAs: [GITHUB, BLOG, SVELTEPRESS, 'https://github.com/SveltePress/sveltepress']
				}
			]
		}).replace(/</g, '\\u003c')
	);

	// The prerendered HTML already carries the right `lang`; this keeps it
	// correct after a client-side hop between /en and /zh.
	$effect(() => {
		document.documentElement.lang = c.locale;
	});

	$effect(() => {
		return mountFx({
			motion: { on: c.play.page.motion.on, off: c.play.page.motion.off },
			cta: { idle: c.contact.cta, sent: c.contact.sent }
		});
	});
</script>

<svelte:head>
	<title>{c.meta.title}</title>
	<meta name="description" content={c.meta.description} />
	<meta name="author" content={content.en.hero.name} />
	<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />

	<link rel="canonical" href={canonical} />
	<link rel="alternate" hreflang="en" href="{SITE_URL}/" />
	<link rel="alternate" hreflang="zh-Hans" href="{SITE_URL}/zh/" />
	<link rel="alternate" hreflang="x-default" href="{SITE_URL}/" />

	<meta property="og:site_name" content={content.en.hero.name} />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content={c.meta.title} />
	<meta property="og:description" content={c.meta.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={lang === 'en' ? 'en_US' : 'zh_CN'} />
	<meta property="og:locale:alternate" content={lang === 'en' ? 'zh_CN' : 'en_US'} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:secure_url" content={ogImage} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={c.meta.ogAlt} />
	<meta property="profile:first_name" content="Dongsheng" />
	<meta property="profile:last_name" content="Zhao" />
	<meta property="profile:username" content="Blackman99" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={c.meta.title} />
	<meta name="twitter:description" content={c.meta.description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={c.meta.ogAlt} />

	{@html `<script type="application/ld+json">${jsonLd}</scr` + `ipt>`}
</svelte:head>

<div class="grain" aria-hidden="true"></div>
<div class="progress" id="progress" aria-hidden="true"></div>
<div class="cursor" id="cursor" aria-hidden="true">
	<div class="c-ring" id="cRing"><span class="c-label" id="cLabel"></span></div>
	<div class="c-dot" id="cDot"></div>
</div>
<canvas id="confetti" aria-hidden="true"></canvas>

<Nav {c} {lang} />

<main>
	<Hero {c} {lang} />
	<Story {c} {lang} />
	<Production {c} {lang} />
	<Agents {c} {lang} />
	<OpenSource {c} {lang} />

	<section class="stats" id="stats" aria-label={c.stats.label}>
		{#each c.hero.stats as s, i (s.label)}
			<div class="stat" data-reveal style="--rd:{i * 0.08}s">
				<div class="odo" role="img" aria-label={s.value}>{@html odometer(s.value)}</div>
				<p>{s.label}</p>
			</div>
		{/each}
	</section>

	<Playground {c} {lang} />
	<Domains {c} {lang} />
	<Contact {c} {lang} />
</main>
