<script lang="ts">
	import ProgressBar from './ProgressBar.svelte';

	interface SidebarLesson {
		slug: string;
		title: string;
		duration_minutes: number | null;
		is_free_preview: boolean;
		progress?: { completed: boolean } | null;
	}

	interface SidebarModule {
		slug: string;
		title: string;
		lessons: SidebarLesson[];
	}

	interface Props {
		module: SidebarModule;
		currentLessonSlug: string;
		isMember: boolean;
	}

	let { module, currentLessonSlug, isMember }: Props = $props();

	const completedCount = $derived(
		module.lessons.filter(l => l.progress?.completed).length
	);
	const totalCount = $derived(module.lessons.length);
	const progressPercent = $derived(
		totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
	);

	function canAccess(lesson: SidebarLesson): boolean {
		return isMember || lesson.is_free_preview;
	}

	function formatDuration(minutes: number | null): string {
		if (!minutes) return '';
		return `${minutes} min`;
	}
</script>

<aside class="w-80 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
	<div class="p-4 border-b border-gray-200 bg-white">
		<a href="/modules/{module.slug}" class="text-sm text-brand-600 hover:text-brand-500 flex items-center gap-1">
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
			</svg>
			Back to module
		</a>
		<h2 class="mt-3 font-semibold text-gray-900 font-serif line-clamp-2">{module.title}</h2>
		{#if isMember && totalCount > 0}
			<div class="mt-3">
				<ProgressBar 
					value={progressPercent}
					label="{completedCount}/{totalCount} completed"
				/>
			</div>
		{/if}
	</div>

	<nav class="p-2">
		<ul class="space-y-1">
			{#each module.lessons as lesson, index}
				{@const isActive = lesson.slug === currentLessonSlug}
				{@const accessible = canAccess(lesson)}
				<li>
					<a
						href={accessible ? `/modules/${module.slug}/${lesson.slug}` : '#'}
						class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
							{isActive ? 'bg-brand-100 text-brand-900' : accessible ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}"
						class:pointer-events-none={!accessible}
					>
						<!-- Status indicator -->
						<span class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
							{#if lesson.progress?.completed}
								<svg class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
								</svg>
							{:else if !accessible}
								<svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
								</svg>
							{:else}
								<span class="text-xs font-medium {isActive ? 'text-brand-600' : 'text-gray-500'}">{index + 1}</span>
							{/if}
						</span>
						
						<!-- Lesson title -->
						<span class="flex-1 truncate">{lesson.title}</span>
						
						<!-- Duration -->
						{#if lesson.duration_minutes && accessible}
							<span class="flex-shrink-0 text-xs text-gray-500">
								{formatDuration(lesson.duration_minutes)}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
