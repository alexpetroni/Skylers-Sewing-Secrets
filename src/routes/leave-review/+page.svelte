<script lang="ts">
	import type { PageData } from './$types';
	import { Card, Button, Textarea, Input } from '$lib/components/ui';
	import { enhance } from '$app/forms';

	interface Props {
		data: PageData;
		form: {
			error?: string;
			content?: string;
			rating?: number;
			authorTitle?: string;
		} | null;
	}

	let { data, form }: Props = $props();

	let rating = $state(form?.rating ?? data.testimonial?.rating ?? 5);
	let content = $state(form?.content ?? data.testimonial?.content ?? '');
	let authorTitle = $state(form?.authorTitle ?? data.testimonial?.author_title ?? '');

	function setRating(value: number) {
		rating = value;
	}

	const characterCount = $derived(content.length);
	const isEditing = $derived(!!data.testimonial && !data.testimonial.is_published);
</script>

<svelte:head>
	<title>{isEditing ? 'Edit Review' : 'Leave a Review'} - Skyler's Sewing Secrets</title>
	<meta name="description" content="Share your experience with Skyler's Sewing Secrets. Your review helps other sewists discover our professional sewing tutorials." />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="bg-ivory-50 min-h-screen">
	<div class="mx-auto max-w-2xl px-6 py-12 lg:px-8">
		<div class="mb-8">
			<a href="/profile" class="meta font-medium text-brand-600 hover:text-brand-500">
				<span aria-hidden="true">←</span> Back to Profile
			</a>
			<h1 class="mt-4 page-title">
				{isEditing ? 'Edit Your Review' : 'Leave a Review'}
			</h1>
			<p class="mt-2 body-base">
				Share your experience with Skyler's Sewing Secrets. Your honest feedback helps other sewists!
			</p>
		</div>

		{#if data.testimonial?.is_published}
			<Card>
				{#snippet children()}
					<div class="p-6 text-center">
						<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
							<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
							</svg>
						</div>
						<h2 class="card-title">Review Published</h2>
						<p class="mt-2 body-base">
							Thank you! Your review has been published and is helping other sewists.
						</p>
						<div class="mt-6">
							<a href="/profile">
								<Button variant="secondary">
									{#snippet children()}Back to Profile{/snippet}
								</Button>
							</a>
						</div>
					</div>
				{/snippet}
			</Card>
		{:else}
			<Card>
				{#snippet children()}
					<form method="POST" action="?/submit" use:enhance class="p-6 space-y-6">
						{#if form?.error}
							<div class="rounded-md bg-red-50 p-4">
								<p class="text-sm text-red-800">{form.error}</p>
							</div>
						{/if}

						<!-- Rating -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">
								Your Rating <span class="text-red-500">*</span>
							</label>
							<div class="flex items-center gap-1">
								{#each [1, 2, 3, 4, 5] as star}
									<button
										type="button"
										onclick={() => setRating(star)}
										class="p-1 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
									>
										<svg
											class="h-8 w-8 transition-colors {star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									</button>
								{/each}
								<span class="ml-2 text-sm text-gray-500">
									{rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
								</span>
							</div>
							<input type="hidden" name="rating" value={rating} />
						</div>

						<!-- Review Content -->
						<div>
							<label for="content" class="block text-sm font-medium text-gray-700 mb-2">
								Your Review <span class="text-red-500">*</span>
							</label>
							<Textarea
								id="content"
								name="content"
								rows={5}
								bind:value={content}
								placeholder="Share your experience with the course. What did you learn? How has it helped your sewing?"
							/>
							<p class="mt-1 text-sm text-gray-500">
								{characterCount}/1000 characters (minimum 20)
							</p>
						</div>

						<!-- Author Title (optional) -->
						<Input
							label="Your Title (optional)"
							name="author_title"
							value={authorTitle}
							placeholder="e.g., Hobbyist Sewist, Fashion Designer, Quilter"
						/>

						<!-- Preview -->
						<div class="bg-gray-50 rounded-lg p-4">
							<p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Preview</p>
							<div class="flex items-start gap-3">
								<div class="flex-shrink-0">
									<div class="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
										<span class="text-brand-600 font-semibold">
											{(data.profile.full_name || 'M')[0].toUpperCase()}
										</span>
									</div>
								</div>
								<div>
									<p class="font-medium text-gray-900">{data.profile.full_name || 'Member'}</p>
									{#if authorTitle}
										<p class="text-sm text-gray-500">{authorTitle}</p>
									{/if}
									<div class="flex items-center gap-1 mt-1">
										{#each Array(5) as _, i}
											<svg
												class="h-4 w-4 {i < rating ? 'text-yellow-400' : 'text-gray-300'}"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
											</svg>
										{/each}
									</div>
									<p class="mt-2 text-sm text-gray-700">
										{content || 'Your review will appear here...'}
									</p>
								</div>
							</div>
						</div>

						<!-- Submit -->
						<div class="flex items-center justify-between pt-4 border-t border-gray-200">
							<p class="text-sm text-gray-500">
								Your review will be published after moderation.
							</p>
							<Button type="submit">
								{#snippet children()}
									{isEditing ? 'Update Review' : 'Submit Review'}
								{/snippet}
							</Button>
						</div>
					</form>
				{/snippet}
			</Card>
		{/if}
	</div>
</div>
