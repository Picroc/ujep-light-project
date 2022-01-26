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
    }

    .left {
        left: 50px;
    }

    .right {
        right: 50px;
    }

    .downed {
        top: 60%;
    }
</style>