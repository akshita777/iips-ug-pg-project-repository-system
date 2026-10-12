<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import Grade from '$lib/components/Grade.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Photo from '$lib/components/Photo.svelte';
	import { PUB_TYPE_LABELS } from '$lib/domain/types';
	import { longDate, n } from '$lib/format';

	let { data } = $props();
	const t = $derived(data.totals);
	const deptName = (id: string) => data.departments.find((d) => d.id === id)?.name ?? id;
</script>

<svelte:head>
	<title>IIPS Research Portal | Faculty research at IIPS, DAVV Indore</title>
	<meta
		name="description"
		content="Profiles, Google Scholar publications, citations and research scores of IIPS, DAVV Indore faculty."
	/>
</svelte:head>

<section class="hero" style:--campus="url({asset('/brand/iips-campus.webp')})">
	<div class="wrap hero-in">
		<span class="pill"><span class="dot"></span> Data checked {longDate(data.updated)}</span>
		<h1>
			<span class="l1">IIPS Faculty</span>
			<span class="l2">Research Portal</span>
		</h1>
		<p class="sub">International Institute of Professional Studies, DAVV Indore</p>
		<p class="meta">
			<span><Icon name="users" size={18} /> {t.faculty} faculty members</span>
			<span class="sep" aria-hidden="true"></span>
			<span><Icon name="pin" size={18} /> Computer Science and Management</span>
		</p>
		<div class="actions">
			<a class="btn" href={resolve('/faculty')}>Browse Faculty</a>
			<a class="btn btn-outline" href={resolve('/scores')}>Research Scores</a>
		</div>
		<dl class="figures">
			<div>
				<dt>Publications:</dt>
				<dd class="num">{n(t.papers)}</dd>
			</div>
			<div>
				<dt>Citations:</dt>
				<dd class="num">{n(t.citations)}</dd>
			</div>
			<div>
				<dt>Patents:</dt>
				<dd class="num">{n(t.patents)}</dd>
			</div>
			<div>
				<dt>Ph.D. awarded:</dt>
				<dd class="num">{n(t.phdAwarded)}</dd>
			</div>
		</dl>
	</div>
</section>

<section class="section">
	<div class="wrap grid grid-3">
		<a class="card feature" href={resolve('/faculty')}>
			<h2 class="card-title">Faculty Profiles</h2>
			<p>Photo, qualification, specialization and Ph.D. scholars, as listed on the IIPS website.</p>
		</a>
		<a class="card feature" href={resolve('/data-check')}>
			<h2 class="card-title">Checked Profile Links</h2>
			<p>Every Scholar and OpenAlex link is matched on evidence and listed for checking.</p>
		</a>
		<a class="card feature" href={resolve('/method')}>
			<h2 class="card-title">Research Score</h2>
			<p>Out of 100, from five pillars: output, impact, quality, recent work and mentoring.</p>
		</a>
	</div>
</section>

<section class="section band">
	<div class="wrap about">
		<div>
			<span class="kicker">About the portal</span>
			<h2>One place for IIPS faculty research</h2>
			<p class="muted">
				Profiles come from the IIPS website. Papers and citations come from Google Scholar, or
				OpenAlex when there is no Scholar profile, cleaned of namesakes and duplicates.
			</p>
			<dl class="stats">
				{#each data.departments as d (d.id)}
					<div>
						<dd class="num">{d.count}</dd>
						<dt>{d.name} faculty</dt>
					</div>
				{/each}
				<div>
					<dd class="num">{t.withScholar + t.withOpenAlex}</dd>
					<dt>Research profiles</dt>
				</div>
			</dl>
		</div>
		<div class="card">
			<h3 class="kicker host">Data sources</h3>
			<ul class="checks">
				<li>
					<Icon name="check" size={18} />
					<span><strong>IIPS website:</strong> names, photos, qualification, Ph.D. scholars.</span>
				</li>
				<li>
					<Icon name="check" size={18} />
					<span><strong>Google Scholar and OpenAlex:</strong> papers and citations.</span>
				</li>
				<li>
					<Icon name="check" size={18} />
					<span><strong>Checked:</strong> each profile link has its evidence shown.</span>
				</li>
			</ul>
			<a class="more" href={resolve('/data-check')}
				>See the data check <Icon name="arrow" size={16} /></a
			>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head center">
			<span class="kicker">Research scores</span>
			<h2>Top Scores This Year</h2>
		</div>
		<div class="grid people">
			{#each data.top as f (f.slug)}
				<a class="card person" href={resolve('/faculty/[slug]', { slug: f.slug })}>
					<div class="pic">
						<Photo src={f.photo} name={f.name} initials={f.initials} width={130} />
					</div>
					<span class="kicker">{f.designation}</span>
					<strong class="pname">{f.name}</strong>
					<span class="pdept">{deptName(f.department)}</span>
					<span class="pline"
						><Grade grade={f.grade} partial={f.partial} /> <span class="num">{f.total}/100</span> ·
						<span class="num">{n(f.citations)}</span> citations</span
					>
				</a>
			{/each}
		</div>
		<p class="center-link">
			<a class="btn btn-outline" href={resolve('/scores')}>All scores</a>
		</p>
	</div>
</section>

<section class="section band">
	<div class="wrap two">
		<div>
			<div class="section-head">
				<span class="kicker">Latest on Google Scholar</span>
				<h2>Recent Publications</h2>
			</div>
			<ul class="papers">
				{#each data.recent as p (p.key)}
					<li>
						<span class="year num">{p.year}</span>
						<div>
							<a href={p.url} rel="external">{p.title}</a>
							<p class="small muted">
								<a href={resolve('/faculty/[slug]', { slug: p.slug })}>{p.facultyName}</a> ·
								{PUB_TYPE_LABELS[p.type]}{p.venue ? `, ${p.venue}` : ''}
							</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>
		<div>
			<div class="section-head">
				<span class="kicker">Specializations</span>
				<h2>Research Areas</h2>
			</div>
			<ul class="chips areas">
				{#each data.areas as a (a.area)}
					<li>
						<a class="chip" href="{resolve('/faculty')}?q={encodeURIComponent(a.area)}"
							>{a.area} <span class="c">{a.count}</span></a
						>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		background:
			linear-gradient(rgb(255 255 255 / 0.84), rgb(255 255 255 / 0.84)),
			var(--campus) center / cover;
		border-bottom: 1px solid var(--line);
		text-align: center;
	}
	.hero-in {
		padding-top: clamp(48px, 9vw, 110px);
		padding-bottom: clamp(40px, 7vw, 80px);
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 14px;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: 4px;
		font-size: 0.85rem;
		font-weight: 600;
		box-shadow: var(--shadow);
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--blue);
	}
	h1 {
		margin: 26px 0 14px;
		font-size: clamp(2.1rem, 6vw, 4rem);
		line-height: 1.12;
		letter-spacing: -0.02em;
	}
	.l1,
	.l2 {
		display: block;
	}
	.l1 {
		color: var(--navy-deep);
	}
	.l2 {
		color: var(--blue);
	}
	.sub {
		font-size: clamp(1.05rem, 2vw, 1.3rem);
		font-weight: 700;
		color: var(--navy);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 10px 22px;
		font-weight: 600;
		margin: 18px 0 28px;
	}
	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.meta :global(svg) {
		color: var(--blue);
	}
	.sep {
		width: 1px;
		height: 20px;
		background: var(--line-strong);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 14px;
	}
	.figures {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px 44px;
		margin: 44px 0 0;
	}
	.figures div {
		display: flex;
		gap: 8px;
		align-items: baseline;
	}
	.figures dt {
		color: var(--blue);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.figures dd {
		margin: 0;
		font-weight: 800;
		font-size: 1.1rem;
	}

	.feature {
		text-decoration: none;
		color: inherit;
		transition: border-color 0.15s;
	}
	.feature:hover {
		border-color: var(--blue);
	}
	.feature p {
		color: var(--text-2);
		font-size: 0.95rem;
		margin: 0;
	}

	.about {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 48px;
		align-items: start;
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 28px;
		margin: 28px 0 0;
	}
	.stats div {
		display: flex;
		flex-direction: column-reverse;
		padding-left: 14px;
		border-left: 2px solid var(--blue);
	}
	.stats dd {
		margin: 0;
		font-size: 2rem;
		font-weight: 800;
		color: var(--navy);
		line-height: 1.1;
	}
	.stats dt {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-2);
	}
	.host {
		margin-bottom: 14px;
	}
	.checks {
		list-style: none;
		margin: 0 0 16px;
		padding: 16px 0 0;
		border-top: 1px solid var(--line);
		display: grid;
		gap: 10px;
		font-size: 0.95rem;
	}
	.checks li {
		display: flex;
		gap: 10px;
	}
	.checks :global(svg) {
		color: var(--blue);
		margin-top: 3px;
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-weight: 600;
	}

	.people {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}
	.person {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		text-decoration: none;
		color: inherit;
	}
	.person:hover {
		border-color: var(--blue);
	}
	.pic {
		width: 120px;
		margin-bottom: 14px;
	}
	.person .kicker {
		font-size: 0.72rem;
		margin-bottom: 2px;
	}
	.pname {
		color: var(--navy);
		font-size: 1.1rem;
	}
	.pdept {
		color: var(--text-2);
		font-size: 0.9rem;
		margin-bottom: 12px;
	}
	.pline {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.9rem;
		color: var(--text-2);
	}
	.center-link {
		text-align: center;
		margin: 28px 0 0;
	}

	.two {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: 48px;
	}
	.papers {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: var(--radius);
	}
	.papers li {
		display: flex;
		gap: 16px;
		padding: 14px 18px;
		border-bottom: 1px solid var(--line);
	}
	.papers li:last-child {
		border-bottom: 0;
	}
	.papers .year {
		flex: none;
		font-weight: 800;
		color: var(--blue);
	}
	.papers a {
		font-weight: 600;
	}
	.papers p {
		margin: 4px 0 0;
	}
	.papers p a {
		font-weight: 500;
	}
	.areas .chip {
		text-decoration: none;
		font-size: 0.92rem;
		padding: 6px 12px;
	}
	.areas .chip:hover {
		background: #d3e4f1;
	}
	.areas .c {
		color: var(--muted);
		margin-left: 2px;
	}

	@media (max-width: 860px) {
		.about,
		.two {
			grid-template-columns: 1fr;
			gap: 32px;
		}
	}
</style>
