<script lang="ts">
	import { asset } from '$app/paths';

	let {
		src,
		name,
		initials,
		width = 120,
		eager = false
	}: {
		src: string | null;
		name: string;
		initials: string;
		width?: number;
		eager?: boolean;
	} = $props();
</script>

{#if src}
	<img
		class="photo"
		src={asset(`/${src}`)}
		alt="Photo of {name}"
		{width}
		height={Math.round((width * 6) / 5)}
		loading={eager ? 'eager' : 'lazy'}
		decoding="async"
	/>
{:else}
	<span class="photo empty" style:width="{width}px" style:height="{Math.round((width * 6) / 5)}px"
		><span aria-hidden="true">{initials}</span><span class="sr-only">{name}</span></span
	>
{/if}

<style>
	.photo {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 5 / 6;
		object-fit: cover;
		border-radius: 4px;
		border: 1px solid var(--line);
		background: var(--band);
	}
	.empty {
		display: grid;
		place-items: center;
		color: var(--navy);
		font-weight: 800;
		font-size: 1.6rem;
	}
</style>
