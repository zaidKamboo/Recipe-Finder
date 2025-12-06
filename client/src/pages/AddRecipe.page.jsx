// src/pages/admin/AddRecipe.jsx
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
    HiChevronLeft,
    HiOutlineCloudUpload,
    HiPlus,
    HiX,
    HiPencil,
} from "react-icons/hi";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";

import { createRecipe, fetchRecipes } from "../store/slices/recipes.slice";

/* ---------- ImagePreview component (handles File -> dataURL preview) ---------- */
function ImagePreview( { file, onRemove } ) {
    const [ src, setSrc ] = useState( null );

    React.useEffect( () => {
        let cancelled = false;
        if ( !file ) return setSrc( null );

        if ( typeof file === "string" ) {
            setSrc( file );
            return;
        }

        if ( file instanceof File ) {
            const reader = new FileReader();
            reader.onload = ( e ) => {
                if ( !cancelled ) setSrc( e.target.result );
            };
            reader.readAsDataURL( file );
            return () => {
                cancelled = true;
            };
        }

        setSrc( null );
        return () => {
            cancelled = true;
        };
    }, [ file ] );

    return (
        <div className="relative w-28 h-20 bg-[#07060a] border border-[#24121b] rounded-xl overflow-hidden">
            { src ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={ src } alt="preview" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                    Preview
                </div>
            ) }

            <button
                type="button"
                onClick={ onRemove }
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-slate-300 hover:bg-white/5"
                title="Remove"
            >
                <HiX className="w-4 h-4" />
            </button>
        </div>
    );
}

/* ---------- AddRecipe page ---------- */
export default function AddRecipe() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // form fields (matching Recipe model)
    const [ title, setTitle ] = useState( "" );
    const [ category, setCategory ] = useState( "" );
    const [ cuisine, setCuisine ] = useState( "" );
    const [ description, setDescription ] = useState( "" );
    const [ instructions, setInstructions ] = useState( "" );

    // ingredients as array of { name, qty, unit, notes }
    const [ ingredients, setIngredients ] = useState( [] );
    const [ newIngName, setNewIngName ] = useState( "" );
    const [ newIngQty, setNewIngQty ] = useState( "" );
    const [ newIngUnit, setNewIngUnit ] = useState( "" );
    const [ newIngNotes, setNewIngNotes ] = useState( "" );

    // images
    const [ newImages, setNewImages ] = useState( [] ); // File[]
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState( null );
    const [ successMsg, setSuccessMsg ] = useState( null );

    // ingredient helpers
    function addIngredient() {
        const name = newIngName.trim();
        if ( !name ) return;
        const ing = {
            name,
            qty: newIngQty !== "" ? Number( newIngQty ) : undefined,
            unit: newIngUnit || undefined,
            notes: newIngNotes || undefined,
        };
        setIngredients( ( s ) => [ ...s, ing ] );
        setNewIngName( "" );
        setNewIngQty( "" );
        setNewIngUnit( "" );
        setNewIngNotes( "" );
    }

    function updateIngredient( idx, patch ) {
        setIngredients( ( s ) => s.map( ( it, i ) => ( i === idx ? { ...it, ...patch } : it ) ) );
    }

    function removeIngredient( idx ) {
        setIngredients( ( s ) => s.filter( ( _, i ) => i !== idx ) );
    }

    // images helpers
    function handleNewImagesPicked( e ) {
        const files = Array.from( e.target.files || [] );
        if ( !files.length ) return;
        // optionally: validate file types / sizes here
        setNewImages( ( s ) => [ ...s, ...files ] );
        e.target.value = "";
    }

    function removeNewImage( idx ) {
        setNewImages( ( s ) => s.filter( ( _, i ) => i !== idx ) );
    }

    // build payload and send to createRecipe thunk
    async function handleSubmit( e ) {
        e.preventDefault();
        setError( null );
        setSuccessMsg( null );

        if ( !title.trim() ) {
            setError( "Title is required" );
            return;
        }

        setLoading( true );
        try {
            // prepare plain JSON data (createRecipe will detect images array and convert to FormData)
            const data = {
                title,
                category,
                cuisine,
                description,
                instructions,
                ingredients: ingredients.map( ( i ) => {
                    const out = {};
                    if ( i.name !== undefined ) out.name = i.name;
                    if ( i.qty !== undefined && i.qty !== null && i.qty !== "" ) out.qty = i.qty;
                    if ( i.unit !== undefined ) out.unit = i.unit;
                    if ( i.notes !== undefined ) out.notes = i.notes;
                    return out;
                } ),
            };

            // call createRecipe thunk; pass images array so thunk builds FormData
            await dispatch( createRecipe( { data, images: newImages } ) ).unwrap();

            // refresh listing
            dispatch( fetchRecipes( { page: 1, pageSize: 12 } ) ).catch( () => { } );

            setSuccessMsg( "Recipe created" );
            // navigate to admin list after small delay
            setTimeout( () => navigate( "/admin/recipes" ), 700 );
        } catch ( err ) {
            // thunk returns structured error or string
            setError( err?.message || err?.error || JSON.stringify( err ) || "Create failed" );
        } finally {
            setLoading( false );
        }
    }

    const canSubmit = useMemo( () => {
        return title.trim().length > 0 && !loading;
    }, [ title, loading ] );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100">
            <Navbar />

            <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-3">
                    <button
                        onClick={ () => navigate( -1 ) }
                        className="p-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] hover:bg-[#0f0810]"
                        title="Back"
                    >
                        <HiChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-semibold">Add Recipe</h1>
                        <div className="text-sm text-slate-400">Create a new recipe (model fields only)</div>
                    </div>
                </div>

                <form onSubmit={ handleSubmit } className="space-y-6">
                    { error && <div className="text-sm text-red-400">{ error }</div> }
                    { successMsg && <div className="text-sm text-emerald-300">{ successMsg }</div> }

                    {/* title / category / cuisine */ }
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400">Title</label>
                            <input
                                value={ title }
                                onChange={ ( e ) => setTitle( e.target.value ) }
                                placeholder="E.g. Paneer Butter Masala"
                                className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">Category</label>
                            <input
                                value={ category }
                                onChange={ ( e ) => setCategory( e.target.value ) }
                                placeholder="Main Course"
                                className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400">Cuisine</label>
                        <input
                            value={ cuisine }
                            onChange={ ( e ) => setCuisine( e.target.value ) }
                            placeholder="e.g. North Indian"
                            className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* description */ }
                    <div>
                        <label className="text-xs text-slate-400">Short description</label>
                        <textarea
                            value={ description }
                            onChange={ ( e ) => setDescription( e.target.value ) }
                            rows={ 3 }
                            placeholder="Brief description for listing..."
                            className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* instructions */ }
                    <div>
                        <label className="text-xs text-slate-400">Instructions</label>
                        <textarea
                            value={ instructions }
                            onChange={ ( e ) => setInstructions( e.target.value ) }
                            rows={ 8 }
                            placeholder="Full preparation instructions..."
                            className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* ingredients */ }
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-slate-400">Ingredients</label>
                            <div className="text-xs text-slate-500">{ ingredients.length } items</div>
                        </div>

                        <div className="mt-2 space-y-2">
                            { ingredients.map( ( ing, idx ) => (
                                <div
                                    key={ idx }
                                    className="p-3 bg-[#07060a] border border-[#24121b] rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-2 items-center"
                                >
                                    <div className="sm:col-span-2">
                                        <input
                                            value={ ing.name }
                                            onChange={ ( e ) => updateIngredient( idx, { name: e.target.value } ) }
                                            placeholder="Ingredient name"
                                            className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            value={ ing.qty ?? "" }
                                            onChange={ ( e ) =>
                                                updateIngredient( idx, {
                                                    qty: e.target.value === "" ? undefined : Number( e.target.value ),
                                                } )
                                            }
                                            placeholder="Qty"
                                            className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                        />
                                    </div>

                                    <div>
                                        <input
                                            value={ ing.unit ?? "" }
                                            onChange={ ( e ) => updateIngredient( idx, { unit: e.target.value } ) }
                                            placeholder="Unit (e.g. tsp)"
                                            className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                        />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <input
                                            value={ ing.notes ?? "" }
                                            onChange={ ( e ) => updateIngredient( idx, { notes: e.target.value } ) }
                                            placeholder="Notes"
                                            className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={ () => removeIngredient( idx ) }
                                            className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-slate-300 hover:bg-white/5"
                                        >
                                            <HiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) ) }

                            {/* add new ingredient mini-form */ }
                            <div className="p-3 bg-[#07060a] border border-[#24121b] rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                                <div className="sm:col-span-2">
                                    <input
                                        value={ newIngName }
                                        onChange={ ( e ) => setNewIngName( e.target.value ) }
                                        placeholder="New ingredient"
                                        className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                    />
                                </div>
                                <div>
                                    <input
                                        value={ newIngQty }
                                        onChange={ ( e ) => setNewIngQty( e.target.value ) }
                                        placeholder="Qty"
                                        className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                    />
                                </div>
                                <div>
                                    <input
                                        value={ newIngUnit }
                                        onChange={ ( e ) => setNewIngUnit( e.target.value ) }
                                        placeholder="Unit"
                                        className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <input
                                        value={ newIngNotes }
                                        onChange={ ( e ) => setNewIngNotes( e.target.value ) }
                                        placeholder="Notes"
                                        className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                    />
                                </div>
                                <div className="flex items-center justify-end">
                                    <button
                                        type="button"
                                        onClick={ addIngredient }
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152017] border border-[#25302b] text-sm"
                                    >
                                        <HiPlus className="w-4 h-4" /> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* images */ }
                    <div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-slate-400">Images</label>
                            <div className="text-xs text-slate-500">{ newImages.length } selected</div>
                        </div>

                        <div className="mt-2 flex gap-3 flex-wrap">
                            { newImages.map( ( f, idx ) => (
                                <ImagePreview key={ idx } file={ f } onRemove={ () => removeNewImage( idx ) } />
                            ) ) }

                            <label className="w-28 h-20 flex items-center justify-center rounded-xl bg-[#08060a] border border-[#24121b] cursor-pointer">
                                <input onChange={ handleNewImagesPicked } type="file" accept="image/*" multiple className="hidden" />
                                <div className="flex flex-col items-center text-slate-400">
                                    <HiOutlineCloudUpload className="w-6 h-6" />
                                    <div className="text-xs mt-1">Upload</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* actions */ }
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={ !canSubmit }
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold"
                        >
                            <HiPencil className="w-5 h-5" />
                            { loading ? "Creating..." : "Create Recipe" }
                        </button>

                        <Link to="/admin/recipes" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.02)] border border-[#2b1e2b] text-sm">
                            Cancel
                        </Link>

                        <button
                            type="button"
                            onClick={ () => {
                                setTitle( "" );
                                setCategory( "" );
                                setCuisine( "" );
                                setDescription( "" );
                                setInstructions( "" );
                                setIngredients( [] );
                                setNewImages( [] );
                                setNewIngName( "" );
                                setNewIngQty( "" );
                                setNewIngUnit( "" );
                                setNewIngNotes( "" );
                                setError( null );
                                setSuccessMsg( null );
                            } }
                            className="ml-auto text-xs text-slate-400 hover:underline"
                        >
                            Reset form
                        </button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    );
}
