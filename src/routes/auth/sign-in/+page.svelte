<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { Input, Button, Alert } from '$lib/components/ui';
	import OAuthButtons from '$lib/components/auth/OAuthButtons.svelte';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();

	const redirectTo = $derived(
		typeof window !== 'undefined' 
			? new URLSearchParams(window.location.search).get('redirectTo') || '/dashboard'
			: '/dashboard'
	);
</script>

<svelte:head>
	<title>Sign In - Skyler's Sewing Secrets</title>
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
			Sign in to your account
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
		<div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
			{#if form?.error}
				<div class="mb-6">
					<Alert variant="error">{form.error}</Alert>
				</div>
			{/if}

			<form method="POST" use:enhance class="space-y-6">
				<input type="hidden" name="redirectTo" value={redirectTo} />

				<Input
					label="Email address"
					name="email"
					type="email"
					autocomplete="email"
					required
					value={form?.email ?? ''}
					error={form?.errors?.email}
				/>

				<Input
					label="Password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
					error={form?.errors?.password}
				/>

				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember-me"
							name="remember-me"
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
						>
						<label for="remember-me" class="ml-3 block text-sm leading-6 text-gray-900">
							Remember me
						</label>
					</div>

					<div class="text-sm leading-6">
						<a href="/auth/forgot-password" class="font-semibold text-brand-600 hover:text-brand-500">
							Forgot password?
						</a>
					</div>
				</div>

				<Button type="submit" fullWidth>
					{#snippet children()}Sign in{/snippet}
				</Button>
			</form>

			<div>
				<div class="relative mt-10">
					<div class="absolute inset-0 flex items-center" aria-hidden="true">
						<div class="w-full border-t border-gray-200"></div>
					</div>
					<div class="relative flex justify-center text-sm font-medium leading-6">
						<span class="bg-white px-6 text-gray-900">Or continue with</span>
					</div>
				</div>

				<OAuthButtons {redirectTo} action="sign-in" />
			</div>
		</div>

		<p class="mt-10 text-center text-sm text-gray-500">
			Not a member yet?
			<a href="/checkout" class="font-semibold leading-6 text-brand-600 hover:text-brand-500">
				Enroll now for lifetime access
			</a>
		</p>
	</div>
</div>
