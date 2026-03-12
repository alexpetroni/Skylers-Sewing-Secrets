<script lang="ts">
	const stitches = Array.from({ length: 12 }, (_, i) => ({
		delay: `${i * 0.15}s`,
		left: `${8 + i * 7.5}%`
	}));
</script>

<div class="min-h-[80vh] flex items-center justify-center px-4 py-16">
	<div class="max-w-lg w-full text-center">
		<!-- Logo -->
		<div class="mb-10">
			<img src="/logo/logo.png" alt="Skyler's Sewing Secrets" class="h-16 mx-auto" />
		</div>

		<!-- Animated stitch line -->
		<div class="relative h-4 mb-10 mx-8">
			{#each stitches as stitch}
				<span
					class="absolute top-1/2 -translate-y-1/2 w-4 h-0.5 bg-brand-400 rounded-full opacity-0 stitch-dash"
					style="left: {stitch.left}; animation-delay: {stitch.delay};"
				></span>
			{/each}
		</div>

		<!-- Message -->
		<h1 class="text-3xl sm:text-4xl font-serif text-charcoal-900 mb-4">
			Stitching Things Up
		</h1>

		<p class="text-lg text-charcoal-500 mb-3">
			We're making some updates behind the scenes to give you a better experience.
		</p>

		<p class="text-charcoal-400">
			Sorry for the inconvenience. We'll be back soon!
		</p>

		<!-- Decorative thread spool -->
		<div class="mt-12 flex justify-center">
			<svg class="w-12 h-12 text-brand-300 animate-spin-slow" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 4" />
				<circle cx="24" cy="24" r="10" stroke="currentColor" stroke-width="2" />
				<circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.3" />
			</svg>
		</div>
	</div>
</div>

<style>
	.stitch-dash {
		animation: stitch 2.4s ease-in-out infinite;
	}

	@keyframes stitch {
		0%, 100% { opacity: 0.15; transform: translateY(-50%) scaleX(0.6); }
		50% { opacity: 1; transform: translateY(-50%) scaleX(1); }
	}

	:global(.animate-spin-slow) {
		animation: spin 8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
