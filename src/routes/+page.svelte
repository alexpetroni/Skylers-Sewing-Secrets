<script lang="ts">
	import type { PageData } from './$types';
	import { Hero, Features, FreePreview, Testimonials, Instructor, Pricing, Cta } from '$lib/components/marketing';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Skyler's Sewing Secrets - Master Professional Sewing Techniques</title>
	<meta name="description" content="Learn professional sewing techniques with Skyler's comprehensive video course. From basics to advanced couture methods, get lifetime access to expert guidance." />
	<meta property="og:title" content="Skyler's Sewing Secrets - Master Professional Sewing Techniques" />
	<meta property="og:description" content="Learn professional sewing techniques with Skyler's comprehensive video course. From basics to advanced couture methods, get lifetime access to expert guidance." />
	<meta property="og:image" content="https://skyler-storage.b-cdn.net/images/portraits/portrait-1.jpg" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://skylersewingsecrets.com" />
</svelte:head>

<Hero />
<Features />
<FreePreview />
<Pricing pricing={data.pricing} />
<Instructor />
<Testimonials testimonials={data.testimonials} />
<Cta pricing={data.pricing} />
