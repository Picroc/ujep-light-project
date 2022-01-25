<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let canvas;

    onMount(() => {
        const ctx = canvas.getContext('2d');
        let frame = requestAnimationFrame(loop);

        function loop(t) {
            frame = requestAnimationFrame(loop);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            for (let p = 0; p < imageData.data.length; p += 4) {
                const i = p / 4;
                const x = i % canvas.width;
                const y = i / canvas.width >>> 0;

                const r = 64 + (128 * x / canvas.width) + (64 * Math.sin(t / 1000));
                const g = 64 + (128 * y / canvas.height) + (64 * Math.cos(t / 1000));
                const b = 128;

                imageData.data[p + 0] = r;
                imageData.data[p + 1] = g;
                imageData.data[p + 2] = b;
                imageData.data[p + 3] = 255;
            }

            ctx.putImageData(imageData, 0, 0);
        }

        return () => {
            cancelAnimationFrame(frame);
        };
    });
</script>

<canvas
    transition:fade
    bind:this={canvas}
    width={32}
    height={32}
></canvas>


<style>
    canvas {
        width: 10%;
        height: 10%;
        background-color: #666;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
        -webkit-mask: url(/assets/logo.svg) 50% 50% no-repeat;
        mask: url(/assets/logo.svg) 50% 50% no-repeat;
        position: absolute;
    }
</style>
