<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		class?: string;
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
	}

	let {
		padding = 'md',
		class: className = '',
		children,
		header,
		footer
	}: Props = $props();

	const paddingClasses: Record<string, string> = {
		none: '',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};
</script>

<div class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-charcoal-100 {className}">
	{#if header}
		<div class="border-b border-charcoal-100 bg-white px-5 py-5 sm:px-6">
			{@render header()}
		</div>
	{/if}

	<div class={paddingClasses[padding]}>
		{@render children()}
	</div>

	{#if footer}
		<div class="border-t border-charcoal-100 bg-ivory-50 px-5 py-4 sm:px-6">
			{@render footer()}
		</div>
	{/if}
</div>
