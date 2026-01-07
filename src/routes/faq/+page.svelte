<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let openItems = $state<Set<string>>(new Set());

	function toggleItem(id: string) {
		if (openItems.has(id)) {
			openItems.delete(id);
			openItems = new Set(openItems);
		} else {
			openItems.add(id);
			openItems = new Set(openItems);
		}
	}

	// Group FAQs by category
	const groupedFaqs = $derived(() => {
		const groups: Record<string, typeof data.faqs> = {};
		for (const faq of data.faqs) {
			const category = faq.category || 'General';
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(faq);
		}
		return groups;
	});
</script>

<svelte:head>
	<title>Frequently Asked Questions - Skyler's Sewing Secrets</title>
	<meta name="description" content="Find answers to common questions about Skyler's Sewing Secrets course, including access, payment, and course content." />
</svelte:head>

<div class="bg-white">
	<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
		<div class="mx-auto max-w-4xl">
			<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">
				Frequently asked questions
			</h1>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis, 
				dolor sit amet consectetur adipisicing elit.
			</p>

			{#if data.faqs.length > 0}
				<div class="mt-16 space-y-16">
					{#each Object.entries(groupedFaqs()) as [category, faqs]}
						<div>
							<h2 class="text-2xl font-bold text-gray-900 font-serif">{category}</h2>
							<dl class="mt-6 space-y-4">
								{#each faqs as faq}
									<div class="border border-gray-200 rounded-lg">
										<dt>
											<button
												type="button"
												class="flex w-full items-start justify-between px-6 py-5 text-left text-gray-900"
												onclick={() => toggleItem(faq.id)}
												aria-expanded={openItems.has(faq.id)}
											>
												<span class="text-base font-semibold leading-7">{faq.question}</span>
												<span class="ml-6 flex h-7 items-center">
													{#if openItems.has(faq.id)}
														<svg class="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
															<path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
														</svg>
													{:else}
														<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
															<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
														</svg>
													{/if}
												</span>
											</button>
										</dt>
										{#if openItems.has(faq.id)}
											<dd class="px-6 pb-5">
												<p class="text-base leading-7 text-gray-600">{faq.answer}</p>
											</dd>
										{/if}
									</div>
								{/each}
							</dl>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Static FAQs when database is empty -->
				<div class="mt-16">
					<dl class="space-y-4">
						{#each [
							{
								id: '1',
								question: 'Nostrud et aliquip Lorem cupidatat occaecat irure sit non est quis amet magna?',
								answer: 'Sit labore excepteur aliqua exercitation exercitation fugiat aliqua mollit. Adipisicing esse exercitation id aliqua mollit minim do. Amet ut velit incididunt aliqua fugiat et excepteur quis eiusmod do magna consectetur. Sint fugiat ut ipsum consectetur fugiat culpa tempor dolore non. Ad magna sit Lorem quis occaecat duis laborum magna veniam ut amet.'
							},
							{
								id: '2',
								question: 'Dolore dolore proident veniam et aute irure mollit dolor aute nostrud ut aliqua laborum?',
								answer: 'Ullamco duis ipsum laborum minim nulla adipisicing exercitation minim enim do occaecat. Occaecat mollit eiusmod excepteur sint consectetur aliqua. Incididunt fugiat est culpa. Aliquip incididunt aliqua consequat ut aute minim.'
							},
							{
								id: '3',
								question: 'Proident in magna in nostrud ex esse officia?',
								answer: 'Quis culpa laboris culpa culpa deserunt occaecat amet sint nulla laboris sunt non aute id. Id cillum ut dolore in et esse aliqua exercitation labore pariatur amet culpa laborum irure. Magna anim enim cillum do et eiusmod ad elit ullamco cillum. Esse duis Lorem mollit quis ullamco sit laboris.'
							},
							{
								id: '4',
								question: 'Occaecat quis aute veniam amet nulla occaecat do?',
								answer: 'Ex velit sint sint minim quis laboris id magna. Lorem quis aliqua enim aliquip consectetur minim id laboris esse dolore proident pariatur est. Ullamco qui dolor aute ut. Nostrud sint ea cillum.'
							},
							{
								id: '5',
								question: 'Ullamco enim aliquip aliquip est cupidatat minim pariatur reprehenderit enim commodo pariatur?',
								answer: 'Quis do esse aliquip cupidatat dolore Lorem velit nisi fugiat ex velit labore. Ut ea consequat esse consectetur. Consectetur mollit sit enim aliquip minim fugiat commodo dolor est minim dolore adipisicing do. Ut in aliquip incididunt qui eu nisi occaecat laborum.'
							},
							{
								id: '6',
								question: 'Lorem sunt magna ea esse aute ex adipisicing est anim?',
								answer: 'Pariatur culpa elit adipisicing laboris. Consectetur incididunt consectetur est veniam labore duis magna consectetur magna aliqua dolore mollit ea. Aute veniam minim nisi amet non anim irure laboris voluptate ut aliqua Lorem est.'
							}
						] as faq}
							<div class="border border-gray-200 rounded-lg">
								<dt>
									<button
										type="button"
										class="flex w-full items-start justify-between px-6 py-5 text-left text-gray-900"
										onclick={() => toggleItem(faq.id)}
										aria-expanded={openItems.has(faq.id)}
									>
										<span class="text-base font-semibold leading-7">{faq.question}</span>
										<span class="ml-6 flex h-7 items-center">
											{#if openItems.has(faq.id)}
												<svg class="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
												</svg>
											{:else}
												<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
												</svg>
											{/if}
										</span>
									</button>
								</dt>
								{#if openItems.has(faq.id)}
									<dd class="px-6 pb-5">
										<p class="text-base leading-7 text-gray-600">{faq.answer}</p>
									</dd>
								{/if}
							</div>
						{/each}
					</dl>
				</div>
			{/if}

			<!-- CTA -->
			<div class="mt-20 rounded-2xl bg-gray-50 p-8 text-center sm:p-12">
				<h2 class="text-2xl font-bold text-gray-900 font-serif">Still have questions?</h2>
				<p class="mt-4 text-gray-600">
					Can't find the answer you're looking for? Please get in touch with me directly.
				</p>
				<div class="mt-6">
					<a href="/contact">
						<Button>
							{#snippet children()}
								Contact Us
							{/snippet}
						</Button>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
