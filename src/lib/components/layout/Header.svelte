<script lang="ts">
	import type { User } from '$lib/types';
	import { Avatar } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	interface Props {
		user?: User | null;
	}

	let { user = null }: Props = $props();

	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);
	let userMenuContainer: HTMLDivElement;

	function closeUserMenu() {
		userMenuOpen = false;
	}

	function handleWindowClick(event: MouseEvent) {
		if (userMenuOpen && userMenuContainer && !userMenuContainer.contains(event.target as Node)) {
			userMenuOpen = false;
		}
	}

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/modules', label: 'Modules' },
		{ href: '/fabric-library', label: 'Fabric Library' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/about', label: 'About Course' },
		{ href: '/faq', label: 'FAQ' },
		{ href: '/contact', label: 'Contact' }
	];
</script>

<svelte:window onclick={handleWindowClick} />

<header class="bg-white border-b border-charcoal-100 sticky top-0 z-[999]">
	<!-- Top bar with auth -->
	<div class="hidden lg:block border-b border-charcoal-100 bg-charcoal-50">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="flex items-center justify-end gap-x-6 py-2">
				{#if user}
					<div class="relative" bind:this={userMenuContainer}>
						<button
							type="button"
							class="flex items-center gap-2 text-sm font-medium text-charcoal-700 hover:text-brand-600 transition-colors"
							onclick={() => userMenuOpen = !userMenuOpen}
						>
							<Avatar src={user.avatar_url} name={user.full_name || user.email} size="xs" />
							<span>{user.full_name || 'Account'}</span>
							<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
							</svg>
						</button>

						{#if userMenuOpen}
							<div class="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-charcoal-100 focus:outline-none">
								<div class="px-4 py-2.5 border-b border-charcoal-100">
									<p class="text-sm font-medium text-charcoal-900 truncate">{user.full_name || 'User'}</p>
									<p class="text-xs text-charcoal-500 truncate">{user.email}</p>
								</div>
								{#if user.is_member}
									<a
										href="/dashboard"
										class="block px-4 py-2.5 text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
										onclick={closeUserMenu}
									>
										Dashboard
									</a>
								{/if}
								<a
									href="/profile"
									class="block px-4 py-2.5 text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
									onclick={closeUserMenu}
								>
									My Profile
								</a>
								{#if user.is_admin}
									<a
										href="/admin"
										class="block px-4 py-2.5 text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
										onclick={closeUserMenu}
									>
										Admin Panel
									</a>
								{/if}
								<div class="border-t border-charcoal-100 mt-1 pt-1">
									<form action="/auth/sign-out" method="POST">
										<button
											type="submit"
											class="block w-full px-4 py-2.5 text-left text-sm text-charcoal-700 hover:bg-ivory-100 transition-colors"
										>
											Sign out
										</button>
									</form>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<a href="/auth/sign-in" class="text-sm font-medium text-charcoal-700 hover:text-brand-600 transition-colors">
						Log in
					</a>
					<a href="/checkout" class="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors">
						Enroll Now
					</a>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main navigation -->
	<nav class="mx-auto max-w-7xl px-6 py-4 lg:py-0 lg:px-8" aria-label="Global">
		<div class="flex items-center justify-between lg:hidden">
			<!-- Mobile: Logo left, menu button right -->
			<a href="/" class="-m-1.5 p-1.5">
				<span class="sr-only">Skyler's Sewing Secrets</span>
				<OptimizedImage
					class="h-20 w-auto"
					src="/logo/logo.png"
					alt="Skyler's Sewing Secrets"
					width={280}
				/>
			</a>
			<button
				type="button"
				class="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-charcoal-700 hover:bg-ivory-100 transition-colors"
				onclick={() => mobileMenuOpen = true}
			>
				<span class="sr-only">Open main menu</span>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
				</svg>
			</button>
		</div>

		<!-- Desktop: Logo left - Centered nav -->
		<div class="hidden lg:flex lg:items-center">
			<!-- Logo on left -->
			<a href="/" class="flex-shrink-0 relative -top-8 -mb-8 z-10">
				<span class="sr-only">Skyler's Sewing Secrets</span>
				<OptimizedImage
					class="h-28 w-auto"
					src="/logo/logo.png"
					alt="Skyler's Sewing Secrets"
					width={320}
				/>
			</a>

			<!-- Centered navigation -->
			<div class="flex-1 flex items-center justify-center gap-x-8">
				{#each navLinks as link}
					<a href={link.href} class="text-sm font-semibold uppercase tracking-wide text-charcoal-800 hover:text-brand-600 transition-colors font-sans">
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Spacer to balance the logo width -->
			<div class="w-[280px] flex-shrink-0"></div>
		</div>
	</nav>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="lg:hidden" role="dialog" aria-modal="true">
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div class="fixed inset-0 z-[1000] bg-charcoal-900/40" onclick={() => mobileMenuOpen = false}></div>

			<!-- Panel -->
			<div class="fixed top-0 right-0 z-[1001] w-full max-h-[85vh] overflow-y-auto bg-white px-6 py-6 rounded-b-2xl shadow-xl">
				<div class="flex items-center justify-between">
					<a href="/" class="-m-1.5 p-1.5" onclick={() => mobileMenuOpen = false}>
						<span class="sr-only">Skyler's Sewing Secrets</span>
						<OptimizedImage
							class="h-20 w-auto"
							src="/logo/logo.png"
							alt=""
							width={280}
						/>
					</a>
					<button
						type="button"
						class="-m-2.5 rounded-lg p-2.5 text-charcoal-600 hover:bg-ivory-200 transition-colors"
						onclick={() => mobileMenuOpen = false}
					>
						<span class="sr-only">Close menu</span>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div class="mt-8 flow-root">
					<div class="-my-6 divide-y divide-charcoal-200">
						<div class="space-y-1 py-6">
							{#each navLinks as link}
								<a
									href={link.href}
									class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-ivory-200 transition-colors"
									onclick={() => mobileMenuOpen = false}
								>
									{link.label}
								</a>
							{/each}
						</div>
						<div class="py-6">
							{#if user}
								<div class="-mx-3 px-4 py-3 mb-3 rounded-lg bg-ivory-200">
									<p class="text-sm font-medium text-charcoal-900 truncate">{user.full_name || 'User'}</p>
									<p class="text-xs text-charcoal-500 truncate">{user.email}</p>
								</div>
								{#if user.is_member}
									<a
										href="/dashboard"
										class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-ivory-200 transition-colors"
										onclick={() => mobileMenuOpen = false}
									>
										Dashboard
									</a>
								{/if}
								<a
									href="/profile"
									class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-ivory-200 transition-colors"
									onclick={() => mobileMenuOpen = false}
								>
									My Profile
								</a>
								{#if user.is_admin}
									<a
										href="/admin"
										class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-ivory-200 transition-colors"
										onclick={() => mobileMenuOpen = false}
									>
										Admin Panel
									</a>
								{/if}
								<form action="/auth/sign-out" method="POST">
									<button
										type="submit"
										class="-mx-3 block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-charcoal-800 hover:bg-ivory-200 transition-colors"
									>
										Sign out
									</button>
								</form>
							{:else}
								<a
									href="/auth/sign-in"
									class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-ivory-200 transition-colors"
									onclick={() => mobileMenuOpen = false}
								>
									Log in
								</a>
								<a
									href="/checkout"
									class="-mx-3 mt-3 block rounded-lg bg-brand-600 px-4 py-3 text-center text-base font-medium text-white hover:bg-brand-700 transition-colors"
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
