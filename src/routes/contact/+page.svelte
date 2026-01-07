<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Textarea, Alert } from '$lib/components/ui';
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
</svelte:head>

<div class="bg-white">
	<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
		<div class="mx-auto max-w-2xl">
			<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">
				Get in Touch
			</h1>
			<p class="mt-6 text-lg leading-8 text-gray-600">
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
			<div class="mt-16 border-t border-gray-200 pt-12">
				<h2 class="text-2xl font-bold text-gray-900 font-serif">Other Ways to Connect</h2>
				<dl class="mt-8 space-y-6">
					<div>
						<dt class="text-sm font-semibold text-gray-900">Email</dt>
						<dd class="mt-1 text-base text-gray-600">
							<a href="mailto:hello@skylerssewingsecrets.com" class="text-brand-600 hover:text-brand-500">
								hello@skylerssewingsecrets.com
							</a>
						</dd>
					</div>
					<div>
						<dt class="text-sm font-semibold text-gray-900">Response Time</dt>
						<dd class="mt-1 text-base text-gray-600">
							I typically respond within 1-2 business days.
						</dd>
					</div>
					<div>
						<dt class="text-sm font-semibold text-gray-900">Social Media</dt>
						<dd class="mt-1 flex gap-4">
							<a href="#" class="text-gray-400 hover:text-gray-500">
								<span class="sr-only">Instagram</span>
								<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
									<path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
								</svg>
							</a>
							<a href="#" class="text-gray-400 hover:text-gray-500">
								<span class="sr-only">YouTube</span>
								<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
									<path fill-rule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clip-rule="evenodd" />
								</svg>
							</a>
							<a href="#" class="text-gray-400 hover:text-gray-500">
								<span class="sr-only">Pinterest</span>
								<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0a12 12 0 0 0-4.373 23.178c-.07-.633-.134-1.606.028-2.298.146-.625.938-3.977.938-3.977s-.239-.479-.239-1.187c0-1.113.645-1.943 1.448-1.943.683 0 1.012.512 1.012 1.127 0 .686-.437 1.713-.663 2.664-.189.796.4 1.446 1.185 1.446 1.422 0 2.515-1.5 2.515-3.664 0-1.915-1.377-3.254-3.342-3.254-2.276 0-3.612 1.707-3.612 3.471 0 .688.265 1.425.595 1.826a.24.24 0 0 1 .056.23c-.061.252-.196.796-.222.907-.035.146-.116.177-.268.107-1-.465-1.624-1.926-1.624-3.1 0-2.523 1.834-4.84 5.286-4.84 2.775 0 4.932 1.977 4.932 4.62 0 2.757-1.739 4.976-4.151 4.976-.811 0-1.573-.421-1.834-.919l-.498 1.902c-.181.695-.669 1.566-.995 2.097A12 12 0 1 0 12 0z" />
								</svg>
							</a>
						</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</div>
