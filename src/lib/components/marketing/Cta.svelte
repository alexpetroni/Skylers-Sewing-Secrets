<script lang="ts">
	import { Button } from '$lib/components/ui';
</script>

<section class="bg-brand-600">
	<div class="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl font-serif">
				Start Learning Today!
			</h2>
			<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-brand-100">
				Lifetime membership for just £149, one-time payment. 
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
