<script lang="ts">
	import { socialLinks } from '$lib/data/social-links';
</script>

<svelte:head>
	<title>Contact Us - Skyler's Sewing Secrets</title>
	<meta name="description" content="Get in touch with Skyler. We'd love to hear from you about the course, collaborations, or any questions you may have." />
	<meta property="og:title" content="Contact Us - Skyler's Sewing Secrets" />
	<meta property="og:description" content="Get in touch with Skyler. We'd love to hear from you about the course, collaborations, or any questions you may have." />
	<meta property="og:image" content="https://skyler-storage.b-cdn.net/images/portraits/portrait-1.jpg" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://skylersewingsecrets.com/contact" />
</svelte:head>

<div class="bg-ivory-50">
	<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
		<div class="mx-auto max-w-2xl">
			<h1 class="page-title">
				Get in Touch
			</h1>
			<p class="mt-4 body-lg">
				Have a question about the course, or just want to say hello?
				Reach out using the contact details below.
			</p>

			<!-- Contact info -->
			<div class="mt-12">
				<h2 class="section-heading">Ways to Connect</h2>
				<dl class="mt-8 space-y-6">
					<div>
						<dt class="meta font-semibold text-charcoal-900">Email</dt>
						<dd class="mt-1 body-base">
							<a href="mailto:skylersewingsecrets@gmail.com" class="text-brand-600 hover:text-brand-500">
								skylersewingsecrets@gmail.com
							</a>
						</dd>
					</div>
					<div>
						<dt class="meta font-semibold text-charcoal-900">Response Time</dt>
						<dd class="mt-1 body-base">
							I typically respond within 1-2 business days.
						</dd>
					</div>
					<div>
						<dt class="meta font-semibold text-charcoal-900">Social Media</dt>
						<dd class="mt-1 flex gap-4">
							{#each socialLinks as link}
								<a href={link.href} target="_blank" rel="noopener noreferrer" class="text-charcoal-400 hover:text-charcoal-500">
									<span class="sr-only">{link.name}</span>
									<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										{@html link.icon}
									</svg>
								</a>
							{/each}
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</div>
