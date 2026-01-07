<script lang="ts">
	type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		src?: string | null;
		alt?: string;
		name?: string;
		size?: Size;
		class?: string;
	}

	let {
		src,
		alt = '',
		name = '',
		size = 'md',
		class: className = ''
	}: Props = $props();

	const sizeClasses: Record<Size, string> = {
		xs: 'h-6 w-6 text-xs',
		sm: 'h-8 w-8 text-sm',
		md: 'h-10 w-10 text-base',
		lg: 'h-12 w-12 text-lg',
		xl: 'h-14 w-14 text-xl'
	};

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	const initials = $derived(getInitials(name || alt));
</script>

{#if src}
	<img
		{src}
		{alt}
		class="inline-block rounded-full object-cover {sizeClasses[size]} {className}"
	/>
{:else}
	<span class="inline-flex items-center justify-center rounded-full bg-gray-500 {sizeClasses[size]} {className}">
		<span class="font-medium leading-none text-white">{initials || '?'}</span>
	</span>
{/if}
