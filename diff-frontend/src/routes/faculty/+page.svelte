<script lang="ts">
	import { onMount } from 'svelte';
	import FacultyCard from '$lib/components/FacultyCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PageBand from '$lib/components/PageBand.svelte';

	let { data } = $props();

	type Sort = 'order' | 'name' | 'score' | 'citations';
	let query = $state('');
	// links such as /faculty?q=Marketing start with that search (read after load: pages are prerendered)
	onMount(() => {
		query = new URL(location.href).searchParams.get('q') ?? '';
	});
	let dept = $state<'all' | 'cs' | 'mgmt'>('all');
	let sort = $state<Sort>('order');

	const deptName = (id: string) => data.departments.find((d) => d.id === id)?.name ?? id;
	const count = (id: string) => data.faculty.filter((f) => f.department === id).length;
	const surname = (name: string) => name.split(/\s+/).at(-1) ?? name;

	const shown = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const list = data.faculty.filter(
			(f) =>
				(dept === 'all' || f.department === dept) &&
				(!q ||
					f.name.toLowerCase().includes(q) ||
					f.designation.toLowerCase().includes(q) ||
					f.specialization.some((s) => s.toLowerCase().includes(q)))
		);
		const by: Record<Sort, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
			order: (a, b) => a.department.localeCompare(b.department) || a.order - b.order,
			name: (a, b) => surname(a.name).localeCompare(surname(b.name)),
			score: (a, b) => b.total - a.total || b.citations - a.citations,
			citations: (a, b) => b.citations - a.citations
		};
		return list.sort(by[sort]);
	});
</script>

<svelte:head>
	<title>Faculty Directory | IIPS Research Portal</title>
</svelte:head>

<PageBand
	title="Faculty Directory"
	kicker="People"
	lead="{data.faculty.length} faculty members of IIPS, DAVV Indore."
	crumbs={[{ label: 'Faculty' }]}
/>

<section class="section tight">
	<div class="wrap">
		<form class="tools no-print" role="search" onsubmit={(e) => e.preventDefault()}>
			<label class="search">
				<span class="sr-only">Search by name or research area</span>
				<Icon name="search" size={18} />
				<input
					id="search"
					class="input"
					type="search"
					placeholder="Name or research area"
					bind:value={query}
				/>
			</label>
			<div class="seg" role="group" aria-label="Department">
				<button type="button" aria-pressed={dept === 'all'} onclick={() => (dept = 'all')}
					>All<span class="count">{data.faculty.length}</span></button
				>
				{#each data.departments as d (d.id)}
					<button type="button" aria-pressed={dept === d.id} onclick={() => (dept = d.id)}
						>{d.short}<span class="count">{count(d.id)}</span></button
					>
				{/each}
			</div>
			<label class="sort">
				<span>Sort</span>
				<select class="select" bind:value={sort}>
					<option value="order">IIPS order</option>
					<option value="name">Surname</option>
					<option value="score">Research score</option>
					<option value="citations">Citations</option>
				</select>
			</label>
		</form>

		<p class="result" aria-live="polite">
			Showing <strong>{shown.length}</strong> of {data.faculty.length}
		</p>

		{#if shown.length}
			<div class="cards">
				{#each shown as f (f.slug)}
					<FacultyCard {f} department={deptName(f.department)} />
				{/each}
			</div>
		{:else}
			<div class="card empty">
				<p>No faculty match "{query}".</p>
				<button class="btn btn-outline btn-small" type="button" onclick={() => (query = '')}
					>Clear search</button
				>
			</div>
		{/if}
	</div>
</section>

<style>
	.tight {
		padding-top: 28px;
	}
	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
		margin-bottom: 14px;
	}
	.search {
		position: relative;
		flex: 1 1 280px;
	}
	.search :global(svg) {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--muted);
	}
	.search input {
		width: 100%;
		padding-left: 38px;
	}
	.sort {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		font-size: 0.92rem;
	}
	.result {
		color: var(--text-2);
		font-size: 0.92rem;
		margin-bottom: 16px;
	}
	.cards {
		display: grid;
		gap: 20px;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	}
	.empty {
		text-align: center;
	}
</style>
