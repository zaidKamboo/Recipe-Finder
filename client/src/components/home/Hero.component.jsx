import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function HeroHalloween( { enableAnimations = true } = {} ) {
    const titleRef = useRef( null );
    const paraRef = useRef( null );
    const ctaRef = useRef( null );
    const tlRef = useRef( null );

    useEffect( () => {
        if ( !enableAnimations ) return;

        let gsapInstance;
        let timeline;

        ( async () => {
            try {
                const gsapModule = await import( "gsap" );
                gsapInstance = gsapModule.default ?? gsapModule;

                timeline = gsapInstance.timeline();
                tlRef.current = timeline;

                gsapInstance.set( [ titleRef.current, paraRef.current, ctaRef.current ], {
                    y: 18,
                    opacity: 0,
                } );

                timeline
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

                timeline.to(
                    ctaRef.current,
                    {
                        scale: 1.04,
                        duration: 0.45,
                        ease: "sine.out",
                        yoyo: true,
                        repeat: 1,
                    },
                    "+=0.15"
                );
            } catch ( err ) { }
        } )();

        return () => {
            try {
                if ( timeline?.kill ) timeline.kill();
                if ( gsapInstance?.killTweensOf )
                    gsapInstance.killTweensOf( [
                        titleRef.current,
                        paraRef.current,
                        ctaRef.current,
                    ] );
            } catch { }
        };
    }, [ enableAnimations ] );

    return (
        <header
            className="relative w-full h-screen overflow-hidden bg-[#0a060d] text-slate-100"
            role="banner"
        >
            <div className="absolute inset-0">
                <img
                    src="/home/creamy-tomato-pasta.jpg"
                    onError={ ( e ) => {
                        e.currentTarget.src =
                            "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%230a060d'/%3E%3Ctext x='50%' y='50%' fill='orange' font-size='16' text-anchor='middle'%3ERecipe%20Preview%3C/text%3E%3C/svg%3E";
                    } }
                    alt="Recipe Finder Background Dish"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#06040a]/80 via-[#120617]/70 to-[#2b1428]/90" />
            </div>

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
                        Explore thousands of delicious recipes, save your favorites, and cook meals
                        tailored to your taste. Simple, smart, and beautifully organized.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Link
                            ref={ ctaRef }
                            to="/recipes"
                            className="inline-flex items-center px-8 py-3 rounded-2xl bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow-lg hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 transition"
                            aria-label="Browse recipes"
                        >
                            Browse Recipes
                        </Link>
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </header>
    );
}
