<script lang="ts">
	import { Button } from '$lib/components/ui';
</script>

<svelte:head>
	<title>About Skyler - Skyler's Sewing Secrets</title>
	<meta name="description" content="Meet Skyler, your expert guide to mastering professional sewing techniques. Learn about her journey and passion for teaching dressmaking." />
</svelte:head>

<div class="bg-white">
	<!-- Hero section -->
	<div class="relative isolate overflow-hidden bg-gradient-to-b from-brand-100/20">
		<div class="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pt-32 lg:flex lg:px-8 lg:py-40">
			<div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
				<h1 class="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-serif">
					Meet Skyler
				</h1>
				<p class="mt-6 text-lg leading-8 text-gray-600">
					Professional dressmaker, pattern designer, and passionate educator with over 15 years of experience 
					in the fashion industry. My mission is to share the secrets of professional sewing with aspiring 
					sewists around the world.
				</p>
				<div class="mt-10 flex items-center gap-x-6">
					<a href="/checkout">
						<Button size="lg">
							{#snippet children()}
								Start Learning Today
							{/snippet}
						</Button>
					</a>
					<a href="/modules" class="text-sm font-semibold leading-6 text-gray-900">
						View the Course <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
			<div class="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
				<div class="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
					<img
						src="/images/portraits/portrait-1.jpg"
						alt="Gabi Skyler - Founder of Skyler's Sewing Secrets"
						class="w-[37rem] rounded-2xl bg-gray-50 object-cover shadow-xl ring-1 ring-gray-400/10"
					>
				</div>
			</div>
		</div>
	</div>

	<!-- Story section -->
	<div class="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
		<div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
			<h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">My Journey</h2>
			<div class="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
				<div class="lg:w-full lg:max-w-2xl lg:flex-auto">
					<p class="text-xl leading-8 text-gray-600">
						My love for sewing began at my grandmother's side, watching her transform simple fabric into 
						beautiful garments. What started as childhood curiosity evolved into a lifelong passion and 
						eventually, a career.
					</p>
					<div class="mt-10 max-w-xl text-base leading-7 text-gray-700">
						<p>
							After training at the London College of Fashion and working with prestigious fashion houses, 
							I discovered that many aspiring sewists struggled to find accessible, professional-quality 
							instruction. Traditional sewing courses often taught outdated techniques, while couture 
							methods remained locked behind expensive ateliers.
						</p>
						<p class="mt-6">
							That's why I created Skyler's Sewing Secrets: to bridge the gap between hobby sewing and 
							professional dressmaking. My course distills years of industry experience into clear, 
							step-by-step tutorials that anyone can follow.
						</p>
						<p class="mt-6">
							Whether you're a complete beginner or an experienced sewist looking to refine your techniques, 
							my goal is to give you the confidence and skills to create garments you're truly proud of.
						</p>
					</div>
				</div>
				<div class="lg:flex lg:flex-auto lg:justify-center">
					<dl class="space-y-8 xl:w-80">
						<div class="flex flex-col-reverse gap-y-4">
							<dt class="text-base leading-7 text-gray-600">Years of industry experience</dt>
							<dd class="text-5xl font-semibold tracking-tight text-gray-900">15+</dd>
						</div>
						<div class="flex flex-col-reverse gap-y-4">
							<dt class="text-base leading-7 text-gray-600">Students taught worldwide</dt>
							<dd class="text-5xl font-semibold tracking-tight text-gray-900">2,500+</dd>
						</div>
						<div class="flex flex-col-reverse gap-y-4">
							<dt class="text-base leading-7 text-gray-600">Video lessons in the course</dt>
							<dd class="text-5xl font-semibold tracking-tight text-gray-900">39</dd>
						</div>
						<div class="flex flex-col-reverse gap-y-4">
							<dt class="text-base leading-7 text-gray-600">Professional techniques covered</dt>
							<dd class="text-5xl font-semibold tracking-tight text-gray-900">50+</dd>
						</div>
					</dl>
				</div>
			</div>
		</div>
	</div>

	<!-- Values section -->
	<div class="bg-gray-50 py-24 sm:py-32">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl lg:text-center">
				<h2 class="text-base font-semibold leading-7 text-brand-600">My Teaching Philosophy</h2>
				<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
					Professional techniques, made accessible
				</p>
			</div>
			<div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
				<dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
					<div class="flex flex-col">
						<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
								</svg>
							</div>
							Clear Instruction
						</dt>
						<dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
							<p class="flex-auto">
								Every technique is broken down into manageable steps with close-up demonstrations, 
								so you can see exactly what to do and why.
							</p>
						</dd>
					</div>
					<div class="flex flex-col">
						<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
								</svg>
							</div>
							Professional Quality
						</dt>
						<dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
							<p class="flex-auto">
								Learn the same techniques used in professional ateliers and couture houses. 
								No shortcuts, no compromises on quality.
							</p>
						</dd>
					</div>
					<div class="flex flex-col">
						<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
								</svg>
							</div>
							Passion for Teaching
						</dt>
						<dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
							<p class="flex-auto">
								I genuinely love sharing knowledge and seeing students progress. 
								Every lesson is crafted with care to help you succeed.
							</p>
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>

	<!-- CTA section -->
	<div class="bg-brand-600">
		<div class="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl font-serif">
					Ready to begin your sewing journey?
				</h2>
				<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-brand-100">
					Join me in the studio and let's transform your sewing skills together.
				</p>
				<div class="mt-10 flex items-center justify-center gap-x-6">
					<a href="/checkout">
						<Button variant="secondary" size="lg">
							{#snippet children()}
								Enroll Now
							{/snippet}
						</Button>
					</a>
					<a href="/contact" class="text-sm font-semibold leading-6 text-white">
						Get in touch <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
