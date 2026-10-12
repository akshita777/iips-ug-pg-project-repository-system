<script lang="ts">
	import { resolve } from '$app/paths';
	import Grade from '$lib/components/Grade.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import PageBand from '$lib/components/PageBand.svelte';
	import { curve } from '$lib/domain/scoring/IndexPolicy';
	import { FLAG_LABELS, PUB_TYPE_LABELS, type PubType } from '$lib/domain/types';
	import { n } from '$lib/format';

	let { data } = $props();
	const r = $derived(data.rules);
	const weights = $derived(
		(Object.entries(r.weights) as [PubType, number][]).sort((a, b) => b[1] - a[1])
	);
	const max = (p: (typeof r.pillars)[0]) => p.parts.reduce((s, x) => s + x.max, 0);

	// the curve every measure uses, drawn from the same function the score uses
	const W = 260;
	const H = 130;
	const path = Array.from({ length: 41 }, (_, i) => {
		const x = (i / 40) * 1.25;
		const y = curve(x, 1, 1);
		return `${i ? 'L' : 'M'}${(x / 1.25) * W},${H - y * H}`;
	}).join(' ');
	const quarter = { x: (0.25 / 1.25) * W, y: H - 0.5 * H };
	const full = { x: (1 / 1.25) * W, y: 0 };
</script>

<svelte:head>
	<title>How Scores Work | IIPS Research Portal</title>
</svelte:head>

<PageBand
	title="How Scores Work"
	kicker="IIPS Research Index"
	lead="Five pillars of 20 points. Every measure has a target that earns full points."
	crumbs={[{ label: 'How Scores Work' }]}
/>

<section class="section tight">
	<div class="wrap">
		<ol class="flow" aria-label="Steps">
			<li>
				<span class="k">1</span><strong>IIPS website</strong><span>Profile and Ph.D. scholars</span>
			</li>
			<li>
				<span class="k">2</span><strong>Scholar or OpenAlex</strong><span>Papers and citations</span
				>
			</li>
			<li><span class="k">3</span><strong>Clean</strong><span>Drop namesakes and repeats</span></li>
			<li><span class="k">4</span><strong>Score</strong><span>Five pillars, out of 100</span></li>
		</ol>

		<div class="grid curve-row">
			<div class="card">
				<h2 class="card-title">The curve</h2>
				<svg
					class="curve"
					viewBox="-56 -14 {W + 66} {H + 42}"
					role="img"
					aria-labelledby="curve-cap"
				>
					<line x1="0" y1={H} x2={W} y2={H} class="axis" />
					<line x1="0" y1="0" x2="0" y2={H} class="axis" />
					<path d={path} class="line" />
					<circle cx={quarter.x} cy={quarter.y} r="4" class="pt" />
					<circle cx={full.x} cy={full.y} r="4" class="pt" />
					<text x={quarter.x + 8} y={quarter.y + 4} class="lbl">¼ of target: half the points</text>
					<text x={full.x - 6} y={full.y - 4} class="lbl end">target: all points</text>
					<text x={W / 2} y={H + 26} class="axis-lbl">value</text>
					<text x="-8" y={H / 2} class="axis-lbl end">points</text>
				</svg>
				<p id="curve-cap" class="small muted">
					Early work counts most, so no one can win on volume alone and every paper still counts.
				</p>
			</div>
			<div class="card">
				<h2 class="card-title">Grades</h2>
				<ul class="grades">
					{#each r.grades as g, i (g.grade)}
						<li>
							<Grade grade={g.grade} />
							<span>{i === 0 ? `${g.min} or more` : `${g.min} to ${r.grades[i - 1].min - 1}`}</span>
						</li>
					{/each}
					<li><Grade grade="" partial /> <span>No research profile found</span></li>
				</ul>
			</div>
		</div>

		<h2 class="h">The five pillars</h2>
		<div class="grid pillars">
			{#each r.pillars as p (p.id)}
				<div class="card">
					<h3 class="card-title">{p.label} <span class="max">{max(p)} points</span></h3>
					<p class="small muted about">{p.about}</p>
					<table class="bands">
						<thead><tr><th>Measure</th><th class="n">Target</th><th class="n">Max</th></tr></thead>
						<tbody>
							{#each p.parts as part (part.metric)}
								<tr>
									<td>{part.label}</td>
									<td class="n">{n(part.target)}</td>
									<td class="n">{part.max}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/each}
		</div>

		<div class="grid two">
			<div class="card">
				<h2 class="card-title">Paper weights</h2>
				<table class="bands">
					<tbody>
						{#each weights as [type, w] (type)}
							<tr><td>{PUB_TYPE_LABELS[type]}</td><td class="n">{w}</td></tr>
						{/each}
					</tbody>
				</table>
				<p class="small muted">
					Ph.D.: awarded 1, ongoing {r.phdOngoingShare}. Citations per paper: over at least
					{r.minPapersForAverage} papers.
				</p>
			</div>
			<div class="card">
				<h2 class="card-title">Not counted</h2>
				<ul class="plain">
					{#each Object.values(FLAG_LABELS) as label (label)}
						<li><Icon name="alert" size={16} /> {label}</li>
					{/each}
				</ul>
				<p class="small muted">
					{n(data.setAside)} entries are left out this way. Each profile lists them.
				</p>
			</div>
			<div class="card">
				<h2 class="card-title">Good to know</h2>
				<ul class="plain">
					<li>
						<Icon name="help" size={16} />
						Google Scholar for {data.withScholar}, OpenAlex for {data.withOpenAlex} of {data.faculty}
						faculty.
					</li>
					<li>
						<Icon name="help" size={16} /> OpenAlex finds fewer citations than Scholar, so its numbers
						run lower.
					</li>
					<li>
						<Icon name="help" size={16} /> Uses public data only. This is not the UGC API score.
					</li>
				</ul>
				<a href={resolve('/data-check')}>Check every profile link</a>
			</div>
		</div>
	</div>
</section>

<style>
	.tight {
		padding-top: 32px;
	}
	.flow {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		list-style: none;
		margin: 0 0 36px;
		padding: 0;
	}
	.flow li {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 4px;
		padding: 0 8px;
	}
	.flow li + li::before {
		content: '';
		position: absolute;
		top: 21px;
		right: 50%;
		width: 100%;
		height: 2px;
		background: var(--line-strong);
		z-index: -1;
	}
	.k {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--navy);
		color: #fff;
		font-weight: 800;
		margin-bottom: 6px;
	}
	.flow strong {
		color: var(--navy);
	}
	.flow span:last-child {
		font-size: 0.88rem;
		color: var(--text-2);
	}
	.curve-row {
		grid-template-columns: 1.4fr 1fr;
		margin-bottom: 36px;
	}
	.curve {
		display: block;
		width: 100%;
		max-width: 420px;
		margin: 0 auto 8px;
	}
	.axis {
		stroke: var(--line-strong);
	}
	.line {
		fill: none;
		stroke: var(--blue);
		stroke-width: 3;
	}
	.pt {
		fill: var(--amber);
	}
	.lbl {
		font-size: 11px;
		fill: var(--text);
		font-weight: 600;
	}
	.lbl.end,
	.axis-lbl.end {
		text-anchor: end;
	}
	.axis-lbl {
		font-size: 11px;
		fill: var(--muted);
		text-anchor: middle;
	}
	.h {
		margin-bottom: 16px;
	}
	.pillars {
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		margin-bottom: 20px;
	}
	.two {
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	}
	.card-title {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}
	.max {
		font-size: 0.8rem;
		color: var(--muted);
		font-weight: 600;
	}
	.about {
		min-height: 2.6em;
	}
	.bands {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.93rem;
	}
	.bands th {
		text-align: left;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
		padding-bottom: 4px;
	}
	.bands th.n {
		text-align: right;
	}
	.bands td {
		padding: 5px 0;
		border-top: 1px solid var(--line);
	}
	.bands .n {
		text-align: right;
		font-weight: 700;
		color: var(--navy);
		padding-left: 8px;
	}
	.grades {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.grades li {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.plain {
		list-style: none;
		margin: 0 0 12px;
		padding: 0;
		display: grid;
		gap: 10px;
		font-size: 0.95rem;
	}
	.plain li {
		display: flex;
		gap: 8px;
	}
	.plain :global(svg) {
		color: var(--blue);
		margin-top: 4px;
	}
	@media (max-width: 760px) {
		.curve-row {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 640px) {
		.flow {
			grid-template-columns: 1fr 1fr;
			row-gap: 24px;
		}
		.flow li:nth-child(3)::before {
			display: none;
		}
	}
</style>
