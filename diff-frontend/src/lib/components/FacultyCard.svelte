<script lang="ts">
	import { resolve } from '$app/paths';
	import type { FacultySummary } from '$lib/server/Portal';
	import Grade from './Grade.svelte';
	import Photo from './Photo.svelte';

	let { f, department }: { f: FacultySummary; department: string } = $props();
</script>

<article class="card fc">
	<a class="cover" href={resolve('/faculty/[slug]', { slug: f.slug })}>
		<span class="sr-only">Open profile of {f.name}</span>
	</a>
	<div class="pic">
		<Photo src={f.photo} name={f.name} initials={f.initials} width={150} />
	</div>
	<span class="kicker">{f.designation}</span>
	<h3>{f.name}</h3>
	<p class="dept">{department}</p>
	<dl class="stats">
		<div>
			<dt>Papers</dt>
			<dd class="num">{f.papers}</dd>
		</div>
		<div>
			<dt>Citations</dt>
			<dd class="num">{f.citations.toLocaleString('en-IN')}</dd>
		</div>
		<div>
			<dt>h-index</dt>
			<dd class="num">{f.h}</dd>
		</div>
	</dl>
	<div class="foot">
		<span class="score"
			><Grade grade={f.grade} partial={f.partial} /> <span class="num">{f.total}/100</span></span
		>
		<span class="src" class:off={f.source === 'iips'}
			>{f.source === 'scholar'
				? 'Scholar'
				: f.source === 'openalex'
					? 'OpenAlex'
					: 'IIPS only'}</span
		>
	</div>
</article>

<style>
	.fc {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 20px 18px 16px;
		transition: border-color 0.15s;
	}
	.fc:hover {
		border-color: var(--blue);
	}
	.cover {
		position: absolute;
		inset: 0;
		z-index: 1;
	}
	.cover:focus-visible {
		outline-offset: -3px;
	}
	.pic {
		width: 130px;
		margin-bottom: 14px;
	}
	.kicker {
		font-size: 0.72rem;
		margin-bottom: 4px;
	}
	h3 {
		margin: 0;
		font-size: 1.08rem;
	}
	.dept {
		color: var(--text-2);
		font-size: 0.9rem;
		margin: 2px 0 12px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: 100%;
		margin: 0 0 12px;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
	}
	.stats div {
		padding: 8px 4px;
	}
	.stats div + div {
		border-left: 1px solid var(--line);
	}
	dt {
		font-size: 0.72rem;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	dd {
		margin: 0;
		font-weight: 700;
		color: var(--navy);
	}
	.foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-top: auto;
		font-size: 0.88rem;
	}
	.score {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
	}
	.src {
		color: var(--good);
		font-weight: 600;
	}
	.src.off {
		color: var(--muted);
		font-weight: 500;
	}
</style>
