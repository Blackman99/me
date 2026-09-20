<script lang="ts">
	import type { Snippet } from 'svelte';
	import { reveal } from '$lib/reveal';

	let {
		id,
		kicker,
		title,
		lede,
		children,
		aside
	}: {
		id: string;
		kicker: string;
		title: string;
		lede?: string;
		children: Snippet<[boolean]>;
		aside?: Snippet<[boolean]>;
	} = $props();

	let active = $state(false);
	let el: HTMLElement;

	$effect(() => {
		if (typeof IntersectionObserver === 'undefined') {
			active = true;
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					active = true;
					io.disconnect();
				}
			},
			{ threshold: 0.25 }
		);
		io.observe(el);
		return () => io.disconnect();
	});
</script>

<section class="section" {id} bind:this={el}>
	<div class="shell" class:split={!!aside}>
		<div class="lead">
			<p class="kicker" use:reveal data-reveal="left">{kicker}</p>
			<h2 class="section-title" use:reveal data-reveal style="--i:1">{title}</h2>
			{#if lede}
				<p class="lede" use:reveal data-reveal style="--i:2">{lede}</p>
			{/if}
			{@render children(active)}
		</div>
		{#if aside}
			<div class="aside" use:reveal data-reveal="scale">
				{@render aside(active)}
			</div>
		{/if}
	</div>
</section>

<style>
	.shell.split {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
		gap: clamp(2rem, 5vw, 4.5rem);
		align-items: center;
	}

	.lead {
		min-width: 0;
	}

	.aside {
		min-width: 0;
	}

	@media (max-width: 62rem) {
		.shell.split {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
	}
</style>
