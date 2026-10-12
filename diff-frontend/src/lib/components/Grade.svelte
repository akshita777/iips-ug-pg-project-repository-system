<script lang="ts">
	/** Without a Scholar profile the numbers are incomplete, so no letter is shown. */
	let {
		grade,
		partial = false,
		size = 'md'
	}: { grade: string; partial?: boolean; size?: 'md' | 'lg' } = $props();
	const tone = $derived(
		partial
			? 'p'
			: grade.startsWith('A')
				? 'a'
				: grade.startsWith('B')
					? 'b'
					: grade === 'C'
						? 'c'
						: 'd'
	);
</script>

{#if partial}
	<span class="grade p {size}" title="No Google Scholar profile, so no grade is given">Partial</span
	>
{:else}
	<span class="grade {tone} {size}" title="Research grade {grade}"
		><span class="sr-only">Grade </span>{grade}</span
	>
{/if}

<style>
	.grade {
		display: inline-grid;
		place-items: center;
		min-width: 2.4em;
		height: 2.1em;
		padding: 0 6px;
		border-radius: 4px;
		font-weight: 800;
		font-size: 0.9rem;
		border: 1px solid;
	}
	.lg {
		font-size: 1.4rem;
	}
	.a {
		background: var(--good-soft);
		color: var(--good);
		border-color: #86efac;
	}
	.b {
		background: var(--blue-soft);
		color: var(--navy);
		border-color: #93c5fd;
	}
	.c {
		background: var(--warn-soft);
		color: var(--warn);
		border-color: var(--cream-line);
	}
	.p {
		background: #fff;
		color: var(--muted);
		border-color: var(--line-strong);
		border-style: dashed;
		font-weight: 600;
		font-size: 0.78rem;
	}
	.lg.p {
		font-size: 0.95rem;
	}
	.d {
		background: #f1f5f9;
		color: var(--text-2);
		border-color: var(--line-strong);
	}
</style>
