<script lang="ts">
	import VideoPlayer from '$lib/components/course/VideoPlayer.svelte';
</script>

<section class="bg-ivory-50 py-24 sm:py-32" id="free-preview">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<p class="eyebrow">Try Before You Buy</p>
			<h2 class="mt-2 section-heading">
				Free Tutorial: Get a Taste of Learning
			</h2>
			<p class="mt-4 body-lg">
				Learn Before You Invest.
			</p>
		</div>

		<div class="mx-auto mt-16 max-w-4xl">
			<div class="text-center">
				<h3 class="subsection-heading font-serif mb-2">Mitred Corner</h3>
				<p class="body-base mb-8">Create perfectly angled corners for hems, borders, and bindings.</p>
				<VideoPlayer
					videoUrl="bunny:556030/cff89304-ef56-471a-8d50-690c5084974f"
					title="Mitred Corner"
					class="shadow-xl"
				/>
			</div>
		</div>
	</div>
</section>
