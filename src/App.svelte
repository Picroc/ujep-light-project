<script lang="ts">
	import AnimationLogo from './components/animationLogo.svelte';
	import AnimationScroller from './components/animationScroller.svelte';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	// import { afterUpdate, beforeUpdate, onMount } from 'svelte';

	let loaded;
	// let showText = true;
	let div;
	let scrollY;

	onMount(() => {
		window.scroll(0 , 0);
	})

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
	{:else if scrollY < 50 }
		<div class='bubble' bind:this={div} in:fly="{{ y: 200, duration: 2000 }}" out:fly="{{ y: 200, duration: 2000 }}">
			<img src='/assets/arrow.gif'>
		</div>
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

	.bubble {
		position: fixed;
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
		bottom: 50px;
	}

	.bubble img {
		max-height: 100px;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>