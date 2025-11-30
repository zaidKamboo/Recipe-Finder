import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    fetchTrendingRecipes,
    selectAllTrendingRecipes,
    selectTrendingStatus,
} from "../../store/slices/trending_recipes.slice";

/* ---------------- DemoCard + helpers (inlined) ---------------- */

function escapeXml( unsafe = "" ) {
    return String( unsafe )
        .replaceAll( "&", "&amp;" )
        .replaceAll( "<", "&lt;" )
        .replaceAll( ">", "&gt;" )
        .replaceAll( '"', "&quot;" )
        .replaceAll( "'", "&apos;" );
}

function makePlaceholder( title = "Recipe" ) {
    const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
      <rect width='100%' height='100%' fill='#120617'/>
      <g fill='#ffd8b2' font-family='system-ui, Arial, sans-serif' text-anchor='middle'>
        <text x='50%' y='42%' font-size='48' font-weight='700'>${escapeXml( title )}</text>
        <text x='50%' y='62%' font-size='22' fill='#f3e0d0' opacity='0.85'>Demo · 25 min</text>
      </g>
    </svg>
  `;
    return `data:image/svg+xml;utf8,${encodeURIComponent( svg )}`;
}

/**
 * Small demo / real-data card.
 * Single-line controls (View) use rounded-full for the modern look.
 */
function DemoCard( { item } ) {
    const placeholder = makePlaceholder( item.title );
    return (
        <article
            className="rounded-2xl overflow-hidden border border-[#2b1e2b] bg-gradient-to-br from-[#0b0710] to-[#221322] shadow-lg transform-gpu transition hover:-translate-y-1 hover:shadow-2xl"
            aria-label={ item.title }
        >
            <div className="w-full h-44 sm:h-48 bg-slate-900">
                <img
                    src={ item.image || placeholder }
                    alt={ item.title }
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-orange-300">{ item.title }</h3>
                <p className="mt-1 text-sm text-slate-300">{ item.subtitle }</p>

                <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-400">{ item.time } · { item.servings }</div>

                    <Link
                        to={ item.link || "/recipes" }
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black text-sm font-semibold"
                        aria-label={ `View ${item.title}` }
                    >
                        View
                    </Link>
                </div>
            </div>
        </article>
    );
}

/* ---------------- TrendingRecipesConnected (main) ---------------- */

export default function TrendingRecipesConnected( { pageSize = 6 } ) {
    const dispatch = useDispatch();
    const trending = useSelector( selectAllTrendingRecipes ) || [];
    console.log( trending )
    const status = useSelector( selectTrendingStatus );

    useEffect( () => {
        dispatch( fetchTrendingRecipes( { page: 1, pageSize } ) );
    }, [ dispatch, pageSize ] );

    const demoData = [
        { id: "t-demo-1", title: "Sinister Tomato Pasta", subtitle: "Comfort · 25 min", time: "25 main", servings: "4 servings" },
        { id: "t-demo-2", title: "Spicy Pumpkin Risotto", subtitle: "Autumn special · 40 min", time: "40 min", servings: "3 servings" },
        { id: "t-demo-3", title: "Black Garlic Ramen", subtitle: "Umami broth · 30 min", time: "30 min", servings: "2 servings" },
        { id: "t-demo-4", title: "Witch's Herb Salad", subtitle: "Fresh · 10 min", time: "10 min", servings: "2 servings" },
        { id: "t-demo-5", title: "Charred Veg Skewers", subtitle: "Grill · 20 min", time: "20 min", servings: "4 servings" },
        { id: "t-demo-6", title: "Dark Chocolate Mousse", subtitle: "Dessert · 50 min", time: "50 min", servings: "6 servings" },
    ];

    // choose list: show demo while loading, otherwise API results or demo fallback
    const list =
        status === "loading"
            ? demoData.slice( 0, pageSize )
            : ( Array.isArray( trending ) && trending.length ? trending.slice( 0, pageSize ).map( normalizeItem ) : demoData.slice( 0, pageSize ) );

    // helper to normalize API recipe -> DemoCard shape
    function normalizeItem( r ) {
        return {
            id: r.id ?? r._id,
            title: r.title ?? r.name ?? "Recipe",
            subtitle: r.subtitle ?? `${r.category ?? "Recipe"}`,
            time: ( r.time && `${r.time} min` ) || ( r.cookTime && `${r.cookTime} min` ) || ( r.duration && `${r.duration} min` ) || "—",
            servings: r.servings ? `${r.servings} servings` : ( r.yield ? `${r.yield}` : "—" ),
            image: r.image ?? r.thumbnail ?? r.photo ?? null,
            link: `/recipes/${r.id ?? r._id}`,
        };
    }

    return (
        <section className="rounded-2xl p-6 bg-gradient-to-br from-[#08050a] to-[#221322] text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                    <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-[#1b0b00] border border-[#3b232f] text-orange-300">🔥</span>
                    Trending Recipes
                </h2>

                <div className="flex items-center gap-4">
                    <Link to="/recipes" className="text-[#ffb48a] text-sm hover:underline">View all</Link>

                    <Link
                        to="/recipes?sort=popular"
                        className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-slate-200 text-sm transition"
                    >
                        See Popular
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                { list.map( ( r ) => (
                    <DemoCard key={ r._id } item={ r } />
                ) ) }
            </div>
        </section>
    );
}
