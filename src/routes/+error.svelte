<script lang="ts">
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	
	// Default values if page status/error aren't available
	let status = $derived(page.status || 404);
	let message = $derived(page.error?.message || 'Page not found');
	
	const gameLinks = [
		{ name: '5-Letter Wordle Solver', url: '/5-letter-wordle-solver', icon: '📝', color: 'from-teal-500 to-teal-700' },
		{ name: 'Quordle Solver', url: '/quordle-solver', icon: '🔢', color: 'from-blue-500 to-indigo-600' },
		{ name: 'Phoodle Answer', url: '/phoodle-answer-today', icon: '🍳', color: 'from-orange-400 to-red-500' },
		{ name: 'Semantle Answer', url: '/semantle-answer-today', icon: '🧠', color: 'from-purple-500 to-fuchsia-600' }
	];
</script>

<svelte:head>
	<title>{status} Error</title>
	<meta name="description" content="Oops! Looks like you've landed on a missing page." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
	<!-- Animated Background Elements -->
	<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl rounded-blob animate-blob"></div>
	<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

	<!-- Main Card Content -->
	<div 
		in:fly={{ y: 50, duration: 800, delay: 200 }} 
		class="relative z-10 w-full max-w-2xl"
	>
		<div class="glass-card rounded-3xl p-8 sm:p-12 text-center border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/60 overflow-hidden relative">
			
			<!-- Decorative Top Border Glow -->
			<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 opacity-80"></div>

			<!-- Error Status Code -->
			<div class="relative inline-block mb-6">
				<h1 class="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 tracking-tighter drop-shadow-xl select-none">
					{status}
				</h1>
				<!-- Floating glitch effect behind number -->
				<div class="absolute inset-0 text-8xl sm:text-9xl font-black text-teal-500/30 blur-sm mix-blend-screen transform -translate-x-1 translate-y-1 select-none pointer-events-none" aria-hidden="true">
					{status}
				</div>
				<div class="absolute inset-0 text-8xl sm:text-9xl font-black text-purple-500/30 blur-sm mix-blend-screen transform translate-x-1 -translate-y-1 select-none pointer-events-none" aria-hidden="true">
					{status}
				</div>
			</div>

			<h2 class="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
				{status === 404 ? "We couldn't find that word..." : "Oops! Something went wrong."}
			</h2>
			
			<p class="text-slate-300 mb-10 max-w-md mx-auto text-lg leading-relaxed">
				{status === 404 
					? "Looks like you searched for a term that isn't in our dictionary. Don't worry, let's get you back to solving puzzles!" 
					: message}
			</p>

			<!-- Quick Navigation Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
				{#each gameLinks as link, i}
					<a 
						href={link.url}
						class="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-{link.color.split('-')[1]}/20"
						in:fade={{ delay: 400 + (i * 100), duration: 500 }}
					>
						<!-- Colorful Icon Container -->
						<div class="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br {link.color} shadow-inner text-xl">
							{link.icon}
						</div>
						
						<div class="flex-1">
							<span class="block font-semibold text-slate-100 group-hover:text-white transition-colors">{link.name}</span>
							<span class="block text-sm text-slate-400">Play now &rarr;</span>
						</div>
					</a>
				{/each}
			</div>

			<!-- Back to Home Button -->
			<a 
				href="/"
				class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50 hover:scale-105 group"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Return Home
			</a>
		</div>
	</div>
</div>

<style>
	/* Background blobs animation */
	@keyframes blob {
		0% { transform: translate(0px, 0px) scale(1); }
		33% { transform: translate(30px, -50px) scale(1.1); }
		66% { transform: translate(-20px, 20px) scale(0.9); }
		100% { transform: translate(0px, 0px) scale(1); }
	}
	
	.animate-blob {
		animation: blob 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
	}
	
	.animation-delay-2000 {
		animation-delay: 2s;
	}
	
	.animation-delay-4000 {
		animation-delay: 4s;
	}

	.glass-card {
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
	}
</style>
