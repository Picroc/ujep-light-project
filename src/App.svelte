<script lang="ts">
	import AnimationLogo from './components/animationLogo.svelte';
	import AnimationScroller from './components/animationScroller.svelte';

	export let name: string;
</script>

<main>
	<AnimationScroller />
	<AnimationLogo />
	<p>This is a placeholder for the LIGHT project.</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>