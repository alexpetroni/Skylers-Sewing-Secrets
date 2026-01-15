<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui';
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
	<title>{data.post.title} - Skyler's Sewing Secrets Blog</title>
	<meta name="description" content={data.post.excerpt || `Read ${data.post.title} on Skyler's Sewing Secrets blog.`} />
	{#if data.post.featured_image_url}
		<meta property="og:image" content={data.post.featured_image_url} />
	{/if}
</svelte:head>

<article class="bg-white">
	<!-- Hero -->
	<div class="relative">
		{#if data.post.featured_image_url}
			<div class="aspect-[21/9] w-full overflow-hidden">
				<OptimizedImage
					src={data.post.featured_image_url}
					alt={data.post.title}
					width={1200}
					class="h-full w-full object-cover"
				/>
			</div>
		{:else}
			<div class="aspect-[21/9] w-full bg-gradient-to-br from-brand-100 to-brand-200"></div>
		{/if}
	</div>

	<!-- Content -->
	<div class="mx-auto max-w-3xl px-6 py-16 lg:px-8">
		<!-- Back link -->
		<div class="mb-8">
			<a href="/blog" class="text-sm font-medium text-brand-600 hover:text-brand-500">
				<span aria-hidden="true">←</span> Back to blog
			</a>
		</div>

		<!-- Header -->
		<header class="mb-12">
			<time datetime={data.post.published_at || data.post.created_at} class="text-sm text-gray-500">
				{formatDate(data.post.published_at || data.post.created_at)}
			</time>
			<h1 class="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">
				{data.post.title}
			</h1>
			{#if data.post.excerpt}
				<p class="mt-6 text-xl leading-8 text-gray-600">
					{data.post.excerpt}
				</p>
			{/if}
		</header>

		<!-- Body -->
		<div class="prose prose-lg prose-gray max-w-none prose-headings:font-serif prose-a:text-brand-600">
			{@html data.post.content}
		</div>

		<!-- CTA -->
		<div class="mt-16 rounded-2xl bg-gray-50 p-8 text-center sm:p-12">
			<h2 class="text-2xl font-bold text-gray-900 font-serif">Want to learn more?</h2>
			<p class="mt-4 text-gray-600">
				Get access to all my professional sewing tutorials with lifetime access.
			</p>
			<div class="mt-6">
				<a href="/checkout">
					<Button>
						{#snippet children()}
							Enroll in the Course
						{/snippet}
					</Button>
				</a>
			</div>
		</div>

		<!-- Author -->
		<div class="mt-16 flex items-center gap-4 border-t border-gray-200 pt-8">
			<OptimizedImage
				src="/images/skyler-avatar.jpg"
				alt="Skyler"
				width={48}
				class="h-12 w-12 rounded-full bg-gray-100 object-cover"
			/>
			<div>
				<p class="font-semibold text-gray-900">Skyler</p>
				<p class="text-sm text-gray-500">Professional Dressmaker & Educator</p>
			</div>
		</div>
	</div>
</article>
