<script lang="ts">
	import type { LessonResource } from '$lib/types';
	import { Card } from '$lib/components/ui';

	interface Props {
		resources: LessonResource[];
	}

	let { resources }: Props = $props();

	function formatFileSize(bytes: number | null): string {
		if (!bytes) return '';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function getFileIcon(fileType: string | null): string {
		const type = fileType?.toLowerCase() || '';
		if (type.includes('pdf')) {
			return `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />`;
		}
		if (type.includes('image') || type.includes('png') || type.includes('jpg')) {
			return `<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />`;
		}
		if (type.includes('zip') || type.includes('archive')) {
			return `<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />`;
		}
		return `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />`;
	}
</script>

{#if resources.length > 0}
	<div class="mt-8">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">Lesson Resources</h3>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each resources as resource}
				<a 
					href={resource.file_url}
					download
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition-colors group"
				>
					<div class="flex-shrink-0">
						<svg class="h-8 w-8 text-gray-400 group-hover:text-brand-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							{@html getFileIcon(resource.file_type)}
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate group-hover:text-brand-600">
							{resource.title}
						</p>
						{#if resource.file_size_bytes}
							<p class="text-xs text-gray-500">{formatFileSize(resource.file_size_bytes)}</p>
						{/if}
					</div>
					<svg class="h-5 w-5 text-gray-400 group-hover:text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
					</svg>
				</a>
			{/each}
		</div>
	</div>
{/if}
