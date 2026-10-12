<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import MatchBadge from '$lib/components/MatchBadge.svelte';
	import PageBand from '$lib/components/PageBand.svelte';
	import { openalexUrl, scholarSearchUrl, scholarUrl } from '$lib/domain/types';

	let { data } = $props();

	type Filter = 'all' | 'high' | 'check' | 'none';
	let filter = $state<Filter>('all');

	const kind = (r: (typeof data.rows)[0]): Exclude<Filter, 'all'> =>
		!r.confidence ? 'none' : r.confidence === 'high' ? 'high' : 'check';
	const count = (k: Exclude<Filter, 'all'>) => data.rows.filter((r) => kind(r) === k).length;
	const rows = $derived(data.rows.filter((r) => filter === 'all' || kind(r) === filter));
	const short = (id: string) => data.departments.find((d) => d.id === id)?.short ?? id;
	const toggle = (k: Filter) => (filter = filter === k ? 'all' : k);
</script>

<svelte:head>
	<title>Data Check | IIPS Research Portal</title>
</svelte:head>

<PageBand
	title="Data Check"
	kicker="Profile links"
	lead="Each link was chosen on evidence. Please report any that look wrong."
	crumbs={[{ label: 'Data Check' }]}
/>

<section class="section tight">
	<div class="wrap">
		<div class="tiles">
			<button
				type="button"
				class="tile good"
				aria-pressed={filter === 'high'}
				onclick={() => toggle('high')}
			>
				<Icon name="shield" size={26} />
				<span><strong class="num">{count('high')}</strong> Verified</span>
			</button>
			<button
				type="button"
				class="tile warn"
				aria-pressed={filter === 'check'}
				onclick={() => toggle('check')}
			>
				<Icon name="alert" size={26} />
				<span><strong class="num">{count('check')}</strong> Please check</span>
			</button>
			<button
				type="button"
				class="tile none"
				aria-pressed={filter === 'none'}
				onclick={() => toggle('none')}
			>
				<Icon name="help" size={26} />
				<span><strong class="num">{count('none')}</strong> Not found</span>
			</button>
		</div>

		<p class="small muted show">
			{#if filter === 'all'}Showing all {data.rows.length}. Click a box to filter.{:else}Showing
				{rows.length}.
				<button class="link" type="button" onclick={() => (filter = 'all')}>Show all</button>{/if}
		</p>

		<div class="table-wrap">
			<table class="data">
				<thead>
					<tr>
						<th>Faculty</th>
						<th>Google Scholar</th>
						<th class="hide-sm">OpenAlex</th>
						<th>Match</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as r (r.slug)}
						<tr>
							<td>
								<a href={resolve('/faculty/[slug]', { slug: r.slug })}><strong>{r.name}</strong></a>
								<span class="d small muted">{short(r.department)}</span>
							</td>
							<td>
								{#if r.scholar}
									<a href={scholarUrl(r.scholar.id)} rel="external"
										>{r.scholar.name} <Icon name="external" size={14} /></a
									>
									<span class="d small muted"
										>{r.scholar.affiliation || 'No affiliation given'}</span
									>
									<span class="d small muted">{r.scholar.counted} papers counted</span>
								{:else}
									<a href={scholarSearchUrl(r.name)} rel="external"
										>Search Google Scholar <Icon name="external" size={14} /></a
									>
									{#if r.rejected.length}
										<span class="d small muted"
											>Rejected: {r.rejected.map((c) => c.name).join(', ')}</span
										>
									{/if}
								{/if}
							</td>
							<td class="hide-sm">
								{#if r.openalex}
									<a href={openalexUrl(r.openalex.id)} rel="external"
										>{r.openalex.id} <Icon name="external" size={14} /></a
									>
									<span class="d small muted"
										>{r.openalex.counted} papers count{r.openalex.records > 1
											? `, ${r.openalex.records} records merged`
											: ''}</span
									>
								{:else}
									<span class="muted">-</span>
								{/if}
							</td>
							<td class="match">
								<MatchBadge confidence={r.confidence} />
								{#if r.scholar?.decidedBy === 'override'}<span class="d small muted"
										>Set by hand</span
									>{/if}
								{#if r.evidence.length}
									<details>
										<summary class="small">Why</summary>
										<ul>
											{#each r.evidence as e, i (i)}<li>{e}</li>{/each}
										</ul>
									</details>
								{/if}
								{#if r.note}<p class="warn small">{r.note}</p>{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="card fix">
			<h2 class="card-title">Fixing a link</h2>
			<ul class="small steps">
				<li>
					Wrong Scholar profile: put the right id (or <code>null</code>) in
					<code>scripts/data/overrides.json</code>.
				</li>
				<li>Found a profile yourself: add its id to <code>scripts/data/hints.json</code>.</li>
				<li>
					A paper is not theirs: add it to <code>scripts/data/exclusions.json</code> with a reason.
				</li>
			</ul>
			<p class="small muted">Then run the data steps again (see the README).</p>
		</div>
	</div>
</section>

<style>
	.tight {
		padding-top: 28px;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-bottom: 12px;
	}
	.tile {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px 18px;
		border: 1px solid var(--line);
		border-left-width: 4px;
		border-radius: var(--radius);
		background: #fff;
		font: inherit;
		text-align: left;
		cursor: pointer;
		box-shadow: var(--shadow);
	}
	.tile strong {
		display: block;
		font-size: 1.8rem;
		line-height: 1.1;
		color: var(--navy);
	}
	.tile[aria-pressed='true'] {
		outline: 2px solid var(--navy);
	}
	.good {
		border-left-color: var(--good);
		color: var(--good);
	}
	.warn {
		border-left-color: var(--amber);
		color: var(--warn);
	}
	.none {
		border-left-color: var(--line-strong);
		color: var(--text-2);
	}
	.show {
		margin-bottom: 14px;
	}
	.link {
		background: none;
		border: 0;
		padding: 0;
		color: var(--blue);
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
	}
	.d {
		display: block;
	}
	.match {
		min-width: 150px;
	}
	details {
		margin-top: 6px;
	}
	summary {
		cursor: pointer;
		color: var(--blue);
		font-weight: 600;
	}
	details ul {
		margin: 6px 0 0;
		padding-left: 18px;
		font-size: 0.86rem;
		color: var(--text-2);
		max-width: 360px;
	}
	p.warn {
		margin: 6px 0 0;
		color: var(--warn);
		border: 0;
	}
	.fix {
		margin-top: 28px;
	}
	.steps {
		margin: 0 0 8px;
		padding-left: 20px;
		display: grid;
		gap: 6px;
	}
	@media (max-width: 700px) {
		.hide-sm {
			display: none;
		}
		.tiles {
			grid-template-columns: 1fr;
		}
	}
</style>
