<script lang="ts">
	import courseOverview from '$lib/data/course-overview';

	const modules = courseOverview.modules;
	const totals = courseOverview.totals;
</script>

<section class="bg-gray-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<h2 class="text-base font-semibold leading-7 text-brand-600">Modules Content Overview</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
				{modules.length} Modules containing {totals.videos} videos and {totals.slides} slides tutorials
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Each module builds upon the last to create a seamless learning experience.
				You'll master the skills while unlocking your inner artist, because here, sewing truly becomes art.
			</p>
		</div>
		<div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
			<dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
				{#each modules as module}
					<div class="relative flex flex-col bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
						<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg {module.is_bonus ? 'bg-yellow-500' : 'bg-brand-600'}">
								<span class="text-white font-bold text-sm">{module.is_bonus ? '★' : module.number}</span>
							</div>
							{#if module.is_bonus}
								{module.title}
							{:else}
								Module {module.number}: {module.title}
							{/if}
						</dt>
						<dd class="mt-4 flex flex-auto flex-col text-sm leading-6 text-gray-600">
							<p class="flex-auto text-gray-500 mb-3">{module.description}</p>
							<p class="text-xs font-semibold text-gray-400">
								{module.videos} videos • {module.minutes} min
								{#if module.tutorial_slides > 0}
									• {module.tutorial_slides} tutorial slides
								{/if}
							</p>
						</dd>
					</div>
				{/each}
			</dl>
		</div>
		<div class="mt-12 text-center">
			<a 
				href="/modules" 
				class="text-sm font-semibold leading-6 text-brand-600 hover:text-brand-500"
			>
				View all modules and lessons <span aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>
</section>
