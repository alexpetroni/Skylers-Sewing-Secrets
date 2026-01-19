<script lang="ts">
	import type { PricingConfig } from '$lib/types';
	import { Button } from '$lib/components/ui';

	interface Props {
		pricing?: PricingConfig | null;
	}

	let { pricing = null }: Props = $props();

	const defaultPrice = 14900;
	const priceInPence = $derived(pricing?.base_price ?? defaultPrice);
	const price = $derived(priceInPence / 100);
	const currency = $derived(pricing?.currency?.toUpperCase() ?? 'GBP');

	function formatPrice(amount: number, curr: string): string {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: curr,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}
</script>

<section class="bg-brand-600">
	<div class="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl font-serif">
				Start Learning Today!
			</h2>
			<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-brand-100">
				Lifetime membership for just {formatPrice(price, currency)}, one-time payment.
				No hidden fees, no recurring payments.
			</p>
			<div class="mt-10 flex items-center justify-center gap-x-6">
				<a href="/checkout">
					<Button variant="secondary" size="lg">
						{#snippet children()}
							Get Started
						{/snippet}
					</Button>
				</a>
				<a href="/modules" class="text-sm font-semibold leading-6 text-white">
					Browse Modules <span aria-hidden="true">→</span>
				</a>
			</div>
		</div>
	</div>
</section>
