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
</svelte:head>

<div class="bg-gray-50 min-h-screen">
	<div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 font-serif">Welcome back, {data.user.full_name || 'Sewist'}!</h1>
			<p class="mt-2 text-gray-600">Continue your sewing journey where you left off.</p>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
			<Card>
				{#snippet children()}
					<div class="p-6">
						<div class="text-sm font-medium text-gray-500">Lessons Completed</div>
						<div class="mt-2 flex items-baseline gap-2">
							<span class="text-3xl font-bold text-gray-900">{data.stats.completedLessons}</span>
							<span class="text-sm text-gray-500">/ {data.stats.totalLessons}</span>
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
						<div class="text-sm font-medium text-gray-500">Modules Progress</div>
						<div class="mt-2 flex items-baseline gap-2">
							<span class="text-3xl font-bold text-gray-900">{data.stats.completedModules}</span>
							<span class="text-sm text-gray-500">/ {data.stats.totalModules} completed</span>
						</div>
					</div>
				{/snippet}
			</Card>

			<Card>
				{#snippet children()}
					<div class="p-6">
						<div class="text-sm font-medium text-gray-500">Time Invested</div>
						<div class="mt-2">
							<span class="text-3xl font-bold text-gray-900">
								{formatDuration(data.stats.totalMinutesWatched)}
							</span>
						</div>
					</div>
				{/snippet}
			</Card>

			<Card>
				{#snippet children()}
					<div class="p-6">
						<div class="text-sm font-medium text-gray-500">Member Since</div>
						<div class="mt-2">
							<span class="text-3xl font-bold text-gray-900">
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
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
				
				{#if data.continueWatching.length > 0}
					<div class="space-y-4">
						{#each data.continueWatching as item}
							<a href="/modules/{item.module.slug}/{item.lesson.slug}" class="block group">
								<Card class="overflow-hidden hover:shadow-md transition-shadow">
									{#snippet children()}
										<div class="flex">
											{#if item.lesson.thumbnail_url || item.module.thumbnail_url}
												<div class="w-32 sm:w-48 flex-shrink-0">
													<img 
														src={item.lesson.thumbnail_url || item.module.thumbnail_url}
														alt={item.lesson.title}
														class="h-full w-full object-cover"
													>
												</div>
											{:else}
												<div class="w-32 sm:w-48 flex-shrink-0 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
													<svg class="h-10 w-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
														<path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
													</svg>
												</div>
											{/if}
											<div class="flex-1 p-4">
												<div class="text-xs text-gray-500 mb-1">{item.module.title}</div>
												<h3 class="font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
													{item.lesson.title}
												</h3>
												{#if item.lesson.duration_minutes}
													<p class="mt-1 text-sm text-gray-500">
														{formatDuration(item.lesson.duration_minutes)}
													</p>
												{/if}
											</div>
											<div class="flex items-center pr-4">
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
								<h3 class="mt-4 text-lg font-semibold text-gray-900">Congratulations!</h3>
								<p class="mt-2 text-gray-600">You've completed all lessons in the course.</p>
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
								<h3 class="mt-4 text-lg font-semibold text-gray-900">Start Learning</h3>
								<p class="mt-2 text-gray-600">Begin your sewing journey with Module 1.</p>
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
				<h2 class="text-xl font-semibold text-gray-900 mb-4">Recently Completed</h2>
				
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
													<p class="text-sm font-medium text-gray-900 truncate">
														{item.lesson.title}
													</p>
													<p class="text-xs text-gray-500 mt-0.5">
														{item.module.title}
													</p>
												</div>
												{#if item.completedAt}
													<span class="text-xs text-gray-400">
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
							<div class="p-6 text-center text-sm text-gray-500">
								No completed lessons yet.
							</div>
						{/snippet}
					</Card>
				{/if}

				<!-- Quick Links -->
				<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">Quick Links</h2>
				<Card>
					{#snippet children()}
						<nav class="divide-y divide-gray-100">
							<a href="/modules" class="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
								<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
								</svg>
								<span class="text-sm font-medium text-gray-700">All Modules</span>
							</a>
							<a href="/fabric-library" class="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
								<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
								</svg>
								<span class="text-sm font-medium text-gray-700">Fabric Library</span>
							</a>
							<a href="/faq" class="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
								<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
								</svg>
								<span class="text-sm font-medium text-gray-700">FAQ</span>
							</a>
							<a href="/contact" class="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
								<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
								</svg>
								<span class="text-sm font-medium text-gray-700">Contact Support</span>
							</a>
						</nav>
					{/snippet}
				</Card>
			</div>
		</div>
	</div>
</div>
