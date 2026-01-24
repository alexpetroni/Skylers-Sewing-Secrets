<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Badge, Button } from '$lib/components/ui';
	import ProgressBar from '$lib/components/course/ProgressBar.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function getLessonCount(module: typeof data.modules[0]): number {
		return module.lessons?.length ?? 0;
	}

	function getCompletedCount(module: typeof data.modules[0]): number {
		if (!module.lessons) return 0;
		return module.lessons.filter(l => l.progress?.completed).length;
	}

	function getProgress(module: typeof data.modules[0]): number {
		const total = getLessonCount(module);
		if (total === 0) return 0;
		return Math.round((getCompletedCount(module) / total) * 100);
	}

	function getTotalDuration(module: typeof data.modules[0]): string {
		if (!module.lessons) return '';
		const totalMinutes = module.lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
		if (totalMinutes < 60) return `${totalMinutes} min`;
		const hours = Math.floor(totalMinutes / 60);
		const mins = totalMinutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}
</script>

<svelte:head>
	<title>Tutorials - Skyler's Sewing Secrets</title>
	<meta name="description" content="Browse all {data.modules.length} modules in Skyler's Sewing Secrets. From basics to advanced couture techniques." />
	<meta property="og:title" content="Course Modules - Skyler's Sewing Secrets" />
	<meta property="og:description" content="Browse all {data.modules.length} modules in Skyler's Sewing Secrets. From basics to advanced couture techniques." />
	<meta property="og:image" content="https://skyler-storage.b-cdn.net/images/portraits/portrait-1.jpg" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://skylersewingsecrets.com/modules" />
</svelte:head>

<div class="bg-ivory-50">
	<!-- Header -->
	<div class="bg-gradient-to-b from-brand-50 to-ivory-50">
		<div class="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h1 class="page-title">
					Course Modules
				</h1>
				<p class="mt-4 body-lg">
					{data.modules.length} modules covering everything from essential basics to advanced couture techniques.
				</p>
				{#if !data.profile}
					<div class="mt-8">
						<a href="/checkout">
							<Button size="lg">
								{#snippet children()}
									Get Full Access
								{/snippet}
							</Button>
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Modules List -->
	<div class="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
		<div class="space-y-8">
			{#each data.modules as module, index}
				<a href="/modules/{module.slug}" class="block group">
					<Card class="overflow-hidden hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-brand-500">
						{#snippet children()}
							<div class="flex items-center">
								<!-- Content -->
								<div class="flex-1 p-6">
									<div class="flex items-center gap-3 mb-3">
										<Badge variant={module.is_bonus ? 'warning' : 'secondary'}>
											{#snippet children()}
												{module.is_bonus ? 'Bonus' : `Module ${index + 1}`}
											{/snippet}
										</Badge>
										{#if getLessonCount(module) > 0}
											<span class="text-sm text-charcoal-500">
												{getLessonCount(module)} tutorials
											</span>
										{/if}
										{#if getTotalDuration(module)}
											<span class="text-sm text-charcoal-500">
												• {getTotalDuration(module)}
											</span>
										{/if}
									</div>
									
									<h2 class="subsection-heading font-serif group-hover:text-brand-600 transition-colors">
										{module.title}
									</h2>

									{#if module.description}
										<p class="mt-2 body-base line-clamp-2">
											{module.description}
										</p>
									{/if}

									<!-- Progress bar for members -->
									{#if data.profile?.is_member && getLessonCount(module) > 0}
										<div class="mt-4">
											<ProgressBar 
												value={getProgress(module)} 
												label="{getCompletedCount(module)} of {getLessonCount(module)} completed"
											/>
										</div>
									{/if}

									<!-- Tutorial preview for non-members -->
									{#if !data.profile?.is_member && module.lessons?.some(l => l.is_free_preview)}
										<div class="mt-4">
											<span class="inline-flex items-center text-sm text-brand-600">
												<svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
													<path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
												</svg>
												Free preview available
											</span>
										</div>
									{/if}
								</div>

								<!-- Arrow -->
								<div class="flex items-center pr-6">
									<svg class="h-6 w-6 text-charcoal-400 group-hover:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
									</svg>
								</div>
							</div>
						{/snippet}
					</Card>
				</a>
			{/each}
		</div>

		<!-- CTA for non-members -->
		{#if !data.profile?.is_member}
			<div class="mt-16 rounded-2xl bg-brand-600 p-8 text-center sm:p-12">
				<h2 class="section-heading text-white">Ready to start learning?</h2>
				<p class="mt-4 text-brand-100">
					Get lifetime access to all {data.modules.length} modules and {data.modules.reduce((sum, m) => sum + getLessonCount(m), 0)} tutorials.
				</p>
				<div class="mt-6">
					<a href="/checkout">
						<Button variant="secondary" size="lg">
							{#snippet children()}
								Enroll Now
							{/snippet}
						</Button>
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
