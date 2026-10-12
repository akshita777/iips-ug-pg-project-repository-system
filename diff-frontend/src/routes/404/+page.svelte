<script lang="ts">
	import { resolve } from '$app/paths';
	import PageBand from '$lib/components/PageBand.svelte';
</script>

<svelte:head>
	<title>Page not found | IIPS Research Portal</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<PageBand title="Page not found" lead="There is no page at this address." />
<section class="section">
	<div class="wrap">
		<a class="btn" href={resolve('/faculty')}>Go to the faculty list</a>
	</div>
</section>
