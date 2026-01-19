<script lang="ts">
	import type { PageData } from './$types';
	import { Avatar } from '$lib/components/ui';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function renderStars(rating: number | null): number[] {
		const count = rating ?? 5;
		return Array(count).fill(0);
	}
</script>

<svelte:head>
	<title>Testimonials - Skyler's Sewing Secrets</title>
	<meta name="description" content="Read what students say about Skyler's Sewing Secrets. Real reviews from sewists who have transformed their skills with professional techniques." />
</svelte:head>

<div class="bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<h1 class="text-base font-semibold leading-7 text-brand-600">Testimonials</h1>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
				What Our Students Say
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Hear from students around the world who have transformed their sewing skills with professional techniques taught by Skyler.
			</p>
		</div>

		{#if data.testimonials.length > 0}
			<div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
				{#each data.testimonials as testimonial}
					<div class="flex flex-col justify-between bg-gray-50 p-8 shadow-sm ring-1 ring-gray-200 rounded-2xl">
						<div>
							{#if testimonial.rating}
								<div class="flex gap-1 mb-4">
									{#each renderStars(testimonial.rating) as _}
										<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
											<path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clip-rule="evenodd" />
										</svg>
									{/each}
								</div>
							{/if}
							<blockquote class="text-gray-700 leading-relaxed">
								"{testimonial.content}"
							</blockquote>
						</div>
						<div class="mt-6 flex items-center gap-4">
							<Avatar
								src={testimonial.author_avatar_url}
								alt={testimonial.author_name}
								size="md"
							/>
							<div>
								<p class="font-semibold text-gray-900">{testimonial.author_name}</p>
								{#if testimonial.author_title || testimonial.country}
									<p class="text-sm text-gray-500">
										{testimonial.author_title}{#if testimonial.author_title && testimonial.country}, {/if}{testimonial.country ?? ''}
									</p>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="mx-auto mt-16 max-w-2xl text-center">
				<p class="text-gray-500">Testimonials coming soon...</p>
			</div>
		{/if}

		<!-- CTA Section -->
		<div class="mx-auto mt-20 max-w-2xl text-center">
			<h2 class="text-2xl font-bold tracking-tight text-gray-900 font-serif">Ready to Transform Your Sewing?</h2>
			<p class="mt-4 text-lg text-gray-600">
				Join hundreds of students who have elevated their sewing skills with professional techniques.
			</p>
			<div class="mt-8 flex items-center justify-center gap-x-6">
				<a
					href="/checkout"
					class="rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
				>
					Enroll Now
				</a>
				<a href="/modules" class="text-base font-semibold leading-6 text-gray-900 hover:text-brand-600 transition-colors">
					View Modules <span aria-hidden="true">→</span>
				</a>
			</div>
		</div>
	</div>
</div>
