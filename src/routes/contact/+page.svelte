<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Textarea, Alert } from '$lib/components/ui';
	import { socialLinks } from '$lib/data/social-links';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	let loading = $state(false);
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
				Fill out the form below and I'll get back to you as soon as possible.
			</p>

			{#if form?.success}
				<div class="mt-8">
					<Alert variant="success">
						{#snippet children()}
							Thank you for your message! I'll get back to you as soon as possible.
						{/snippet}
					</Alert>
				</div>
			{/if}

			{#if form?.error}
				<div class="mt-8">
					<Alert variant="error">
						{#snippet children()}
							{form.error}
						{/snippet}
					</Alert>
				</div>
			{/if}

			<form 
				method="POST" 
				class="mt-12 space-y-6"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<Input
							label="Name"
							name="name"
							type="text"
							required
							placeholder="Your name"
							value={form?.values?.name ?? ''}
							error={form?.errors?.name}
						/>
					</div>
					<div>
						<Input
							label="Email"
							name="email"
							type="email"
							required
							placeholder="your@email.com"
							value={form?.values?.email ?? ''}
							error={form?.errors?.email}
						/>
					</div>
				</div>

				<div>
					<Input
						label="Subject"
						name="subject"
						type="text"
						placeholder="What is this about?"
						value={form?.values?.subject ?? ''}
						error={form?.errors?.subject}
					/>
				</div>

				<div>
					<Textarea
						label="Message"
						name="message"
						rows={6}
						required
						placeholder="Your message..."
						value={form?.values?.message ?? ''}
						error={form?.errors?.message}
					/>
				</div>

				<div>
					<Button type="submit" disabled={loading} class="w-full sm:w-auto">
						{#snippet children()}
							{#if loading}
								Sending...
							{:else}
								Send Message
							{/if}
						{/snippet}
					</Button>
				</div>
			</form>

			<!-- Additional contact info -->
			<div class="mt-16 border-t border-charcoal-200 pt-12">
				<h2 class="section-heading">Other Ways to Connect</h2>
				<dl class="mt-8 space-y-6">
					<div>
						<dt class="meta font-semibold text-charcoal-900">Email</dt>
						<dd class="mt-1 body-base">
							<a href="mailto:skyler@skylersewingsecrets.com" class="text-brand-600 hover:text-brand-500">
								skyler@skylersewingsecrets.com
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
