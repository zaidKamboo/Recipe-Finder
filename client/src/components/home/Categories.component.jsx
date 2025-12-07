import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
    GiCroissant,
    GiHotMeal,
    GiFruitBowl,
    GiCupcake,
    GiHamburger,
    GiNoodles,
    GiChickenOven,
    GiPieSlice,
} from "react-icons/gi";

const CATEGORIES = [
    { key: "breakfast", label: "Breakfast", icon: GiCroissant },
    { key: "quick", label: "Quick & Easy", icon: GiHotMeal },
    { key: "vegetarian", label: "Vegetarian", icon: GiFruitBowl },
    { key: "dessert", label: "Dessert", icon: GiCupcake },
    { key: "fastfood", label: "Fast Food", icon: GiHamburger },
    { key: "asian", label: "Asian", icon: GiNoodles },
    { key: "nonveg", label: "Non-Veg", icon: GiChickenOven },
    { key: "baking", label: "Baking", icon: GiPieSlice },
];

export default function Categories( { enableAnimations = true } = {} ) {
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
                    const cards = gsapInstance.utils.toArray(
                        "[data-category-card]"
                    );

                    if ( !cards.length ) return;

                    // SECTION: fade + move in/out with scroll
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
                                start: "top 80%",   // start anim when top is near bottom of viewport
                                end: "bottom 40%",  // done anim when bottom is near middle
                                scrub: 0.5,         // tie progress to scroll (smooth)
                            },
                        }
                    );

                    // CARDS: staggered fade/slide in, reversed on scroll up
                    gsapInstance.from( cards, {
                        opacity: 0,
                        y: 40,
                        scale: 0.96,
                        ease: "power3.out",
                        stagger: {
                            each: 0.15,
                            from: "start",
                        },
                        scrollTrigger: {
                            trigger: section,
                            start: "top 78%",
                            end: "bottom 35%",
                            scrub: 0.7,
                        },
                    } );

                    // Soft border / glow that intensifies as you scroll over the section
                    gsapInstance.fromTo(
                        section,
                        {
                            boxShadow: "0 0 0 rgba(255,122,26,0)",
                            borderColor: "#2b1e2b",
                        },
                        {
                            boxShadow: "0 0 28px rgba(255,122,26,0.32)",
                            borderColor: "#ff7a1a",
                            ease: "sine.inOut",
                            scrollTrigger: {
                                trigger: section,
                                start: "top 85%",
                                end: "bottom 30%",
                                scrub: 1,
                            },
                        }
                    );
                }, section );

                gsapCtxRef.current = ctx;
            } catch ( err ) {
                // silent fail
                console.error( "Categories GSAP error:", err );
            }
        } )();

        return () => {
            // Clean up all animations & ScrollTriggers for this component
            try {
                gsapCtxRef.current?.revert?.();
            } catch {
                // ignore
            }
        };
    }, [ enableAnimations ] );

    return (
        <div
            ref={ sectionRef }
            className="
                relative
                rounded-2xl p-6 
                bg-gradient-to-br from-[#08050a] to-[#221322] 
                border border-[#2b1e2b] shadow-xl text-slate-100
                overflow-hidden
            "
        >
            {/* Soft inner glow accent */ }
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={ {
                    background:
                        "radial-gradient(circle at 10% 0%, rgba(255,122,26,0.22), transparent 55%)",
                } }
            />

            <h3 className="relative text-xl font-semibold mb-5 flex items-center gap-3">
                <span className="inline-flex w-8 h-8 justify-center items-center rounded-lg bg-[#1a0b14] border border-[#3b2332] text-orange-300">
                    🍽️
                </span>
                Explore Categories
            </h3>

            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
                { CATEGORIES.map( ( c ) => {
                    const Icon = c.icon;
                    return (
                        <Link
                            key={ c.key }
                            to={ `/recipes?category=${c.key}` }
                            data-category-card
                            className="
                                group flex flex-col items-start p-4 rounded-xl 
                                bg-gradient-to-br from-[#0b0710] to-[#221322] 
                                border border-[#2b1e2b] shadow-md transition 
                                hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#ff7a1a]
                                hover:scale-[1.02]
                            "
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#160a11] border border-[#3a2333] text-orange-300 text-2xl">
                                    <Icon />
                                </span>
                                <span className="font-semibold text-slate-200">
                                    { c.label }
                                </span>
                            </div>

                            <div className="mt-2 text-xs text-slate-400 group-hover:text-orange-300 transition">
                                Popular choices · Explore now
                            </div>
                        </Link>
                    );
                } ) }
            </div>
        </div>
    );
}
