<script>
    import { styles } from '../utils/styles';
    import ScrollerBlock from './scrollerBlock.svelte';

    const COMMON_DURATION = 500;

    const infoBlocks = [
        {
            id: 'stars',
            stopFrame: 168,
            duration: COMMON_DURATION,
            title: 'Hvězdy',
            text: 'Světlo vzniká chemickou reakcí v jádru hvězdy – termonukleární fúze vodíku na helium.\n' +
                'Tato reakce uvolňuje energii v podobě záření procházející hvězdou ven.',
            position: 'right',
        },
        {
            id: 'sun',
            stopFrame: 224,
            duration: COMMON_DURATION,
            title: 'Slunce',
            text: 'Světlo vzniká chemickou reakcí v jádru hvězdy – termonukleární fúze vodíku na helium.\n' +
                'Tato reakce uvolňuje energii v podobě záření procházející hvězdou ven.',
            position: 'right',
        },
        {
            id: 'rad',
            stopFrame: 319,
            duration: COMMON_DURATION,
            title: 'Radiace',
            text: 'Emise energie ve formě vlnění (elektromagnetického záření) nebo částic skrze prostor či  hmotu.\n' +
                'Záření vzniká z hvězd, akrečních disků (rozptýlený materiál obíhající okolo tělesa jako např. hvězdy nebo černé díry), reliktního záření z období po velkém třesku, mezihvězdného mračna (uskupení plynu, plazmatu a prachu v galaxiích)',
        },
        {
            id: 'polar',
            stopFrame: 389,
            duration: COMMON_DURATION,
            title: 'Polární záře',
            text: 'Na Slunci vznikají vlivem nerovností v magnetickém poli sluneční skvrny, u kterých vznikne masivní erupce. Mrak částic z protonů, elektronů a alfa částic letí vesmírem. Část se ho stáčí po spirálách směrem k magnetickým pólům Země, sráží se s atmosférou a emituje se elektromagnetické záření ve viditelném spektru.\n' +
                'Je jevem tzv. vesmírného počasí.',
            position: 'right',
        },
        {
            id: 'lightning',
            stopFrame: 454,
            duration: COMMON_DURATION,
            title: 'Blesk',
            text: 'Přiblížením kladně nabitého oblaku k záporně nabitému vznikne vysoké elektrické napětí, které se vyrovná světelným výbojem – bleskem. To samé může nastat mezi mrakem a zemí.',
        },
        {
            id: 'mushrooms',
            stopFrame: 533,
            duration: COMMON_DURATION,
            title: 'Bioluminiscenční Houby',
            text: 'Světlo vzniká chemickou reakcí kyslíku, vápníku a luciferinu za přítomnosti luciferázy. Při reakci se uvolňuje energie v podobě světla a tepla (bioluminiscence). Více než 80 % energie je emitováno v podobě světla',
            position: 'right',
        },
        {
            id: 'jellyfish',
            stopFrame: 606,
            duration: COMMON_DURATION,
            title: 'Medúza',
            text: 'Světlo vzniká chemickou reakcí kyslíku, vápníku a luciferinu za přítomnosti luciferázy. Při reakci se uvolňuje energie v podobě světla a tepla (bioluminiscence). Více než 80 % energie je emitováno v podobě světla',
        },
        {
            id: 'fire',
            stopFrame: 744,
            duration: COMMON_DURATION,
            title: 'Oheň',
            text: 'Vzniká hořením, tedy chemickou reakcí mezi hořlavinou, kyslíkem a zdrojem iniciace, při které se uvolňuje energie v podobě tepla a světla.',
        },
        {
            id: 'bulb',
            stopFrame: 828,
            duration: COMMON_DURATION,
            title: 'Žárovka',
            text: 'Světlo je vyzařováno wolframovým vodičem (vláknem) zahřátým elektrickým proudem na vysokou teplotu. Většina energie je ztracena vyzařovaným teplem.',
            position: 'right',
        },
        {
            id: 'lamp',
            stopFrame: 880,
            duration: COMMON_DURATION,
            title: 'Zářivka',
            text: 'Elektrony se srážejí s atomy rtuti. Elektrony atomů rtuti mají tak nestabilní hladinu energie. Aby se tyto elektrony dostaly na stabilní (nižší) hladinu energie, emitují záření v převážně ultrafialových délkách, ty jsou látkou luminofor odráženy ve formě viditelného světla.\n' +
                'Zářivky jsou efektivnější než žárovky (méně tepla, více světla).\n',
            position: 'right',
        },
        {
            id: 'mac',
            stopFrame: 967,
            duration: COMMON_DURATION,
            title: 'Monitor',
            text: 'Light-Emitting Diode funuje na principu elektroluminiscence, tedy luminiscence, při níž dochází k přeměně elektrické energie ve světlo při průchodu proudu vhodným materiálem (luminoforem), na rozdíl od emise světla (incandescence) nebo od reakce různých chemikálií (chemiluminiscence). Prochází-li elektrický náboj luminoforem, elektrony s vysokou energetickou hladinou uvolňují svou energii ve formě fotonů – světla. Barva světa se odvíjí obvykle od barvy diody. Spojením červené, zelené a modré diody můžeme dosáhnout různých barev úpravou poměrů světelnosti nebo bílé.',
        },
        {
            id: 'laser',
            stopFrame: 1056,
            duration: COMMON_DURATION,
            title: 'Laser',
            text: 'Výbojka (trubice naplněná směsí plynů s elektrickým vodičem) dodává energii do aktivního prostředí (obvykle směs plynů), kde vybudí elektrony na vyšší, nestabilní energetickou hladinu. Elektrony následně přestoupí na nižší energetickou hladinu a přitom vyzáří množství energie ve formě fotonů. Ty interagují s dalšími elektrony s vyšší hladinou energie, čímž spouštějí tzv. stimulovanou emisi fotonů. Aktivní část laseru je umístěna v prostoru se zrcadly, ve kterém se paprsky odrážejí a exponenciálně umocňují emisi světla, které je nasměrováno ven z laseru polopropustným sklem.\n',
            position: 'right',
        },
    ].sort((a, b) => a.stopFrame - b.stopFrame);
    const scrollToBlock = infoBlocks.reduce((prev, curr) => ({ ...prev, [curr.stopFrame]: curr }), {});

    // function calculateFrame(currentScroll) { // 720
    //     const currentFrame = Math.floor(currentScroll / 20); // 36
    //     let toAdd = 0; // 500
    //     let offsetFrame = currentFrame;
    //     for (const block of infoBlocks) {
    //         if (offsetFrame >= block.stopFrame) {
    //             toAdd += block.duration;
    //             offsetFrame = Math.floor((currentScroll - toAdd) / 20); // 11
    //             if (offsetFrame <= block.stopFrame) {
    //                 return block.stopFrame;
    //             }
    //         }
    //     }
    //     console.log('TOADD', toAdd);
    //     return Math.floor((currentScroll - toAdd) / 20);
    // }

    let windowHeight = window.innerHeight;
    let scrollValue = 0;
    let blockScrollValue = 0;
    let scrollEnabled = true;
    export let loaded = false;

    const framesCount = 1116;
    const pixelsPerScroll = 20;
    const calcHeight =
        `${framesCount * pixelsPerScroll + windowHeight + infoBlocks.reduce((prev, curr) => prev + curr.duration, 0)}px`;

    const frameMapper = [...Array(
        framesCount * pixelsPerScroll + windowHeight + infoBlocks.reduce((prev, curr) => prev + curr.duration, 0)).keys()
    ].map((scrollVal) => {
        const currentFrame = Math.floor(scrollVal / 20); // 36
        let toAdd = 0; // 500
        let offsetFrame = currentFrame;
        for (const block of infoBlocks) {
            if (offsetFrame >= block.stopFrame) {
                toAdd += block.duration;
                offsetFrame = Math.floor((scrollVal - toAdd) / 20); // 11
                if (offsetFrame <= block.stopFrame) {
                    return block.stopFrame;
                }
            }
        }
        return Math.floor((scrollVal - toAdd) / 20);
    });

    // $: {
    //     console.log('SCROLL', scrollValue);
    //     console.log('FRAME', frameMapper[scrollValue]);
    // }


    $: source = scrollValue > 20 ? `/assets/animation/animation_frame${Math.min(frameMapper[scrollValue], framesCount)}.jpg` : '';

    async function preload() {
        console.log('Function working');
        const framesArray = [...Array(framesCount).keys()].map(number =>
            new Promise((resolve => {
                const img = new Image();
                img.onload = resolve;
                img.src = `/assets/animation/animation_frame${number + 1}.jpg`;
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
<!--{ #if scrollValue > 1000 && scrollValue < 1500 }-->
<!--    <div class='testSpacer'>-->
<!--        <div></div>-->
<!--    </div>-->
<!--{/if}-->


{#await preload() then _}
    <div class='backgroundAnimation'>
        {#if source}
            <img src={source} alt=''>
        {/if}
    </div>
{/await}

{ #if scrollToBlock[frameMapper[scrollValue]] }
    <ScrollerBlock title={scrollToBlock[frameMapper[scrollValue]].title}
                   text={scrollToBlock[frameMapper[scrollValue]].text}
                   position={scrollToBlock[frameMapper[scrollValue]].position || 'left'}
                   downed={scrollToBlock[frameMapper[scrollValue]].id === 'laser'}
    />
{/if}

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

    .testSpacer {
        position: fixed;
        width: 100%;
        height: 100%;
        outline: red 3px inset;
        z-index: 200;
        overflow: scroll;
    }

    .testSpacer div {
        position: relative;
        height: 2000px;
    }
</style>