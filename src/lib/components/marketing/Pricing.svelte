<script lang="ts">
	import type { PricingConfig } from '$lib/types';
	import { Button } from '$lib/components/ui';
	import courseOverview from '$lib/data/course-overview';

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
		`${courseOverview.totals.modules + courseOverview.totals.bonus_modules} structured modules`,
		`${courseOverview.totals.videos} videos and ${courseOverview.totals.slides} slides tutorials`,
		`Over ${Math.floor(courseOverview.totals.minutes / 60)} hours of video content`,
		'Professional couture techniques',
		'From basics to advanced projects',
		'HD video streaming',
		'Watch on any device',
		'Lifetime access with future updates',
		'Bonus Chanel inspired Skirt video tutorial',
		'Learn at your own pace'
	];
</script>

<section class="bg-ivory-50 py-24 sm:py-32" id="pricing">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl sm:text-center">
			<p class="eyebrow">One-Time Payment</p>
			<h2 class="mt-2 section-heading">
				Invest in your sewing journey
			</h2>
			<p class="mt-4 body-lg">
				Get complete access to the entire course with a single payment.<br />
				No subscriptions, no hidden fees.
			</p>
		</div>

		<div class="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-charcoal-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
			<div class="p-8 sm:p-10 lg:flex-auto">
				<h3 class="section-heading">Complete Course Access</h3>
				<p class="mt-4 body-base">
					Master professional sewing techniques with Skyler's comprehensive video course.
					Elevate your craft with professional couture techniques—perfect for passionate hobbyists, fashion students, and professionals alike.
				</p>
				<div class="mt-10 flex items-center gap-x-4">
					<h4 class="flex-none text-sm font-semibold leading-6 text-brand-600">What's included</h4>
					<div class="h-px flex-auto bg-ivory-100"></div>
				</div>
				<ul class="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-charcoal-600 sm:grid-cols-2 sm:gap-6">
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
				<div class="rounded-2xl bg-ivory-50 py-10 text-center ring-1 ring-inset ring-charcoal-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
					<div class="mx-auto max-w-xs px-8">
						<p class="text-base font-semibold text-charcoal-600">Pay once, own it forever</p>
						<p class="mt-6 flex items-baseline justify-center gap-x-2">
							<span class="text-5xl font-bold tracking-tight text-charcoal-900">
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
						<p class="mt-6 text-xs leading-5 text-charcoal-600">
							Secure payment via Stripe. Have a promo code? Apply it at checkout.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
