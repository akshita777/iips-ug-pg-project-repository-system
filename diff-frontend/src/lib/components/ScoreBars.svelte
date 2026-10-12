<script lang="ts">
	import type { ScorePart, ScorePillar } from '$lib/domain/scoring/ScoringPolicy';

	let { pillars }: { pillars: ScorePillar[] } = $props();

	const fmt = (p: ScorePart) =>
		p.metric === 'citations' ? p.value.toLocaleString('en-IN') : String(p.value);
</script>

<ul class="bars">
	{#each pillars as p (p.id)}
		<li>
			<div class="top">
				<span class="label">{p.label}</span>
				<span class="pts num"><strong>{p.points}</strong> / {p.max}</span>
			</div>
			<div class="track" aria-hidden="true">
				<div class="fill" style:width="{(p.points / p.max) * 100}%"></div>
			</div>
			<p class="parts">
				{#each p.parts as part, i (part.metric)}{#if i}<span class="dot" aria-hidden="true">·</span
						>{/if}{part.label}
					<strong>{fmt(part)}</strong>{/each}
			</p>
		</li>
	{/each}
</ul>

<style>
	.bars {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 14px;
	}
	.top {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 0.95rem;
		margin-bottom: 4px;
	}
	.label {
		font-weight: 650;
	}
	.pts {
		color: var(--text-2);
		white-space: nowrap;
	}
	.pts strong {
		color: var(--navy);
	}
	.track {
		height: 10px;
		background: #eef2f6;
		border-radius: 2px;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: var(--blue);
	}
	.parts {
		margin: 4px 0 0;
		font-size: 0.82rem;
		color: var(--muted);
	}
	.parts strong {
		color: var(--text-2);
	}
	.dot {
		margin: 0 6px;
	}
</style>
