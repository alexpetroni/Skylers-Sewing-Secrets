<script lang="ts">
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';
	import { socialLinks } from '$lib/data/social-links';

	const currentYear = new Date().getFullYear();

	let newsletterEmail = $state('');
	let newsletterStatus = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let newsletterMessage = $state('');

	async function handleNewsletterSubmit(event: SubmitEvent) {
		event.preventDefault();
		newsletterStatus = 'loading';

		try {
			const formData = new FormData();
			formData.append('email', newsletterEmail);

			const response = await fetch('/api/newsletter', {
				method: 'POST',
				body: formData
			});

			const data = await response.json();

			if (response.ok) {
				newsletterStatus = 'success';
				newsletterMessage = 'Thank you for subscribing!';
				newsletterEmail = '';
			} else {
				newsletterStatus = 'error';
				newsletterMessage = data.error || 'Something went wrong. Please try again.';
			}
		} catch {
			newsletterStatus = 'error';
			newsletterMessage = 'Something went wrong. Please try again.';
		}
	}

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
					class="h-auto w-full max-w-[200px]"
					src="/logo/logo-white.png"
					alt="Skyler's Sewing Secrets"
					width={300}
				/>
				<p class="text-sm leading-relaxed text-charcoal-300 max-w-xs">
					Master professional sewing techniques with Skyler's expert guidance. From basics to advanced couture methods.
				</p>
			</div>
			<div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<div>
						<h3 class="text-lg font-semibold leading-6 text-ivory-100">Learn</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.learn as item}
								<li>
									<a href={item.href} class="text-sm leading-6 text-charcoal-300 hover:text-ivory-100 transition-colors">{item.name}</a>
								</li>
							{/each}
						</ul>
					</div>
					<div class="mt-10 md:mt-0">
						<h3 class="text-lg font-semibold leading-6 text-ivory-100">Company</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.company as item}
								<li>
									<a href={item.href} class="text-sm leading-6 text-charcoal-300 hover:text-ivory-100 transition-colors">{item.name}</a>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<div>
						<h3 class="text-lg font-semibold leading-6 text-ivory-100">Legal</h3>
						<ul role="list" class="mt-6 space-y-4">
							{#each navigation.legal as item}
								<li>
									<a href={item.href} class="text-sm leading-6 text-charcoal-300 hover:text-ivory-100 transition-colors">{item.name}</a>
								</li>
							{/each}
						</ul>
					</div>
					<div class="mt-10 md:mt-0">
						<h3 class="text-lg font-semibold leading-6 text-ivory-100">Follow Us</h3>
						<div class="mt-6 flex gap-4">
							{#each socialLinks as link}
								<a href={link.href} target="_blank" rel="noopener noreferrer" class="text-charcoal-400 hover:text-ivory-100 transition-colors" aria-label={link.name}>
									<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										{@html link.icon}
									</svg>
								</a>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="mt-16 border-t border-charcoal-800 pt-8 sm:mt-20 lg:mt-24">
			<p class="text-xs leading-5 text-charcoal-400">&copy; {currentYear} Skyler's Sewing Secrets. All rights reserved.</p>
		</div>
	</div>
</footer>
