<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Badge } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog - Skyler's Sewing Secrets</title>
	<meta name="description" content="Sewing tips, tutorials, and inspiration from Skyler. Learn new techniques and stay updated with the latest in the sewing world." />
</svelte:head>

<div class="bg-white">
	<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">
				Sewing Blog
			</h1>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Tips, tutorials, and inspiration to help you on your sewing journey.
			</p>
		</div>

		{#if data.posts.length > 0}
			<div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
				{#each data.posts as post}
					<article class="flex flex-col items-start">
						<a href="/blog/{post.slug}" class="block w-full">
							{#if post.featured_image_url}
								<div class="relative w-full">
									<OptimizedImage
										src={post.featured_image_url}
										alt={post.title}
										width={600}
										class="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
									/>
								</div>
							{:else}
								<div class="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 sm:aspect-[2/1] lg:aspect-[3/2]"></div>
							{/if}
						</a>
						<div class="max-w-xl">
							<div class="mt-8 flex items-center gap-x-4 text-xs">
								<time datetime={post.published_at || post.created_at} class="text-gray-500">
									{formatDate(post.published_at || post.created_at)}
								</time>
							</div>
							<div class="group relative">
								<h3 class="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600 font-serif">
									<a href="/blog/{post.slug}">
										<span class="absolute inset-0"></span>
										{post.title}
									</a>
								</h3>
								{#if post.excerpt}
									<p class="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{post.excerpt}</p>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="mx-auto mt-16 max-w-2xl text-center">
				<div class="rounded-2xl bg-gray-50 p-12">
					<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
					</svg>
					<h3 class="mt-4 text-lg font-semibold text-gray-900">No posts yet</h3>
					<p class="mt-2 text-gray-600">
						Check back soon for sewing tips, tutorials, and inspiration!
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
