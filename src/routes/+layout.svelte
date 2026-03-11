<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	let maintenance = $derived(page.data.maintenance === true);
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" />
	<title>Skyler's Sewing Secrets</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	{#if !maintenance}
		<Header user={data.profile} />
	{/if}

	<main class="flex-1 overflow-x-hidden">
		{@render children()}
	</main>

	{#if !maintenance}
		<Footer />
	{/if}
</div>
