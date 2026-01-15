<script lang="ts">
	import { Button } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
	import courseOverview from '$lib/data/course-overview';
</script>

<svelte:head>
	<title>About - Skyler's Sewing Secrets</title>
	<meta name="description" content="Welcome to Skyler's Sewing Secrets - a couture-level sewing course with {courseOverview.totals.minutes} minutes of step-by-step tutorials across {courseOverview.totals.videos} videos. Learn professional finishing techniques using just a domestic sewing machine." />
</svelte:head>

<div class="bg-white">
	<!-- Hero section -->
	<div class="relative isolate overflow-hidden bg-gradient-to-b from-brand-100/20">
		<div class="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pt-32 lg:flex lg:flex-row-reverse lg:px-8 lg:py-40">
			<div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
				<h1 class="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-serif">
					Welcome to Skyler's Sewing Secrets!
				</h1>
				<p class="mt-4 text-xl italic text-gray-500">
					Where craftsmanship, creativity and couture-level finishing come to life.
				</p>
				<p class="mt-6 text-lg leading-8 text-gray-600">
					Welcome! I'm so glad you're here! Whether you are just starting your sewing journey or
					have years of experience behind the machine, this course is designed to take your skills
					and your confidence to an entirely new level.
				</p>
				<div class="mt-10 flex items-center gap-x-6">
					<a href="/checkout">
						<Button size="lg">
							{#snippet children()}
								Start Now
							{/snippet}
						</Button>
					</a>
					<a href="/modules" class="text-sm font-semibold leading-6 text-gray-900">
						View the Course <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
			<div class="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:mr-10 lg:ml-0 lg:mt-0 lg:max-w-none lg:flex-none xl:mr-32">
				<div class="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
					<OptimizedImage
						src="/images/portraits/portrait-1.jpg"
						alt="Gabi Skyler - Founder of Skyler's Sewing Secrets"
						width={600}
						class="w-[37rem] rounded-2xl bg-gray-50 object-cover shadow-xl ring-1 ring-gray-400/10"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Welcome extended section -->
	<div class="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
		<div class="mx-auto max-w-3xl">
			<p class="text-lg leading-8 text-gray-600">
				Skyler's Sewing Secrets is more than just a sewing course—it's a place to slow down, focus
				on the art of how things are made, and fall in love with the details that turn ordinary
				garments into something extraordinary. Here you'll be guided through the same thoughtful
				techniques used in high-end ateliers, adapted for anyone with a domestic sewing machine
				and a passion to learn.
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				You'll discover how powerful it feels to finish a seam beautifully, to shape a garment
				with intention, and to sew with the kind of care that shows both inside and out. This is
				your space to grow, to create, and to connect deeply with your craft.
			</p>
			<p class="mt-6 text-xl font-medium text-gray-900">
				And by the end, you won't just be a better sewer—you'll be an artist of the finishings.
			</p>
		</div>
	</div>

	<!-- About the Course section -->
	<div class="bg-gray-50 py-24 sm:py-32">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl lg:text-center">
				<h2 class="text-base font-semibold leading-7 text-brand-600">About the Course</h2>
				<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
					Couture-level sewing, made accessible
				</p>
				<p class="mt-6 text-lg leading-8 text-gray-600">
					Skyler's Sewing Secrets is a comprehensive, couture-level sewing course designed to
					unlock the beauty of fine garment finishing—no industrial equipment or prior experience
					in fashion school required.
				</p>
			</div>
			<div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
				<div class="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2 lg:gap-y-16">
					<div class="relative pl-16">
						<dt class="text-base font-semibold leading-7 text-gray-900">
							<div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
								</svg>
							</div>
							{courseOverview.totals.minutes} Minutes of Video ({courseOverview.totals.videos} videos)
						</dt>
						<dd class="mt-2 text-base leading-7 text-gray-600">
							Lifetime access to step-by-step video tutorials and visual guides. Learn at your own
							pace, in your own space.
						</dd>
					</div>
					<div class="relative pl-16">
						<dt class="text-base font-semibold leading-7 text-gray-900">
							<div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122" />
								</svg>
							</div>
							{courseOverview.totals.modules} Carefully Crafted Modules (plus bonus)
						</dt>
						<dd class="mt-2 text-base leading-7 text-gray-600">
							Each module builds your understanding and skillset with intention and clarity,
							progressing from fundamentals to advanced techniques.
						</dd>
					</div>
					<div class="relative pl-16">
						<dt class="text-base font-semibold leading-7 text-gray-900">
							<div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
								</svg>
							</div>
							Domestic Machine Only
						</dt>
						<dd class="mt-2 text-base leading-7 text-gray-600">
							No serger or overlocker needed. This course proves that miracles can be made with
							the simplest tools, as long as you have the right techniques.
						</dd>
					</div>
					<div class="relative pl-16">
						<dt class="text-base font-semibold leading-7 text-gray-900">
							<div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-2.927 0" />
								</svg>
							</div>
							Bonus: Haute Couture Project
						</dt>
						<dd class="mt-2 text-base leading-7 text-gray-600">
							In the final bonus module, create an haute couture skirt using Chanel-inspired
							techniques—showcasing everything you've learned.
						</dd>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Why Skyler's Sewing Secrets section -->
	<div class="py-24 sm:py-32">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl lg:mx-0">
				<h2 class="text-base font-semibold leading-7 text-brand-600">Why Skyler's Sewing Secrets?</h2>
				<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
					Because true craftsmanship is not about speed—it's about soul
				</p>
				<p class="mt-6 text-lg leading-8 text-gray-600">
					In a world of fast fashion and shortcuts, Skyler invites you to slow down and rediscover
					the art of making something truly exceptional. With {courseOverview.totals.minutes} minutes of expert-guided
					tutorials, this course is more than a technical program—it's a transformation.
				</p>
				<p class="mt-4 text-lg leading-8 text-gray-600">
					This is where your skills meet intention, where precision becomes second nature, and
					where every stitch you sew tells a story of dedication, care, and creative pride.
				</p>
			</div>
			<div class="mx-auto mt-16 max-w-2xl lg:max-w-none">
				<div class="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
					<div class="flex flex-col">
						<h3 class="text-xl font-semibold leading-7 text-gray-900">
							The Value of Investing in Your Craft
						</h3>
						<p class="mt-4 flex-auto text-base leading-7 text-gray-600">
							When you invest in this course, you're not just buying a lesson—you're building a
							foundation that will serve you for a lifetime. You're gaining insider knowledge once
							reserved for couture houses, distilled into a program you can master at your own pace,
							from your own sewing table.
						</p>
						<p class="mt-4 text-base leading-7 text-gray-600">
							Whether you're building a brand, pursuing a fashion career, or sewing for pure joy,
							these skills are a legacy—and they will elevate everything you create.
						</p>
					</div>
					<div class="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
						<blockquote class="flex-auto text-lg leading-8 text-gray-600 italic">
							"Fashion is not necessarily about labels. It's not about brands. It's about something
							else that comes from within you."
						</blockquote>
						<p class="mt-6 text-base font-semibold text-gray-900">— Ralph Lauren</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- CTA section -->
	<div class="bg-brand-600">
		<div class="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-white font-serif lg:whitespace-nowrap">
					Start Now! Sew with Purpose! Finish with Pride!
				</h2>
				<p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-brand-100">
					Let's begin this journey together. One stitch at a time.
				</p>
				<p class="mt-4 text-base text-brand-200">
					With love, Skyler
				</p>
				<div class="mt-10 flex items-center justify-center gap-x-6">
					<a href="/checkout">
						<Button variant="secondary" size="lg">
							{#snippet children()}
								Enroll Now
							{/snippet}
						</Button>
					</a>
					<a href="/modules" class="text-sm font-semibold leading-6 text-white">
						View the Course <span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
