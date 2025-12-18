import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import {
    fetchRecipe,
    selectRecipeById,
    selectRecipesStatus,
    selectRecipesError
} from "../store/slices/recipe.slice";

export default function Recipe() {

    const { id } = useParams();
    const dispatch = useDispatch();

    const recipe = useSelector( ( state ) => selectRecipeById( state, id ) ?? null );
    const status = useSelector( selectRecipesStatus );
    const error = useSelector( selectRecipesError );
    console.log( recipe )
    const [ imgIndex, setImgIndex ] = useState( 0 );

    useEffect( () => {
        if ( !id ) return;
        dispatch( fetchRecipe( id ) );
    }, [ id, dispatch ] );

    useEffect( () => {
        setImgIndex( 0 );
    }, [ recipe?.images ] );

    const loading = status === "loading" && !recipe;
    const images = recipe?.images?.length ? recipe.images : [];

    const prev = () => setImgIndex( ( i ) => ( i <= 0 ? images.length - 1 : i - 1 ) );
    const next = () => setImgIndex( ( i ) => ( i >= images.length - 1 ? 0 : i + 1 ) );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="rounded-3xl bg-[linear-gradient(180deg,#0b0710_0%,#1e0f1a_100%)] border border-[#2b1e2b] shadow-2xl overflow-hidden">
                    <div className="p-6 md:p-10">

                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/recipes"
                                    className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-full bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-slate-200"
                                >
                                    ← Back
                                </Link>

                                <h1 className="text-2xl font-semibold">
                                    { loading ? "Loading…" : recipe?.title || "Not found" }
                                </h1>
                            </div>

                            { recipe?.category && (
                                <span className="px-3 py-1 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-sm">
                                    { recipe.category }
                                </span>
                            ) }
                        </div>

                        { loading && (
                            <div className="py-24 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-orange-500 animate-spin" />
                            </div>
                        ) }

                        { !loading && error && (
                            <div className="py-24 text-center text-red-400">{ error }</div>
                        ) }

                        { !loading && !error && !recipe && (
                            <div className="py-24 text-center text-slate-400">Recipe not found.</div>
                        ) }

                        { !loading && recipe && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                                    {/* IMAGE SECTION (now wider) */ }
                                    <div className="md:col-span-2 flex flex-col gap-4">
                                        <div className="relative rounded-xl overflow-hidden border border-[#2b1e2b] ">
                                            <div className="w-full aspect-[4/3]  flex items-center justify-center">
                                                { images.length ? (
                                                    <img
                                                        src={ images[ imgIndex ]?.url }
                                                        alt={ recipe.title }
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="text-slate-400">No image</div>
                                                ) }
                                            </div>

                                            { images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={ prev }
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-[#2b1e2b] flex items-center justify-center"
                                                    >
                                                        <HiChevronLeft className="w-5 h-5" />
                                                    </button>

                                                    <button
                                                        onClick={ next }
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-[#2b1e2b] flex items-center justify-center"
                                                    >
                                                        <HiChevronRight className="w-5 h-5" />
                                                    </button>

                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2">
                                                        { images.map( ( _, i ) => (
                                                            <button
                                                                key={ i }
                                                                onClick={ () => setImgIndex( i ) }
                                                                className={ `w-2 h-2 rounded-full ${i === imgIndex ? "bg-orange-400" : "bg-slate-700"}` }
                                                            />
                                                        ) ) }
                                                    </div>
                                                </>
                                            ) }
                                        </div>

                                        <div className="rounded-xl p-4 border border-[#2b1e2b] bg-[#08060a] text-sm text-slate-300">
                                            <div className="mb-2 text-slate-400">Details</div>

                                            <div className="grid grid-cols-1 gap-2 text-sm">
                                                { recipe.cuisine && (
                                                    <div>
                                                        <span className="text-slate-400">Cuisine:</span>
                                                        <span className="ml-2">{ recipe.cuisine }</span>
                                                    </div>
                                                ) }

                                                { recipe.createdAt && (
                                                    <div>
                                                        <span className="text-slate-400">Created:</span>
                                                        <span className="ml-2">{ new Date( recipe.createdAt ).toLocaleString() }</span>
                                                    </div>
                                                ) }

                                                { recipe.updatedAt && (
                                                    <div>
                                                        <span className="text-slate-400">Updated:</span>
                                                        <span className="ml-2">{ new Date( recipe.updatedAt ).toLocaleString() }</span>
                                                    </div>
                                                ) }
                                            </div>
                                        </div>
                                    </div>

                                    {/* DESCRIPTION + INGREDIENTS + INSTRUCTIONS */ }
                                    <div className="md:col-span-2 flex flex-col gap-6">
                                        { recipe.description && (
                                            <p className="text-slate-300">{ recipe.description }</p>
                                        ) }

                                        <div className="rounded-xl p-6 bg-[#06040a] border border-[#2b1e2b]">
                                            <h3 className="text-lg font-semibold text-orange-300 mb-3">Ingredients</h3>

                                            { Array.isArray( recipe.ingredients ) && recipe.ingredients.length > 0 ? (
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-200">
                                                    { recipe.ingredients.map( ( ing, i ) => (
                                                        <li key={ i } className="flex items-start gap-3">
                                                            <div className="min-w-[48px] text-slate-400">
                                                                { ing.qty ? `${ing.qty}${ing.unit ? ` ${ing.unit}` : ""}` : "—" }
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{ ing.name || ing.ingredientName || "Unknown" }</div>
                                                                { ing.notes && <div className="text-xs text-slate-400">{ ing.notes }</div> }
                                                            </div>
                                                        </li>
                                                    ) ) }
                                                </ul>
                                            ) : (
                                                <div className="text-sm text-slate-400">No ingredients listed.</div>
                                            ) }
                                        </div>

                                        <div className="rounded-xl p-6 bg-[#06040a] border border-[#2b1e2b]">
                                            <h3 className="text-lg font-semibold text-orange-300 mb-3">Instructions</h3>

                                            { recipe.instructions ? (
                                                <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed" dangerouslySetInnerHTML={ { __html: recipe.instructions } } />
                                            ) : (
                                                <div className="text-sm text-slate-400">No instructions provided.</div>
                                            ) }
                                        </div>
                                    </div>

                                </div>
                            </>
                        ) }
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
