import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";

import {
    fetchRecipes,
    selectAllRecipes,
    selectRecipesFetchStatus,
} from "../store/slices/recipes.slice";

/* ------------------ helpers ------------------ */
function makePlaceholder( title = "Recipe" ) {
    const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
    <rect width='100%' height='100%' fill='#120617'/>
    <g fill='#ffd8b2' font-family='system-ui' text-anchor='middle'>
      <text x='50%' y='45%' font-size='48' font-weight='700'>${title}</text>
      <text x='50%' y='62%' font-size='22' opacity='0.8'>Preview</text>
    </g>
  </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent( svg )}`;
}

function getRecipeImages( recipe = {} ) {
    const urls = [];

    if ( Array.isArray( recipe.images ) ) {
        recipe.images.forEach( ( img ) => {
            if ( typeof img === "string" ) urls.push( img );
            else if ( img?.url ) urls.push( img.url );
        } );
    }

    if ( !urls.length && recipe.image?.url ) urls.push( recipe.image.url );
    if ( !urls.length ) urls.push( makePlaceholder( recipe.title ) );

    return urls;
}

/* ------------------ Recipe Card ------------------ */
function RecipeCard( { recipe } ) {
    const slides = getRecipeImages( recipe );
    const [ index, setIndex ] = useState( 0 );
    const intervalRef = useRef( null );

    useEffect( () => {
        if ( slides.length <= 1 ) return;
        intervalRef.current = setInterval(
            () => setIndex( ( i ) => ( i + 1 ) % slides.length ),
            3500
        );
        return () => clearInterval( intervalRef.current );
    }, [ slides.length ] );

    return (
        <article className="relative rounded-2xl overflow-hidden border border-[#2b1e2b] bg-gradient-to-br from-[#0b0710] to-[#221322] shadow hover:-translate-y-1 hover:shadow-2xl transition">
            <span
                className={ `absolute top-3 right-3 z-20 px-3 py-1 rounded-full text-xs font-bold ${recipe.isVeg ? "bg-green-600" : "bg-red-600"
                    } text-white` }
            >
                { recipe.isVeg ? "🌱 Veg" : "🍗 Non-Veg" }
            </span>

            <div className="relative w-full h-48 bg-black/20">
                { slides.map( ( src, i ) => (
                    <img
                        key={ i }
                        src={ src }
                        alt={ recipe.title }
                        className={ `absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"
                            }` }
                    />
                ) ) }
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-orange-300">
                    { recipe.title }
                </h3>

                <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                    { recipe.description }
                </p>

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{ recipe.category }</span>

                    <Link
                        to={ `/recipes/${recipe.id}` }
                        className="px-3 py-1 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-black text-sm font-semibold"
                    >
                        View
                    </Link>
                </div>
            </div>
        </article>
    );
}

/* ------------------ Page ------------------ */
export default function RecipesPage() {
    const dispatch = useDispatch();

    const recipes = useSelector( selectAllRecipes );
    const fetchStatus = useSelector( selectRecipesFetchStatus );
    console.log( recipes )
    const [ q, setQ ] = useState( "" );
    const [ category, setCategory ] = useState( "all" );
    const [ diet, setDiet ] = useState( "any" );
    const [ page, setPage ] = useState( 1 );
    const [ pageSize, setPageSize ] = useState( 6 );

    /* -------- fetch ALL recipes ONCE -------- */
    useEffect( () => {
        dispatch( fetchRecipes() );
    }, [ dispatch ] );

    /* -------- reset page on filter change -------- */
    useEffect( () => {
        setPage( 1 );
    }, [ q, category, diet, pageSize ] );

    /* -------- FILTER (title + desc + ingredients) -------- */
    const filtered = useMemo( () => {
        let out = [ ...recipes ];

        if ( q.trim() ) {
            const query = q.toLowerCase();
            out = out.filter( ( r ) => {
                const inTitle = r.title?.toLowerCase().includes( query );
                const inDesc = r.description?.toLowerCase().includes( query );
                const inIngredients =
                    Array.isArray( r.ingredients ) &&
                    r.ingredients.some( ( ing ) =>
                        ing?.name?.toLowerCase().includes( query )
                    );
                return inTitle || inDesc || inIngredients;
            } );
        }

        if ( category !== "all" ) {
            out = out.filter(
                ( r ) => r.category?.toLowerCase() === category.toLowerCase()
            );
        }

        if ( diet !== "any" ) {
            out = out.filter(
                ( r ) => r.diet?.toLowerCase() === diet.toLowerCase()
            );
        }

        return out;
    }, [ recipes, q, category, diet ] );

    /* -------- PAGINATION (FIXED) -------- */
    const total = filtered.length;
    const pages = Math.max( 1, Math.ceil( total / pageSize ) );

    const paginatedRecipes = useMemo( () => {
        const start = ( page - 1 ) * pageSize;
        return filtered.slice( start, start + pageSize );
    }, [ filtered, page, pageSize ] );

    const pageNumbers = useMemo( () => {
        const delta = 2;
        const start = Math.max( 1, page - delta );
        const end = Math.min( pages, page + delta );
        return Array.from( { length: end - start + 1 }, ( _, i ) => start + i );
    }, [ page, pages ] );

    /* -------- dynamic categories -------- */
    const categories = useMemo( () => {
        const set = new Set();
        recipes.forEach( ( r ) => r.category && set.add( r.category ) );
        return [ "all", ...Array.from( set ) ];
    }, [ recipes ] );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-20 pb-10">
                {/* filters */ }
                <div className="flex flex-wrap gap-3 mb-6">
                    <input
                        value={ q }
                        onChange={ ( e ) => setQ( e.target.value ) }
                        placeholder="Search recipe or ingredient (e.g. tomato, garlic)"
                        className="flex-1 px-4 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b]"
                    />

                    <select
                        value={ category }
                        onChange={ ( e ) => setCategory( e.target.value ) }
                        className="px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b]"
                    >
                        { categories.map( ( c ) => (
                            <option key={ c } value={ c }>
                                { c }
                            </option>
                        ) ) }
                    </select>

                    <select
                        value={ diet }
                        onChange={ ( e ) => setDiet( e.target.value ) }
                        className="px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b]"
                    >
                        <option value="any">Any</option>
                        <option value="veg">🌱 Veg</option>
                        <option value="nonveg">🍗 Non-Veg</option>
                    </select>

                    <select
                        value={ pageSize }
                        onChange={ ( e ) => setPageSize( Number( e.target.value ) ) }
                        className="px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b]"
                    >
                        <option value={ 6 }>6 / page</option>
                        <option value={ 9 }>9 / page</option>
                        <option value={ 12 }>12 / page</option>
                        <option value={ 24 }>24 / page</option>
                    </select>
                </div>

                {/* content */ }
                { fetchStatus === "loading" ? (
                    <div className="py-24 text-center">Loading…</div>
                ) : paginatedRecipes.length ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                { paginatedRecipes.map( ( r ) => (
                                    <RecipeCard key={ r.id } recipe={ r } />
                            ) ) }
                        </div>

                            {/* pagination */ }
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <button disabled={ page === 1 } onClick={ () => setPage( page - 1 ) }>
                                    <HiChevronLeft />
                                </button>

                                { pageNumbers.map( ( p ) => (
                                    <button
                                        key={ p }
                                        onClick={ () => setPage( p ) }
                                        className={ `px-3 py-1 rounded-full border ${p === page
                                            ? "bg-orange-500 text-black"
                                            : "border-[#2b1e2b]"
                                            }` }
                                    >
                                        { p }
                                    </button>
                                ) ) }

                                <button disabled={ page === pages } onClick={ () => setPage( page + 1 ) }>
                                    <HiChevronRight />
                                </button>
                            </div>
                        </>
                ) : (
                            <div className="py-24 text-center text-slate-400">
                                No recipes found
                            </div>
                ) }
            </div>

            <Footer />
        </div>
    );
}
