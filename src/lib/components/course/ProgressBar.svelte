<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		label?: string;
		size?: 'sm' | 'md' | 'lg';
		showPercentage?: boolean;
		class?: string;
	}

	let { 
		value, 
		max = 100, 
		label, 
		size = 'sm',
		showPercentage = false,
		class: className = ''
	}: Props = $props();

	const percentage = $derived(Math.min(Math.round((value / max) * 100), 100));

	const heightClasses = {
		sm: 'h-1.5',
		md: 'h-2',
		lg: 'h-3'
	};
</script>

<div class={className}>
	{#if label || showPercentage}
		<div class="flex justify-between items-center mb-1">
			{#if label}
				<span class="text-xs text-gray-500">{label}</span>
			{/if}
			{#if showPercentage}
				<span class="text-xs font-medium text-gray-700">{percentage}%</span>
			{/if}
		</div>
	{/if}
	<div class="w-full bg-gray-200 rounded-full overflow-hidden {heightClasses[size]}">
		<div 
			class="bg-brand-600 rounded-full transition-all duration-300 {heightClasses[size]}"
			style="width: {percentage}%"
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
		></div>
	</div>
</div>
