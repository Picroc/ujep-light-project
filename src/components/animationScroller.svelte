<script>
    import { styles } from '../utils/styles';
    let windowHeight = 0;
    let scrollValue = 0;
    export let loaded = false;

    const framesCount = 1116;
    const pixelsPerScroll = 20;
    $: calcHeight = `${framesCount * pixelsPerScroll + windowHeight}px`;


    $: source = scrollValue > 20 ? `/assets/animation/animation_frame${Math.min(Math.floor(scrollValue / 20), framesCount)}.png` : '';

    async function preload() {
        console.log('Function working');
        const framesArray = [...Array(framesCount).keys()].map(number =>
            new Promise((resolve => {
                const img = new Image();
                img.onload = resolve;
                img.src = `/assets/animation/animation_frame${number + 1}.png`;
                console.log('Loading', img.src);
            }))
        );

        await Promise.all(framesArray);
        loaded = true;

        return Promise.resolve();
    }

</script>
<div use:styles={{calcHeight}} class='scrollSpacer'>
</div>

{#await preload() then _}
    <div class='backgroundAnimation'>
        {#if source}
            <img src={source} alt=''>
        {/if}
    </div>
{/await}

<svelte:window bind:scrollY={scrollValue} bind:innerHeight={windowHeight} />

<style>
    .scrollSpacer {
        position: absolute;
        width: 100%;
        height: var(--calcHeight);
    }

    .backgroundAnimation {
        position: fixed;
        z-index: -1;
        width: 100%;
        height: 100%;
    }

    .backgroundAnimation img {
        width: 100%;
        height: 100%;
    }
</style>