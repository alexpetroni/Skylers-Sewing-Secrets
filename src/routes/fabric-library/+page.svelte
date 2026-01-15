<script lang="ts">
	import { Button, Card } from '$lib/components/ui';
	import OptimizedImage from '$lib/components/ui/OptimizedImage.svelte';

	interface Fabric {
		name: string;
		slug: string;
		image: string;
		weight: string;
		difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
		description: string;
		tips: string;
		pro_tip?: string;
		recommended_techniques: string[];
	}

	const fabrics: Fabric[] = [
		{
			name: 'Cotton',
			slug: 'cotton',
			image: '/images/fabrics/cotton.jpg',
			weight: 'Light to Medium',
			difficulty: 'Beginner',
			description: "Cotton is a fantastic fabric to sew with, making it perfect for beginners! It's easy to work with and can be used for a variety of garments, including dresses, skirts, and even jackets.",
			tips: 'For the best results, I recommend using flat-felled seam for shirts or sporty dresses to give them a clean, durable finish. Alternatively, an overlock stitch or a wider French seam is a great way to neatly finish seam allowances. Topstitches can add strength and style.',
			recommended_techniques: ['Flat-felled seam', 'French seam', 'Overlock stitch', 'Topstitching']
		},
		{
			name: 'Jersey',
			slug: 'jersey',
			image: '/images/fabrics/jersey.jpg',
			weight: 'Light to Medium',
			difficulty: 'Intermediate',
			description: "Jersey is a beautifully draping fabric, making it a great choice for comfortable garments. Even Coco Chanel embraced jersey for her iconic dresses - proof of its timeless appeal!",
			tips: 'Finding the perfect machine needle can be a challenge. I find that stretch needles or ballpoint needles in size 70/10 or 75/11 work best, especially for delicate silk jerseys. Using the right needle is essential to prevent damage to the knit. For stitching, zig-zag, overlock or babylock with specialised threads ensure flexibility and durability. To help garments maintain their shape, fine silicone elastic is a great addition to shoulders, neckline or armhole seam allowances.',
			recommended_techniques: ['Zig-zag stitch', 'Overlock', 'Babylock', 'Silicone elastic reinforcement']
		},
		{
			name: 'Silk Satin',
			slug: 'silk-satin',
			image: '/images/fabrics/silk-satin.jpg',
			weight: 'Light',
			difficulty: 'Advanced',
			description: 'Silk satin has been a symbol of luxury and glamour since the days of the Silk Road. Its rich sheen and fluid drape make it a favorite for high-end fashion, but working with it requires precision.',
			tips: 'To maintain accuracy while cutting, placing the silk on paper helps prevent shifting. Staystitching on lightweight paper further ensures the fabric retains its shape. For sewing, Microtex or Sharps needles in sizes 60/8 or 70/10 are ideal, as they glide through the delicate fibers without causing damage. Always use sharp scissors and avoid damaged needles to preserve the fabric integrity. For flawless finish, French seams and pin hems are the perfect choices, giving your garments a couture-quality touch with elegant drape and movement - worthy of the red carpet!',
			recommended_techniques: ['French seam', 'Pin hem', 'Staystitching on paper', 'Microtex needles']
		},
		{
			name: 'Organza',
			slug: 'organza',
			image: '/images/fabrics/organza.jpg',
			weight: 'Light',
			difficulty: 'Advanced',
			description: 'There are three types of organza: single - very sheer, double - medium weight, and triple - a more opaque version. Organza is another unpredictable fabric with a crisp, rice-paper-like texture with no natural drape.',
			tips: "Like other delicate, silky materials, I prefer to stitch it on paper and use a sharp, brand-new sewing machine needle to prevent damage to its fine fibers. When sewing, I rely on French seams, pin hems, or even flat felled seams for a clean finish. Organza demands precision - any sloppy work looks noticeably cheap. Beyond garment construction, organza is also used as an interlining in couture sewing, providing structure where fusible interlining isn't an option.",
			recommended_techniques: ['French seam', 'Pin hem', 'Flat felled seam', 'Stitch on paper']
		},
		{
			name: 'Velvet',
			slug: 'velvet',
			image: '/images/velvet.jpg',
			weight: 'Medium',
			difficulty: 'Advanced',
			description: 'Velvet can be very challenging to work with due to its pile and luxurious texture. This sumptuous fabric requires special handling to achieve professional results.',
			tips: 'Cut each panel on a single layer, ensuring all pieces follow the same grain - especially the bias cuts - to keep the pile aligned in one direction. When sewing two layers together, pin diagonally to prevent shifting while sewing, and stitch in the direction of the pile. Steam rather than press, placing a towel underneath to avoid crushing the pile. Instead of finishing seam allowances, I prefer to line the velvet for a cleaner, more refined look.',
			recommended_techniques: ['Single layer cutting', 'Diagonal pinning', 'Steam pressing', 'Lining']
		},
		{
			name: 'Sequins',
			slug: 'sequins',
			image: '/images/fabrics/sequin.jpg',
			weight: 'Medium',
			difficulty: 'Advanced',
			description: 'Sequins require patience - but the result is worth it. This glamorous fabric can create spectacular, red-carpet-worthy pieces when handled with care.',
			tips: "When cutting, use separate scissors, as sequins can quickly dull the blades. Cut each pattern piece on a single layer, with the right side facing up, to follow the grain of the sequins accurately. Use sharp needles and sew slowly, only when you're certain of the final stitching, as needle holes will be visible permanently in the sequins. Test your fabric first. If the sequins are small, you may be able to stitch through them; otherwise, you'll need to remove or break them. Be careful not to cut the thread, as sequins are typically sewn on with a chain stitch. Avoid using a hot iron, as sequins can melt, shrink or change color. For finishing the inside, seam allowances can be bound with bias tape, Hong Kong binding, or simply by lining the garment.",
			recommended_techniques: ['Single layer cutting', 'Bias tape binding', 'Hong Kong binding', 'Lining']
		},
		{
			name: 'Lace',
			slug: 'lace',
			image: '/images/fabrics/lace.jpg',
			weight: 'Light',
			difficulty: 'Advanced',
			description: "Lace is the most romantic fabric... Whether used for evening gowns, wedding dresses, or delicate appliques, lace always evokes sensual femininity. J'adore!",
			tips: "I recommend cutting each panel separately on paper, carefully following the lace's direction. Use sharp, fine needles and opt for French seams or bind the seam allowances with tulle, using the Hong Kong binding method for a flawless finish.",
			recommended_techniques: ['French seam', 'Hong Kong binding with tulle', 'Cut on paper', 'Fine needles']
		},
		{
			name: 'Wool',
			slug: 'wool',
			image: '/images/fabrics/tweed.jpg',
			weight: 'Medium to Heavy',
			difficulty: 'Intermediate',
			description: 'Wool is another timeless and truly remarkable fabric. Wool crepe drapes beautifully, pleats perfectly and holds its shape wonderfully.',
			tips: "For a sophisticated, luxurious feel, I recommend lining it with crepe de chine, because this elegant, high-end fabric deserves nothing less. However, if you choose not to, you can always overlock or bind the seam allowances for a clean finish. Wool really thrives with hand-stitching techniques, so don't be afraid to get creative and add your personal touch. Be bold and let your craftsmanship shine to make your garment unique.",
			recommended_techniques: ['Hand-stitching', 'Crepe de chine lining', 'Overlock', 'Binding']
		},
		{
			name: 'Georgette',
			slug: 'georgette',
			image: '/images/fabrics/georgette.jpg',
			weight: 'Light',
			difficulty: 'Advanced',
			description: "If there is one fabric that embodies elegance and movement, it's georgette. This dreamy textile flutters at the slightest breath of air, making it a delight to wear but a challenge to cut.",
			tips: "To keep it from shifting, always stabilize it on lightweight paper with pins before cutting. And for absolute precision, cut each panel individually - this ensures you stay on grain. When it comes to stitching, handle georgette with maximum care. Use the finest machine needle, because once damaged, this delicate beauty doesn't forgive. For a couture-worthy look, use French seams, pin hems or self-binding with georgette or organza. The result? A garment that drapes like a dream, flows effortlessly, and takes gathers, pleats and pintucks like a pro - truly one of the most versatile fabrics out there! Trust me, once you master georgette, there's no going back!",
			pro_tip: 'Always keep a skin-nude silk georgette in your stash for base, bindings, facings and many more.',
			recommended_techniques: ['French seam', 'Pin hem', 'Self-binding', 'Stitch on paper']
		},
		{
			name: 'Tulle',
			slug: 'tulle',
			image: '/images/fabrics/tulle.jpg',
			weight: 'Very Light',
			difficulty: 'Intermediate',
			description: "Let's get one thing straight - tulle is NOT a mesh! This sheer, magical fabric is my go-to for adding structure without weight.",
			tips: "Tulle is perfect for creating illusion necklines, deep V cutouts, or providing invisible support in gowns. It's the secret weapon for reinforcing fabric under zippers, binding delicate lace, or even acting as an interlining for organza and other sheer textiles. When working with tulle, cut it carefully and staystitch it on paper to keep it from shifting and stretching - you don't want snags ruining your masterpiece! Unless you're working with silk tulle, keep the iron at bay, or risk irreversible meltdown (literally).",
			recommended_techniques: ['Staystitching on paper', 'No heat pressing', 'Binding', 'Interlining']
		},
		{
			name: 'Chiffon',
			slug: 'chiffon',
			image: '/images/fabrics/chiffon.jpg',
			weight: 'Very Light',
			difficulty: 'Advanced',
			description: 'Chiffon is an ethereal, gossamer-like fabric that creates stunning, flowing garments. Its sheer quality and delicate nature make it a favorite for romantic and formal designs.',
			tips: 'Like georgette, chiffon requires careful handling. Stabilize on paper before cutting and use sharp, fine needles. French seams are essential for a clean finish as raw edges will be visible. Consider using silk thread for the most invisible seams.',
			recommended_techniques: ['French seam', 'Pin hem', 'Stitch on paper', 'Fine needles']
		}
	];

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty) {
			case 'Beginner':
				return 'bg-green-100 text-green-800';
			case 'Intermediate':
				return 'bg-yellow-100 text-yellow-800';
			case 'Advanced':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<svelte:head>
	<title>Fabric Library - Skyler's Sewing Secrets</title>
	<meta name="description" content="Explore our comprehensive fabric guide with expert tips on working with cotton, silk, jersey, lace, and more. Learn professional techniques for each fabric type." />
</svelte:head>

<div class="bg-white">
	<!-- Header -->
	<div class="bg-gradient-to-b from-brand-50 to-white">
		<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-serif">
					Fabric Library
				</h1>
				<p class="mt-6 text-lg leading-8 text-gray-600">
					Understanding fabrics is essential to successful sewing. Explore my personal guide to 
					working with different fabrics, with tips and techniques I've learned over years of 
					professional dressmaking.
				</p>
			</div>
		</div>
	</div>

	<!-- Fabric Grid -->
	<div class="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
		<div class="space-y-16">
			{#each fabrics as fabric, index}
				<article 
					id={fabric.slug} 
					class="scroll-mt-24"
				>
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start {index % 2 === 1 ? 'lg:grid-flow-dense' : ''}">
						<!-- Image -->
						<div class="{index % 2 === 1 ? 'lg:col-start-2' : ''}">
							<div class="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
								<OptimizedImage
									src={fabric.image}
									alt={fabric.name}
									width={800}
									class="h-full w-full object-cover"
								/>
							</div>
						</div>

						<!-- Content -->
						<div class="{index % 2 === 1 ? 'lg:col-start-1' : ''}">
							<div class="flex items-center gap-4 mb-4">
								<h2 class="text-3xl font-bold text-gray-900 font-serif">{fabric.name}</h2>
								<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium {getDifficultyColor(fabric.difficulty)}">
									{fabric.difficulty}
								</span>
							</div>

							<div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
								<span class="inline-flex items-center">
									<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
									</svg>
									{fabric.weight}
								</span>
							</div>

							<p class="text-gray-600 mb-6">{fabric.description}</p>

							<div class="bg-brand-50 rounded-xl p-6 mb-6">
								<h3 class="text-sm font-semibold text-brand-900 uppercase tracking-wide mb-3">
									Skyler's Tips
								</h3>
								<p class="text-gray-700 text-sm leading-relaxed">{fabric.tips}</p>
								{#if fabric.pro_tip}
									<div class="mt-4 pt-4 border-t border-brand-200">
										<p class="text-sm text-brand-800">
											<strong class="font-semibold">Pro tip:</strong> {fabric.pro_tip}
										</p>
									</div>
								{/if}
							</div>

							<div>
								<h3 class="text-sm font-semibold text-gray-900 mb-3">Recommended Techniques</h3>
								<div class="flex flex-wrap gap-2">
									{#each fabric.recommended_techniques as technique}
										<span class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
											{technique}
										</span>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</article>

				{#if index < fabrics.length - 1}
					<hr class="border-gray-200" />
				{/if}
			{/each}
		</div>
	</div>

	<!-- Quick Navigation -->
	<div class="bg-gray-50 py-16">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<h2 class="text-2xl font-bold text-gray-900 font-serif mb-8 text-center">Quick Navigation</h2>
			<div class="flex flex-wrap justify-center gap-3">
				{#each fabrics as fabric}
					<a 
						href="#{fabric.slug}"
						class="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200 transition-colors"
					>
						{fabric.name}
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- CTA -->
	<div class="bg-white py-24">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-3xl font-bold tracking-tight text-gray-900 font-serif">
					Master these fabrics in the course
				</h2>
				<p class="mt-6 text-lg leading-8 text-gray-600">
					Learn how to work with each of these fabrics through detailed video tutorials. 
					See the techniques in action and follow along at your own pace.
				</p>
				<div class="mt-10">
					<a href="/checkout">
						<Button size="lg">
							{#snippet children()}
								Start Learning Today
							{/snippet}
						</Button>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
