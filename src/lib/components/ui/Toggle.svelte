<script lang="ts">
	interface Props {
		checked?: boolean;
		disabled?: boolean;
		label?: string;
		description?: string;
		name?: string;
		onchange?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		label,
		description,
		name,
		onchange
	}: Props = $props();

	function handleClick() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}
</script>

<div class="flex items-center">
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		{disabled}
		{name}
		class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {checked ? 'bg-brand-600' : 'bg-gray-200'}"
		onclick={handleClick}
	>
		<span
			aria-hidden="true"
			class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out {checked ? 'translate-x-5' : 'translate-x-0'}"
		></span>
	</button>
	{#if label || description}
		<span class="ml-3 text-sm">
			{#if label}
				<span class="font-medium text-gray-900">{label}</span>
			{/if}
			{#if description}
				<span class="text-gray-500">{description}</span>
			{/if}
		</span>
	{/if}
</div>
