<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		onclose?: () => void;
		children: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		size = 'md',
		onclose,
		children,
		footer
	}: Props = $props();

	const sizeClasses: Record<string, string> = {
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-lg',
		lg: 'sm:max-w-2xl',
		xl: 'sm:max-w-4xl'
	};

	function handleClose() {
		open = false;
		onclose?.();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 z-50 overflow-y-auto"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
	>
		<div 
			class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
			onclick={handleBackdropClick}
		>
			<!-- Background overlay -->
			<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

			<!-- Modal panel -->
			<div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full {sizeClasses[size]}">
				{#if title}
					<div class="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
						<h3 class="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
							{title}
						</h3>
						<button
							type="button"
							class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
							onclick={handleClose}
						>
							<span class="sr-only">Close</span>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/if}

				<div class="px-4 py-5 sm:p-6">
					{@render children()}
				</div>

				{#if footer}
					<div class="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
						{@render footer()}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
