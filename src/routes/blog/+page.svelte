<script lang="ts">
	import type { PageData } from './$types';

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
	<meta property="og:title" content="Sewing Blog - Skyler's Sewing Secrets" />
	<meta property="og:description" content="Sewing tips, tutorials, and inspiration from Skyler. Learn new techniques and stay updated with the latest in the sewing world." />
	<meta property="og:image" content="https://skyler-storage.b-cdn.net/images/portraits/portrait-1.jpg" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://skylersewingsecrets.com/blog" />
</svelte:head>

<div class="bg-ivory-50">
	<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h1 class="page-title">
				Sewing Blog
			</h1>
			<p class="mt-4 body-lg">
				Tips, tutorials, and inspiration to help you on your sewing journey.
			</p>
		</div>

		{#if data.posts.length > 0}
			<div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
				{#each data.posts as post}
					<article class="flex flex-col items-start">
						<div class="max-w-xl">
							<div class="mt-8 flex items-center gap-x-4 text-xs">
								<time datetime={post.published_at || post.created_at} class="text-charcoal-500">
									{formatDate(post.published_at || post.created_at)}
								</time>
							</div>
							<div class="group relative">
								<h3 class="mt-3 card-title font-serif group-hover:text-charcoal-600">
									<a href="/blog/{post.slug}">
										<span class="absolute inset-0"></span>
										{post.title}
									</a>
								</h3>
								{#if post.excerpt}
									<p class="mt-4 line-clamp-3 meta">{post.excerpt}</p>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<div class="mx-auto mt-16 max-w-2xl text-center">
				<div class="rounded-2xl bg-ivory-50 p-12">
					<svg class="mx-auto h-12 w-12 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
					</svg>
					<h3 class="mt-4 card-title">No posts yet</h3>
					<p class="mt-2 body-base">
						Check back soon for sewing tips, tutorials, and inspiration!
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
