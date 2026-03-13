<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { Input, Button, Alert } from '$lib/components/ui';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Reset Password - Skyler's Sewing Secrets</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<h2 class="text-center text-2xl font-bold leading-9 tracking-tight text-charcoal-900">
			Set your new password
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
			{#if form?.success}
				<div class="text-center">
					<Alert variant="success">Your password has been updated successfully.</Alert>
					<div class="mt-6">
						<a href="/dashboard">
							<Button fullWidth>
								{#snippet children()}Go to Dashboard{/snippet}
							</Button>
						</a>
					</div>
					<p class="mt-4 text-sm text-charcoal-500">
						Or <a href="/auth/sign-in" class="font-semibold text-brand-600 hover:text-brand-500">sign in</a>
					</p>
				</div>
			{:else}
				{#if form?.error}
					<div class="mb-6">
						<Alert variant="error">{form.error}</Alert>
					</div>
				{/if}

				<form method="POST" use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update({ reset: false });
					};
				}} class="space-y-6">
					<Input
						label="New password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						hint="At least 8 characters"
						error={form?.errors?.password}
					/>

					<Input
						label="Confirm password"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						required
						error={form?.errors?.confirmPassword}
					/>

					<Button type="submit" fullWidth disabled={loading}>
						{#snippet children()}{loading ? 'Updating...' : 'Update Password'}{/snippet}
					</Button>
				</form>
			{/if}
		</div>
	</div>
</div>
