import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiSearch, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { GiKnifeFork } from "react-icons/gi";
import Footer from "../components/common/Footer.component";
import Navbar from "../components/common/Navbar.component";

/* ---------- Demo / placeholder utilities ---------- */
const demoRecipes = [
    { id: "r1", title: "Sinister Tomato Pasta", category: "quick", popularity: 85, description: "Creamy tomato sauce with basil and a wicked twist." },
    { id: "r2", title: "Spicy Pumpkin Risotto", category: "seasonal", popularity: 78, description: "Autumnal risotto with roasted pumpkin & warming spices." },
    { id: "r3", title: "Black Garlic Ramen", category: "asian", popularity: 93, description: "Deep umami broth with black garlic and spring greens." },
    { id: "r4", title: "Witch's Herb Salad", category: "vegetarian", popularity: 65, description: "Fresh greens with a citrus-herb vinaigrette." },
    { id: "r5", title: "Charred Veg Skewers", category: "fastfood", popularity: 72, description: "Smoky skewers glazed with a sticky chili sauce." },
    { id: "r6", title: "Dark Chocolate Mousse", category: "dessert", popularity: 99, description: "Silky mousse with bitter chocolate and sea salt." },
    { id: "r7", title: "Midnight Pancakes", category: "breakfast", popularity: 80, description: "Fluffy pancakes with a chocolate drizzle." },
    { id: "r8", title: "Savory Chicken Pot", category: "nonveg", popularity: 70, description: "Comforting pot roast, slow-cooked to perfection." },
];

const CATEGORIES = [
    { key: "all", label: "All" },
    { key: "breakfast", label: "Breakfast" },
    { key: "quick", label: "Quick & Easy" },
    { key: "vegetarian", label: "Vegetarian" },
    { key: "dessert", label: "Dessert" },
    { key: "fastfood", label: "Fast Food" },
    { key: "asian", label: "Asian" },
    { key: "nonveg", label: "Non-Veg" },
    { key: "seasonal", label: "Seasonal" },
];

/* inline svg placeholder generator */
function makePlaceholder( title = "Recipe" ) {
    const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
      <rect width='100%' height='100%' fill='#120617'/>
      <g fill='#ffd8b2' font-family='system-ui, Arial, sans-serif' text-anchor='middle'>
        <text x='50%' y='45%' font-size='48' font-weight='700'>${escapeXml( title )}</text>
        <text x='50%' y='62%' font-size='22' fill='#f3e0d0' opacity='0.85'>Demo · Preview</text>
      </g>
    </svg>
  `;
    return `data:image/svg+xml;utf8,${encodeURIComponent( svg )}`;
}
function escapeXml( unsafe = "" ) {
    return String( unsafe )
        .replaceAll( "&", "&amp;" )
        .replaceAll( "<", "&lt;" )
        .replaceAll( ">", "&gt;" )
        .replaceAll( '"', "&quot;" )
        .replaceAll( "'", "&apos;" );
}

/* ---------- Simple Recipe Card (theming matched) ---------- */
function RecipeCard( { recipe } ) {
    const img = recipe.image || makePlaceholder( recipe.title );
    return (
        <article className="rounded-2xl overflow-hidden border border-[#2b1e2b] bg-gradient-to-br from-[#0b0710] to-[#221322] shadow transform transition hover:-translate-y-1 hover:shadow-2xl">
            <div className="w-full h-44 sm:h-48 bg-slate-900">
                <img src={ img } alt={ recipe.title } className="w-full h-full object-cover" />
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-orange-300">{ recipe.title }</h3>
                <p className="mt-1 text-sm text-slate-300">{ recipe.description }</p>

                <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-400">{ recipe.category }</div>
                    <Link
                        to={ `/recipes/${recipe.id}` }
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black text-sm font-semibold"
                    >
                        View
                    </Link>
                </div>
            </div>
        </article>
    );
}

/* ---------- Main Recipes Page (rounded-full accents) ---------- */
export default function RecipesPage() {
    const storeRecipes = useSelector( ( s ) => ( s?.recipes?.items && Array.isArray( s.recipes.items ) ? s.recipes.items : null ) );
    const allItems = storeRecipes && storeRecipes.length > 0 ? storeRecipes : demoRecipes;

    // UI state (filters)
    const [ q, setQ ] = useState( "" );
    const [ category, setCategory ] = useState( "all" );
    const [ sort, setSort ] = useState( "newest" ); // newest, popular
    const [ diet, setDiet ] = useState( "any" ); // any, vegetarian, nonveg
    const [ page, setPage ] = useState( 1 );
    const [ pageSize, setPageSize ] = useState( 6 );

    // filter + sort
    const filtered = useMemo( () => {
        let list = allItems.slice();

        if ( category && category !== "all" ) {
            list = list.filter( ( r ) => ( r.category || "" ).toLowerCase() === category.toLowerCase() );
        }

        if ( diet && diet !== "any" ) {
            if ( diet === "vegetarian" ) list = list.filter( ( r ) => ( r.category || "" ).toLowerCase() === "vegetarian" );
            if ( diet === "nonveg" ) list = list.filter( ( r ) => ( r.category || "" ).toLowerCase() === "nonveg" );
        }

        if ( q && q.trim() ) {
            const term = q.trim().toLowerCase();
            list = list.filter(
                ( r ) =>
                    ( r.title || "" ).toLowerCase().includes( term ) ||
                    ( r.description || "" ).toLowerCase().includes( term ) ||
                    ( r.category || "" ).toLowerCase().includes( term )
            );
        }

        if ( sort === "popular" ) list.sort( ( a, b ) => ( b.popularity || 0 ) - ( a.popularity || 0 ) );
        // newest: keep original or sort by createdAt if provided

        return list;
    }, [ allItems, category, q, sort, diet ] );

    const total = filtered.length;
    const pages = Math.max( 1, Math.ceil( total / pageSize ) );
    const pageItems = filtered.slice( ( page - 1 ) * pageSize, page * pageSize );

    function gotoPage( n ) {
        const p = Math.max( 1, Math.min( pages, n ) );
        setPage( p );
        window.scrollTo( { top: 0, behavior: "smooth" } );
    }

    const setAndReset = ( setter ) => ( val ) => {
        setter( val );
        setPage( 1 );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100 transition-colors">
            <Navbar />
            {/* padding so filters sit below fixed navbar */ }
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
                {/* Filters-only header (no title) */ }
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-6">
                    {/* Left: Search */ }
                    <div className="flex-1 min-w-0">
                        <label className="relative w-full">
                            <input
                                type="search"
                                placeholder="Search recipes, e.g., pumpkin, pasta..."
                                value={ q }
                                onChange={ ( e ) => setAndReset( setQ )( e.target.value ) }
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                aria-label="Search recipes"
                            />
                            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        </label>
                    </div>

                    {/* Right: Filter controls */ }
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={ category }
                            onChange={ ( e ) => setAndReset( setCategory )( e.target.value ) }
                            className="rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 px-3 py-2"
                            aria-label="Filter by category"
                        >
                            { CATEGORIES.map( ( c ) => (
                                <option key={ c.key } value={ c.key }>
                                    { c.label }
                                </option>
                            ) ) }
                        </select>

                        <select
                            value={ diet }
                            onChange={ ( e ) => setAndReset( setDiet )( e.target.value ) }
                            className="rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 px-3 py-2"
                            aria-label="Dietary filter"
                        >
                            <option value="any">Any</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="nonveg">Non-Veg</option>
                        </select>

                        <select
                            value={ sort }
                            onChange={ ( e ) => setAndReset( setSort )( e.target.value ) }
                            className="rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 px-3 py-2"
                            aria-label="Sort recipes"
                        >
                            <option value="newest">Newest</option>
                            <option value="popular">Most popular</option>
                        </select>
                    </div>
                </div>

                {/* grid */ }
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    { pageItems.map( ( r ) => (
                        <RecipeCard key={ r.id ?? r._id } recipe={ r } />
                    ) ) }
                </div>

                {/* empty state */ }
                { total === 0 && <div className="py-12 text-center text-slate-400">No recipes found. Try another search or clear filters.</div> }

                {/* pagination & page size */ }
                <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={ () => gotoPage( page - 1 ) }
                            disabled={ page <= 1 }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 disabled:opacity-50"
                            aria-label="Previous page"
                        >
                            <HiChevronLeft className="w-5 h-5" />
                            Prev
                        </button>

                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            Page <strong className="mx-2">{ page }</strong> of { pages }
                        </div>

                        <button
                            onClick={ () => gotoPage( page + 1 ) }
                            disabled={ page >= pages }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 disabled:opacity-50"
                            aria-label="Next page"
                        >
                            Next
                            <HiChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-300">
                        <label className="flex items-center gap-2">
                            <span className="text-slate-300">Per page</span>
                            <select
                                value={ pageSize }
                                onChange={ ( e ) => {
                                    setPageSize( Number( e.target.value ) );
                                    setPage( 1 );
                                } }
                                className="rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 px-2 py-1"
                                aria-label="Items per page"
                            >
                                <option value={ 6 }>6</option>
                                <option value={ 9 }>9</option>
                                <option value={ 12 }>12</option>
                            </select>
                        </label>

                        <span className="text-slate-500">• { total } results</span>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
