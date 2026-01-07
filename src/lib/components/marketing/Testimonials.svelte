<script lang="ts">
	import type { Testimonial } from '$lib/types';
	import { Avatar } from '$lib/components/ui';

	interface Props {
		testimonials: Testimonial[];
	}

	let { testimonials }: Props = $props();

	function renderStars(rating: number | null): string[] {
		const count = rating ?? 5;
		return Array(count).fill('star');
	}
</script>

<section class="bg-gray-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<h2 class="text-base font-semibold leading-7 text-brand-600">Testimonials</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
				I have worked with amazing people
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Hear from students who have transformed their sewing skills with professional techniques.
			</p>
		</div>

		{#if testimonials.length > 0}
			<div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
				{#each testimonials as testimonial}
					<div class="flex flex-col justify-between bg-white p-8 shadow-sm ring-1 ring-gray-200 rounded-2xl">
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
								{#if testimonial.author_title}
									<p class="text-sm text-gray-500">{testimonial.author_title}</p>
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
	</div>
</section>
