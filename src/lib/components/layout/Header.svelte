<script lang="ts">
	import type { User } from '$lib/types';
	import { Avatar } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	interface Props {
		user?: User | null;
	}

	let { user = null }: Props = $props();

	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/modules', label: 'Modules' },
		{ href: '/fabric-library', label: 'Fabric Library' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/about', label: 'About' },
		{ href: '/faq', label: 'FAQ' },
		{ href: '/contact', label: 'Contact' }
	];
</script>

<header class="bg-white shadow-sm">
	<nav class="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8" aria-label="Global">
		<!-- Logo -->
		<div class="flex lg:flex-1">
			<a href="/" class="-m-1.5 p-1.5">
				<span class="sr-only">Skyler's Sewing Secrets</span>
				<OptimizedImage
					class="h-12 w-auto"
					src="/logo/logo.png"
					alt="Skyler's Sewing Secrets"
					width={200}
				/>
			</a>
		</div>

		<!-- Desktop Navigation -->
		<div class="hidden lg:flex lg:gap-x-10">
			{#each navLinks as link}
				<a href={link.href} class="text-sm font-semibold leading-6 text-gray-900 hover:text-brand-600">
					{link.label}
				</a>
			{/each}
		</div>

		<!-- Auth Buttons -->
		<div class="flex flex-1 items-center justify-end gap-x-6">
			{#if user}
				{#if user.is_member}
					<a href="/dashboard" class="hidden text-sm font-semibold leading-6 text-gray-900 hover:text-brand-600 lg:block">
						Dashboard
					</a>
				{/if}
				{#if user.is_admin}
					<a href="/admin" class="hidden text-sm font-semibold leading-6 text-gray-900 hover:text-brand-600 lg:block">
						Admin
					</a>
				{/if}
				<a href="/dashboard" class="flex items-center gap-2">
					<Avatar src={user.avatar_url} name={user.full_name || user.email} size="sm" />
				</a>
			{:else}
				<a href="/auth/sign-in" class="hidden text-sm font-semibold leading-6 text-gray-900 lg:block">
					Log in
				</a>
				<a href="/checkout" class="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
					Enroll Now
				</a>
			{/if}
		</div>

		<!-- Mobile menu button -->
		<div class="flex lg:hidden">
			<button
				type="button"
				class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
				onclick={() => mobileMenuOpen = true}
			>
				<span class="sr-only">Open main menu</span>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
				</svg>
			</button>
		</div>
	</nav>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="lg:hidden" role="dialog" aria-modal="true">
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div class="fixed inset-0 z-10 bg-gray-900/50" onclick={() => mobileMenuOpen = false}></div>
			
			<!-- Panel -->
			<div class="fixed inset-y-0 right-0 z-20 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
				<div class="flex items-center justify-between">
					<a href="/" class="-m-1.5 p-1.5" onclick={() => mobileMenuOpen = false}>
						<span class="sr-only">Skyler's Sewing Secrets</span>
						<OptimizedImage
							class="h-10 w-auto"
							src="/logo/logo.png"
							alt=""
							width={200}
						/>
					</a>
					<button
						type="button"
						class="-m-2.5 rounded-md p-2.5 text-gray-700"
						onclick={() => mobileMenuOpen = false}
					>
						<span class="sr-only">Close menu</span>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div class="mt-6 flow-root">
					<div class="-my-6 divide-y divide-gray-500/10">
						<div class="space-y-2 py-6">
							{#each navLinks as link}
								<a
									href={link.href}
									class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
									onclick={() => mobileMenuOpen = false}
								>
									{link.label}
								</a>
							{/each}
						</div>
						<div class="py-6">
							{#if user}
								{#if user.is_member}
									<a
										href="/dashboard"
										class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
										onclick={() => mobileMenuOpen = false}
									>
										Dashboard
									</a>
								{/if}
								{#if user.is_admin}
									<a
										href="/admin"
										class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
										onclick={() => mobileMenuOpen = false}
									>
										Admin
									</a>
								{/if}
								<form action="/auth/sign-out" method="POST">
									<button
										type="submit"
										class="-mx-3 block w-full rounded-lg px-3 py-2.5 text-left text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
									>
										Sign out
									</button>
								</form>
							{:else}
								<a
									href="/auth/sign-in"
									class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
									onclick={() => mobileMenuOpen = false}
								>
									Log in
								</a>
								<a
									href="/checkout"
									class="-mx-3 mt-2 block rounded-lg bg-brand-600 px-3 py-2.5 text-center text-base font-semibold leading-7 text-white hover:bg-brand-500"
									onclick={() => mobileMenuOpen = false}
								>
									Enroll Now
								</a>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</header>
