// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
    HiOutlineMenu,
    HiPlus,
    HiFire,
    HiChevronLeft,
    HiTrash,
    HiEye,
    HiOutlineRefresh,
    HiSearch,
} from "react-icons/hi";
import { RiUser3Line, RiPlantLine, RiEditLine } from "react-icons/ri";
import { MdOutlineAnalytics } from "react-icons/md";

import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";

import {
    fetchRecipes,
    selectAllRecipes,
    selectRecipesFetchStatus,
    deleteRecipe,
} from "../store/slices/recipes.slice";

import {
    fetchAdminProfile,
    selectAdmin,
    selectAdminStatus,
    logoutAdmin,
    fetchAdminDashboard,
    selectAdminDashboard,
    selectAdminDashboardStatus,
} from "../store/slices/admin.slice";

/* ---------- Modern Stat Card ---------- */
function StatCard( { title, value, hint, IconComponent, color } ) {
    return (
        <div className="rounded-2xl p-4 bg-gradient-to-b from-[#0c0710] to-[#131216] border border-[#2b1e2b] shadow-sm hover:shadow-lg transition">
            <div className="flex items-center gap-4">
                <div
                    className={ `w-12 h-12 flex items-center justify-center rounded-full ${color} text-black flex-shrink-0` }
                    aria-hidden
                >
                    <IconComponent className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 truncate">{ title }</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-100 truncate">{ value }</div>
                    { hint && <div className="text-xs text-slate-500 mt-1">{ hint }</div> }
                </div>
            </div>
        </div>
    );
}

/* ---------- Category Bar (animated) ---------- */
function CategoryBar( { label, count, max } ) {
    const pct = max > 0 ? Math.round( ( count / max ) * 100 ) : 0;
    return (
        <div className="flex items-center gap-3">
            <div className="text-sm text-slate-200 w-28 truncate">{ label }</div>
            <div className="flex-1 h-3 bg-[#0b0710] rounded-md border border-[#20151a] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#ff7a1a] to-[#ff3b00] transition-all duration-700" style={ { width: `${pct}%` } } />
            </div>
            <div className="text-xs text-slate-400 w-10 text-right">{ count }</div>
        </div>
    );
}

/* ---------- Mobile recipe card (used on small screens) ---------- */
function MobileRecipeCard( { recipe, onView, onEdit, onDelete } ) {
    return (
        <div className="bg-[#07060a] border border-[#24121b] rounded-xl p-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-100 truncate">{ recipe.title }</div>
                    <div className="text-xs text-slate-400 mt-1 truncate">{ recipe.description ?? "—" }</div>
                    <div className="text-xs text-slate-400 mt-1">
                        Category: <span className="text-slate-200">{ recipe.category ?? "—" }</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                        Created: <span className="text-slate-200">{ recipe.createdAt ? new Date( recipe.createdAt ).toLocaleDateString() : "—" }</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <button onClick={ onView } className="px-2 py-1 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-xs">View</button>
                    <button onClick={ onEdit } className="px-2 py-1 rounded-full bg-[#102027] border border-[#214040] text-xs">Edit</button>
                    <button onClick={ onDelete } className="px-2 py-1 rounded-full bg-gradient-to-br from-[#ff3b00] to-[#d70000] text-black text-xs">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // admin
    const admin = useSelector( selectAdmin );
    const adminStatus = useSelector( selectAdminStatus );

    // dashboard (aggregated)
    const dashboard = useSelector( selectAdminDashboard );
    const dashboardStatus = useSelector( selectAdminDashboardStatus );

    // recipes slice (detailed list + server pagination)
    const recipes = useSelector( selectAllRecipes );
    const recipesFetchStatus = useSelector( selectRecipesFetchStatus );

    // UI
    const [ sidebarOpen, setSidebarOpen ] = useState( true );
    const [ queryInput, setQueryInput ] = useState( "" );
    const [ query, setQuery ] = useState( "" );
    const [ pageSize, setPageSize ] = useState( 8 );
    const [ page, setPage ] = useState( 1 );
    const [ selectedRecipeId, setSelectedRecipeId ] = useState( null );
    const [ confirmDeleteOpen, setConfirmDeleteOpen ] = useState( false );
    const [ busy, setBusy ] = useState( false );

    // mount: load admin + dashboard + initial recipes
    useEffect( () => {
        dispatch( fetchAdminProfile() ).catch( () => { } );
        dispatch( fetchAdminDashboard() ).catch( () => { } );
        dispatch( fetchRecipes( { page: 1, pageSize } ) ).catch( () => { } );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ dispatch, pageSize ] );

    // fetch recipes when page or query changes (server-side pagination/search)
    useEffect( () => {
        dispatch( fetchRecipes( { page, pageSize, q: query } ) ).catch( () => { } );
    }, [ dispatch, page, pageSize, query ] );

    // SAFE redirect effect — stable deps (only admin)
    useEffect( () => {
        // if admin is not authenticated, redirect to home
        if ( !admin?.username ) {
            navigate( "/" );
        }
        // we intentionally depend only on admin here so the array length is stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ admin ] );

    /* 
      // Alternative (linter-friendly) approach — uncomment if you prefer:
      // const safeNavigate = useCallback((to) => navigate(to), [navigate]);
      // useEffect(() => {
      //   if (!admin?.username) safeNavigate("/");
      // }, [admin, safeNavigate]);
    */

    const totalRecipes = dashboard?.totalRecipes ?? ( recipes ? recipes.length : 0 );
    const totalUsers = dashboard?.totalUsers ?? "—";
    const totalIngredients = dashboard?.totalIngredients ?? "—";
    const recipesByCategory = dashboard?.recipesByCategory ?? [];
    const topRecipes = dashboard?.topRecipes ?? [];

    const recentRecipes = useMemo( () => {
        if ( Array.isArray( dashboard?.recentRecipes ) && dashboard.recentRecipes.length > 0 ) return dashboard.recentRecipes;
        if ( Array.isArray( recipes ) && recipes.length > 0 ) return recipes.slice( 0, 8 );
        return [];
    }, [ dashboard, recipes ] );

    const isDashboardLoading = dashboardStatus === "loading";
    const isRecipesLoading = recipesFetchStatus === "loading";

    const maxCategoryCount = recipesByCategory.reduce( ( acc, c ) => Math.max( acc, c.count ?? 0 ), 0 );

    async function handleDeleteRecipe( id ) {
        if ( !id ) return;
        setBusy( true );
        try {
            await dispatch( deleteRecipe( id ) ).unwrap();
            dispatch( fetchRecipes( { page, pageSize, q: query } ) );
            setConfirmDeleteOpen( false );
            setSelectedRecipeId( null );
        } catch ( err ) {
            console.error( "Failed to delete recipe:", err );
        } finally {
            setBusy( false );
        }
    }

    function handleLogout() {
        dispatch( logoutAdmin() );
        navigate( "/admin/login" );
    }

    function handleSearchSubmit( e ) {
        e.preventDefault();
        setPage( 1 );
        setQuery( queryInput?.trim() ?? "" );
    }

    function handleRefresh() {
        dispatch( fetchAdminDashboard() );
        dispatch( fetchRecipes( { page: 1, pageSize, q: query } ) );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100">
            <Navbar />

            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                {/* top row (wraps on small) */ }
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={ () => setSidebarOpen( ( s ) => !s ) }
                            className="p-2 rounded-md bg-[#0b0710] border border-[#2b1e2b] hover:bg-[#0f0810]"
                            aria-label="toggle"
                            title="Toggle"
                        >
                            <HiChevronLeft className="w-5 h-5" />
                        </button>

                        <div>
                            <div className="text-2xl font-bold">Admin Dashboard</div>
                            <div className="text-sm text-slate-400">Manage recipes, users & analytics</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <form onSubmit={ handleSearchSubmit } className="flex items-center gap-2">
                            <input
                                className="px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none w-48 sm:w-64"
                                placeholder="Search recipes or users..."
                                value={ queryInput }
                                onChange={ ( e ) => setQueryInput( e.target.value ) }
                                aria-label="Search"
                            />
                            <button type="submit" className="p-2 rounded-full bg-[#152017] border border-[#25302b] hover:bg-[#1b2a21]" aria-label="search" title="Search">
                                <HiSearch className="w-5 h-5" />
                            </button>
                        </form>

                        <button
                            onClick={ () => navigate( "/admin/recipes/create" ) }
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow text-sm"
                            title="New recipe"
                        >
                            <HiPlus className="w-4 h-4" /> New
                        </button>

                        <button onClick={ handleRefresh } className="p-2 rounded-full bg-[#0b0710] border border-[#2b1e2b] hover:bg-[#0f0710]" title="Refresh">
                            <HiOutlineRefresh className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#0b0710] border border-[#2b1e2b]">
                            <div className="w-8 h-8 rounded-full bg-[#1b0b12] flex items-center justify-center text-orange-300 text-sm">
                                { admin?.username?.[ 0 ]?.toUpperCase() ?? "A" }
                            </div>
                            <div className="text-sm">
                                <div className="font-medium">{ admin?.username ?? "Admin" }</div>
                                <div className="text-xs text-slate-400">{ adminStatus === "loading" ? "Loading..." : "Administrator" }</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* stats row: responsive grid */ }
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <StatCard title="Total Recipes" value={ isDashboardLoading ? "…" : totalRecipes } hint="All recipes in the system" IconComponent={ HiFire } color="bg-orange-300" />
                    <StatCard title="Total Users" value={ isDashboardLoading ? "…" : totalUsers } hint="Registered users" IconComponent={ RiUser3Line } color="bg-blue-300" />
                    <StatCard title="Total Ingredients" value={ isDashboardLoading ? "…" : totalIngredients } hint="Indexed ingredients" IconComponent={ RiPlantLine } color="bg-emerald-300" />
                </div>

                {/* content grid: main + analytics (stacks on small) */ }
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* main: recent recipes */ }
                    <div className="lg:col-span-2 rounded-2xl p-4 bg-gradient-to-b from-[#0b0710] to-[#151018] border border-[#2b1e2b] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Recent Recipes</h3>
                            <div className="text-sm text-slate-400">{ isRecipesLoading ? "Loading…" : `${totalRecipes} total` }</div>
                        </div>

                        {/* Desktop/table view (md+) */ }
                        <div className="hidden md:block overflow-auto">
                            { isRecipesLoading && !recentRecipes.length ? (
                                <div className="py-12 flex justify-center">
                                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-orange-500 animate-spin" />
                                </div>
                            ) : recentRecipes.length === 0 ? (
                                <div className="py-8 text-center text-slate-500">No recipes yet</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-slate-400">
                                            <th className="py-2 px-3">Title</th>
                                            <th className="py-2 px-3">Category</th>
                                            <th className="py-2 px-3">Created</th>
                                            <th className="py-2 px-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { recentRecipes.map( ( r ) => (
                                            <tr key={ r.id ?? r._id } className="border-t border-[#24121b] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                                                <td className="py-3 px-3 align-top">
                                                    <div className="font-medium text-slate-100">{ r.title }</div>
                                                    <div className="text-xs text-slate-500 mt-1">{ r.description ? `${r.description.slice( 0, 80 )}${r.description.length > 80 ? "…" : ""}` : "—" }</div>
                                                </td>
                                                <td className="py-3 px-3 text-slate-300 align-top">{ r.category ?? "—" }</td>
                                                <td className="py-3 px-3 text-slate-300 align-top">{ r.createdAt ? new Date( r.createdAt ).toLocaleDateString() : "—" }</td>
                                                <td className="py-3 px-3 align-top">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Link to={ `/recipes/${r.id ?? r._id}` } className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-sm hover:bg-[#111018]" title="View recipe">
                                                            <HiEye className="w-4 h-4" /> View
                                                        </Link>

                                                        <button onClick={ () => navigate( `/admin/recipes/edit/${r.id ?? r._id}` ) } className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102027] border border-[#214040] text-sm hover:bg-[#123133]" title="Edit recipe">
                                                            <RiEditLine className="w-4 h-4" /> Edit
                                                        </button>

                                                        <button onClick={ () => { setSelectedRecipeId( r.id ?? r._1d ); setConfirmDeleteOpen( true ); } } className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-br from-[#ff3b00] to-[#d70000] text-black text-sm hover:brightness-95" title="Delete recipe">
                                                            <HiTrash className="w-4 h-4" /> Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) ) }
                                    </tbody>
                                </table>
                            ) }
                        </div>

                        {/* Mobile list view (sm / xs): stacked cards */ }
                        <div className="md:hidden space-y-3">
                            { isRecipesLoading && !recentRecipes.length ? (
                                <div className="py-8 flex justify-center">
                                    <div className="w-10 h-10 rounded-full border-4 border-t-transparent border-orange-500 animate-spin" />
                                </div>
                            ) : recentRecipes.length === 0 ? (
                                <div className="py-4 text-center text-slate-500">No recipes yet</div>
                            ) : (
                                recentRecipes.map( ( r ) => (
                                    <MobileRecipeCard
                                        key={ r.id ?? r._id }
                                        recipe={ r }
                                        onView={ () => navigate( `/recipes/${r.id ?? r._id}` ) }
                                        onEdit={ () => navigate( `/admin/recipes/edit/${r.id ?? r._id}` ) }
                                        onDelete={ () => { setSelectedRecipeId( r.id ?? r._id ); setConfirmDeleteOpen( true ); } }
                                    />
                                ) )
                            ) }
                        </div>

                        {/* pagination */ }
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                            <div>Showing { recentRecipes.length } of { totalRecipes }</div>
                            <div className="flex items-center gap-2">
                                <button onClick={ () => setPage( ( p ) => Math.max( 1, p - 1 ) ) } disabled={ page <= 1 || isRecipesLoading } className="px-3 py-1 rounded-full bg-[#0b0710] border border-[#2b1e2b] disabled:opacity-50 text-xs">Prev</button>
                                <div className="px-2 text-sm">Page { page }</div>
                                <button onClick={ () => setPage( ( p ) => p + 1 ) } disabled={ isRecipesLoading } className="px-3 py-1 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-xs">Next</button>
                            </div>
                        </div>
                    </div>

                    {/* right: analytics */ }
                    <aside className="rounded-2xl p-4 bg-gradient-to-b from-[#0b0710] to-[#151018] border border-[#2b1e2b] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <MdOutlineAnalytics className="w-6 h-6 text-orange-300" />
                                <div className="text-lg font-semibold">Analytics</div>
                            </div>
                            <div className="text-xs text-slate-400">{ dashboard?.fetchedAt ? new Date( dashboard.fetchedAt ).toLocaleString() : "—" }</div>
                        </div>

                        <div className="space-y-3 mb-3">
                            <div className="text-sm text-slate-400 flex items-center justify-between">
                                <span>Top recipes</span>
                                <span className="text-xs text-slate-500">{ topRecipes.length } shown</span>
                            </div>

                            { topRecipes.length === 0 ? (
                                <div className="text-sm text-slate-500">No top recipes</div>
                            ) : (
                                topRecipes.slice( 0, 6 ).map( ( t ) => (
                                    <div key={ t.id ?? t._id } className="flex items-center justify-between p-2 rounded-md bg-[#07060a] border border-[#22121a]">
                                        <div className="text-sm truncate">{ t.title }</div>
                                        <div className="text-xs text-slate-400">{ t.popularity ?? "—" }</div>
                                    </div>
                                ) )
                            ) }
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <HiFire className="w-5 h-5 text-orange-300" />
                                <div className="text-sm font-medium">Recipes by category</div>
                            </div>

                            <div className="space-y-2">
                                { recipesByCategory.length === 0 ? (
                                    <div className="text-sm text-slate-500">No category data</div>
                                ) : (
                                    recipesByCategory.map( ( c ) => <CategoryBar key={ c.category } label={ c.category } count={ c.count } max={ maxCategoryCount } /> )
                                ) }
                            </div>
                        </div>

                        <div className="pt-3 border-t border-[#20121a]">
                            <div className="text-xs text-slate-400 mb-2">Users</div>
                            <div className="grid gap-2">
                                <div className="p-3 rounded-xl bg-[#08060a] border border-[#22121a] text-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <RiUser3Line className="w-5 h-5 text-blue-300" />
                                        <div>Total users</div>
                                    </div>
                                    <div className="text-sm text-slate-200">{ isDashboardLoading ? "…" : totalUsers }</div>
                                </div>

                                <div className="p-3 rounded-xl bg-[#08060a] border border-[#22121a] text-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <RiPlantLine className="w-5 h-5 text-emerald-300" />
                                        <div>Ingredients indexed</div>
                                    </div>
                                    <div className="text-sm text-slate-200">{ isDashboardLoading ? "…" : totalIngredients }</div>
                                </div>

                                <div className="p-3 rounded-xl bg-[#08060a] border border-[#22121a] text-sm">
                                    <Link to="/admin/users" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold">Manage users</Link>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* quick actions */ }
                <div className="rounded-2xl p-4 bg-gradient-to-b from-[#0b0710] to-[#151018] border border-[#2b1e2b] shadow-sm mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-semibold">Quick actions</div>
                        <div className="text-sm text-slate-400">Common admin tasks</div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link to="/admin/recipes/create" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#152017] border border-[#25302b] text-sm">Create recipe</Link>
                        <Link to="/admin/import" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#121227] border border-[#23253a] text-sm">Import data</Link>
                        <Link to="/admin/logs" className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#171014] border border-[#2b211f] text-sm">View logs</Link>
                    </div>
                </div>

                {/* confirm modal */ }
                { confirmDeleteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-[#0b0710] border border-[#2b1e2b] p-6">
                            <h4 className="text-lg font-semibold">Delete recipe?</h4>
                            <p className="text-sm text-slate-400 mt-2">This action cannot be undone. Are you sure you want to delete this recipe?</p>

                            <div className="mt-4 flex items-center gap-3 justify-end">
                                <button className="px-4 py-2 rounded-full bg-[rgba(255,255,255,0.03)]" onClick={ () => setConfirmDeleteOpen( false ) }>Cancel</button>
                                <button onClick={ () => handleDeleteRecipe( selectedRecipeId ) } disabled={ busy } className="px-4 py-2 rounded-full bg-gradient-to-br from-[#ff3b00] to-[#d70000] text-black font-semibold">
                                    { busy ? "Deleting..." : "Delete" }
                                </button>
                            </div>
                        </div>
                    </div>
                ) }
            </main>

            <Footer />
        </div>
    );
}
