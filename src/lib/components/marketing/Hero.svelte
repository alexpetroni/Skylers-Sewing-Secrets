<script lang="ts">
	import { Button } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
</script>

<div class="relative bg-white">
	<div class="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
		<div class="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-48 lg:pt-40 xl:col-span-6">
			<div class="mx-auto max-w-2xl lg:mx-0">
				<div class="hidden sm:mb-8 sm:flex">
					<div class="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
						New: Bonus Chanel Skirt Tutorial 
						<a href="/modules" class="font-semibold text-brand-600">
							<span class="absolute inset-0" aria-hidden="true"></span>
							View modules <span aria-hidden="true">&rarr;</span>
						</a>
					</div>
				</div>
				<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-serif">
					Turn your handmade garments into professional-quality masterpieces
				</h1>
				<p class="mt-6 text-lg leading-8 text-gray-600">
					Learn techniques used by professionals. Enhance the durability and beauty of your garments. 
					Suitable for all skill levels.
				</p>
				<div class="mt-10 flex items-center gap-x-6">
					<a href="/checkout">
						<Button size="lg">
							{#snippet children()}
								Enroll Now - Lifetime Access
							{/snippet}
						</Button>
					</a>
					<a href="/modules" class="text-sm font-semibold leading-6 text-gray-900">
						Browse Modules <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</div>
		<div class="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
			<OptimizedImage
				class="aspect-[3/2] w-full bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
				src="/images/hero-sewing.jpg"
				alt="Professional sewing workspace with fabric and tools"
				width={1200}
			/>
		</div>
	</div>
</div>
