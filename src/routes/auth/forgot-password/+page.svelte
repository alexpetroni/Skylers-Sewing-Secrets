<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { Input, Button, Alert } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
</script>

<svelte:head>
	<title>Forgot Password - Skyler's Sewing Secrets</title>
</svelte:head>

<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<OptimizedImage
			class="mx-auto h-16 w-auto"
			src="/logo/logo.png"
			alt="Skyler's Sewing Secrets"
			width={200}
		/>
		<h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
			Reset your password
		</h2>
		<p class="mt-2 text-center text-sm text-gray-600">
			Enter your email address and we'll send you a link to reset your password.
		</p>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
			{#if form?.success}
				<Alert variant="success" title="Check your email">
					We've sent a password reset link to your email address. Please check your inbox.
				</Alert>
			{:else}
				{#if form?.error}
					<div class="mb-6">
						<Alert variant="error">{form.error}</Alert>
					</div>
				{/if}

				<form method="POST" use:enhance class="space-y-6">
					<Input
						label="Email address"
						name="email"
						type="email"
						autocomplete="email"
						required
						value={form?.email ?? ''}
						error={form?.errors?.email}
					/>

					<Button type="submit" fullWidth>
						{#snippet children()}Send reset link{/snippet}
					</Button>
				</form>
			{/if}
		</div>

		<p class="mt-10 text-center text-sm text-gray-500">
			Remember your password?
			<a href="/auth/sign-in" class="font-semibold leading-6 text-brand-600 hover:text-brand-500">
				Sign in
			</a>
		</p>
	</div>
</div>
