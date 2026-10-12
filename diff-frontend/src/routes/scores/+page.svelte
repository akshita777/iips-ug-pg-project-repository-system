<script lang="ts">
	import { resolve } from '$app/paths';
	import Grade from '$lib/components/Grade.svelte';
	import PageBand from '$lib/components/PageBand.svelte';
	import Photo from '$lib/components/Photo.svelte';
	import { n } from '$lib/format';

	let { data } = $props();
	let dept = $state<'all' | 'cs' | 'mgmt'>('all');

	const rows = $derived(data.ranked.filter((f) => dept === 'all' || f.department === dept));
	const most = $derived(Math.max(1, ...data.grades.map((g) => g.count)));
	const short = (id: string) => data.departments.find((d) => d.id === id)?.short ?? id;
</script>

<svelte:head>
	<title>Research Scores | IIPS Research Portal</title>
</svelte:head>

<PageBand
	title="Research Scores"
	kicker="Scores out of 100"
	lead="Ranked by score. Click a name for the full breakdown."
	crumbs={[{ label: 'Research Scores' }]}
/>

<section class="section tight">
	<div class="wrap">
		<div class="summary">
			<div class="card">
				<h2 class="card-title">Grades</h2>
				<ul class="dist">
					{#each data.grades as g (g.grade)}
						<li>
							<Grade grade={g.grade} />
							<span class="track" aria-hidden="true"
								><span class="fill" style:width="{(g.count / most) * 100}%"></span></span
							>
							<span class="num cnt">{g.count}</span>
							<span class="sr-only">faculty</span>
						</li>
					{/each}
				</ul>
				{#if data.partial}
					<p class="small muted partial">
						<Grade grade="" partial />
						{data.partial} without a research profile, not graded.
					</p>
				{/if}
			</div>
			{#each data.departments as d (d.id)}
				<div class="card dept">
					<h2 class="card-title">{d.name}</h2>
					<p class="avg num"><strong>{d.average}</strong> / 100</p>
					<p class="small muted">Average of {d.count} graded faculty</p>
				</div>
			{/each}
		</div>

		<div class="seg no-print" role="group" aria-label="Department">
			<button type="button" aria-pressed={dept === 'all'} onclick={() => (dept = 'all')}>All</button
			>
			{#each data.departments as d (d.id)}
				<button type="button" aria-pressed={dept === d.id} onclick={() => (dept = d.id)}
					>{d.short}</button
				>
			{/each}
		</div>

		<div class="table-wrap">
			<table class="data scores">
				<thead>
					<tr>
						<th class="n">#</th>
						<th>Faculty</th>
						<th class="hide-sm">Dept.</th>
						{#each data.pillars as c (c.id)}
							<th class="n hide-md"
								><abbr title="{c.label}: {c.about}, out of {c.max}">{c.label}</abbr></th
							>
						{/each}
						<th class="n">Score</th>
						<th>Grade</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as f, i (f.slug)}
						<tr>
							<td class="n">{dept === 'all' ? i + 1 : data.ranked.indexOf(f) + 1}</td>
							<td>
								<a class="who" href={resolve('/faculty/[slug]', { slug: f.slug })}>
									<span class="thumb"
										><Photo src={f.photo} name={f.name} initials={f.initials} width={40} /></span
									>
									<span>
										<strong>{f.name}</strong>
										<span class="small muted d"
											>{f.designation}{f.partial ? ', no research profile' : ''}</span
										>
									</span>
								</a>
							</td>
							<td class="hide-sm">{short(f.department)}</td>
							{#each f.points as p, j (j)}
								<td class="n hide-md">{Math.round(p)}</td>
							{/each}
							<td class="n nowrap">
								<span class="bar" aria-hidden="true"><span style:width="{f.total}%"></span></span>
								<strong>{f.total}</strong>
							</td>
							<td><Grade grade={f.grade} partial={f.partial} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="small muted foot">
			Citations total for everyone shown: {n(rows.reduce((s, f) => s + f.citations, 0))}.
			<a href={resolve('/method')}>How scores work</a>
		</p>
	</div>
</section>

<style>
	.tight {
		padding-top: 28px;
	}
	.summary {
		display: grid;
		grid-template-columns: 1.4fr 1fr 1fr;
		gap: 20px;
		margin-bottom: 28px;
	}
	.dist {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.dist li {
		display: grid;
		grid-template-columns: 48px 1fr 28px;
		align-items: center;
		gap: 10px;
	}
	.track {
		height: 12px;
		background: #eef2f6;
		border-radius: 2px;
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--blue);
	}
	.partial {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 14px 0 0;
	}
	.cnt {
		font-weight: 700;
		text-align: right;
	}
	.avg {
		font-size: 1.2rem;
		color: var(--text-2);
		margin: 6px 0 4px;
	}
	.avg strong {
		font-size: 2.6rem;
		color: var(--navy);
	}
	.seg {
		margin-bottom: 16px;
	}
	.who {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		color: inherit;
		min-width: 220px;
	}
	.who strong {
		color: var(--blue);
		display: block;
	}
	.who:hover strong {
		text-decoration: underline;
	}
	.thumb {
		width: 40px;
		flex: none;
	}
	.d {
		display: block;
	}
	.scores td {
		vertical-align: middle;
	}
	.nowrap {
		white-space: nowrap;
	}
	abbr {
		text-decoration: none;
	}
	.bar {
		display: inline-block;
		width: 70px;
		height: 8px;
		background: #eef2f6;
		border-radius: 2px;
		margin-right: 8px;
		vertical-align: middle;
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--blue);
	}
	.foot {
		margin-top: 12px;
	}
	@media (max-width: 1000px) {
		.hide-md {
			display: none;
		}
		.summary {
			grid-template-columns: 1fr 1fr;
		}
		.summary > :first-child {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 600px) {
		.hide-sm,
		.bar {
			display: none;
		}
		.summary {
			grid-template-columns: 1fr;
		}
	}
</style>
