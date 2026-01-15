<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		loading?: boolean;
		fullWidth?: boolean;
		children: Snippet;
		icon?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		fullWidth = false,
		disabled = false,
		type = 'button',
		class: className = '',
		children,
		icon,
		...restProps
	}: Props = $props();

	const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg';

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:outline-brand-600',
		secondary: 'bg-white text-charcoal-800 shadow-sm ring-1 ring-inset ring-charcoal-200 hover:bg-cream-100 hover:ring-charcoal-300',
		ghost: 'text-charcoal-700 hover:bg-cream-200 hover:text-charcoal-900',
		danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600',
		success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-emerald-600'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'px-3 py-1.5 text-xs gap-1.5',
		md: 'px-4 py-2.5 text-sm gap-2',
		lg: 'px-6 py-3 text-base gap-2.5'
	};

	const classes = $derived(
		`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`
	);
</script>

<button
	{type}
	class={classes}
	disabled={disabled || loading}
	{...restProps}
>
	{#if loading}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
	{:else if icon}
		{@render icon()}
	{/if}
	{@render children()}
</button>
