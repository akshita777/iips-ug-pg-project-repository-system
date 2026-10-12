<script lang="ts">
	import '../app.css';
	import { asset, resolve } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import { longDate } from '$lib/format';

	let { data, children } = $props();
	let menuOpen = $state(false);

	const nav = [
		{ href: resolve('/'), label: 'Home' },
		{ href: resolve('/faculty'), label: 'Faculty' },
		{ href: resolve('/scores'), label: 'Research Scores' },
		{ href: resolve('/method'), label: 'How Scores Work' },
		{ href: resolve('/data-check'), label: 'Data Check' }
	];

	const active = (href: string) =>
		href === resolve('/') ? page.url.pathname === href : page.url.pathname.startsWith(href);

	$effect(() => {
		// close the phone menu after every navigation
		void page.url.pathname;
		menuOpen = false;
	});
</script>

<a class="skip" href="#main">Skip to content</a>

<header class="masthead">
	<div class="wrap head">
		<a class="org" href={resolve('/')}>
			<img src={asset('/brand/davv-logo.webp')} alt="DAVV logo" width="48" height="48" />
			<img src={asset('/brand/iips-logo.webp')} alt="IIPS logo" width="43" height="48" />
			<span class="org-text">
				<span class="over">Faculty research of</span>
				<strong>International Institute of Professional Studies</strong>
				<span class="under">Devi Ahilya Vishwavidyalaya (DAVV), Indore, India</span>
			</span>
		</a>
		<div class="portal-name">
			<strong>IIPS Research Portal</strong>
			<span>Publications, citations and Ph.D. guidance</span>
		</div>
	</div>
</header>

<nav class="navbar no-print" aria-label="Main">
	<div class="wrap navrow">
		<button
			class="menu-btn"
			type="button"
			aria-expanded={menuOpen}
			aria-controls="main-menu"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<Icon name={menuOpen ? 'close' : 'menu'} size={22} />
			<span>Menu</span>
		</button>
		<ul id="main-menu" class:open={menuOpen}>
			{#each nav as item (item.href)}
				<li>
					<a href={item.href} aria-current={active(item.href) ? 'page' : undefined}>{item.label}</a>
				</li>
			{/each}
		</ul>
		<a class="btn btn-amber btn-small cta" href="{resolve('/faculty')}#search">
			<Icon name="search" size={16} /> Find Faculty
		</a>
	</div>
</nav>

<div class="notice no-print">
	<div class="wrap notice-row">
		<span class="tag">Update</span>
		<span
			>Data from <a href={data.sources.iips} rel="external">iips.edu.in</a>, Google Scholar and
			OpenAlex, checked on {longDate(data.updated)}.</span
		>
	</div>
</div>

<main id="main" tabindex="-1">
	{@render children()}
</main>

<footer class="footer">
	<div class="wrap cols">
		<div>
			<p class="f-brand">
				<img src={asset('/brand/iips-logo.webp')} alt="" width="34" height="38" />
				IIPS Research Portal
			</p>
			<p class="small muted">
				Faculty profiles, Google Scholar publications and research scores for IIPS, DAVV Indore.
			</p>
		</div>
		<div>
			<h2 class="f-title">Quick links</h2>
			<ul>
				{#each nav.slice(1) as item (item.href)}
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
			</ul>
		</div>
		<div>
			<h2 class="f-title">Sources</h2>
			<ul>
				<li>
					<a href={data.sources.iips} rel="external"
						>IIPS faculty profiles <Icon name="external" size={14} /></a
					>
				</li>
				<li>
					<a href={data.sources.scholar} rel="external"
						>Google Scholar <Icon name="external" size={14} /></a
					>
				</li>
				<li>
					<a href="https://www.dauniv.ac.in/" rel="external"
						>DAVV website <Icon name="external" size={14} /></a
					>
				</li>
			</ul>
		</div>
		<div>
			<h2 class="f-title">Address</h2>
			<address class="small">
				International Institute of Professional Studies (IIPS),<br />
				Devi Ahilya Vishwavidyalaya, Takshashila Campus,<br />
				Khandwa Road, Indore, Madhya Pradesh 452001
			</address>
		</div>
	</div>
	<div class="wrap legal small">
		<span
			>© {data.updated.slice(0, 4)} IIPS Research Portal. OOAD Lab project, MCA (Integrated).</span
		>
		<span>Public data, checked {longDate(data.updated)}.</span>
	</div>
</footer>

<style>
	.skip {
		position: absolute;
		left: 8px;
		top: -60px;
		z-index: 100;
		background: var(--navy);
		color: #fff;
		padding: 10px 16px;
		font-weight: 700;
	}
	.skip:focus {
		top: 8px;
	}

	/* white masthead with the two crests */
	.masthead {
		background: #fff;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding-top: 14px;
		padding-bottom: 14px;
	}
	.org {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		min-width: 0;
	}
	.org img {
		height: 48px;
		width: auto;
	}
	.org-text {
		display: flex;
		flex-direction: column;
		line-height: 1.3;
		padding-left: 12px;
		border-left: 1px solid var(--line);
	}
	.over {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.org-text strong {
		color: var(--navy);
		font-size: 1.05rem;
	}
	.under {
		color: var(--text-2);
		font-size: 0.85rem;
	}
	.portal-name {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		text-align: right;
		padding-right: 16px;
		border-right: 3px solid var(--navy);
		line-height: 1.3;
	}
	.portal-name strong {
		color: var(--navy);
		font-size: 1.3rem;
		font-weight: 800;
	}
	.portal-name span {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}

	/* blue navigation bar */
	.navbar {
		background: var(--blue);
		position: sticky;
		top: 0;
		z-index: 20;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.15);
	}
	.navrow {
		display: flex;
		align-items: center;
		gap: 12px;
		min-height: 52px;
	}
	.navbar ul {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		flex: 1;
	}
	.navbar ul a {
		display: flex;
		align-items: center;
		height: 52px;
		padding: 0 16px;
		color: #fff;
		text-decoration: none;
		font-size: 0.86rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.navbar ul a:hover {
		background: rgb(0 0 0 / 0.12);
	}
	.navbar ul a[aria-current='page'] {
		background: var(--navy);
	}
	.menu-btn {
		display: none;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 10px;
		background: transparent;
		border: 1px solid rgb(255 255 255 / 0.5);
		border-radius: 4px;
		color: #fff;
		font: inherit;
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.cta {
		margin-left: auto;
	}

	/* cream notice strip */
	.notice {
		background: var(--cream);
		border-bottom: 1px solid var(--cream-line);
		font-size: 0.9rem;
	}
	.notice-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-top: 7px;
		padding-bottom: 7px;
		color: var(--amber-text);
	}
	.notice a {
		color: var(--amber-text);
		font-weight: 600;
	}
	.tag {
		background: #c2410c;
		color: #fff;
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 2px 8px;
		border-radius: 3px;
		flex: none;
	}

	main:focus {
		outline: none;
	}

	/* footer */
	.footer {
		background: #f1f5f9;
		border-top: 1px solid var(--line);
		margin-top: 0;
	}
	.cols {
		display: grid;
		grid-template-columns: 1.3fr 1fr 1fr 1.3fr;
		gap: 32px;
		padding-top: 44px;
		padding-bottom: 32px;
	}
	.f-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--navy);
		font-weight: 800;
		font-size: 1.15rem;
	}
	.f-title {
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--navy);
		margin-bottom: 12px;
	}
	.footer ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 6px;
		font-size: 0.93rem;
	}
	.footer ul a {
		color: var(--text-2);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.footer ul a:hover {
		color: var(--blue);
		text-decoration: underline;
	}
	address {
		font-style: normal;
		color: var(--text-2);
		line-height: 1.7;
	}
	.legal {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px;
		padding-top: 18px;
		padding-bottom: 24px;
		border-top: 1px solid var(--line-strong);
		color: var(--muted);
	}

	@media (max-width: 980px) {
		.portal-name {
			display: none;
		}
		.cols {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (max-width: 820px) {
		.menu-btn {
			display: inline-flex;
		}
		.navbar ul {
			display: none;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			flex-direction: column;
			background: var(--blue);
			border-top: 1px solid rgb(255 255 255 / 0.2);
			box-shadow: 0 6px 12px rgb(0 0 0 / 0.15);
		}
		.navbar ul.open {
			display: flex;
		}
		.navbar ul a {
			height: 50px;
			padding: 0 clamp(16px, 4vw, 40px);
			border-bottom: 1px solid rgb(255 255 255 / 0.12);
		}
	}
	@media (max-width: 560px) {
		.org img:first-child {
			display: none;
		}
		.org-text strong {
			font-size: 0.95rem;
		}
		.under {
			font-size: 0.78rem;
		}
		.cols {
			grid-template-columns: 1fr;
			gap: 24px;
		}
	}
</style>
