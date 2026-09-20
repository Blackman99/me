<script lang="ts">
	type Line = { kind: 'cmd' | 'tool' | 'out' | 'ok'; text: string };

	let { active = false }: { active?: boolean } = $props();

	const script: Line[] = [
		{ kind: 'cmd', text: '/ship add gzip paging to the path endpoint' },
		{ kind: 'tool', text: 'read  internal/path/handler.go' },
		{ kind: 'tool', text: 'edit  internal/path/handler.go  +84 -31' },
		{ kind: 'tool', text: 'bash  go test ./internal/path/...' },
		{ kind: 'out', text: 'ok   internal/path   1.284s' },
		{ kind: 'ok', text: 'verified · 1 file changed · ready to push' }
	];

	const reduced =
		typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

	let shown = $state(reduced ? script.length : 0);
	let typed = $state(reduced ? script[0].text.length : 0);

	$effect(() => {
		if (!active || reduced || shown >= script.length) return;

		const line = script[shown];
		const isCmd = line.kind === 'cmd';

		// The command is typed out character by character; everything the agent
		// prints back appears whole, the way a real terminal behaves.
		if (isCmd && typed < line.text.length) {
			const t = setTimeout(() => (typed += 1), 21);
			return () => clearTimeout(t);
		}

		const t = setTimeout(
			() => {
				shown += 1;
				typed = 0;
			},
			isCmd ? 380 : 300
		);
		return () => clearTimeout(t);
	});

	const visible = $derived(script.slice(0, shown + (shown < script.length ? 1 : 0)));
</script>

<div class="term" aria-hidden="true">
	<div class="chrome">
		<span class="dot"></span><span class="dot"></span><span class="dot"></span>
		<span class="name">codsh</span>
	</div>
	<pre>{#each visible as line, i (i)}<span class="line {line.kind}"
				>{#if line.kind === 'cmd'}<span class="sigil">&gt;</span>{:else if line.kind === 'ok'}<span
						class="sigil ok">✓</span
					>{:else}<span class="sigil dim">·</span>{/if}<span class="text"
					>{i === shown && line.kind === 'cmd' ? line.text.slice(0, typed) : line.text}</span
				>{#if i === shown && active}<span class="caret"></span>{/if}</span
			>{/each}</pre>
</div>

<style>
	.term {
		background: var(--bg-soft);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		font-family: var(--mono);
		box-shadow: 0 24px 60px -30px rgb(0 0 0 / 0.9);
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 0.42rem;
		padding: 0.6rem 0.85rem;
		border-bottom: 1px solid var(--line-soft);
		background: var(--surface);
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--line);
	}

	.name {
		margin-left: 0.55rem;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		color: var(--fg-faint);
		text-transform: uppercase;
	}

	pre {
		margin: 0;
		padding: 1.05rem 1.1rem 1.35rem;
		font-size: clamp(0.72rem, 0.62rem + 0.35vw, 0.85rem);
		line-height: 1.95;
		min-height: 13.5rem;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.line {
		display: block;
	}

	.sigil {
		display: inline-block;
		width: 1.25em;
		color: var(--accent);
	}

	.sigil.dim {
		color: var(--fg-faint);
	}

	.sigil.ok {
		color: var(--data);
	}

	.cmd .text {
		color: var(--fg);
	}

	.tool .text {
		color: var(--fg-dim);
	}

	.out .text {
		color: var(--data-dim);
	}

	.ok .text {
		color: var(--data);
	}

	.caret {
		display: inline-block;
		width: 0.55em;
		height: 1.05em;
		margin-left: 2px;
		vertical-align: text-bottom;
		background: var(--accent);
		animation: blink 1.05s steps(2, start) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.caret {
			display: none;
		}
	}
</style>
