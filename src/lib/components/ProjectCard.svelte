<script lang="ts">
	import type { Project } from '$lib/content';

	let { project, index = 0, cursor }: { project: Project; index?: number; cursor: string } = $props();
</script>

<article class="card proj" class:featured={project.featured} data-reveal style="--rd:{index * 0.08}s">
	<div class="p-title">
		<h3>
			<a href={project.href} target="_blank" rel="noopener noreferrer" data-cursor={cursor}>{project.name}</a>
		</h3>
		{#if project.stars}<span class="stars mono" title="{project.stars} stars on GitHub">★ {project.stars}</span>{/if}
	</div>

	{#if project.featured && project.tagline}
		<p class="tagline">{project.tagline}</p>
	{/if}

	<p>{project.blurb}</p>

	{#if project.featured && project.highlights?.length}
		<ul class="chips">
			{#each project.highlights as h (h)}
				<li>{h}</li>
			{/each}
		</ul>
	{/if}

	<div class="p-meta mono">
		<span>{project.role} · {project.tech}</span>
		{#if project.links?.length}
			<span class="p-links">
				{#each project.links as l (l.href)}
					<a href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
				{/each}
			</span>
		{/if}
	</div>
</article>
