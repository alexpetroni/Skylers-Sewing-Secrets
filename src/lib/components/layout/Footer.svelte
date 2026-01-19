<script lang="ts">
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
	import { socialLinks } from '$lib/data/social-links';

	const currentYear = new Date().getFullYear();

	const navigation = {
		learn: [
			{ name: 'Modules', href: '/modules' },
			{ name: 'Fabric Library', href: '/fabric-library' },
			{ name: 'Blog', href: '/blog' },
			{ name: 'Testimonials', href: '/testimonials' }
		],
		company: [
			{ name: 'About Course', href: '/about' },
			{ name: 'Contact', href: '/contact' },
			{ name: 'FAQ', href: '/faq' }
		],
		legal: [
			{ name: 'Privacy Policy', href: '/legal/privacy' },
			{ name: 'Terms & Conditions', href: '/legal/terms-and-conditions' },
			{ name: 'Claims', href: '/legal/claims' }
		]
	};
</script>

<footer class="bg-charcoal-900" aria-labelledby="footer-heading">
	<h2 id="footer-heading" class="sr-only">Footer</h2>
	<div class="mx-auto max-w-7xl px-6 pb-8 pt-20 sm:pt-28 lg:px-8 lg:pt-32">
		<div class="xl:grid xl:grid-cols-3 xl:gap-8">
			<div class="space-y-8">
				<OptimizedImage
					class="h-auto w-full max-w-[280px]"
					src="/logo/logo-white.png"
					alt="Skyler's Sewing Secrets"
					width={400}
				/>
				<p class="text-sm leading-relaxed text-charcoal-300 max-w-xs">
					Master professional sewing techniques with Skyler's expert guidance. From basics to advanced couture methods.
				</p>
				<div class="flex space-x-5">
					{#each socialLinks as item}
						<a href={item.href} class="text-charcoal-400 hover:text-brand-400 transition-colors">
							<span class="sr-only">{item.name}</span>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								{@html item.icon}
							</svg>
						</a>
					{/each}
				</div>
			</div>
			<div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<div>
						<h3 class="text-sm font-semibold leading-6 text-cream-100">Learn</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.learn as item}
								<li>
									<a href={item.href} class="text-sm leading-6 text-charcoal-300 hover:text-cream-100 transition-colors">{item.name}</a>
								</li>
							{/each}
						</ul>
					</div>
					<div class="mt-10 md:mt-0">
						<h3 class="text-sm font-semibold leading-6 text-cream-100">Company</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.company as item}
								<li>
									<a href={item.href} class="text-sm leading-6 text-charcoal-300 hover:text-cream-100 transition-colors">{item.name}</a>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<div>
						<h3 class="text-sm font-semibold leading-6 text-cream-100">Legal</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.legal as item}
								<li>
									<a href={item.href} class="text-sm leading-6 text-charcoal-300 hover:text-cream-100 transition-colors">{item.name}</a>
								</li>
							{/each}
						</ul>
					</div>
					<div class="mt-10 md:mt-0">
						<h3 class="text-sm font-semibold leading-6 text-cream-100">Newsletter</h3>
						<p class="mt-6 text-sm leading-6 text-charcoal-300">
							Get sewing tips and updates delivered to your inbox.
						</p>
						<form class="mt-4" action="/api/newsletter" method="POST">
							<div class="flex gap-x-2">
								<label for="email-address" class="sr-only">Email address</label>
								<input
									id="email-address"
									name="email"
									type="email"
									autocomplete="email"
									required
									class="min-w-0 flex-auto rounded-lg border-0 bg-charcoal-800 px-4 py-2.5 text-cream-100 shadow-sm ring-1 ring-inset ring-charcoal-700 placeholder:text-charcoal-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm"
									placeholder="Enter your email"
								>
								<button
									type="submit"
									class="flex-none rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
								>
									Subscribe
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
		<div class="mt-16 border-t border-charcoal-800 pt-8 sm:mt-20 lg:mt-24">
			<p class="text-xs leading-5 text-charcoal-400">&copy; {currentYear} Skyler's Sewing Secrets. All rights reserved.</p>
		</div>
	</div>
</footer>
