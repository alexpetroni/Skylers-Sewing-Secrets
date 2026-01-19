<script lang="ts">
	import type { PricingConfig } from '$lib/types';
	import { Button } from '$lib/components/ui';

	interface Props {
		pricing: PricingConfig | null;
	}

	let { pricing }: Props = $props();

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

	const includedFeatures = [
		'39 tutorials',
		'Downloadable video tutorials and slides',
		'Watch on any device',
		'7 structured modules',
		'Bonus Chanel inspired Skirt video tutorial',
		'Learn at your own pace'
	];
</script>

<section class="bg-white py-24 sm:py-32" id="pricing">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl sm:text-center">
			<h2 class="text-base font-semibold leading-7 text-brand-600">One-Time Payment</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
				Invest in your sewing journey
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Get complete access to the entire course with a single payment. No subscriptions, no hidden fees.
			</p>
		</div>

		<div class="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
			<div class="p-8 sm:p-10 lg:flex-auto">
				<h3 class="text-2xl font-bold tracking-tight text-gray-900 font-serif">Complete Course Access</h3>
				<p class="mt-6 text-base leading-7 text-gray-600">
					Master professional sewing techniques with Skyler's comprehensive video course. 
					Perfect for beginners and intermediate sewists looking to elevate their skills.
				</p>
				<div class="mt-10 flex items-center gap-x-4">
					<h4 class="flex-none text-sm font-semibold leading-6 text-brand-600">What's included</h4>
					<div class="h-px flex-auto bg-gray-100"></div>
				</div>
				<ul class="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
					{#each includedFeatures as feature}
						<li class="flex gap-x-3">
							<svg class="h-6 w-5 flex-none text-brand-600" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
							</svg>
							{feature}
						</li>
					{/each}
				</ul>
			</div>
			<div class="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
				<div class="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
					<div class="mx-auto max-w-xs px-8">
						<p class="text-base font-semibold text-gray-600">Pay once, own it forever</p>
						<p class="mt-6 flex items-baseline justify-center gap-x-2">
							<span class="text-5xl font-bold tracking-tight text-gray-900">
								{formatPrice(price, currency)}
							</span>
						</p>
						<a href="/checkout" class="mt-10 block">
							<Button size="lg" class="w-full">
								{#snippet children()}
									Get Lifetime Access
								{/snippet}
							</Button>
						</a>
						<p class="mt-6 text-xs leading-5 text-gray-600">
							Secure payment via Stripe. Have a promo code? Apply it at checkout.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
