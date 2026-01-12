<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui';
	import VideoPlayer from '$lib/components/course/VideoPlayer.svelte';
	import LessonSidebar from '$lib/components/course/LessonSidebar.svelte';
	import LessonResources from '$lib/components/course/LessonResources.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let sidebarOpen = $state(true);
	let isCompleting = $state(false);

	// Find next and previous lessons
	const currentIndex = $derived(
		data.module.lessons.findIndex(l => l.slug === data.lesson.slug)
	);
	const prevLesson = $derived(
		currentIndex > 0 ? data.module.lessons[currentIndex - 1] : null
	);
	const nextLesson = $derived(
		currentIndex < data.module.lessons.length - 1 ? data.module.lessons[currentIndex + 1] : null
	);

	async function markComplete() {
		if (isCompleting || data.lesson.progress?.completed) return;
		
		isCompleting = true;
		try {
			const response = await fetch('/api/progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId: data.lesson.id })
			});
			
			if (response.ok) {
				// Update local state
				data.lesson.progress = { completed: true, completed_at: new Date().toISOString() };
			}
		} catch (error) {
			console.error('Failed to mark lesson complete:', error);
		} finally {
			isCompleting = false;
		}
	}

	function canAccessLesson(lesson: typeof data.module.lessons[0]): boolean {
		return data.profile?.is_member || lesson.is_free_preview;
	}
</script>

<svelte:head>
	<title>{data.lesson.title} - {data.module.title} - Skyler's Sewing Secrets</title>
	<meta name="description" content={data.lesson.description || `Watch ${data.lesson.title} in ${data.module.title}.`} />
</svelte:head>

<div class="flex h-[calc(100vh-64px)] bg-white">
	<!-- Sidebar (desktop) -->
	<div class="hidden lg:block {sidebarOpen ? '' : 'lg:hidden'}">
		<LessonSidebar 
			module={data.module}
			currentLessonSlug={data.lesson.slug}
			isMember={data.profile?.is_member ?? false}
		/>
	</div>

	<!-- Main content -->
	<div class="flex-1 overflow-y-auto">
		<!-- Toggle sidebar button -->
		<button
			type="button"
			class="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-6 h-12 bg-gray-100 hover:bg-gray-200 rounded-r-lg shadow transition-colors {sidebarOpen ? 'left-80' : 'left-0'}"
			onclick={() => sidebarOpen = !sidebarOpen}
			aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
		>
			<svg class="h-4 w-4 text-gray-600 {sidebarOpen ? '' : 'rotate-180'}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
			</svg>
		</button>

		<div class="max-w-4xl mx-auto px-4 py-6 lg:px-8">
			<!-- Breadcrumb -->
			<nav class="mb-6">
				<ol class="flex items-center gap-2 text-sm flex-wrap">
					<li>
						<a href="/modules" class="text-gray-500 hover:text-gray-700">Modules</a>
					</li>
					<li class="text-gray-400">/</li>
					<li>
						<a href="/modules/{data.module.slug}" class="text-gray-500 hover:text-gray-700">{data.module.title}</a>
					</li>
					<li class="text-gray-400">/</li>
					<li class="text-gray-900 font-medium truncate">{data.lesson.title}</li>
				</ol>
			</nav>

			<!-- Video Player -->
			{#if data.lesson.video_url}
				<div class="rounded-xl overflow-hidden shadow-lg bg-black">
					<VideoPlayer 
						videoUrl={data.lesson.video_url}
						title={data.lesson.title}
					/>
				</div>
			{/if}

			<!-- Lesson content -->
			<div class="mt-8">
				<div class="flex items-start justify-between gap-4">
					<div>
						<h1 class="text-2xl font-bold text-gray-900 font-serif sm:text-3xl">
							{data.lesson.title}
						</h1>
						{#if data.lesson.duration_minutes}
							<p class="mt-2 text-sm text-gray-500">
								{data.lesson.duration_minutes} minutes
							</p>
						{/if}
					</div>

					<!-- Mark complete button -->
					{#if data.profile?.is_member}
						<div class="flex-shrink-0">
							{#if data.lesson.progress?.completed}
								<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
									<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
									</svg>
									Completed
								</span>
							{:else}
								<Button 
									variant="secondary" 
									size="sm" 
									onclick={markComplete}
									disabled={isCompleting}
								>
									{#snippet children()}
										{#if isCompleting}
											Saving...
										{:else}
											Mark Complete
										{/if}
									{/snippet}
								</Button>
							{/if}
						</div>
					{/if}
				</div>

				{#if data.lesson.description}
					<p class="mt-4 text-gray-600 text-lg">
						{data.lesson.description}
					</p>
				{/if}

				<!-- Lesson content (from Quill editor) -->
				{#if data.lesson.content}
					<div class="mt-8 prose prose-gray max-w-none prose-headings:font-serif">
						{@html data.lesson.content}
					</div>
				{/if}

				<!-- Resources -->
				{#if data.lesson.resources && data.lesson.resources.length > 0}
					<LessonResources resources={data.lesson.resources} />
				{/if}

				<!-- Navigation -->
				<div class="mt-12 pt-8 border-t border-gray-200">
					<div class="flex items-center justify-between">
						{#if prevLesson && canAccessLesson(prevLesson)}
							<a 
								href="/modules/{data.module.slug}/{prevLesson.slug}"
								class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600"
							>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
								</svg>
								<span>
									<span class="text-gray-400 block text-xs">Previous</span>
									{prevLesson.title}
								</span>
							</a>
						{:else}
							<div></div>
						{/if}

						{#if nextLesson && canAccessLesson(nextLesson)}
							<a 
								href="/modules/{data.module.slug}/{nextLesson.slug}"
								class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 text-right"
							>
								<span>
									<span class="text-gray-400 block text-xs">Next</span>
									{nextLesson.title}
								</span>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
								</svg>
							</a>
						{:else if !data.profile?.is_member && nextLesson}
							<a 
								href="/checkout"
								class="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-500"
							>
								<span>Unlock remaining lessons</span>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
								</svg>
							</a>
						{:else}
							<a 
								href="/modules/{data.module.slug}"
								class="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-500"
							>
								<span>Back to module</span>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
								</svg>
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
