// src/pages/admin/EditRecipe.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    HiChevronLeft,
    HiOutlineCloudUpload,
    HiPlus,
    HiX,
    HiPencil,
} from "react-icons/hi";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";

// Thunks / selectors from your recipes slice
import {
    fetchRecipe,
    updateRecipe,
    fetchRecipes,
    selectRecipeById,
    selectRecipesFetchStatus,
} from "../store/slices/recipes.slice";

import { selectAdmin } from "../store/slices/admin.slice";

/* ---------- Tiny spinner (SVG) ---------- */
function Spinner( { size = 20 } ) {
    const s = size;
    return (
        <svg
            className="animate-spin"
            width={ s }
            height={ s }
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
        >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}

/* ---------- Loading overlay (fullscreen) ---------- */
function LoadingOverlay( { message = "Saving..." } ) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            role="status"
            aria-live="polite"
        >
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-[#0b0710]/80 to-[#151018]/80 border border-[#2b1e2b]">
                <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-orange-500 animate-spin" />
                <div className="text-sm text-slate-100">{ message }</div>
            </div>
        </div>
    );
}

/* ---------- ImagePreview component (handles url string or File) ---------- */
function ImagePreview( { fileOrUrl, onRemove } ) {
    const [ src, setSrc ] = useState( null );

    useEffect( () => {
        let cancelled = false;
        if ( !fileOrUrl ) {
            setSrc( null );
            return;
        }

        if ( typeof fileOrUrl === "string" ) {
            setSrc( fileOrUrl );
            return;
        }

        if ( fileOrUrl instanceof File ) {
            const reader = new FileReader();
            reader.onload = ( e ) => {
                if ( !cancelled ) setSrc( e.target.result );
            };
            reader.readAsDataURL( fileOrUrl );
            return () => {
                cancelled = true;
            };
        }

        // fallback
        setSrc( null );
        return () => {
            cancelled = true;
        };
    }, [ fileOrUrl ] );

    return (
        <div className="relative w-28 h-20 bg-[#07060a] border border-[#24121b] rounded-xl overflow-hidden">
            { src ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={ src } alt="preview" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">Preview</div>
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

/* ---------- EditRecipe page (fields strictly follow Recipe.js model) ---------- */
export default function EditRecipe() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const admin = useSelector( selectAdmin );
    const existingRecipeFromStore = useSelector( ( state ) =>
        typeof selectRecipeById === "function" ? selectRecipeById( state, id ) : null
    );
    const recipesStatus = useSelector( ( state ) =>
        typeof selectRecipesFetchStatus === "function" ? selectRecipesFetchStatus( state ) : "idle"
    );

    // local ui state
    const [ loading, setLoading ] = useState( false ); // submission loading
    const [ fetching, setFetching ] = useState( true ); // initial fetch
    const [ error, setError ] = useState( null );
    const [ successMsg, setSuccessMsg ] = useState( null );

    // form fields matching Recipe model
    const [ title, setTitle ] = useState( "" );
    const [ category, setCategory ] = useState( "" );
    const [ description, setDescription ] = useState( "" );
    const [ instructions, setInstructions ] = useState( "" );
    const [ cuisine, setCuisine ] = useState( "" );

    // ingredients: array of { ingredient?, name, qty, unit, notes }
    const [ ingredients, setIngredients ] = useState( [] );
    // small inline inputs for adding a new ingredient
    const [ newIngName, setNewIngName ] = useState( "" );
    const [ newIngQty, setNewIngQty ] = useState( "" );
    const [ newIngUnit, setNewIngUnit ] = useState( "" );
    const [ newIngNotes, setNewIngNotes ] = useState( "" );

    // images: existing image URLs, newImages are File[]
    const [ existingImages, setExistingImages ] = useState( [] );
    const [ newImages, setNewImages ] = useState( [] );
    const [ removedImageUrls, setRemovedImageUrls ] = useState( [] );

    // --- load recipe (from store or API) ---
    useEffect( () => {
        let mounted = true;
        setFetching( true );
        setError( null );

        async function load() {
            try {
                if ( existingRecipeFromStore ) {
                    setFormFromRecipe( existingRecipeFromStore );
                    if ( mounted ) setFetching( false );
                    return;
                }

                const res = await dispatch( fetchRecipe( id ) ).unwrap();
                const recipe = res?.recipe ?? res?.data ?? res;
                if ( !recipe ) throw new Error( "Failed to load recipe" );
                if ( !mounted ) return;
                setFormFromRecipe( recipe );
            } catch ( err ) {
                if ( mounted ) setError( err?.message ?? "Failed to load recipe" );
            } finally {
                if ( mounted ) setFetching( false );
            }
        }

        load();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ dispatch, id, existingRecipeFromStore ] );

    // Normalize server recipe -> local form fields (strict to model fields)
    function setFormFromRecipe( recipe ) {
        setTitle( recipe.title ?? "" );
        setCategory( recipe.category ?? "" );
        setDescription( recipe.description ?? "" );
        setInstructions( recipe.instructions ?? "" );
        setCuisine( recipe.cuisine ?? "" );

        // Normalize ingredients -> ensure each is { ingredient (id or null), name, qty, unit, notes }
        const normalizedIngredients = Array.isArray( recipe.ingredients )
            ? recipe.ingredients.map( ( ing ) => {
                const ingredientId =
                    ( ing && ing.ingredient && ( ing.ingredient._id ?? ing.ingredient ) ) || undefined;

                // Name precedence: ing.name (explicit), else ing.ingredient.name (populated)
                const name =
                    ( ing && ( ing.name ?? ( ing.ingredient && ing.ingredient.name ) ) ) ?? "";

                const qty = ing && ing.qty !== undefined ? ing.qty : undefined;
                const unit = ing && ing.unit !== undefined ? ing.unit : undefined;
                const notes = ing && ing.notes !== undefined ? ing.notes : undefined;

                return { ingredient: ingredientId, name: name ?? "", qty, unit, notes };
            } )
            : [];

        setIngredients( normalizedIngredients );

        // images array of strings (urls)
        const normalizedImages = Array.isArray( recipe.images )
            ? recipe.images
                .map( ( img ) => {
                    if ( !img ) return null;
                    if ( typeof img === "string" ) return img;
                    if ( img.url ) return img.url;
                    if ( img.path ) return img.path;
                    return String( img );
                } )
                .filter( Boolean )
            : [];

        setExistingImages( normalizedImages );
        setNewImages( [] );
        setRemovedImageUrls( [] );
        setError( null );
    }

    // --- ingredients helpers ---
    function addIngredient() {
        const name = newIngName.trim();
        if ( !name ) return;
        const ingObj = {
            ingredient: undefined, // no id from UI, keep undefined unless server populated existing ingredient
            name,
            qty: newIngQty !== "" ? Number( newIngQty ) : undefined,
            unit: newIngUnit || undefined,
            notes: newIngNotes || undefined,
        };
        setIngredients( ( s ) => [ ...s, ingObj ] );
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

    // --- images helpers ---
    function handleNewImagesPicked( e ) {
        const files = Array.from( e.target.files || [] );
        if ( !files.length ) return;
        setNewImages( ( s ) => [ ...s, ...files ] );
        e.target.value = "";
    }

    function removeExistingImage( url ) {
        setExistingImages( ( s ) => s.filter( ( u ) => u !== url ) );
        setRemovedImageUrls( ( s ) => [ ...s, url ] );
    }

    function removeNewImage( idx ) {
        setNewImages( ( s ) => s.filter( ( _, i ) => i !== idx ) );
    }

    function createPayload() {
        const useFormData = newImages.length > 0;

        const ingPayload = ingredients.map( ( i ) => {
            const out = {};
            if ( i.ingredient ) out.ingredient = i.ingredient; // objectId or string
            if ( i.name !== undefined ) out.name = i.name;
            if ( i.qty !== undefined && i.qty !== null && i.qty !== "" ) out.qty = i.qty;
            if ( i.unit !== undefined ) out.unit = i.unit;
            if ( i.notes !== undefined ) out.notes = i.notes;
            return out;
        } );

        if ( useFormData ) {
            const fd = new FormData();
            fd.append( "title", title );
            fd.append( "category", category );
            if ( description ) fd.append( "description", description );
            if ( instructions ) fd.append( "instructions", instructions );
            if ( cuisine ) fd.append( "cuisine", cuisine );

            fd.append( "ingredients", JSON.stringify( ingPayload ) );
            // images handling: send remaining existing images (so backend keeps them) and removed images list
            fd.append( "existingImages", JSON.stringify( existingImages ) );
            fd.append( "removedImages", JSON.stringify( removedImageUrls ) );
            newImages.forEach( ( f ) => fd.append( "images", f ) );
            return fd;
        }

        return {
            title,
            category,
            description,
            instructions,
            cuisine,
            ingredients: ingPayload,
            existingImages,
            removedImages: removedImageUrls,
        };
    }

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
            const payload = createPayload();
            // call your thunk — your thunk handles FormData vs JSON
            await dispatch( updateRecipe( { id, data: payload } ) ).unwrap();

            // refresh the listing/dashboard
            dispatch( fetchRecipes( { page: 1, pageSize: 12 } ) ).catch( () => { } );

            setSuccessMsg( "Recipe updated" );
            setTimeout( () => navigate( `/recipes/${id}` ), 700 );
        } catch ( err ) {
            setError( err?.message ?? "Update failed" );
        } finally {
            setLoading( false );
        }
    }

    const canSubmit = useMemo( () => {
        return title.trim().length > 0 && !loading && !fetching;
    }, [ title, loading, fetching ] );

    // If admin guard wanted:
    // useEffect(() => { if (admin && !admin.isAdmin) navigate("/"); }, [admin, navigate]);

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
                        <h1 className="text-2xl font-semibold">Edit Recipe</h1>
                        <div className="text-sm text-slate-400">Update recipe details (model fields only)</div>
                    </div>
                </div>

                { fetching ? (
                    <div className="py-12 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-orange-500 animate-spin" />
                    </div>
                ) : (
                    <form
                        onSubmit={ handleSubmit }
                        className="space-y-6"
                        aria-busy={ loading ? "true" : "false" }
                    >
                        { error && <div className="text-sm text-red-400">{ error }</div> }
                        { successMsg && <div className="text-sm text-emerald-300">{ successMsg }</div> }

                        {/* Section: Title / Category / Cuisine (rounded widget) */ }
                        <div className="rounded-2xl p-4 bg-[linear-gradient(180deg,#0b0710,#151018)] border border-[#2b1e2b] shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-xs text-slate-400">Title</label>
                                    <input
                                        value={ title }
                                        onChange={ ( e ) => setTitle( e.target.value ) }
                                        placeholder="E.g. Paneer Butter Masala"
                                        className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        disabled={ loading }
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Category</label>
                                    <input
                                        value={ category }
                                        onChange={ ( e ) => setCategory( e.target.value ) }
                                        placeholder="Main Course"
                                        className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        disabled={ loading }
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="text-xs text-slate-400">Cuisine</label>
                                <input
                                    value={ cuisine }
                                    onChange={ ( e ) => setCuisine( e.target.value ) }
                                    placeholder="e.g. North Indian"
                                    className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    disabled={ loading }
                                />
                            </div>
                        </div>

                        {/* Section: Description (rounded widget) */ }
                        <div className="rounded-2xl p-4 bg-[linear-gradient(180deg,#0b0710,#151018)] border border-[#2b1e2b] shadow-sm">
                            <label className="text-xs text-slate-400">Short description</label>
                            <textarea
                                value={ description }
                                onChange={ ( e ) => setDescription( e.target.value ) }
                                rows={ 3 }
                                placeholder="Brief description for listing..."
                                className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={ loading }
                            />
                        </div>

                        {/* Section: Instructions */ }
                        <div className="rounded-2xl p-4 bg-[linear-gradient(180deg,#0b0710,#151018)] border border-[#2b1e2b] shadow-sm">
                            <label className="text-xs text-slate-400">Instructions</label>
                            <textarea
                                value={ instructions }
                                onChange={ ( e ) => setInstructions( e.target.value ) }
                                rows={ 8 }
                                placeholder="Full preparation instructions..."
                                className="mt-2 w-full px-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                disabled={ loading }
                            />
                        </div>

                        {/* Section: Ingredients */ }
                        <div className="rounded-2xl p-4 bg-[linear-gradient(180deg,#0b0710,#151018)] border border-[#2b1e2b] shadow-sm">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-slate-400">Ingredients</label>
                                <div className="text-xs text-slate-500">{ ingredients.length } items</div>
                            </div>

                            <div className="mt-2 space-y-2">
                                { ingredients.map( ( ing, idx ) => (
                                    <div key={ idx } className="p-3 bg-[#07060a] border border-[#24121b] rounded-xl grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                                        <div className="sm:col-span-2">
                                            <input
                                                value={ ing.name }
                                                onChange={ ( e ) => updateIngredient( idx, { name: e.target.value } ) }
                                                placeholder="Ingredient name"
                                                className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                                disabled={ loading }
                                            />
                                        </div>

                                        <div>
                                            <input
                                                value={ ing.qty ?? "" }
                                                onChange={ ( e ) => {
                                                    const val = e.target.value;
                                                    updateIngredient( idx, { qty: val === "" ? undefined : Number( val ) } );
                                                } }
                                                placeholder="Qty"
                                                className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                                disabled={ loading }
                                            />
                                        </div>

                                        <div>
                                            <input
                                                value={ ing.unit ?? "" }
                                                onChange={ ( e ) => updateIngredient( idx, { unit: e.target.value } ) }
                                                placeholder="Unit (e.g. tsp)"
                                                className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                                disabled={ loading }
                                            />
                                        </div>

                                        <div className="sm:col-span-1">
                                            <input
                                                value={ ing.notes ?? "" }
                                                onChange={ ( e ) => updateIngredient( idx, { notes: e.target.value } ) }
                                                placeholder="Notes"
                                                className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                                disabled={ loading }
                                            />
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <button type="button" onClick={ () => removeIngredient( idx ) } className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-slate-300 hover:bg-white/5" disabled={ loading }>
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
                                            disabled={ loading }
                                        />
                                    </div>
                                    <div>
                                        <input
                                            value={ newIngQty }
                                            onChange={ ( e ) => setNewIngQty( e.target.value ) }
                                            placeholder="Qty"
                                            className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                            disabled={ loading }
                                        />
                                    </div>
                                    <div>
                                        <input
                                            value={ newIngUnit }
                                            onChange={ ( e ) => setNewIngUnit( e.target.value ) }
                                            placeholder="Unit"
                                            className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                            disabled={ loading }
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <input
                                            value={ newIngNotes }
                                            onChange={ ( e ) => setNewIngNotes( e.target.value ) }
                                            placeholder="Notes"
                                            className="w-full px-2 py-2 rounded-md bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                            disabled={ loading }
                                        />
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <button type="button" onClick={ addIngredient } className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152017] border border-[#25302b] text-sm" disabled={ loading }>
                                            <HiPlus className="w-4 h-4" /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Images */ }
                        <div className="rounded-2xl p-4 bg-[linear-gradient(180deg,#0b0710,#151018)] border border-[#2b1e2b] shadow-sm">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-slate-400">Images</label>
                                <div className="text-xs text-slate-500">{ existingImages.length + newImages.length } total</div>
                            </div>

                            <div className="mt-2 flex gap-3 flex-wrap">
                                { existingImages.map( ( url ) => (
                                    <ImagePreview key={ url } fileOrUrl={ url } onRemove={ () => removeExistingImage( url ) } />
                                ) ) }

                                { newImages.map( ( f, idx ) => (
                                    <ImagePreview key={ idx } fileOrUrl={ f } onRemove={ () => removeNewImage( idx ) } />
                                ) ) }

                                <label className="w-28 h-20 flex items-center justify-center rounded-xl bg-[#08060a] border border-[#24121b] cursor-pointer">
                                    <input onChange={ handleNewImagesPicked } type="file" accept="image/*" multiple className="hidden" disabled={ loading } />
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
                                aria-disabled={ !canSubmit }
                            >
                                { loading ? <Spinner size={ 18 } /> : <HiPencil className="w-5 h-5" /> }
                                <span>{ loading ? "Updating..." : "Update Recipe" }</span>
                            </button>

                            <Link to="/admin/recipes" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.02)] border border-[#2b1e2b] text-sm">
                                Cancel
                            </Link>

                            <button
                                type="button"
                                onClick={ () =>
                                    setFormFromRecipe( {
                                        title: "",
                                        category: "",
                                        description: "",
                                        instructions: "",
                                        cuisine: "",
                                        ingredients: [],
                                        images: [],
                                    } )
                                }
                                className="ml-auto text-xs text-slate-400 hover:underline"
                                disabled={ loading }
                            >
                                Reset form
                            </button>
                        </div>
                    </form>
                ) }
            </main>

            <Footer />

            {/* fullscreen loading overlay while submitting */ }
            { loading && <LoadingOverlay message="Updating recipe..." /> }
        </div>
    );
}
    