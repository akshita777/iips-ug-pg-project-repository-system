<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PageBand from '$lib/components/PageBand.svelte';
</script>

<svelte:head><title>Page not found | IIPS Research Portal</title></svelte:head>

<PageBand
	title={page.status === 404 ? 'Page not found' : 'Something went wrong'}
	lead={page.error?.message}
/>
<section class="section">
	<div class="wrap">
		<a class="btn" href={resolve('/faculty')}>Go to the faculty list</a>
	</div>
</section>
