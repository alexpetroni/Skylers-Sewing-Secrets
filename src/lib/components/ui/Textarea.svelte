<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
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
		rows = 4,
		class: className = '',
		...restProps
	}: Props = $props();

	const textareaId = id ?? name ?? crypto.randomUUID();

	const textareaClasses = $derived(
		`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
			error
				? 'ring-red-300 focus:ring-red-500 text-red-900 placeholder:text-red-300'
				: 'ring-gray-300 focus:ring-brand-600'
		} ${className}`
	);
</script>

<div>
	{#if label}
		<label for={textareaId} class="block text-sm font-medium leading-6 text-gray-900">
			{label}
		</label>
	{/if}
	<div class={label ? 'mt-2' : ''}>
		<textarea
			{name}
			id={textareaId}
			{rows}
			class={textareaClasses}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
			{...restProps}
		></textarea>
	</div>
	{#if error}
		<p class="mt-2 text-sm text-red-600" id="{textareaId}-error">{error}</p>
	{:else if hint}
		<p class="mt-2 text-sm text-gray-500" id="{textareaId}-hint">{hint}</p>
	{/if}
</div>
