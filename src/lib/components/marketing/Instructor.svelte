<script lang="ts">
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
 </script>

<section class="bg-ivory-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-12 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
			<div class="lg:order-2">
				<div class="overflow-hidden rounded-2xl bg-ivory-100 lg:max-h-[45rem]">
					<OptimizedImage
						src="/images/portraits/portrait-2.jpg"
						alt="Skyler - Founder of Skyler's Sewing Secrets"
						width={600}
						sizes="(min-width: 1024px) 50vw, 100vw"
						class="w-full h-full object-cover object-top"
					/>
				</div>
			</div>
			<div class="lg:order-1">
				<p class="eyebrow">Meet Your Instructor</p>
				<h2 class="mt-2 section-heading">
					Skyler
				</h2>
				<p class="mt-4 text-xl italic text-charcoal-500">
					"Some things are only learned by watching hands work"
				</p>
				<p class="mt-6 body-lg">
					It all started very early—around the age of six—with a pair of scissors and a grandmother
					who had clients coming and going. Fabric quickly revealed itself as something full of
					possibilities. By sixteen, dresses were being made out of whatever was available: flags,
					curtains, drapery fabrics. If it could be stitched, it deserved a chance.
				</p>
				<p class="mt-4 body-lg">
					The craft was learned the old way, beside master tailors in fashion houses, where time
					mattered and the inside of the garment was treated with the same respect as the outside.
					From there, sewing became a passport: London, Paris, New York, Lisbon, Bali—catwalks,
					haute couture, bridal ateliers, made-to-measure salons, theatre productions, cabaret stages.
				</p>
				<p class="mt-4 body-lg">
					After more than forty years in the industry, the excitement hasn't faded. What matters most
					now is passing on the quiet knowledge that never makes it into textbooks—the small habits,
					the couture tricks, the patience that turns work into something truly finished. Skyler's
					Sewing Secrets exists for those who care about neatness, time, and the deep satisfaction
					of garments that are as beautiful on the inside as they are on the outside.
				</p>
				<p class="mt-6 text-sm font-semibold text-charcoal-900">
					Founder of Skyler's Sewing Secrets
				</p>
			</div>
		</div>
	</div>
</section>
