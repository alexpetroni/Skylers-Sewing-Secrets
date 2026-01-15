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
		value = $bindable(),
		...restProps
	}: Props = $props();

	const fallbackId = crypto.randomUUID();
	const inputId = $derived(id ?? name ?? fallbackId);

	const inputClasses = $derived(
		`block w-full rounded-lg border-0 py-2.5 px-4 text-charcoal-900 shadow-sm ring-1 ring-inset placeholder:text-charcoal-400 focus:ring-2 focus:ring-inset sm:text-sm transition-colors ${
			error
				? 'ring-red-300 focus:ring-red-500 text-red-900 placeholder:text-red-300'
				: 'ring-charcoal-200 focus:ring-brand-500'
		} ${className}`
	);
</script>

<div>
	{#if label}
		<label for={inputId} class="block text-sm font-medium leading-6 text-charcoal-700 mb-1.5">
			{label}
		</label>
	{/if}
	<div>
		<input
			{type}
			{name}
			id={inputId}
			class={inputClasses}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
			bind:value
			{...restProps}
		/>
	</div>
	{#if error}
		<p class="mt-2 text-sm text-red-600" id="{inputId}-error">{error}</p>
	{:else if hint}
		<p class="mt-2 text-sm text-charcoal-500" id="{inputId}-hint">{hint}</p>
	{/if}
</div>
