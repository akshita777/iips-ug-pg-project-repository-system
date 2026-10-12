<script lang="ts">
	import { resolve } from '$app/paths';
	import Grade from '$lib/components/Grade.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import MatchBadge from '$lib/components/MatchBadge.svelte';
	import PageBand from '$lib/components/PageBand.svelte';
	import Photo from '$lib/components/Photo.svelte';
	import Radar from '$lib/components/Radar.svelte';
	import ScoreBars from '$lib/components/ScoreBars.svelte';
	import YearBars from '$lib/components/YearBars.svelte';
	import {
		FLAG_LABELS,
		IIPS_PROFILE_URL,
		PUB_TYPES,
		PUB_TYPE_LABELS,
		SOURCE_LABELS,
		openalexUrl,
		scholarSearchUrl,
		scholarUrl,
		type PubType
	} from '$lib/domain/types';
	import { n } from '$lib/format';

	let { data } = $props();
	const f = $derived(data.faculty);
	const s = $derived(f.scholar);
	const oa = $derived(f.openalex);

	const types = $derived(PUB_TYPES.filter((t) => data.papers.some((p) => p.type === t)));
	let type = $state<PubType | 'all'>('all');
	let showAll = $state(false);
	const LIMIT = 15;
	const list = $derived(
		data.papers
			.filter((p) => type === 'all' || p.type === type)
			.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.citations - a.citations)
	);
	const visible = $derived(showAll ? list : list.slice(0, LIMIT));

	const phdLabel = { awarded: 'Awarded', submitted: 'Thesis submitted', ongoing: 'Ongoing' };
	const chart = $derived(s ? s.citesPerYear.filter((c) => c.year >= data.year - 14) : []);
	const recent = $derived(Object.values(data.facts.recentByType).reduce((a, b) => a + b, 0));
	const differs = $derived(
		data.source === 'scholar' && s && s.reported.citations !== data.facts.citations
	);
</script>

<svelte:head>
	<title>{f.name} | IIPS Research Portal</title>
	<meta
		name="description"
		content="{f.name}, {f.designation}, {data.department
			.name}, IIPS DAVV Indore. Publications, citations and research score."
	/>
</svelte:head>

<PageBand
	title={f.name}
	kicker="{f.designation}, {data.department.name}"
	crumbs={[{ label: 'Faculty', href: resolve('/faculty') }, { label: f.name }]}
/>

<section class="section tight">
	<div class="wrap top">
		<!-- identity -->
		<div class="card id">
			<div class="pic">
				<Photo src={f.photo} name={f.name} initials={data.initials} width={200} eager />
			</div>
			<div class="id-text">
				<table class="facts">
					<tbody>
						<tr><th scope="row">Qualification</th><td>{f.qualification || '-'}</td></tr>
						<tr><th scope="row">Designation</th><td>{f.designation}</td></tr>
						<tr><th scope="row">Department</th><td>{data.department.name}</td></tr>
						{#if f.teachingExperience}
							<tr><th scope="row">Teaching</th><td>{f.teachingExperience}</td></tr>
						{/if}
						{#if f.industryExperience}
							<tr><th scope="row">Industry</th><td>{f.industryExperience}</td></tr>
						{/if}
						{#if f.emails.length}
							<tr>
								<th scope="row">Email</th>
								<td>
									{#each f.emails as e, i (e)}{#if i},
										{/if}<a href="mailto:{e}">{e}</a>{/each}
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
				{#if f.specialization.length}
					<ul class="chips spec" aria-label="Specialization">
						{#each f.specialization as sp (sp)}<li class="chip">{sp}</li>{/each}
					</ul>
				{/if}
				<div class="links no-print">
					{#if s}
						<a class="btn" href={scholarUrl(s.id)} rel="external"
							><Icon name="cap" size={18} /> Google Scholar <Icon name="external" size={15} /></a
						>
					{:else}
						<a class="btn btn-outline" href={scholarSearchUrl(f.name)} rel="external"
							><Icon name="search" size={17} /> Search Scholar</a
						>
					{/if}
					{#if oa}
						<a class="btn btn-outline" href={openalexUrl(oa.ids[0])} rel="external"
							>OpenAlex <Icon name="external" size={15} /></a
						>
					{/if}
					{#if oa?.orcid}
						<a class="btn btn-outline" href={oa.orcid} rel="external"
							>ORCID <Icon name="external" size={15} /></a
						>
					{/if}
					<a class="btn btn-outline" href={IIPS_PROFILE_URL} rel="external"
						>IIPS profile <Icon name="external" size={15} /></a
					>
				</div>
			</div>
		</div>

		<!-- score -->
		<aside class="card score" aria-labelledby="score-h">
			<h2 id="score-h" class="card-title">Research Index</h2>
			<div class="big">
				<span class="total num"><strong>{data.sheet.total}</strong>/{data.sheet.max}</span>
				<Grade grade={data.sheet.grade} partial={data.sheet.partial} size="lg" />
			</div>
			{#if data.percentile !== null}
				<p class="rank small">
					Rank <strong>{data.rank}</strong> of {data.graded} graded · higher than
					<strong>{data.percentile}%</strong> of IIPS faculty
				</p>
				<Radar
					labels={data.sheet.pillars.map((p) => p.label)}
					values={data.sheet.pillars.map((p) => p.points)}
					compare={data.medians}
				/>
			{:else}
				<p class="note small">
					<Icon name="alert" size={16} /> No research profile found: papers are from the IIPS site, citations
					unknown, so no grade is given.
				</p>
			{/if}
			<div class="bars"><ScoreBars pillars={data.sheet.pillars} /></div>
			<a class="how small" href={resolve('/method')}>How this is worked out</a>
		</aside>
	</div>
</section>

<!-- figures -->
<section class="section band slim">
	<div class="wrap">
		<dl class="tiles">
			<div>
				<dt>Papers counted</dt>
				<dd class="num">{data.facts.papers}</dd>
			</div>
			<div>
				<dt>Citations</dt>
				<dd class="num">{n(data.facts.citations)}</dd>
			</div>
			<div>
				<dt>h-index</dt>
				<dd class="num">{data.facts.h}</dd>
			</div>
			<div>
				<dt>i10-index</dt>
				<dd class="num">{data.facts.i10}</dd>
			</div>
			<div>
				<dt>Last {data.recentYears} years</dt>
				<dd class="num">{recent}</dd>
			</div>
			<div>
				<dt>Patents</dt>
				<dd class="num">{data.facts.byType.patent}</dd>
			</div>
			<div>
				<dt>Ph.D. awarded</dt>
				<dd class="num">{data.facts.phdAwarded}</dd>
			</div>
			<div>
				<dt>Ph.D. ongoing</dt>
				<dd class="num">{data.facts.phdOngoing}</dd>
			</div>
		</dl>
		<p class="small muted reported">
			Source: {SOURCE_LABELS[data.source]}.
			{#if differs && s}
				Scholar itself shows {n(s.reported.citations)} citations and h-index {s.reported.h};
				{data.asideCount} entr{data.asideCount === 1 ? 'y is' : 'ies are'} not counted here (see below).
			{/if}
		</p>
	</div>
</section>

<div class="wrap body">
	{#if s && chart.length}
		<section class="block" aria-labelledby="cites-h">
			<h2 id="cites-h">Citations per Year</h2>
			<p class="small muted">As shown on Google Scholar.</p>
			<div class="card"><YearBars data={chart} label="Citations per year" /></div>
		</section>
	{/if}

	<section class="block" aria-labelledby="pubs-h">
		<h2 id="pubs-h">Publications</h2>
		{#if data.source !== 'iips'}
			{#if data.source === 'openalex'}
				<p class="small muted">From OpenAlex (no Google Scholar profile found).</p>
			{/if}
			<div class="seg no-print" role="group" aria-label="Type">
				<button
					type="button"
					aria-pressed={type === 'all'}
					onclick={() => ((type = 'all'), (showAll = false))}
					>All<span class="count">{data.papers.length}</span></button
				>
				{#each types as t (t)}
					<button
						type="button"
						aria-pressed={type === t}
						onclick={() => ((type = t), (showAll = false))}
						>{PUB_TYPE_LABELS[t]}<span class="count"
							>{data.papers.filter((p) => p.type === t).length}</span
						></button
					>
				{/each}
			</div>
			<ol class="pubs">
				{#each visible as p (p.key)}
					<li>
						<span class="y num">{p.year ?? '-'}</span>
						<div class="pt">
							<a href={p.url} rel="external">{p.title}</a>
							<p class="small">{p.authors}</p>
							<p class="small muted">
								<span class="type">{PUB_TYPE_LABELS[p.type]}</span>{p.venue ? ` · ${p.venue}` : ''}
							</p>
						</div>
						<span class="c num" title="Citations"
							>{p.citations}<span class="sr-only"> citations</span></span
						>
					</li>
				{/each}
			</ol>
			{#if list.length > LIMIT}
				<button
					class="btn btn-outline btn-small no-print"
					type="button"
					onclick={() => (showAll = !showAll)}
				>
					{showAll ? 'Show fewer' : `Show all ${list.length}`}
				</button>
			{/if}
			{#if data.asideCount}
				<details class="more">
					<summary>Not counted ({data.asideCount})</summary>
					<ul class="aside">
						{#each data.aside as p (p.key)}
							<li>
								<a href={p.url} rel="external">{p.title}</a>
								<span class="small muted">({p.year ?? 'no year'}, {p.citations} citations)</span>
								<span class="why small">{FLAG_LABELS[p.flag!]}{p.note ? `: ${p.note}` : ''}</span>
							</li>
						{/each}
					</ul>
					{#if data.asideCount > data.aside.length}
						<p class="small muted">
							And {data.asideCount - data.aside.length} more, mostly by namesakes in the same OpenAlex
							record.
						</p>
					{/if}
				</details>
			{/if}
		{:else if f.iipsPapers.length}
			<p class="small muted">
				From the IIPS website (no Google Scholar or OpenAlex profile found).
			</p>
			<ol class="iips">
				{#each f.iipsPapers as p, i (i)}
					<li>
						{#if p.link}<a href={p.link} rel="external">{p.text}</a>{:else}{p.text}{/if}
					</li>
				{/each}
			</ol>
		{:else}
			<p class="muted">No publications found on Google Scholar, OpenAlex or the IIPS website.</p>
		{/if}
	</section>

	{#if f.phd.length}
		<section class="block" aria-labelledby="phd-h">
			<h2 id="phd-h">Ph.D. Scholars</h2>
			<div class="table-wrap">
				<table class="data">
					<thead><tr><th>#</th><th>Scholar</th><th>Topic</th><th>Status</th></tr></thead>
					<tbody>
						{#each f.phd as p, i (i)}
							<tr>
								<td class="num">{i + 1}</td>
								<td class="nowrap">{p.name}</td>
								<td>{p.topic || '-'}</td>
								<td><span class="st {p.status}">{phdLabel[p.status]}</span></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	{#if f.responsibilities.length || f.memberships.length || f.projects.length}
		<section class="block grid grid-2" aria-label="Roles and projects">
			{#if f.responsibilities.length}
				<div class="card">
					<h2 class="card-title">Responsibilities</h2>
					<ul class="plain">
						{#each f.responsibilities as r, i (i)}<li>{r}</li>{/each}
					</ul>
				</div>
			{/if}
			{#if f.memberships.length}
				<div class="card">
					<h2 class="card-title">Memberships</h2>
					<ul class="plain">
						{#each f.memberships as r, i (i)}<li>{r}</li>{/each}
					</ul>
				</div>
			{/if}
			{#if f.projects.length}
				<div class="card">
					<h2 class="card-title">Projects</h2>
					<ul class="plain">
						{#each f.projects as p, i (i)}
							<li>
								{p.title}
								<span class="small muted">({p.agency}{p.status ? `, ${p.status}` : ''})</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	{/if}

	{#if data.source !== 'iips' && f.iipsPapers.length}
		<section class="block">
			<details class="more">
				<summary>Papers listed on the IIPS website ({f.iipsPapers.length})</summary>
				<ol class="iips">
					{#each f.iipsPapers as p, i (i)}
						<li>
							{#if p.link}<a href={p.link} rel="external">{p.text}</a>{:else}{p.text}{/if}
						</li>
					{/each}
				</ol>
			</details>
		</section>
	{/if}

	<section class="block" aria-labelledby="check-h">
		<h2 id="check-h">Are these the right profiles?</h2>
		<div class="grid grid-2">
			<div class="card check">
				<h3 class="card-title">Google Scholar</h3>
				{#if s}
					<p class="check-top">
						<MatchBadge confidence={s.match.confidence} />
						<a href={scholarUrl(s.id)} rel="external">{s.name}</a>
						<span class="muted small">{s.affiliation}</span>
					</p>
					<ul class="evidence">
						{#each s.match.evidence as e, i (i)}
							<li><Icon name="check" size={16} /> {e}</li>
						{/each}
					</ul>
					{#if s.match.note}<p class="small warn">
							<Icon name="alert" size={15} />
							{s.match.note}
						</p>{/if}
				{:else}
					<p class="check-top">
						<MatchBadge confidence={null} />
						<a href={scholarSearchUrl(f.name)} rel="external">Search Google Scholar</a>
					</p>
					{#if f.scholarSearch.candidates.length}
						<p class="small muted">Looked at and rejected:</p>
						<ul class="plain small">
							{#each f.scholarSearch.candidates as c (c.id)}
								<li><a href={scholarUrl(c.id)} rel="external">{c.name}</a>, {c.affiliation}</li>
							{/each}
						</ul>
					{/if}
				{/if}
			</div>
			<div class="card check">
				<h3 class="card-title">OpenAlex</h3>
				{#if oa}
					<p class="check-top">
						<MatchBadge confidence={oa.match.confidence} />
						<a href={openalexUrl(oa.ids[0])} rel="external">{oa.name}</a>
					</p>
					<ul class="evidence">
						{#each oa.match.evidence as e, i (i)}
							<li><Icon name="check" size={16} /> {e}</li>
						{/each}
					</ul>
					{#if oa.match.note}<p class="small muted">{oa.match.note}</p>{/if}
				{:else}
					<p class="check-top"><MatchBadge confidence={null} /> No matching OpenAlex record.</p>
				{/if}
			</div>
		</div>
		<p class="small muted fix">
			Wrong or missing? See <a href={resolve('/data-check')}>Data Check</a>.
		</p>
	</section>
</div>

<style>
	.tight {
		padding-top: 28px;
		padding-bottom: 28px;
	}
	.top {
		display: grid;
		grid-template-columns: 1fr 360px;
		gap: 24px;
		align-items: start;
	}
	.id {
		display: flex;
		gap: 24px;
	}
	.pic {
		width: 190px;
		flex: none;
	}
	.id-text {
		flex: 1;
		min-width: 0;
	}
	.facts {
		border-collapse: collapse;
		width: 100%;
		font-size: 0.97rem;
		margin-bottom: 14px;
	}
	.facts th,
	.facts td {
		text-align: left;
		vertical-align: top;
		padding: 7px 0;
		border-bottom: 1px solid var(--line);
	}
	.facts th {
		width: 130px;
		color: var(--muted);
		font-weight: 600;
		padding-right: 12px;
	}
	.facts td a {
		word-break: break-all;
	}
	.spec {
		margin-bottom: 16px;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.big {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.total {
		font-size: 1.2rem;
		color: var(--text-2);
	}
	.total strong {
		font-size: 2.8rem;
		color: var(--navy);
		line-height: 1;
	}
	.rank {
		margin: 6px 0 12px;
		color: var(--text-2);
	}
	.bars {
		margin-top: 18px;
		padding-top: 16px;
		border-top: 1px solid var(--line);
	}
	.check .card-title {
		font-size: 1rem;
	}
	.note,
	.warn {
		display: flex;
		gap: 6px;
		color: var(--warn);
		margin: 14px 0 0;
	}
	.note :global(svg),
	.warn :global(svg) {
		margin-top: 3px;
	}
	.how {
		display: inline-block;
		margin-top: 14px;
		font-weight: 600;
	}

	.slim {
		padding: 24px 0;
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		gap: 16px;
		margin: 0;
	}
	.tiles div {
		display: flex;
		flex-direction: column-reverse;
		padding-left: 12px;
		border-left: 2px solid var(--blue);
	}
	.tiles dd {
		margin: 0;
		font-size: 1.8rem;
		font-weight: 800;
		color: var(--navy);
		line-height: 1.15;
	}
	.tiles dt {
		font-size: 0.74rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-2);
	}
	.reported {
		margin: 14px 0 0;
	}

	.body {
		padding-top: 12px;
		padding-bottom: 56px;
	}
	.block {
		margin-top: 40px;
	}

	.pubs {
		list-style: none;
		margin: 16px 0;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: #fff;
	}
	.pubs li {
		display: grid;
		grid-template-columns: 52px 1fr auto;
		gap: 14px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--line);
	}
	.pubs li:last-child {
		border-bottom: 0;
	}
	.y {
		font-weight: 800;
		color: var(--blue);
	}
	.pt a {
		font-weight: 600;
	}
	.pt p {
		margin: 3px 0 0;
		color: var(--text-2);
		overflow-wrap: anywhere;
	}
	.type {
		font-weight: 600;
		color: var(--navy);
	}
	.c {
		font-weight: 700;
		color: var(--navy);
		min-width: 3ch;
		text-align: right;
	}
	.aside,
	.iips {
		margin: 8px 0 0;
		padding-left: 22px;
		display: grid;
		gap: 10px;
		font-size: 0.95rem;
	}
	.iips {
		overflow-wrap: anywhere;
	}
	.why {
		display: block;
		color: var(--warn);
	}

	.nowrap {
		white-space: nowrap;
	}
	.st {
		display: inline-block;
		padding: 1px 9px;
		border-radius: 999px;
		font-size: 0.82rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.st.awarded {
		background: var(--good-soft);
		color: var(--good);
	}
	.st.submitted {
		background: var(--blue-soft);
		color: var(--navy);
	}
	.st.ongoing {
		background: #f1f5f9;
		color: var(--text-2);
	}

	.plain {
		margin: 0;
		padding-left: 20px;
		display: grid;
		gap: 6px;
		font-size: 0.95rem;
	}

	.check-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}
	.check-top a {
		font-weight: 700;
	}
	.evidence {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 6px;
		font-size: 0.95rem;
	}
	.evidence li {
		display: flex;
		gap: 8px;
	}
	.evidence :global(svg) {
		color: var(--good);
		margin-top: 4px;
	}
	.fix {
		margin: 14px 0 0;
	}

	@media (max-width: 960px) {
		.top {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 620px) {
		.id {
			flex-direction: column;
			align-items: center;
		}
		.pic {
			width: 170px;
		}
		.facts th {
			width: 104px;
		}
		.pubs li {
			grid-template-columns: 44px 1fr;
		}
		.c {
			grid-column: 2;
			text-align: left;
		}
		.c::after {
			content: ' citations' / '';
			font-weight: 400;
			color: var(--muted);
		}
	}
</style>
