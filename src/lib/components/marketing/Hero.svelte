<script lang="ts">
	import { Button } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
	import { onMount } from 'svelte';

	const slides = [
		{ src: '/images/collage/pintuck.jpg', alt: 'Pintuck sewing technique' },
		{ src: '/images/collage/gathering.jpg', alt: 'Gathering technique' },
		{ src: '/images/collage/shapes.jpg', alt: 'Pattern shapes' },
		{ src: '/images/collage/bias-tape.jpg', alt: 'Bias tape technique' },
		{ src: '/images/collage/skirt-inside.jpg', alt: 'Inside of Chanel skirt' },
		{ src: '/images/collage/pintuck2.jpg', alt: 'Pintuck detail' }
	];

	let currentSlide = $state(0);
	let interval: ReturnType<typeof setInterval>;

	onMount(() => {
		interval = setInterval(() => {
			currentSlide = (currentSlide + 1) % slides.length;
		}, 4000);

		return () => clearInterval(interval);
	});

	function goToSlide(index: number) {
		currentSlide = index;
		resetInterval();
	}

	function nextSlide() {
		currentSlide = (currentSlide + 1) % slides.length;
		resetInterval();
	}

	function prevSlide() {
		currentSlide = (currentSlide - 1 + slides.length) % slides.length;
		resetInterval();
	}

	function resetInterval() {
		clearInterval(interval);
		interval = setInterval(() => {
			currentSlide = (currentSlide + 1) % slides.length;
		}, 4000);
	}
</script>

<div class="relative bg-cream-50">
	<div class="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
		<div class="px-6 pb-24 pt-16 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-48 lg:pt-44 xl:col-span-6">
			<div class="mx-auto max-w-2xl lg:mx-0">
				<div class="hidden sm:mb-10 sm:flex">
					<div class="relative rounded-full px-4 py-1.5 text-sm leading-6 text-charcoal-600 ring-1 ring-charcoal-200 hover:ring-brand-300 transition-colors">
						New: Bonus Chanel Skirt Tutorial
						<a href="/modules" class="font-medium text-brand-600 ml-1">
							<span class="absolute inset-0" aria-hidden="true"></span>
							View modules <span aria-hidden="true">&rarr;</span>
						</a>
					</div>
				</div>
				<h1 class="text-4xl font-bold tracking-tight text-charcoal-900 sm:text-5xl lg:text-6xl font-serif leading-tight">
					Turn your handmade garments into professional-quality masterpieces
				</h1>
				<p class="mt-8 text-lg leading-relaxed text-charcoal-600">
					Learn techniques used by professionals. Enhance the durability and beauty of your garments.
					Suitable for all skill levels.
				</p>
				<div class="mt-12 flex items-center gap-x-6">
					<a href="/checkout">
						<Button size="lg">
							{#snippet children()}
								Enroll Now - Lifetime Access
							{/snippet}
						</Button>
					</a>
					<a href="/modules" class="text-sm font-medium text-charcoal-700 hover:text-brand-600 transition-colors">
						Browse Modules <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</div>
		<div class="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0 flex items-center">
			<div class="relative h-60 sm:h-72 lg:h-96 w-full overflow-hidden rounded-2xl m-4 lg:m-6">
				{#each slides as slide, index}
					<div
						class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
						class:opacity-100={currentSlide === index}
						class:opacity-0={currentSlide !== index}
					>
						<OptimizedImage
							class="w-full h-full object-cover"
							src={slide.src}
							alt={slide.alt}
							width={1200}
						/>
					</div>
				{/each}

				<!-- Previous button -->
				<button
					type="button"
					onclick={prevSlide}
					class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
					aria-label="Previous slide"
				>
					<svg class="w-5 h-5 text-charcoal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>

				<!-- Next button -->
				<button
					type="button"
					onclick={nextSlide}
					class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
					aria-label="Next slide"
				>
					<svg class="w-5 h-5 text-charcoal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>

				<!-- Slide indicators -->
				<div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
					{#each slides as _, index}
						<button
							type="button"
							onclick={() => goToSlide(index)}
							class="w-2 h-2 rounded-full transition-all duration-300 {currentSlide === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'}"
							aria-label="Go to slide {index + 1}"
						></button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
