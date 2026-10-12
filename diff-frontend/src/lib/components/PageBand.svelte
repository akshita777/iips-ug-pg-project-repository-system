<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	let {
		title,
		kicker,
		lead,
		crumbs = [],
		children
	}: {
		title: string;
		kicker?: string;
		lead?: string;
		crumbs?: { label: string; href?: string }[];
		children?: Snippet;
	} = $props();
</script>

<section class="band" style:--campus="url({asset('/brand/iips-campus.webp')})">
	<div class="wrap">
		<nav aria-label="Breadcrumb" class="crumbs no-print">
			<ol>
				<li><a href={resolve('/')}>Home</a></li>
				{#each crumbs as c (c.label)}
					<li>
						{#if c.href}
							<!-- callers pass hrefs that already went through resolve() -->
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={c.href}>{c.label}</a>
						{:else}
							<span aria-current="page">{c.label}</span>
						{/if}
					</li>
				{/each}
			</ol>
		</nav>
		{#if kicker}<span class="kicker">{kicker}</span>{/if}
		<h1>{title}</h1>
		{#if lead}<p class="lead">{lead}</p>{/if}
		{@render children?.()}
	</div>
</section>

<style>
	.band {
		background:
			linear-gradient(rgb(248 250 252 / 0.94), rgb(248 250 252 / 0.94)),
			var(--campus) center 40% / cover;
		border-bottom: 1px solid var(--line);
		padding: 22px 0 30px;
	}
	.crumbs ol {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		list-style: none;
		margin: 0 0 18px;
		padding: 0;
		font-size: 0.88rem;
		color: var(--muted);
	}
	.crumbs li + li::before {
		content: '/';
		margin-right: 6px;
		color: var(--line-strong);
	}
	.crumbs a {
		color: var(--blue);
		text-decoration: none;
	}
	.crumbs a:hover {
		text-decoration: underline;
	}
	h1 {
		margin-bottom: 6px;
	}
	.lead {
		color: var(--text-2);
		margin: 0;
		max-width: 70ch;
	}
</style>
