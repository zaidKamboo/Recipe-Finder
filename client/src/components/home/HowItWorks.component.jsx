import React, { useEffect, useRef } from "react";
import { HiOutlineSearch, HiOutlineHeart, HiOutlineFire } from "react-icons/hi";

const STEPS = [
    {
        id: 1,
        title: "Browse recipes",
        icon: HiOutlineSearch,
        text: "Explore curated collections, trending dishes, and categories tailored to your taste.",
    },
    {
        id: 2,
        title: "Save your favourites",
        icon: HiOutlineHeart,
        text: "Bookmark the recipes you love so you can come back to them anytime.",
    },
    {
        id: 3,
        title: "Cook & enjoy",
        icon: HiOutlineFire,
        text: "Follow step-by-step instructions in your kitchen and enjoy a great meal.",
    },
];

export default function HowItWorks( { enableAnimations = true } = {} ) {
    const sectionRef = useRef( null );
    const gsapCtxRef = useRef( null );

    useEffect( () => {
        if ( !enableAnimations ) return;

        let gsapInstance;
        let ScrollTrigger;

        ( async () => {
            try {
                const gsapModule = await import( "gsap" );
                const stModule = await import( "gsap/ScrollTrigger" );

                gsapInstance = gsapModule.default ?? gsapModule;
                ScrollTrigger = stModule.ScrollTrigger || stModule.default;

                if ( !gsapInstance || !ScrollTrigger ) return;
                gsapInstance.registerPlugin( ScrollTrigger );

                const section = sectionRef.current;
                if ( !section ) return;

                const ctx = gsapInstance.context( () => {
                    const stepCards = gsapInstance.utils.toArray( "[data-how-step]" );
                    const lineEl = section.querySelector( "[data-how-line]" );

                    // SECTION container: fade + move with scroll
                    gsapInstance.fromTo(
                        section,
                        {
                            opacity: 0,
                            y: 80,
                            scale: 0.96,
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: section,
                                start: "top 80%",
                                end: "bottom 40%",
                                scrub: 0.6,
                            },
                        }
                    );

                    // Vertical (or horizontal) line "grows" with scroll
                    if ( lineEl ) {
                        gsapInstance.fromTo(
                            lineEl,
                            { scaleY: 0, opacity: 0 },
                            {
                                scaleY: 1,
                                opacity: 1,
                                transformOrigin: "top center",
                                ease: "power2.out",
                                scrollTrigger: {
                                    trigger: section,
                                    start: "top 78%",
                                    end: "bottom 40%",
                                    scrub: 0.7,
                                },
                            }
                        );
                    }

                    // Steps: staggered fade + slide, tied to scroll
                    if ( stepCards.length ) {
                        gsapInstance.from( stepCards, {
                            opacity: 0,
                            y: 40,
                            scale: 0.97,
                            ease: "power3.out",
                            stagger: {
                                each: 0.18,
                                from: "start",
                            },
                            scrollTrigger: {
                                trigger: section,
                                start: "top 78%",
                                end: "bottom 35%",
                                scrub: 0.8,
                            },
                        } );

                        // Optional: subtle "active step" effect when center of viewport hits each card
                        stepCards.forEach( ( el ) => {
                            gsapInstance.to( el, {
                                boxShadow: "0 0 24px rgba(255,122,26,0.25)",
                                borderColor: "#ff7a1a",
                                y: -6,
                                ease: "power2.out",
                                scrollTrigger: {
                                    trigger: el,
                                    start: "center 70%", // when step card hits upper-middle
                                    end: "center 40%",
                                    scrub: true,
                                },
                            } );
                        } );
                    }
                }, section );

                gsapCtxRef.current = ctx;
            } catch ( err ) {
                console.error( "HowItWorks GSAP error:", err );
            }
        } )();

        return () => {
            try {
                gsapCtxRef.current?.revert?.();
            } catch {
                // ignore
            }
        };
    }, [ enableAnimations ] );

    return (
        <section
            ref={ sectionRef }
            className="
        relative
        rounded-2xl p-6 sm:p-8
        bg-gradient-to-br from-[#08050a] via-[#140716] to-[#221322]
        border border-[#2b1e2b] shadow-xl text-slate-100
        overflow-hidden
      "
        >
            {/* soft background glow */ }
            <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={ {
                    background:
                        "radial-gradient(circle at 0% 0%, rgba(255,122,26,0.2), transparent 60%)",
                } }
            />

            <div className="relative flex flex-col gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-semibold flex items-center gap-3">
                    <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-[#1b0b14] border border-[#3b2332] text-orange-300">
                        🎯
                    </span>
                    How it works
                </h2>
                <p className="text-sm sm:text-base text-slate-400 max-w-xl">
                    From discovering a recipe to serving it on your plate, everything is kept
                    simple and delightful.
                </p>
            </div>

            <div className="relative">
                {/* connecting line (vertical on mobile, horizontal on lg) */ }
                <div
                    data-how-line
                    className="
            hidden sm:block
            absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-6 bottom-6
            lg:left-[18%] lg:right-[18%] lg:top-1/2 lg:-translate-y-1/2
            bg-gradient-to-b sm:bg-gradient-to-b lg:bg-gradient-to-r
            from-[#ff7a1a] via-[#ffb48a] to-[#ff7a1a]
            opacity-70
          "
                    style={ {
                        width: "2px",
                        // For large screens, make it horizontal instead
                        height: "auto",
                    } }
                />

                <div
                    className="
            grid grid-cols-1 lg:grid-cols-3 gap-6 relative
          "
                >
                    { STEPS.map( ( step, idx ) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={ step.id }
                                data-how-step
                                className="
                  relative
                  flex items-start gap-3 sm:gap-4
                  lg:flex-col lg:items-start
                  p-4 sm:p-5
                  rounded-2xl
                  bg-[rgba(7,6,10,0.92)]
                  border border-[#2b1e2b]
                  transition-transform transition-shadow
                "
                            >
                                {/* step marker / number */ }
                                <div className="flex flex-col items-center mr-2 lg:mr-0">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#160a11] border border-[#3a2333] text-xs sm:text-sm text-orange-300 font-semibold">
                                        { String( step.id ).padStart( 2, "0" ) }
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                        <span className="inline-flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-lg bg-[#1c1017] border border-[#3a2333] text-orange-300 text-xl">
                                            <Icon />
                                        </span>
                                        <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                                            { step.title }
                                        </h3>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-400">
                                        { step.text }
                                    </p>
                                </div>
                            </div>
                        );
                    } ) }
                </div>
            </div>
        </section>
    );
}
