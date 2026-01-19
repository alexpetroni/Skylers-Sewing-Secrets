<script lang="ts">
	import VideoPlayer from '$lib/components/course/VideoPlayer.svelte';
</script>

<section class="bg-white py-24 sm:py-32" id="free-preview">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-base font-semibold leading-7 text-brand-600">Try Before You Buy</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
				Free Tutorial: Get a Taste of Learning
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Learn Before You Invest.
			</p>
		</div>

		<div class="mx-auto mt-16 max-w-4xl">
			<div class="text-center">
				<h3 class="text-2xl font-bold text-gray-900 font-serif mb-2">Mitred Corner</h3>
				<p class="text-gray-600 mb-8">Create perfectly angled corners for hems, borders, and bindings.</p>
				<VideoPlayer
					videoUrl="bunny:556030/cff89304-ef56-471a-8d50-690c5084974f"
					title="Mitred Corner"
					class="shadow-xl"
				/>
			</div>
		</div>
	</div>
</section>
