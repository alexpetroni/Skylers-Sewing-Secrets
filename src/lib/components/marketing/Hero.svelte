<script lang="ts">
	import { Button } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
	import { onMount } from 'svelte';

	interface Slide {
		src: string;
		alt: string;
		videoUrl?: string;
		rotate?: number;
	}

	const slides: Slide[] = [
		{ src: '/images/collage/20260128_104658.jpg', alt: 'Professional sewing technique' },
		{ src: '/images/collage/20260128_110605.jpg', alt: 'Detailed stitching work' },
		{ src: '/images/collage/20260128_112048.jpg', alt: 'Couture sewing detail' },
		{ src: '/images/collage/20260128_112535.jpg', alt: 'Fabric finishing technique' },
		{ src: '/images/collage/20260128_113327.jpg', alt: 'Sewing craftsmanship' },
		{ src: '/images/collage/20260128_114358.jpg', alt: 'Garment construction' },
		{ src: '/images/collage/20260128_120116.jpg', alt: 'Sewing artistry' }
	];

	let currentSlide = $state(0);
	let interval: ReturnType<typeof setInterval>;
	let showVideoModal = $state(false);
	let currentVideoUrl = $state('');

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

	function handleSlideClick(slide: Slide) {
		if (slide.videoUrl) {
			currentVideoUrl = slide.videoUrl;
			showVideoModal = true;
			clearInterval(interval);
		}
	}

	function closeVideoModal() {
		showVideoModal = false;
		currentVideoUrl = '';
		resetInterval();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showVideoModal) {
			closeVideoModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative bg-ivory-50">
	<!-- Two-column layout: Text left, Carousel right -->
	<div class="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
			<!-- Welcome text section (left) -->
			<div class="order-2 lg:order-1">
				<h1 class="text-4xl font-bold tracking-tight text-charcoal-900 sm:text-5xl font-serif leading-tight">
					Welcome to Skyler's Sewing Secrets!
				</h1>
				<p class="mt-4 text-xl italic text-charcoal-500">
					Where craftsmanship, creativity and couture-level finishing come to life.
				</p>
				<p class="mt-6 text-lg leading-relaxed text-charcoal-600">
					Skyler's Sewing Secrets is more than just a sewing course—it's a place to slow down, focus on the art of how things are made, and fall in love with the details that turn ordinary garments into something extraordinary. Here you'll be guided through the same thoughtful techniques used in high-end ateliers, adapted for anyone with a domestic sewing machine and a passion to learn.
				</p>
				<p class="mt-4 text-lg leading-relaxed text-charcoal-600">
					You'll discover how powerful it feels to finish a seam beautifully, to shape a garment with intention, and to sew with the kind of care that shows both inside and out. This is your space to grow, to create, and to connect deeply with your craft.
				</p>
				<p class="mt-4 text-lg leading-relaxed text-charcoal-600">
					And by the end, you won't just be a better sewer—you'll be an artist of the finishings.
				</p>
				<div class="mt-10 flex items-center gap-x-6">
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

			<!-- Portrait carousel (right) -->
			<div class="order-1 lg:order-2 flex justify-center">
				<div class="relative aspect-[9/16] w-full max-w-xs sm:max-w-sm overflow-hidden rounded-2xl shadow-xl">
					{#each slides as slide, index}
						<button
							type="button"
							class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out border-0 p-0 bg-transparent {slide.videoUrl ? 'cursor-pointer' : 'cursor-default'}"
							class:opacity-100={currentSlide === index}
							class:opacity-0={currentSlide !== index}
							class:pointer-events-none={currentSlide !== index}
							onclick={() => handleSlideClick(slide)}
							aria-label={slide.videoUrl ? `Play video: ${slide.alt}` : slide.alt}
						>
							<OptimizedImage
								class="w-full h-full object-cover {slide.rotate ? `rotate-${slide.rotate}` : ''}"
								src={slide.src}
								alt={slide.alt}
								width={400}
								sizes="(max-width: 640px) 320px, 384px"
								loading={index === 0 ? 'eager' : 'lazy'}
							/>
							{#if slide.videoUrl}
								<div class="absolute inset-0 flex items-center justify-center">
									<div class="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all">
										<svg class="w-10 h-10 text-brand-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
											<path d="M8 5v14l11-7z" />
										</svg>
									</div>
								</div>
							{/if}
						</button>
					{/each}

					<!-- Previous button -->
					<button
						type="button"
						onclick={prevSlide}
						class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
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
						class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
						aria-label="Next slide"
					>
						<svg class="w-5 h-5 text-charcoal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>

					<!-- Slide indicators -->
					<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
						{#each slides as _, index}
							<button
								type="button"
								onclick={() => goToSlide(index)}
								class="w-2.5 h-2.5 rounded-full transition-all duration-300 {currentSlide === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'}"
								aria-label="Go to slide {index + 1}"
							></button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Video Modal -->
	{#if showVideoModal}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
			onclick={closeVideoModal}
		>
			<button
				type="button"
				class="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
				onclick={closeVideoModal}
				aria-label="Close video"
			>
				<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="relative w-full max-w-sm mx-4"
				onclick={(e) => e.stopPropagation()}
			>
				<video
					class="w-full rounded-lg shadow-2xl"
					src={currentVideoUrl}
					controls
					autoplay
					playsinline
				>
					<track kind="captions" />
				</video>
			</div>
		</div>
	{/if}
</div>
