<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink' | 'brand'
		| 'primary' | 'secondary' | 'success' | 'warning' | 'error';
	type Size = 'sm' | 'md';

	interface Props {
		variant?: Variant;
		size?: Size;
		dot?: boolean;
		removable?: boolean;
		onremove?: () => void;
		children: Snippet;
	}

	let {
		variant = 'gray',
		size = 'md',
		dot = false,
		removable = false,
		onremove,
		children
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		gray: 'bg-charcoal-50 text-charcoal-600 ring-charcoal-200',
		red: 'bg-red-50 text-red-700 ring-red-200',
		yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
		green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
		blue: 'bg-blue-50 text-blue-700 ring-blue-200',
		indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
		purple: 'bg-purple-50 text-purple-700 ring-purple-200',
		pink: 'bg-pink-50 text-pink-700 ring-pink-200',
		brand: 'bg-brand-50 text-brand-700 ring-brand-200',
		primary: 'bg-brand-50 text-brand-700 ring-brand-200',
		secondary: 'bg-charcoal-50 text-charcoal-600 ring-charcoal-200',
		success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
		warning: 'bg-amber-50 text-amber-700 ring-amber-200',
		error: 'bg-red-50 text-red-700 ring-red-200'
	};

	const dotClasses: Record<Variant, string> = {
		gray: 'fill-gray-400',
		red: 'fill-red-500',
		yellow: 'fill-yellow-500',
		green: 'fill-green-500',
		blue: 'fill-blue-500',
		indigo: 'fill-indigo-500',
		purple: 'fill-purple-500',
		pink: 'fill-pink-500',
		brand: 'fill-brand-500',
		primary: 'fill-brand-500',
		secondary: 'fill-gray-400',
		success: 'fill-green-500',
		warning: 'fill-yellow-500',
		error: 'fill-red-500'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'px-1.5 py-0.5 text-xs',
		md: 'px-2 py-1 text-xs'
	};
</script>

<span class="inline-flex items-center gap-x-1.5 rounded-md font-medium ring-1 ring-inset {variantClasses[variant]} {sizeClasses[size]}">
	{#if dot}
		<svg class="h-1.5 w-1.5 {dotClasses[variant]}" viewBox="0 0 6 6" aria-hidden="true">
			<circle cx="3" cy="3" r="3" />
		</svg>
	{/if}
	{@render children()}
	{#if removable}
		<button
			type="button"
			class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-gray-500/20"
			onclick={onremove}
		>
			<span class="sr-only">Remove</span>
			<svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-gray-600/50 group-hover:stroke-gray-600/75">
				<path d="M4 4l6 6m0-6l-6 6" />
			</svg>
		</button>
	{/if}
</span>
