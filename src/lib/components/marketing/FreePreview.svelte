<script lang="ts">
	const previews = [
		{
			title: 'Dolore fugiat et aliqua. Sit magna quis minim anim duis quis esse cillum eiusmod commodo.',
			description: 'Aliquip qui minim velit eu fugiat dolore reprehenderit sit pariatur est ut duis adipisicing. Culpa sunt dolor labore tempor voluptate sunt esse officia officia id. Quis mollit commodo cillum ad nisi aute dolore. Ea sunt ea incididunt minim id. Velit nostrud occaecat officia ad exercitation cupidatat ullamco. Sit sunt id enim ipsum. Velit aute amet dolore Lorem elit esse anim adipisicing do do aute. Est deserunt fugiat ullamco tempor nisi qui quis amet laborum magna minim consectetur consequat nisi Lorem. Occaecat voluptate ullamco anim enim incididunt minim. Excepteur sunt reprehenderit laborum cupidatat cupidatat aliquip ad deserunt. In minim adipisicing laborum.',
			videoUrl: 'https://www.youtube.com/embed/czM2ulE1mEI?si=PnLM8-FB4Hr66_Rx'
		},
		{
			title: 'Nulla labore reprehenderit esse velit eiusmod quis officia. Esse nostrud nisi quis consequat qui aute eiusmod.',
			description: 'Excepteur sunt nulla consequat fugiat. Nisi et nostrud culpa labore adipisicing sint nulla aliqua occaecat ullamco exercitation officia reprehenderit cupidatat. Aute ea nostrud ipsum dolor in cupidatat incididunt nostrud esse do proident ullamco sit. Cupidatat veniam labore sunt velit voluptate ullamco dolor occaecat elit enim. Anim consequat occaecat irure eiusmod dolore amet sint deserunt exercitation laborum est incididunt dolor. Non eu ea qui velit elit incididunt id proident consequat elit minim id sunt ad consectetur. Proident veniam cillum laborum. Voluptate pariatur id nisi eiusmod proident nulla cillum labore pariatur esse cupidatat occaecat sit culpa. Adipisicing et amet nulla adipisicing magna amet adipisicing.',
			videoUrl: 'https://www.youtube.com/embed/7EgFm8Dor40?si=hwsI5nV_LwjMUufT'
		}
	];
</script>

<section class="bg-white py-24 sm:py-32" id="free-preview">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-base font-semibold leading-7 text-brand-600">Try Before You Buy</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
				Free Course Preview: Get a Taste of Learning
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Learn Before You Invest. Experience Our Teaching Style Risk-Free.
			</p>
		</div>

		<div class="mx-auto mt-16 max-w-4xl">
			{#each previews as preview, index}
				<div class="mt-16 first:mt-0 pb-12 border-b border-gray-200 last:border-0">
					<div class="sm:flex {index % 2 === 1 ? 'flex-row-reverse' : ''} gap-8">
						<div class="flex-shrink-0 mb-6 sm:mb-0">
							<iframe
								width="560"
								height="315"
								src={preview.videoUrl}
								title={preview.title}
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerpolicy="strict-origin-when-cross-origin"
								allowfullscreen
								class="w-full sm:w-[560px] aspect-video rounded-lg shadow-lg"
							></iframe>
						</div>
						<div class="flex-1">
							<h3 class="text-lg font-bold text-gray-900">{preview.title}</h3>
							<p class="mt-3 text-gray-600 leading-7">{preview.description}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- CTA Banner -->
	<div class="relative isolate overflow-hidden bg-gray-900 mt-24">
		<div class="px-6 py-12 sm:px-6 sm:py-16 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl font-serif">
					Start Learning Today!
				</h2>
				<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
					Lifetime membership - one time payment.
				</p>
				<div class="mt-10 flex items-center justify-center gap-x-6">
					<a
						href="/checkout"
						class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
					>
						Get started
					</a>
				</div>
			</div>
		</div>
		<svg
			viewBox="0 0 1024 1024"
			class="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
			aria-hidden="true"
		>
			<circle cx="512" cy="512" r="512" fill="url(#free-preview-gradient)" fill-opacity="0.7"></circle>
			<defs>
				<radialGradient id="free-preview-gradient">
					<stop stop-color="#7775D6"></stop>
					<stop offset="1" stop-color="#E935C1"></stop>
				</radialGradient>
			</defs>
		</svg>
	</div>
</section>
