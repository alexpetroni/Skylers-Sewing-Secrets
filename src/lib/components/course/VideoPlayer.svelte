<script lang="ts">
	import { parseBunnyUrl, getBunnyEmbedUrl } from '$lib/types';

	interface Props {
		videoUrl: string;
		title?: string;
		class?: string;
	}

	let {
		videoUrl,
		title = 'Video',
		class: className = ''
	}: Props = $props();

	const bunnyVideo = $derived(parseBunnyUrl(videoUrl));
	const embedUrl = $derived(
		bunnyVideo 
			? getBunnyEmbedUrl(bunnyVideo.libraryId, bunnyVideo.videoId)
			: null
	);
</script>

<div class="aspect-video w-full overflow-hidden rounded-lg bg-gray-900 {className}">
	{#if embedUrl}
		<iframe
			src={embedUrl}
			{title}
			loading="lazy"
			allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
			allowfullscreen
			class="h-full w-full"
		></iframe>
	{:else}
		<div class="flex h-full items-center justify-center text-gray-400">
			<p>Video unavailable</p>
		</div>
	{/if}
</div>
