<script lang="ts">
	import { Button } from '$lib/components/ui';
</script>

<svelte:head>
	<title>Checkout Cancelled - Skyler's Sewing Secrets</title>
</svelte:head>

<div class="bg-ivory-50 py-24 sm:py-32">
	<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
		<div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-ivory-100">
			<svg class="h-12 w-12 text-charcoal-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</div>

		<h1 class="mt-8 page-title">
			Checkout Cancelled
		</h1>

		<p class="mt-4 body-lg">
			Your checkout was cancelled and you have not been charged. Your cart has been saved if you'd like to complete your purchase later.
		</p>

		<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/checkout">
				<Button size="lg">
					{#snippet children()}Try Again{/snippet}
				</Button>
			</a>

			<a href="/">
				<Button variant="secondary" size="lg">
					{#snippet children()}Return Home{/snippet}
				</Button>
			</a>
		</div>

		<p class="mt-8 meta">
			Having trouble? <a href="/contact" class="text-brand-600 hover:text-brand-500">Contact us</a> and we'll help you out.
		</p>
	</div>
</div>
