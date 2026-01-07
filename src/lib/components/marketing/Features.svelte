<script lang="ts">
	const modules = [
		{
			title: 'Module 1: Basics',
			description: 'Master essential tools, fabric cutting, machine sewing, and fundamental hand stitches including tailor\'s stitch, blanket stitch, and invisible stitch. Plus guides on staystitching and interlinings.',
			moduleNumber: 1
		},
		{
			title: 'Module 2: Seams',
			description: 'Learn professional seam finishes: French seams, pin hems, flat felled seams, quick binding, Hong Kong binding, and how to make and attach your own bias binding strips.',
			moduleNumber: 2
		},
		{
			title: 'Module 3: Zippers',
			description: 'Perfect your zipper techniques with covered zips, exposed zips, and the elegant invisible zip in a French seam for a truly professional finish.',
			moduleNumber: 3
		},
		{
			title: 'Module 4: Shapes',
			description: 'Create beautiful structural elements: straps, rouleaux loops, belts, collar corners, curved binding, piping, mitred corners, and corset boning techniques.',
			moduleNumber: 4
		},
		{
			title: 'Module 5: Pockets',
			description: 'Add functional elegance with rounded pockets, lined pockets, side pockets in French seams, and the iconic Dior flap pocket detail.',
			moduleNumber: 5
		},
		{
			title: 'Module 6: Fabric Manipulation',
			description: 'Transform your fabrics with lace appliqué, 3D appliqué, gathered frills, pintucks, pleats, and flares for stunning decorative effects.',
			moduleNumber: 6
		},
		{
			title: 'Bonus: Chanel Skirt',
			description: 'Put your skills together in this comprehensive bonus tutorial where you\'ll create your own beautiful Chanel-style skirt from start to finish.',
			moduleNumber: 7,
			isBonus: true
		}
	];
</script>

<section class="bg-gray-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<h2 class="text-base font-semibold leading-7 text-brand-600">Modules Content Overview</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-serif">
				Designed to complete each other
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				Each module builds upon the last to create a seamless learning experience. 
				You'll master the skills while unlocking your inner artist, because here, sewing truly becomes art.
			</p>
		</div>
		<div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
			<dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
				{#each modules as module}
					<div class="relative flex flex-col bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
						<dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg {module.isBonus ? 'bg-yellow-500' : 'bg-brand-600'}">
								<span class="text-white font-bold text-sm">{module.isBonus ? '★' : module.moduleNumber}</span>
							</div>
							{module.title}
						</dt>
						<dd class="mt-4 flex flex-auto flex-col text-sm leading-6 text-gray-600">
							<p class="flex-auto">{module.description}</p>
						</dd>
					</div>
				{/each}
			</dl>
		</div>
		<div class="mt-12 text-center">
			<a 
				href="/modules" 
				class="text-sm font-semibold leading-6 text-brand-600 hover:text-brand-500"
			>
				View all modules and lessons <span aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>
</section>
