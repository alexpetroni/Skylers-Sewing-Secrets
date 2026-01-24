<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Card, Button, Input, Badge } from '$lib/components/ui';
	import { Avatar } from '$lib/components/ui';
	import { enhance } from '$app/forms';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'N/A';
		return new Date(dateStr).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>My Profile - Skyler's Sewing Secrets</title>
	<meta name="description" content="Manage your Skyler's Sewing Secrets account settings, update your profile, and view your membership status." />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="bg-ivory-50 min-h-screen">
	<div class="mx-auto max-w-3xl px-6 py-12 lg:px-8">
		<div class="mb-8">
			<h1 class="page-title">My Profile</h1>
			<p class="mt-2 body-base">Manage your account information.</p>
		</div>

		<!-- Profile Card -->
		<Card class="mb-8">
			{#snippet children()}
				<div class="p-6">
					<div class="flex items-center gap-6 mb-8">
						<Avatar
							src={data.profile.avatar_url}
							name={data.profile.full_name || data.profile.email}
							size="xl"
						/>
						<div>
							<h2 class="subsection-heading">
								{data.profile.full_name || 'User'}
							</h2>
							<p class="meta">{data.profile.email}</p>
							<div class="flex gap-2 mt-2">
								{#if data.profile.is_member}
									<Badge variant="success">
										{#snippet children()}Member{/snippet}
									</Badge>
								{/if}
								{#if data.profile.is_admin}
									<Badge variant="primary">
										{#snippet children()}Admin{/snippet}
									</Badge>
								{/if}
							</div>
						</div>
					</div>

					<form method="POST" action="?/updateProfile" use:enhance class="space-y-6">
						{#if form?.success}
							<div class="rounded-md bg-green-50 p-4">
								<p class="text-sm text-green-800">Profile updated successfully!</p>
							</div>
						{/if}

						{#if form?.error}
							<div class="rounded-md bg-red-50 p-4">
								<p class="text-sm text-red-800">{form.error}</p>
							</div>
						{/if}

						<Input
							label="Full Name"
							name="full_name"
							value={form?.fullName ?? data.profile.full_name ?? ''}
							placeholder="Enter your full name"
						/>

						<Input
							label="Email"
							type="email"
							value={data.profile.email}
							disabled
							class="bg-gray-50"
						/>

						<div class="pt-4">
							<Button type="submit">
								{#snippet children()}
									Save Changes
								{/snippet}
							</Button>
						</div>
					</form>
				</div>
			{/snippet}
		</Card>

		<!-- Account Info -->
		<Card class="mb-8">
			{#snippet children()}
				<div class="p-6">
					<h3 class="card-title mb-4">Account Information</h3>
					<dl class="divide-y divide-gray-100">
						<div class="py-3 flex justify-between">
							<dt class="text-sm text-gray-500">Member Since</dt>
							<dd class="text-sm font-medium text-gray-900">
								{formatDate(data.profile.member_since || data.profile.created_at)}
							</dd>
						</div>
						<div class="py-3 flex justify-between">
							<dt class="text-sm text-gray-500">Account Status</dt>
							<dd class="text-sm font-medium text-gray-900">
								{#if data.profile.is_suspended}
									<span class="text-red-600">Suspended</span>
								{:else}
									<span class="text-green-600">Active</span>
								{/if}
							</dd>
						</div>
						<div class="py-3 flex justify-between">
							<dt class="text-sm text-gray-500">Membership</dt>
							<dd class="text-sm font-medium text-gray-900">
								{data.profile.is_member ? 'Lifetime Access' : 'No membership'}
							</dd>
						</div>
					</dl>
				</div>
			{/snippet}
		</Card>

		<!-- Review Status -->
		{#if data.profile.is_member}
			<Card>
				{#snippet children()}
					<div class="p-6">
						<h3 class="card-title mb-4">Your Review</h3>
						{#if data.testimonial}
							<div class="bg-gray-50 rounded-lg p-4 mb-4">
								<div class="flex items-center gap-1 mb-2">
									{#each Array(5) as _, i}
										<svg
											class="h-4 w-4 {i < (data.testimonial.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									{/each}
								</div>
								<p class="text-gray-700 text-sm">{data.testimonial.content}</p>
								<div class="mt-3 flex items-center gap-2">
									{#if data.testimonial.is_published}
										<Badge variant="success">
											{#snippet children()}Published{/snippet}
										</Badge>
									{:else}
										<Badge variant="warning">
											{#snippet children()}Pending Review{/snippet}
										</Badge>
									{/if}
								</div>
							</div>
							{#if !data.testimonial.is_published}
								<p class="text-sm text-gray-500">
									Your review is pending moderation. Once approved, it will appear on our website.
								</p>
								<div class="mt-4">
									<a href="/leave-review">
										<Button variant="secondary">
											{#snippet children()}Edit Review{/snippet}
										</Button>
									</a>
								</div>
							{/if}
						{:else}
							<p class="body-base mb-4">
								Share your experience with Skyler's Sewing Secrets! Your review helps other sewists decide to join our community.
							</p>
							<a href="/leave-review">
								<Button>
									{#snippet children()}Leave a Review{/snippet}
								</Button>
							</a>
						{/if}
					</div>
				{/snippet}
			</Card>
		{/if}
	</div>
</div>
