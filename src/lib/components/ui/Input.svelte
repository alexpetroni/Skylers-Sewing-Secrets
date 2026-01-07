<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		hint?: string;
	}

	let {
		label,
		error,
		hint,
		id,
		name,
		type = 'text',
		class: className = '',
		...restProps
	}: Props = $props();

	const inputId = id ?? name ?? crypto.randomUUID();

	const inputClasses = $derived(
		`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
			error
				? 'ring-red-300 focus:ring-red-500 text-red-900 placeholder:text-red-300'
				: 'ring-gray-300 focus:ring-brand-600'
		} ${className}`
	);
</script>

<div>
	{#if label}
		<label for={inputId} class="block text-sm font-medium leading-6 text-gray-900">
			{label}
		</label>
	{/if}
	<div class={label ? 'mt-2' : ''}>
		<input
			{type}
			{name}
			id={inputId}
			class={inputClasses}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
			{...restProps}
		/>
	</div>
	{#if error}
		<p class="mt-2 text-sm text-red-600" id="{inputId}-error">{error}</p>
	{:else if hint}
		<p class="mt-2 text-sm text-gray-500" id="{inputId}-hint">{hint}</p>
	{/if}
</div>
