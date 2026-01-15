<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		label?: string;
		error?: string;
		hint?: string;
		children: Snippet;
	}

	let {
		label,
		error,
		hint,
		id,
		name,
		class: className = '',
		children,
		value = $bindable(),
		...restProps
	}: Props = $props();

	const fallbackId = crypto.randomUUID();
	const selectId = $derived(id ?? name ?? fallbackId);

	const selectClasses = $derived(
		`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
			error
				? 'ring-red-300 focus:ring-red-500 text-red-900'
				: 'ring-gray-300 focus:ring-brand-600'
		} ${className}`
	);
</script>

<div>
	{#if label}
		<label for={selectId} class="block text-sm font-medium leading-6 text-gray-900">
			{label}
		</label>
	{/if}
	<div class={label ? 'mt-2' : ''}>
		<select
			{name}
			id={selectId}
			class={selectClasses}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
			bind:value
			{...restProps}
		>
			{@render children()}
		</select>
	</div>
	{#if error}
		<p class="mt-2 text-sm text-red-600" id="{selectId}-error">{error}</p>
	{:else if hint}
		<p class="mt-2 text-sm text-gray-500" id="{selectId}-hint">{hint}</p>
	{/if}
</div>
