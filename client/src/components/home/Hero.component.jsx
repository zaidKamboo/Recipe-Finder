import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function HeroHalloween( { enableAnimations = true } = {} ) {
    const titleRef = useRef( null );
    const paraRef = useRef( null );
    const ctaRef = useRef( null );
    const bgRef = useRef( null );
    const overlayRef = useRef( null );

    const tlRef = useRef( null );        // intro timeline
    const bgLoopRef = useRef( null );    // background loop
    const textLoopRef = useRef( null );  // heading + para loop
    const ctaLoopRef = useRef( null );   // button loop

    useEffect( () => {
        if ( !enableAnimations ) return;

        let gsapInstance;

        ( async () => {
            try {
                const gsapModule = await import( "gsap" );
                gsapInstance = gsapModule.default ?? gsapModule;

                /* -------------------------
                   ✨ Intro Text Entrance
                ------------------------- */
                const introTl = gsapInstance.timeline();
                tlRef.current = introTl;

                gsapInstance.set(
                    [ titleRef.current, paraRef.current, ctaRef.current ],
                    { y: 18, opacity: 0 }
                );

                introTl
                    .to( titleRef.current, {
                        y: 0,
                        opacity: 1,
                        duration: 0.7,
                        ease: "power3.out",
                    } )
                    .to(
                        paraRef.current,
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            ease: "power3.out",
                        },
                        "-=0.35"
                    )
                    .to(
                        ctaRef.current,
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            ease: "back.out(1.2)",
                        },
                        "-=0.25"
                    );

                /* ------------------------------------------
                   🔥 Background Continuous "Breathing" Loop
                   opacity + scale + slight vertical drift
                ------------------------------------------- */
                if ( bgRef.current && overlayRef.current ) {
                    bgLoopRef.current = gsapInstance.timeline( {
                        repeat: -1,
                        yoyo: true,
                        defaults: { ease: "sine.inOut", duration: 4 },
                    } );

                    bgLoopRef.current
                        .to( bgRef.current, {
                            opacity: 0.78,
                            scale: 1.05,
                            y: -8,
                        } )
                        .to(
                            overlayRef.current,
                            {
                                opacity: 0.96,
                            },
                            0
                        );
                }

                /* ------------------------------------
                   🌫️ Floating / Glow Text Loop
                ------------------------------------- */
                if ( titleRef.current && paraRef.current ) {
                    textLoopRef.current = gsapInstance.timeline( {
                        repeat: -1,
                        yoyo: true,
                        delay: 1.1,
                        defaults: { ease: "sine.inOut", duration: 2.5 },
                    } );

                    textLoopRef.current
                        .to( titleRef.current, {
                            y: -4,
                            // subtle glow
                            textShadow: "0 0 18px rgba(255, 122, 26, 0.65)",
                        } )
                        .to(
                            paraRef.current,
                            {
                                y: 3,
                                opacity: 0.9,
                            },
                            0
                        );
                }

                /* ------------------------------------
                   🧡 CTA Button Pulse / Attract Loop
                ------------------------------------- */
                if ( ctaRef.current ) {
                    ctaLoopRef.current = gsapInstance.timeline( {
                        repeat: -1,
                        yoyo: true,
                        delay: 1.4,
                        defaults: { ease: "sine.inOut", duration: 1.8 },
                    } );

                    ctaLoopRef.current
                        .to( ctaRef.current, {
                            scale: 1.06,
                            y: -3,
                            boxShadow: "0 0 28px rgba(255, 122, 26, 0.85)",
                        } )
                        .to( ctaRef.current, {
                            scale: 1.02,
                            boxShadow: "0 0 18px rgba(255, 122, 26, 0.5)",
                        } );
                }
            } catch ( err ) {
                // silently fail in case gsap is not available
            }
        } )();

        return () => {
            try {
                tlRef.current?.kill?.();
                bgLoopRef.current?.kill?.();
                textLoopRef.current?.kill?.();
                ctaLoopRef.current?.kill?.();

                if ( gsapInstance?.killTweensOf ) {
                    gsapInstance.killTweensOf( [
                        titleRef.current,
                        paraRef.current,
                        ctaRef.current,
                        bgRef.current,
                        overlayRef.current,
                    ] );
                }
            } catch {
                // ignore cleanup errors
            }
        };
    }, [ enableAnimations ] );

    return (
        <header
            className="relative w-full h-screen overflow-hidden bg-[#0a060d] text-slate-100"
            role="banner"
        >
            {/* Background Image */ }
            <div className="absolute inset-0">
                <img
                    ref={ bgRef }
                    src="/home/creamy-tomato-pasta.jpg"
                    onError={ ( e ) => {
                        e.currentTarget.src =
                            "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%230a060d'/%3E%3Ctext x='50%' y='50%' fill='orange' font-size='16' text-anchor='middle'%3ERecipe%20Preview%3C/text%3E%3C/svg%3E";
                    } }
                    alt="Recipe Finder Background Dish"
                    className="w-full h-full object-cover opacity-95 transition-all duration-700 will-change-transform will-change-opacity"
                />

                {/* Dark gradient overlay (also animated) */ }
                <div
                    ref={ overlayRef }
                    className="absolute inset-0 bg-gradient-to-b from-[#06040a]/80 via-[#120617]/70 to-[#2b1428]/90 opacity-90 transition-all duration-700"
                />
            </div>

            {/* Center Content */ }
            <div className="relative w-full h-full flex items-center justify-center px-6">
                <div className="w-full max-w-3xl text-center">
                    <h1
                        ref={ titleRef }
                        className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-lg"
                    >
                        Find the perfect recipe today
                    </h1>

                    <p
                        ref={ paraRef }
                        className="mt-4 text-lg sm:text-xl text-slate-300 opacity-95 drop-shadow-md"
                    >
                        Explore thousands of delicious recipes, save your favorites, and
                        cook meals tailored to your taste. Simple, smart, and beautifully
                        organized.
                    </p>

                    <div className="mt-8 flex justify-center">
                        <Link
                            ref={ ctaRef }
                            to="/recipes"
                            className="inline-flex items-center px-8 py-3 rounded-2xl bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow-lg hover:brightness-95"
                        >
                            Browse Recipes
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Fade */ }
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </header>
    );
}
