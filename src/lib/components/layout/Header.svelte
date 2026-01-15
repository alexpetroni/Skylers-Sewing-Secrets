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

	function closeUserMenu() {
		userMenuOpen = false;
	}

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

<header class="bg-white/95 backdrop-blur-sm border-b border-charcoal-100">
	<nav class="mx-auto flex max-w-7xl items-center justify-between gap-x-8 px-6 py-4 lg:px-8" aria-label="Global">
		<!-- Logo -->
		<div class="flex lg:flex-1">
			<a href="/" class="-m-1.5 p-1.5">
				<span class="sr-only">Skyler's Sewing Secrets</span>
				<OptimizedImage
					class="h-16 lg:h-20 w-auto"
					src="/logo/logo.png"
					alt="Skyler's Sewing Secrets"
					width={280}
				/>
			</a>
		</div>

		<!-- Desktop Navigation -->
		<div class="hidden lg:flex lg:gap-x-8">
			{#each navLinks as link}
				<a href={link.href} class="text-sm font-medium text-charcoal-600 hover:text-brand-600 transition-colors">
					{link.label}
				</a>
			{/each}
		</div>

		<!-- Auth Buttons -->
		<div class="flex flex-1 items-center justify-end gap-x-5">
			{#if user}
				<!-- User dropdown -->
				<div class="relative hidden lg:block">
					<button
						type="button"
						class="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
						onclick={() => userMenuOpen = !userMenuOpen}
					>
						<span class="sr-only">Open user menu</span>
						<Avatar src={user.avatar_url} name={user.full_name || user.email} size="sm" />
					</button>

					{#if userMenuOpen}
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
						<div class="fixed inset-0 z-10" onclick={closeUserMenu}></div>
						<div class="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-charcoal-100 focus:outline-none">
							<div class="px-4 py-2.5 border-b border-charcoal-100">
								<p class="text-sm font-medium text-charcoal-900 truncate">{user.full_name || 'User'}</p>
								<p class="text-xs text-charcoal-500 truncate">{user.email}</p>
							</div>
							{#if user.is_member}
								<a
									href="/dashboard"
									class="block px-4 py-2.5 text-sm text-charcoal-700 hover:bg-cream-100 transition-colors"
									onclick={closeUserMenu}
								>
									Dashboard
								</a>
							{/if}
							<a
								href="/profile"
								class="block px-4 py-2.5 text-sm text-charcoal-700 hover:bg-cream-100 transition-colors"
								onclick={closeUserMenu}
							>
								My Profile
							</a>
							{#if user.is_admin}
								<a
									href="/admin"
									class="block px-4 py-2.5 text-sm text-charcoal-700 hover:bg-cream-100 transition-colors"
									onclick={closeUserMenu}
								>
									Admin Panel
								</a>
							{/if}
							<div class="border-t border-charcoal-100 mt-1 pt-1">
								<form action="/auth/sign-out" method="POST">
									<button
										type="submit"
										class="block w-full px-4 py-2.5 text-left text-sm text-charcoal-700 hover:bg-cream-100 transition-colors"
									>
										Sign out
									</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
				<!-- Mobile: just show avatar -->
				<div class="lg:hidden">
					<Avatar src={user.avatar_url} name={user.full_name || user.email} size="sm" />
				</div>
			{:else}
				<a href="/auth/sign-in" class="hidden text-sm font-medium text-charcoal-600 hover:text-brand-600 lg:block transition-colors">
					Log in
				</a>
				<a href="/checkout" class="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
					Enroll Now
				</a>
			{/if}
		</div>

		<!-- Mobile menu button -->
		<div class="flex lg:hidden">
			<button
				type="button"
				class="-m-2.5 inline-flex items-center justify-center rounded-lg p-2.5 text-charcoal-600 hover:bg-cream-100 transition-colors"
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
			<div class="fixed inset-0 z-10 bg-charcoal-900/40" onclick={() => mobileMenuOpen = false}></div>

			<!-- Panel -->
			<div class="fixed inset-y-0 right-0 z-20 w-full overflow-y-auto bg-cream-50 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-charcoal-200">
				<div class="flex items-center justify-between">
					<a href="/" class="-m-1.5 p-1.5" onclick={() => mobileMenuOpen = false}>
						<span class="sr-only">Skyler's Sewing Secrets</span>
						<OptimizedImage
							class="h-14 w-auto"
							src="/logo/logo.png"
							alt=""
							width={200}
						/>
					</a>
					<button
						type="button"
						class="-m-2.5 rounded-lg p-2.5 text-charcoal-600 hover:bg-cream-200 transition-colors"
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
									class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-cream-200 transition-colors"
									onclick={() => mobileMenuOpen = false}
								>
									{link.label}
								</a>
							{/each}
						</div>
						<div class="py-6">
							{#if user}
								<div class="-mx-3 px-4 py-3 mb-3 rounded-lg bg-cream-200">
									<p class="text-sm font-medium text-charcoal-900 truncate">{user.full_name || 'User'}</p>
									<p class="text-xs text-charcoal-500 truncate">{user.email}</p>
								</div>
								{#if user.is_member}
									<a
										href="/dashboard"
										class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-cream-200 transition-colors"
										onclick={() => mobileMenuOpen = false}
									>
										Dashboard
									</a>
								{/if}
								<a
									href="/profile"
									class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-cream-200 transition-colors"
									onclick={() => mobileMenuOpen = false}
								>
									My Profile
								</a>
								{#if user.is_admin}
									<a
										href="/admin"
										class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-cream-200 transition-colors"
										onclick={() => mobileMenuOpen = false}
									>
										Admin Panel
									</a>
								{/if}
								<form action="/auth/sign-out" method="POST">
									<button
										type="submit"
										class="-mx-3 block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-charcoal-800 hover:bg-cream-200 transition-colors"
									>
										Sign out
									</button>
								</form>
							{:else}
								<a
									href="/auth/sign-in"
									class="-mx-3 block rounded-lg px-4 py-3 text-base font-medium text-charcoal-800 hover:bg-cream-200 transition-colors"
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
