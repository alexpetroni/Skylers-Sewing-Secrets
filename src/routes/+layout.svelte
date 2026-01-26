<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" />
	<title>Skyler's Sewing Secrets</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header user={data.profile} />

	<main class="flex-1 overflow-x-hidden">
		{@render children()}
	</main>
	
	<Footer />
</div>
