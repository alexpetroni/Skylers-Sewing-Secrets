<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Badge, Button } from '$lib/components/ui';
	import ProgressBar from '$lib/components/course/ProgressBar.svelte';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const completedCount = $derived(
		data.module.lessons.filter(l => l.progress?.completed).length
	);
	const totalCount = $derived(data.module.lessons.length);
	const progressPercent = $derived(
		totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
	);

	function formatDuration(minutes: number | null): string {
		if (!minutes) return '';
		if (minutes < 60) return `${minutes} min`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	function canAccessLesson(lesson: typeof data.module.lessons[0]): boolean {
		return data.profile?.is_member || lesson.is_free_preview;
	}
</script>

<svelte:head>
	<title>{data.module.title} - Skyler's Sewing Secrets</title>
	<meta name="description" content={data.module.description || `Learn ${data.module.title} with Skyler's professional sewing techniques.`} />
	<meta property="og:title" content={`${data.module.title} - Skyler's Sewing Secrets`} />
	<meta property="og:description" content={data.module.description || `Learn ${data.module.title} with Skyler's professional sewing techniques.`} />
	<meta property="og:image" content={data.module.thumbnail_url || 'https://skyler-storage.b-cdn.net/images/portraits/portrait-1.jpg'} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`https://skylersewingsecrets.com/modules/${data.module.slug}`} />
</svelte:head>

<div class="bg-ivory-50">
	<!-- Header -->
	<div class="bg-gradient-to-b from-brand-50 to-ivory-50">
		<div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
			<!-- Breadcrumb -->
			<nav class="mb-8">
				<ol class="flex items-center gap-2 text-sm">
					<li>
						<a href="/modules" class="text-charcoal-500 hover:text-charcoal-700">Modules</a>
					</li>
					<li class="text-charcoal-400">/</li>
					<li class="text-charcoal-900 font-medium">{data.module.title}</li>
				</ol>
			</nav>

			<div class="lg:flex lg:items-start lg:gap-12">
				<!-- Module Info -->
				<div class="lg:flex-1">
					<div class="flex items-center gap-3 mb-4">
						<Badge variant={data.module.is_bonus ? 'warning' : 'secondary'}>
							{#snippet children()}
								{data.module.is_bonus ? 'Bonus Module' : `Module ${data.module.order_index}`}
							{/snippet}
						</Badge>
						<span class="text-sm text-charcoal-500">
							{totalCount} tutorials
						</span>
					</div>
					
					<h1 class="text-3xl font-bold text-charcoal-900 sm:text-4xl font-serif">
						{data.module.title}
					</h1>
					
					{#if data.module.description}
						<p class="mt-4 text-lg text-charcoal-600">
							{data.module.description}
						</p>
					{/if}

					<!-- Progress for members -->
					{#if data.profile?.is_member && totalCount > 0}
						<div class="mt-6">
							<ProgressBar 
								value={progressPercent}
								size="md"
								showPercentage
								label="{completedCount} of {totalCount} tutorials completed"
							/>
						</div>
					{/if}
				</div>

				<!-- Thumbnail -->
				{#if data.module.thumbnail_url}
					<div class="mt-8 lg:mt-0 lg:w-80 lg:flex-shrink-0">
						<OptimizedImage
							src={data.module.thumbnail_url}
							alt={data.module.title}
							class="w-full rounded-xl shadow-lg"
							width={800}
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Lessons List -->
	<div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
		<h2 class="text-xl font-semibold text-charcoal-900 mb-6">Lessons</h2>
		
		<div class="space-y-4">
			{#each data.module.lessons as lesson, index}
				{@const accessible = canAccessLesson(lesson)}
				<a 
					href={accessible ? `/modules/${data.module.slug}/${lesson.slug}` : '#'}
					class="block group"
					class:pointer-events-none={!accessible}
				>
					<Card class="overflow-hidden transition-all duration-200 {accessible ? 'hover:shadow-md hover:ring-2 hover:ring-brand-500' : 'opacity-75'}">
						{#snippet children()}
							<div class="flex items-center p-4 sm:p-6">
								<!-- Lesson Number / Status -->
								<div class="flex-shrink-0 mr-4">
									{#if lesson.progress?.completed}
										<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
											<svg class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
											</svg>
										</div>
									{:else if accessible}
										<div class="flex h-10 w-10 items-center justify-center rounded-full bg-ivory-100 group-hover:bg-brand-100 transition-colors">
											<span class="text-sm font-medium text-charcoal-600 group-hover:text-brand-600">{index + 1}</span>
										</div>
									{:else}
										<div class="flex h-10 w-10 items-center justify-center rounded-full bg-ivory-100">
											<svg class="h-5 w-5 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
											</svg>
										</div>
									{/if}
								</div>

								<!-- Lesson Info -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<h3 class="text-base font-medium text-charcoal-900 truncate {accessible ? 'group-hover:text-brand-600' : ''}">
											{lesson.title}
										</h3>
										{#if lesson.is_free_preview && !data.profile?.is_member}
											<Badge variant="success" size="sm">
												{#snippet children()}
													Free Preview
												{/snippet}
											</Badge>
										{/if}
									</div>
									{#if lesson.description}
										<p class="mt-1 text-sm text-charcoal-500 line-clamp-1">
											{lesson.description}
										</p>
									{/if}
								</div>

								<!-- Duration & Arrow -->
								<div class="flex items-center gap-4 ml-4">
									{#if lesson.duration_minutes}
										<span class="text-sm text-charcoal-500 hidden sm:block">
											{formatDuration(lesson.duration_minutes)}
										</span>
									{/if}
									{#if accessible}
										<svg class="h-5 w-5 text-charcoal-400 group-hover:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
										</svg>
									{/if}
								</div>
							</div>
						{/snippet}
					</Card>
				</a>
			{/each}
		</div>

		<!-- CTA for non-members -->
		{#if !data.profile?.is_member}
			<div class="mt-12 rounded-2xl bg-ivory-50 p-8 text-center sm:p-12">
				<svg class="mx-auto h-12 w-12 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
				</svg>
				<h3 class="mt-4 text-lg font-semibold text-charcoal-900">Unlock all lessons</h3>
				<p class="mt-2 text-charcoal-600">
					Get lifetime access to this module and all other course content.
				</p>
				<div class="mt-6">
					<a href="/checkout">
						<Button>
							{#snippet children()}
								Enroll Now
							{/snippet}
						</Button>
					</a>
				</div>
			</div>
		{/if}

		<!-- Navigation -->
		<div class="mt-12 flex justify-between">
			<a href="/modules" class="text-sm font-medium text-brand-600 hover:text-brand-500">
				<span aria-hidden="true">←</span> All Modules
			</a>
		</div>
	</div>
</div>
