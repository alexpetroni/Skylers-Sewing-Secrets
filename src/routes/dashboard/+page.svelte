<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Badge, Button } from '$lib/components/ui';
	import { ProgressBar } from '$lib/components/course';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function formatDuration(minutes: number): string {
		if (minutes < 60) return `${minutes} min`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<svelte:head>
	<title>My Dashboard - Skyler's Sewing Secrets</title>
	<meta name="description" content="Track your sewing course progress, continue learning, and access all your tutorials from your personal dashboard." />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="bg-ivory-50 min-h-screen">
	<div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="page-title">Welcome back, {data.user.full_name || 'Sewist'}!</h1>
			<p class="mt-2 body-base">Continue your sewing journey where you left off.</p>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
			<Card>
				{#snippet children()}
					<div class="p-6">
						<div class="text-sm font-medium text-charcoal-500">Tutorials Completed</div>
						<div class="mt-2 flex items-baseline gap-2">
							<span class="text-3xl font-bold text-charcoal-900">{data.stats.completedLessons}</span>
							<span class="text-sm text-charcoal-500">/ {data.stats.totalLessons}</span>
						</div>
						<ProgressBar 
							value={(data.stats.completedLessons / data.stats.totalLessons) * 100}
							class="mt-3"
						/>
					</div>
				{/snippet}
			</Card>

			<Card>
				{#snippet children()}
					<div class="p-6">
						<div class="text-sm font-medium text-charcoal-500">Modules Progress</div>
						<div class="mt-2 flex items-baseline gap-2">
							<span class="text-3xl font-bold text-charcoal-900">{data.stats.completedModules}</span>
							<span class="text-sm text-charcoal-500">/ {data.stats.totalModules} completed</span>
						</div>
					</div>
				{/snippet}
			</Card>

			<Card>
				{#snippet children()}
					<div class="p-6">
						<div class="text-sm font-medium text-charcoal-500">Time Invested</div>
						<div class="mt-2">
							<span class="text-3xl font-bold text-charcoal-900">
								{formatDuration(data.stats.totalMinutesWatched)}
							</span>
						</div>
					</div>
				{/snippet}
			</Card>

			<Card>
				{#snippet children()}
					<div class="p-6">
						<div class="text-sm font-medium text-charcoal-500">Member Since</div>
						<div class="mt-2">
							<span class="text-3xl font-bold text-charcoal-900">
								{data.user.member_since ? formatDate(data.user.member_since) : 'Today'}
							</span>
						</div>
					</div>
				{/snippet}
			</Card>
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Continue Learning -->
			<div class="lg:col-span-2">
				<h2 class="subsection-heading mb-4">Continue Learning</h2>
				
				{#if data.continueWatching.length > 0}
					<div class="space-y-4">
						{#each data.continueWatching as item}
							<a href="/modules/{item.module.slug}/{item.lesson.slug}" class="block group">
								<Card class="overflow-hidden hover:shadow-md transition-shadow">
									{#snippet children()}
										<div class="flex items-center p-4 sm:p-6">
											<div class="flex-1 min-w-0">
												<div class="text-xs text-charcoal-500 mb-1">{item.module.title}</div>
												<h3 class="text-lg font-semibold text-charcoal-900 group-hover:text-brand-600 transition-colors">
													{item.lesson.title}
												</h3>
												{#if item.lesson.description}
													<p class="mt-1 text-base text-charcoal-600 line-clamp-2">
														{item.lesson.description}
													</p>
												{/if}
												{#if item.lesson.duration_minutes}
													<p class="mt-2 text-sm text-charcoal-500">
														{formatDuration(item.lesson.duration_minutes)}
													</p>
												{/if}
											</div>
											<div class="flex items-center ml-4">
												<div class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 group-hover:bg-brand-600 transition-colors">
													<svg class="h-5 w-5 text-brand-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
														<path d="M8 5v14l11-7z" />
													</svg>
												</div>
											</div>
										</div>
									{/snippet}
								</Card>
							</a>
						{/each}
					</div>
				{:else if data.stats.completedLessons === data.stats.totalLessons}
					<Card>
						{#snippet children()}
							<div class="p-8 text-center">
								<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
									<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
									</svg>
								</div>
								<h3 class="mt-4 card-title">Congratulations!</h3>
								<p class="mt-2 body-base">You've completed all lessons in the course.</p>
							</div>
						{/snippet}
					</Card>
				{:else}
					<Card>
						{#snippet children()}
							<div class="p-8 text-center">
								<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
									<svg class="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
										<path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
									</svg>
								</div>
								<h3 class="mt-4 card-title">Start Learning</h3>
								<p class="mt-2 body-base">Begin your sewing journey with Module 1.</p>
								<div class="mt-4">
									<a href="/modules">
										<Button>
											{#snippet children()}
												Browse Modules
											{/snippet}
										</Button>
									</a>
								</div>
							</div>
						{/snippet}
					</Card>
				{/if}
			</div>

			<!-- Recently Completed -->
			<div>
				<h2 class="subsection-heading mb-4">Recently Completed</h2>
				
				{#if data.recentlyCompleted.length > 0}
					<Card>
						{#snippet children()}
							<ul class="divide-y divide-gray-100">
								{#each data.recentlyCompleted as item}
									<li class="p-4">
										<a href="/modules/{item.module.slug}/{item.lesson.slug}" class="hover:text-brand-600">
											<div class="flex items-start gap-3">
												<div class="flex-shrink-0 mt-0.5">
													<svg class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
														<path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
													</svg>
												</div>
												<div class="flex-1 min-w-0">
													<p class="text-sm font-medium text-charcoal-900 truncate">
														{item.lesson.title}
													</p>
													<p class="text-xs text-charcoal-500 mt-0.5">
														{item.module.title}
													</p>
												</div>
												{#if item.completedAt}
													<span class="text-xs text-charcoal-400">
														{formatDate(item.completedAt)}
													</span>
												{/if}
											</div>
										</a>
									</li>
								{/each}
							</ul>
						{/snippet}
					</Card>
				{:else}
					<Card>
						{#snippet children()}
							<div class="p-6 text-center text-sm text-charcoal-500">
								No completed lessons yet.
							</div>
						{/snippet}
					</Card>
				{/if}

				<!-- Modules -->
				<h2 class="subsection-heading mt-8 mb-4">Modules</h2>
				<Card>
					{#snippet children()}
						<ul class="divide-y divide-gray-100">
							{#each data.modules as module}
								<li>
									<a href="/modules/{module.slug}" class="flex items-center gap-3 p-4 hover:bg-ivory-50 transition-colors">
										{#if module.progress === 100}
											<div class="flex-shrink-0">
												<svg class="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
													<path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" />
												</svg>
											</div>
										{:else if module.progress > 0}
											<div class="flex-shrink-0 h-5 w-5 rounded-full border-2 border-brand-600 flex items-center justify-center">
												<span class="text-[8px] font-bold text-brand-600">{module.progress}</span>
											</div>
										{:else}
											<div class="flex-shrink-0 h-5 w-5 rounded-full border-2 border-gray-300"></div>
										{/if}
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium text-charcoal-900 truncate">{module.title}</p>
											<p class="text-xs text-charcoal-500">{module.completedCount}/{module.lessonCount} tutorials</p>
										</div>
										<svg class="h-4 w-4 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
										</svg>
									</a>
								</li>
							{/each}
						</ul>
					{/snippet}
				</Card>
			</div>
		</div>
	</div>
</div>
