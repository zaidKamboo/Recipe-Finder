import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    fetchTrendingRecipes,
    selectAllTrendingRecipes,
    selectTrendingStatus,
} from "../../store/slices/trending_recipes.slice";

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
        <text x='50%' y='42%' font-size='48' font-weight='700'>${escapeXml(
            title
        )}</text>
        <text x='50%' y='62%' font-size='22' fill='#f3e0d0' opacity='0.85'>Demo · 25 min</text>
      </g>
    </svg>
  `;
    return `data:image/svg+xml;utf8,${encodeURIComponent( svg )}`;
}

function timeAgo( iso ) {
    if ( !iso ) return "—";
    const t = new Date( iso ).getTime();
    if ( Number.isNaN( t ) ) return "—";
    const s = Math.floor( ( Date.now() - t ) / 1000 );
    if ( s < 60 ) return `${s}s ago`;
    const m = Math.floor( s / 60 );
    if ( m < 60 ) return `${m}m ago`;
    const h = Math.floor( m / 60 );
    if ( h < 24 ) return `${h}h ago`;
    const d = Math.floor( h / 24 );
    if ( d < 30 ) return `${d}d ago`;
    return new Date( iso ).toLocaleDateString();
}

function truncate( text = "", n = 100 ) {
    if ( !text ) return "—";
    return text.length > n ? text.slice( 0, n ).trim() + "…" : text;
}

function DemoCard( { item } ) {
    // Normalize images into URL strings; supports images[0].url etc.
    const rawImages =
        Array.isArray( item.images ) && item.images.length
            ? item.images
            : item.image
                ? [ item.image ]
                : [];

    const images = rawImages
        .map( ( img ) => {
            if ( !img ) return null;
            if ( typeof img === "string" ) return img;
            if ( typeof img === "object" ) {
                if ( img.url ) return img.url;
                if ( img.path ) return img.path;
            }
            return null;
        } )
        .filter( Boolean );

    const placeholder = makePlaceholder( item.title );
    const slides = images.length ? images : [ placeholder ];

    const [ index, setIndex ] = useState( 0 );
    const [ paused, setPaused ] = useState( false );
    const intervalRef = useRef( null );

    useEffect( () => {
        if ( paused || slides.length <= 1 ) return;
        intervalRef.current = setInterval( () => {
            setIndex( ( i ) => ( i + 1 ) % slides.length );
        }, 3500 );
        return () => clearInterval( intervalRef.current );
    }, [ slides.length, paused ] );

    const goPrev = () =>
        setIndex( ( i ) => ( i - 1 + slides.length ) % slides.length );
    const goNext = () =>
        setIndex( ( i ) => ( i + 1 ) % slides.length );

    const ingredientsCount = Array.isArray( item.ingredients )
        ? item.ingredients.length
        : 0;
    const ingredientPreview = Array.isArray( item.ingredients )
        ? item.ingredients
            .slice( 0, 2 )
            .map(
                ( ig ) =>
                    ig.name ||
                    ( ig.ingredient && ig.ingredient.name )
            )
            .filter( Boolean )
            .join( ", " )
        : "";

    return (
        <article
            className="rounded-2xl overflow-hidden border border-[#2b1e2b] bg-gradient-to-br from-[#0b0710] to-[#221322] shadow-lg transform-gpu transition hover:-translate-y-1 hover:shadow-2xl"
            aria-label={ item.title }
        >
            <div
                onMouseEnter={ () => setPaused( true ) }
                onMouseLeave={ () => setPaused( false ) }
                className="relative w-full h-44 sm:h-48 "
            >
                { slides.map( ( src, i ) => (
                    <img
                        key={ i }
                        src={ src }
                        alt={ `${item.title} ${i + 1}` }
                        className={ `absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index
                            ? "opacity-100 z-10"
                            : "opacity-0 z-0"
                            }` }
                    />
                ) ) }
                { slides.length > 1 && (
                    <>
                        <button
                            onClick={ goPrev }
                            aria-label="Previous image"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            ‹
                        </button>
                        <button
                            onClick={ goNext }
                            aria-label="Next image"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
                        >
                            ›
                        </button>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-2">
                            { slides.map( ( _, dotIdx ) => (
                                <button
                                    key={ dotIdx }
                                    onClick={ () => setIndex( dotIdx ) }
                                    aria-label={ `Go to slide ${dotIdx + 1}` }
                                    className={ `w-2 h-2 rounded-full ${dotIdx === index
                                        ? "bg-white"
                                        : "bg-white/40"
                                        }` }
                                ></button>
                            ) ) }
                        </div>
                    </>
                ) }
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-orange-300">
                    { item.title }
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                    { item.category ?? "Recipe" } ·{ " " }
                    { item.cuisine ?? "—" }
                </p>
                <p className="mt-2 text-sm text-slate-400">
                    { truncate( item.description, 110 ) }
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <div>
                        { ingredientsCount > 0 ? (
                            <span>
                                { ingredientsCount } ingredient
                                { ingredientsCount > 1 ? "s" : "" }
                                { ingredientPreview
                                    ? ` · ${ingredientPreview}`
                                    : "" }
                            </span>
                        ) : (
                            <span>No ingredients listed</span>
                        ) }
                    </div>
                    <div>
                        { timeAgo(
                            item.createdAt ??
                            item.updatedAt ??
                            item.created_at
                        ) }
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-end">
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

export default function TrendingRecipesConnected( { pageSize = 6 } ) {
    const dispatch = useDispatch();
    const trending = useSelector( selectAllTrendingRecipes ) || [];
    const status = useSelector( selectTrendingStatus );

    useEffect( () => {
        dispatch( fetchTrendingRecipes( { page: 1, pageSize } ) );
    }, [ dispatch, pageSize ] );

    const demoData = [
        {
            id: "t-demo-1",
            title: "Blueberry Pancakes",
            category: "Breakfast",
            cuisine: "American",
            description: "Fluffy pancakes with blueberry.",
            ingredients: [ { name: "Flour" }, { name: "Blueberries" } ],
            images: [ makePlaceholder( "Blueberry Pancakes" ) ],
        },
        {
            id: "t-demo-2",
            title: "Spicy Pumpkin Risotto",
            category: "Main",
            cuisine: "Italian",
            description: "Creamy pumpkin risotto.",
            ingredients: [ { name: "Rice" } ],
            images: [ makePlaceholder( "Spicy Pumpkin Risotto" ) ],
        },
        {
            id: "t-demo-3",
            title: "Black Garlic Ramen",
            category: "Main",
            cuisine: "Japanese",
            description: "Rich umami broth ramen.",
            ingredients: [ { name: "Noodles" } ],
            images: [ makePlaceholder( "Black Garlic Ramen" ) ],
        },
        {
            id: "t-demo-4",
            title: "Witch's Herb Salad",
            category: "Salad",
            cuisine: "Fusion",
            description: "Fresh mixed herbs and leaves.",
            ingredients: [ { name: "Lettuce" } ],
            images: [ makePlaceholder( "Witch's Herb Salad" ) ],
        },
        {
            id: "t-demo-5",
            title: "Charred Veg Skewers",
            category: "Grill",
            cuisine: "Mediterranean",
            description: "Smoky vegetable skewers.",
            ingredients: [ { name: "Bell pepper" } ],
            images: [ makePlaceholder( "Charred Veg Skewers" ) ],
        },
        {
            id: "t-demo-6",
            title: "Dark Chocolate Mousse",
            category: "Dessert",
            cuisine: "French",
            description: "Silky dark chocolate mousse.",
            ingredients: [ { name: "Chocolate" } ],
            images: [ makePlaceholder( "Dark Chocolate Mousse" ) ],
        },
    ];

    function normalizeItem( r ) {
        if ( !r ) return null;
        return {
            id:
                r.id ??
                r._id ??
                r._id?.toString?.() ??
                Math.random().toString( 36 ).slice( 2, 9 ),
            title: r.title ?? r.name ?? "Recipe",
            description: r.description ?? r.summary ?? r.desc ?? "",
            category: r.category ?? r.categoryName ?? r.type ?? "Recipe",
            cuisine: r.cuisine ?? r.cuisineType ?? "—",
            ingredients: Array.isArray( r.ingredients )
                ? r.ingredients
                : Array.isArray( r.components )
                    ? r.components
                    : [],
            
            images: Array.isArray( r.images )
                ? r.images
                : r.image
                    ? [ r.image ]
                    : [],
            createdAt:
                r.createdAt ?? r.updatedAt ?? r.created_at ?? null,
            link: `/recipes/${r.id ?? r._id}`,
        };
    }

    const list =
        status === "loading"
            ? demoData.slice( 0, pageSize )
            : Array.isArray( trending ) && trending.length
                ? trending
                    .slice( 0, pageSize )
                    .map( normalizeItem )
                    .filter( Boolean )
                : demoData.slice( 0, pageSize );

    return (
        <section className="rounded-2xl p-6 bg-gradient-to-br from-[#08050a] to-[#221322] text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                    <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-[#1b0b00] border border-[#3b232f] text-orange-300">
                        🔥
                    </span>
                    Trending Recipes
                </h2>

                <div className="flex items-center gap-4">
                    <Link
                        to="/recipes"
                        className="text-[#ffb48a] text-sm hover:underline"
                    >
                        View all
                    </Link>

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
                    <DemoCard key={ r.id } item={ r } />
                ) ) }
            </div>
        </section>
    );
}
