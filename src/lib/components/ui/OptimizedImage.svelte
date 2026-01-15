<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		quality?: number;
		class?: string;
	}

	let { src, alt, width = 800, height, quality = 80, class: className = '' }: Props = $props();

	const BUNNY_CDN_URL = import.meta.env.PUBLIC_BUNNY_CDN_URL;

	function getOptimizedSrc(originalSrc: string, w: number, q: number): string {
		if (!BUNNY_CDN_URL) {
			return originalSrc;
		}

		const basePath = originalSrc.replace(/^\/static\//, '').replace(/^\//, '');
		const queryParams = new URLSearchParams({
			width: w.toString(),
			quality: q.toString(),
		});

		if (height) {
			queryParams.set('height', height.toString());
		}

		return `${BUNNY_CDN_URL}/${basePath}?${queryParams.toString()}`;
	}

	const srcSet = $derived([
		`${getOptimizedSrc(src, 400, quality)} 400w`,
		`${getOptimizedSrc(src, 800, quality)} 800w`,
		`${getOptimizedSrc(src, 1200, quality)} 1200w`,
		`${getOptimizedSrc(src, 1600, quality)} 1600w`,
	].join(', '));

	const optimizedSrc = $derived(getOptimizedSrc(src, width, quality));
</script>

{#if BUNNY_CDN_URL}
	<picture>
		<source srcset={srcSet} />
		<img
			src={optimizedSrc}
			{alt}
			class={className}
			loading="lazy"
		/>
	</picture>
{:else}
	<img
		src={src}
		{alt}
		class={className}
		loading="lazy"
	/>
{/if}

<style>
	:global(img) {
		height: auto;
		max-width: 100%;
	}
</style>
