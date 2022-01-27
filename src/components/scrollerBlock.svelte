<script>
    import { fly } from 'svelte/transition';

    export let title;
    export let text;
    export let svgSource;
    export let position = 'left';
    export let downed = false;
</script>

<div transition:fly={{ x: position === 'left' ? -200 : 200, duration: 1000 }} class='scrollerBlock {position} {`${ downed ? "downed" : "" }`}'>
    <h2>{title}</h2>
    <p>{text}</p>
    { #if svgSource }
        <div class='sourceGraph'>
            <img src={svgSource} />
        </div>
    {/if}
</div>

<style>
    .scrollerBlock {
        position: fixed;
        top: 50%;
        transform: translate(0, -50%);
        /*bottom: 0;*/
        margin-top: auto;
        margin-bottom: auto;
        width: 22%;
        line-height: 25px;
        font-size: large;
        white-space: pre-wrap;
    }

    .scrollerBlock p {
        margin: 0;
    }

    .scrollerBlock h2 {
        margin: 0;
    }

    .sourceGraph img {
        max-height: 100px;
        height: 100px;
    }

    .left {
        left: 50px;
    }

    .right {
        right: 50px;
    }

    .downed {
        top: 70%;
    }
</style>