<script lang="ts">
	import type { Confidence } from '$lib/domain/types';
	import Icon from './Icon.svelte';

	let { confidence }: { confidence: Confidence | null } = $props();
	const label = $derived(
		confidence === 'high' ? 'Verified' : confidence === 'medium' ? 'Please check' : 'Not found'
	);
</script>

<span class="badge {confidence ?? 'none'}">
	<Icon name={confidence === 'high' ? 'check' : confidence ? 'alert' : 'help'} size={15} />
	{label}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 2px 10px;
		border-radius: 999px;
		font-size: 0.82rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.high {
		background: var(--good-soft);
		color: var(--good);
	}
	.medium,
	.low {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.none {
		background: #f1f5f9;
		color: var(--text-2);
	}
</style>
