<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { Input, Button, Alert } from '$lib/components/ui';

	interface Props {
		form: ActionData;
		data: PageData;
	}

	let { form, data }: Props = $props();
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
						<a href="/auth/sign-in">
							<Button fullWidth>
								{#snippet children()}Sign in with your new password{/snippet}
							</Button>
						</a>
					</div>
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
					<input type="hidden" name="token" value={data.token} />

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
