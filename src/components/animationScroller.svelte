<script>
    import { styles } from '../utils/styles';
    let windowHeight = 0;
    let scrollValue = 0;

    const framesCount = 1116;
    const pixelsPerScroll = 20;
    $: calcHeight = `${framesCount * pixelsPerScroll + windowHeight}px`;


    $: source = `/assets/animation/animation_frame${Math.min(Math.floor(scrollValue / 20) + 1, framesCount)}.png`;

</script>
<div use:styles={{calcHeight}} class='scrollSpacer'>
</div>

<div class='backgroundAnimation'>
    <img src={source} alt=''>
</div>
<div class='testRender'>
    {scrollValue}
</div>

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
    }

    .testRender {
        position: fixed;
        z-index: 100;
        top: -5px;
    }
</style>