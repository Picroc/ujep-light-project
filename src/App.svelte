<script lang="ts">
	import AnimationLogo from './components/animationLogo.svelte';
	import AnimationScroller from './components/animationScroller.svelte';
	import { fade, fly } from 'svelte/transition';
	// import { afterUpdate, beforeUpdate, onMount } from 'svelte';

	let loaded;
	// let showText = true;
	let div;
	let scrollY;

	// onMount(() => {
	// 	showText = div.getBoundingClientRect().y > 0;
	// })
	//
	// afterUpdate(() => {
	// 	showText = div ? div.getBoundingClientRect().y > 0 : true;
	// 	console.log(div && div.getBoundingClientRect());
	// });
</script>

<svelte:window bind:scrollY />
<AnimationScroller bind:loaded />
<main>
	{ #if !loaded }
		<AnimationLogo />
	{:else }
		<h2 bind:this={div} in:fly="{{ y: -200, duration: 2000 }}" out:fade>Scroll down</h2>
	{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h2 {
		color: #6b5955;
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