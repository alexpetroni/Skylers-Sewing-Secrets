<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { Input, Button, Alert } from '$lib/components/ui';
	import OAuthButtons from '$lib/components/auth/OAuthButtons.svelte';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	let promoCode = $state('');
	let isApplyingPromo = $state(false);

	function formatPrice(amountInPence: number): string {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP'
		}).format(amountInPence / 100);
	}
</script>

<svelte:head>
	<title>Enroll Now - Skyler's Sewing Secrets</title>
</svelte:head>

<div class="bg-gray-50 py-12 sm:py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-x-16">
			<!-- Left: Course info -->
			<div class="lg:pr-8">
				<h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
					Join Skyler's Sewing Secrets
				</h1>
				<p class="mt-4 text-lg text-gray-600">
					Get lifetime access to all modules, lessons, and resources. Learn professional sewing techniques from an expert.
				</p>

				<div class="mt-10">
					<h2 class="text-lg font-semibold text-gray-900">What's included:</h2>
					<ul class="mt-4 space-y-3">
						{#each [
							'7 comprehensive modules',
							'39 video lessons',
							'Downloadable resources & patterns',
							'Fabric library reference',
							'Progress tracking',
							'Lifetime access - no subscription'
						] as feature}
							<li class="flex items-start">
								<svg class="h-6 w-5 flex-none text-brand-600" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
								</svg>
								<span class="ml-3 text-gray-600">{feature}</span>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Price display -->
				<div class="mt-10 rounded-lg bg-gray-100 p-6">
					<div class="flex items-baseline justify-between">
						<span class="text-lg font-medium text-gray-900">Lifetime Access</span>
						<div class="text-right">
							{#if data.appliedPromo}
								<p class="text-sm text-gray-500 line-through">{formatPrice(data.pricing.base_price)}</p>
								<p class="text-3xl font-bold text-gray-900">{formatPrice(data.finalPrice)}</p>
								<p class="text-sm text-green-600">
									{data.appliedPromo.discount_type === 'percentage' 
										? `${data.appliedPromo.discount_value}% off`
										: `${formatPrice(data.appliedPromo.discount_value)} off`}
								</p>
							{:else}
								<p class="text-3xl font-bold text-gray-900">{formatPrice(data.pricing.base_price)}</p>
							{/if}
						</div>
					</div>
					<p class="mt-2 text-sm text-gray-500">One-time payment, no recurring fees</p>
				</div>
			</div>

			<!-- Right: Checkout form -->
			<div class="mt-12 lg:mt-0">
				<div class="rounded-lg bg-white p-8 shadow-lg">
					{#if data.user}
						<!-- User is already logged in (probably via OAuth before payment) -->
						<div class="mb-6">
							<Alert variant="info">
								You're signed in as {data.user.email}. Complete your purchase below.
							</Alert>
						</div>
					{/if}

					{#if form?.error}
						<div class="mb-6">
							<Alert variant="error">{form.error}</Alert>
						</div>
					{/if}

					<form method="POST" action="?/checkout" use:enhance class="space-y-6">
						{#if !data.user}
							<h2 class="text-xl font-semibold text-gray-900">Create your account</h2>
							
							<Input
								label="Full name"
								name="fullName"
								type="text"
								autocomplete="name"
								required
								value={form?.fullName ?? ''}
								error={form?.errors?.fullName}
							/>

							<Input
								label="Email address"
								name="email"
								type="email"
								autocomplete="email"
								required
								value={form?.email ?? ''}
								error={form?.errors?.email}
							/>

							<Input
								label="Password"
								name="password"
								type="password"
								autocomplete="new-password"
								required
								hint="At least 8 characters"
								error={form?.errors?.password}
							/>

							<div class="relative">
								<div class="absolute inset-0 flex items-center">
									<div class="w-full border-t border-gray-200"></div>
								</div>
								<div class="relative flex justify-center text-sm font-medium">
									<span class="bg-white px-4 text-gray-500">Or sign up with</span>
								</div>
							</div>

							<OAuthButtons redirectTo="/checkout" action="sign-up" />

							<div class="relative">
								<div class="absolute inset-0 flex items-center">
									<div class="w-full border-t border-gray-200"></div>
								</div>
							</div>
						{/if}

						<!-- Promo code -->
						<div>
							<label for="promoCode" class="block text-sm font-medium text-gray-900">
								Promo code (optional)
							</label>
							<div class="mt-2 flex gap-2">
								<input
									type="text"
									name="promoCode"
									id="promoCode"
									bind:value={promoCode}
									class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm"
									placeholder="Enter code"
								>
								<button
									type="submit"
									formaction="?/applyPromo"
									class="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
								>
									Apply
								</button>
							</div>
							{#if form?.promoError}
								<p class="mt-2 text-sm text-red-600">{form.promoError}</p>
							{/if}
							{#if data.appliedPromo}
								<p class="mt-2 text-sm text-green-600">
									Code "{data.appliedPromo.code}" applied!
								</p>
							{/if}
						</div>

						<input type="hidden" name="promoCodeId" value={data.appliedPromo?.id ?? ''} />

						<Button type="submit" fullWidth size="lg">
							{#snippet children()}
								Continue to Payment - {formatPrice(data.finalPrice)}
							{/snippet}
						</Button>

						<p class="text-center text-xs text-gray-500">
							By enrolling, you agree to our 
							<a href="/legal/terms-and-conditions" class="underline">Terms & Conditions</a>
							and <a href="/legal/privacy" class="underline">Privacy Policy</a>.
						</p>
					</form>

					<p class="mt-6 text-center text-sm text-gray-500">
						Already a member? 
						<a href="/auth/sign-in" class="font-semibold text-brand-600 hover:text-brand-500">
							Sign in
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
