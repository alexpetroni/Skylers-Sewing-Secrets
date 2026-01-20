<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Welcome! - Skyler's Sewing Secrets</title>
</svelte:head>

<div class="bg-ivory-50 py-24 sm:py-32">
	<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
		<div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-green-100">
			<svg class="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
			</svg>
		</div>

		<h1 class="mt-8 page-title">
			Welcome to Skyler's Sewing Secrets!
		</h1>

		<p class="mt-4 body-lg">
			Thank you for your purchase! Your lifetime access has been activated. You now have full access to all modules, tutorials, and resources.
		</p>

		<div class="mt-10 space-y-4">
			<a href="/dashboard">
				<Button size="lg" fullWidth>
					{#snippet children()}Go to Your Dashboard{/snippet}
				</Button>
			</a>

			<a href="/modules">
				<Button variant="secondary" size="lg" fullWidth>
					{#snippet children()}Start Learning{/snippet}
				</Button>
			</a>
		</div>

		<div class="mt-12 rounded-lg bg-ivory-100 p-6 text-left">
			<h2 class="card-title">What's next?</h2>
			<ul class="mt-4 space-y-3 meta">
				<li class="flex gap-3">
					<span class="text-brand-600 font-semibold">1.</span>
					Check your email for your welcome message and login details
				</li>
				<li class="flex gap-3">
					<span class="text-brand-600 font-semibold">2.</span>
					Visit your dashboard to track your progress
				</li>
				<li class="flex gap-3">
					<span class="text-brand-600 font-semibold">3.</span>
					Start with Module 1: Basics to build a strong foundation
				</li>
				<li class="flex gap-3">
					<span class="text-brand-600 font-semibold">4.</span>
					Download the resources for each lesson as you progress
				</li>
			</ul>
		</div>

		<p class="mt-8 meta">
			A confirmation email has been sent to your email address. If you have any questions, please 
			<a href="/contact" class="text-brand-600 hover:text-brand-500">contact us</a>.
		</p>
	</div>
</div>
