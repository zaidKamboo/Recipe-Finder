import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HiSearch, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import Footer from "../components/common/Footer.component";
import Navbar from "../components/common/Navbar.component";
import {
    fetchRecipes,
    selectAllRecipes,
    selectRecipesFetchStatus,
    selectRecipesTotal,
} from "../store/slices/recipes.slice";

function makePlaceholder( title = "Recipe" ) {
    const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
      <rect width='100%' height='100%' fill='#120617'/>
      <g fill='#ffd8b2' font-family='system-ui, Arial, sans-serif' text-anchor='middle'>
        <text x='50%' y='45%' font-size='48' font-weight='700'>${encodeURIComponent( title )}</text>
        <text x='50%' y='62%' font-size='22' fill='#f3e0d0' opacity='0.85'>Preview</text>
      </g>
    </svg>
  `;
    return `data:image/svg+xml;utf8,${encodeURIComponent( svg )}`;
}

function RecipeCard( { recipe } ) {
    const img = recipe.image || recipe.imageUrl || makePlaceholder( recipe.title );
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
                        to={ `/recipes/${recipe.id ?? recipe._id}` }
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black text-sm font-semibold"
                    >
                        View
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function RecipesPage() {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const storeRecipes = useSelector( selectAllRecipes );
    const fetchStatus = useSelector( selectRecipesFetchStatus );
    const totalFromStore = useSelector( selectRecipesTotal );

    const qs = React.useMemo( () => new URLSearchParams( location.search ), [ location.search ] );

    const [ q, setQ ] = useState( qs.get( "q" ) ?? "" );
    const [ category, setCategory ] = useState( qs.get( "category" ) ?? "all" );
    const [ sort, setSort ] = useState( qs.get( "sort" ) ?? "newest" );
    const [ diet, setDiet ] = useState( qs.get( "diet" ) ?? "any" );
    const [ page, setPage ] = useState( Number( qs.get( "page" ) ?? 1 ) );
    const [ pageSize, setPageSize ] = useState( Number( qs.get( "pageSize" ) ?? 6 ) );

    useEffect( () => {
        // keep local state in sync if URL changed externally
        setQ( qs.get( "q" ) ?? "" );
        setCategory( qs.get( "category" ) ?? "all" );
        setSort( qs.get( "sort" ) ?? "newest" );
        setDiet( qs.get( "diet" ) ?? "any" );
        setPage( Number( qs.get( "page" ) ?? 1 ) );
        setPageSize( Number( qs.get( "pageSize" ) ?? 6 ) );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ location.search ] );

    useEffect( () => {
        const params = new URLSearchParams();
        if ( q && q.trim() ) params.set( "q", q.trim() );
        if ( category && category !== "all" ) params.set( "category", category );
        if ( sort && sort !== "newest" ) params.set( "sort", sort );
        if ( diet && diet !== "any" ) params.set( "diet", diet );
        if ( page && page > 1 ) params.set( "page", String( page ) );
        if ( pageSize && pageSize !== 6 ) params.set( "pageSize", String( pageSize ) );

        const search = params.toString();
        navigate( { pathname: location.pathname, search: search ? `?${search}` : "" }, { replace: true } );
        // dispatch fetch
        const fetchParams = {
            page,
            pageSize,
        };
        if ( q && q.trim() ) fetchParams.q = q.trim();
        if ( category && category !== "all" ) fetchParams.category = category;
        if ( sort ) fetchParams.sort = sort;
        if ( diet && diet !== "any" ) fetchParams.diet = diet;
        dispatch( fetchRecipes( fetchParams ) );
    }, [ dispatch, q, category, sort, diet, page, pageSize, navigate, location.pathname ] );

    const filtered = useMemo( () => {
        const list = Array.isArray( storeRecipes ) ? storeRecipes.slice() : [];
        if ( !list.length ) return [];
        let out = list;
        if ( category && category !== "all" ) {
            out = out.filter( ( r ) => ( r.category || "" ).toLowerCase() === category.toLowerCase() );
        }
        if ( diet && diet !== "any" ) {
            if ( diet === "vegetarian" ) out = out.filter( ( r ) => ( r.category || "" ).toLowerCase() === "vegetarian" );
            if ( diet === "nonveg" ) out = out.filter( ( r ) => ( r.category || "" ).toLowerCase() === "nonveg" );
        }
        if ( q && q.trim() ) {
            const term = q.trim().toLowerCase();
            out = out.filter(
                ( r ) =>
                    ( r.title || "" ).toLowerCase().includes( term ) ||
                    ( r.description || "" ).toLowerCase().includes( term ) ||
                    ( r.category || "" ).toLowerCase().includes( term )
            );
        }
        if ( sort === "popular" ) out.sort( ( a, b ) => ( b.popularity || 0 ) - ( a.popularity || 0 ) );
        return out;
    }, [ storeRecipes, category, q, sort, diet ] );

    const total = Number( totalFromStore ) > 0 ? totalFromStore : filtered.length;
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

    const isLoading = fetchStatus === "loading";
    const hasData = Array.isArray( storeRecipes ) && storeRecipes.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100 transition-colors">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <label className="relative w-full">
                            <input
                                type="search"
                                placeholder="Search recipes..."
                                value={ q }
                                onChange={ ( e ) => setAndReset( setQ )( e.target.value ) }
                                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                aria-label="Search recipes"
                            />
                            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <select value={ category } onChange={ ( e ) => setAndReset( setCategory )( e.target.value ) } className="rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 px-3 py-2">
                            <option value="all">All</option>
                            <option value="breakfast">Breakfast</option>
                            <option value="quick">Quick & Easy</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="dessert">Dessert</option>
                            <option value="fastfood">Fast Food</option>
                            <option value="asian">Asian</option>
                            <option value="nonveg">Non-Veg</option>
                            <option value="seasonal">Seasonal</option>
                        </select>

                        <select value={ diet } onChange={ ( e ) => setAndReset( setDiet )( e.target.value ) } className="rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 px-3 py-2">
                            <option value="any">Any</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="nonveg">Non-Veg</option>
                        </select>

                        <select value={ sort } onChange={ ( e ) => setAndReset( setSort )( e.target.value ) } className="rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 px-3 py-2">
                            <option value="newest">Newest</option>
                            <option value="popular">Most popular</option>
                        </select>
                    </div>
                </div>

                { isLoading ? (
                    <div className="py-24 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-orange-500 animate-spin" />
                    </div>
                ) : hasData ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            { pageItems.map( ( r ) => (
                                <RecipeCard key={ r.id ?? r._id } recipe={ r } />
                            ) ) }
                        </div>

                            { total === 0 && <div className="py-12 text-center text-slate-400">No recipes found. Try another search or clear filters.</div> }

                            <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <button onClick={ () => gotoPage( page - 1 ) } disabled={ page <= 1 } className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 disabled:opacity-50">
                                        <HiChevronLeft className="w-5 h-5" /> Prev
                                    </button>

                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        Page <strong className="mx-2">{ page }</strong> of { pages }
                                    </div>

                                    <button onClick={ () => gotoPage( page + 1 ) } disabled={ page >= pages } className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 disabled:opacity-50">
                                        Next <HiChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <label className="flex items-center gap-2">
                                        <span className="text-slate-300">Per page</span>
                                        <select value={ pageSize } onChange={ ( e ) => { setPageSize( Number( e.target.value ) ); setPage( 1 ); } } className="rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 px-2 py-1">
                                            <option value={ 6 }>6</option>
                                            <option value={ 9 }>9</option>
                                            <option value={ 12 }>12</option>
                                        </select>
                                    </label>

                                    <span className="text-slate-500">• { total } results</span>
                                </div>
                            </div>
                    </>
                ) : (
                    <div className="py-24 text-center text-slate-400">No recipes yet. Try refreshing or change filters.</div>
                ) }
            </div>
            <Footer />
        </div>
    );
}
