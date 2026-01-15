<script lang="ts">
	import type { Module } from '$lib/types';
	import { Card, Badge } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	interface Props {
		modules: Module[];
	}

	let { modules }: Props = $props();
</script>

<section class="bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<h2 class="text-base font-semibold leading-7 text-brand-600">Modules Content Overview</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
				{modules.length} Modules
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Designed to complete each other in order to create a seamless experience,
				you'll master the skills while unlocking your inner artist,
				because here, sewing truly becomes art.
			</p>
		</div>

		<div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
			{#each modules as module, index}
				<Card class="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
					{#snippet children()}
						{#if module.thumbnail_url}
							<div class="aspect-video w-full overflow-hidden">
								<OptimizedImage
									src={module.thumbnail_url}
									alt={module.title}
									width={400}
									class="h-full w-full object-cover"
								/>
							</div>
						{:else}
							<div class="aspect-video w-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
								<span class="text-4xl font-bold text-brand-600">{index + 1}</span>
							</div>
						{/if}
						<div class="p-6">
							<div class="flex items-center gap-2 mb-3">
								<Badge variant={module.is_bonus ? 'yellow' : 'brand'}>
									{#snippet children()}
										{module.is_bonus ? 'Bonus' : `Module ${index + 1}`}
									{/snippet}
								</Badge>
							</div>
							<h3 class="text-lg font-semibold text-gray-900 font-serif">
								{module.title}
							</h3>
							{#if module.description}
								<p class="mt-2 text-sm text-gray-600 line-clamp-2">
									{module.description}
								</p>
							{/if}
						</div>
					{/snippet}
				</Card>
			{/each}
		</div>

		<div class="mt-12 text-center">
			<a
				href="/modules"
				class="text-sm font-semibold leading-6 text-brand-600 hover:text-brand-500"
			>
				View all modules and lessons <span aria-hidden="true">→</span>
			</a>
		</div>
	</div>
</section>
