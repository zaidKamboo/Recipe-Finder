import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
    HiPlus,
    HiFire,
    HiChevronLeft,
    HiChevronRight,
    HiOutlineRefresh,
    HiSearch,
} from "react-icons/hi";
import { RiUser3Line, RiPlantLine } from "react-icons/ri";
import { MdOutlineAnalytics } from "react-icons/md";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";

import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";

import {
    fetchRecipes,
    selectAllRecipes,
    selectRecipesFetchStatus,
    deleteRecipe,
    selectRecipesTotal,
} from "../store/slices/recipes.slice";

import {
    fetchAdminProfile,
    selectAdmin,
    selectAdminStatus,
    fetchAdminDashboard,
    selectAdminDashboard,
    selectAdminDashboardStatus,
} from "../store/slices/admin.slice";

/* ---------- Stat Card ---------- */
function StatCard( { title, value, hint, Icon, color } ) {
    return (
        <div className="rounded-2xl p-4 bg-gradient-to-b from-[#0c0710] to-[#14101a] shadow-sm">
            <div className="flex items-center gap-4">
                <div
                    className={ `w-12 h-12 rounded-full flex items-center justify-center ${color}` }
                >
                    <Icon className="w-6 h-6 text-black" />
                </div>
                <div>
                    <div className="text-xs text-slate-400">{ title }</div>
                    <div className="text-2xl font-semibold text-slate-100">{ value }</div>
                    { hint && <div className="text-xs text-slate-500">{ hint }</div> }
                </div>
            </div>
        </div>
    );
}

/* ---------- Category Bar ---------- */
function CategoryBar( { label, count, max } ) {
    const pct = max ? Math.round( ( count / max ) * 100 ) : 0;
    return (
        <div className="flex items-center gap-3">
            <div className="w-28 text-sm truncate text-slate-300">{ label }</div>
            <div className="flex-1 h-3 bg-[#07060a] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600 transition-all"
                    style={ { width: `${pct}%` } }
                />
            </div>
            <div className="w-10 text-right text-xs text-slate-400">{ count }</div>
        </div>
    );
}

/* ---------- Admin Dashboard ---------- */
export default function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const admin = useSelector( selectAdmin );
    const adminStatus = useSelector( selectAdminStatus );

    const dashboard = useSelector( selectAdminDashboard );
    const dashboardStatus = useSelector( selectAdminDashboardStatus );

    const recipes = useSelector( selectAllRecipes );
    const recipesStatus = useSelector( selectRecipesFetchStatus );
    const totalRecipes = useSelector( selectRecipesTotal );

    /* ---------- pagination & search ---------- */
    const [ queryInput, setQueryInput ] = useState( "" );
    const [ query, setQuery ] = useState( "" );
    const [ pageSize, setPageSize ] = useState( 8 );
    const [ page, setPage ] = useState( 1 );

    const totalPages = Math.max( 1, Math.ceil( totalRecipes / pageSize ) );

    const getPageNumbers = () => {
        const delta = 2;
        const start = Math.max( 1, page - delta );
        const end = Math.min( totalPages, page + delta );
        return Array.from( { length: end - start + 1 }, ( _, i ) => start + i );
    };

    /* ---------- effects ---------- */
    useEffect( () => {
        dispatch( fetchAdminProfile() );
        dispatch( fetchAdminDashboard() );
    }, [ dispatch ] );

    useEffect( () => {
        dispatch( fetchRecipes( { page, pageSize, q: query } ) );
    }, [ dispatch, page, pageSize, query ] );

    useEffect( () => {
        if ( adminStatus === "succeeded" && !admin?.username ) {
            navigate( "/admin/login" );
        }
    }, [ admin, adminStatus, navigate ] );

    /* ---------- handlers ---------- */
    function handleSearchSubmit( e ) {
        e.preventDefault();
        setPage( 1 );
        setQuery( queryInput.trim() );
    }

    function handleRefresh() {
        dispatch( fetchAdminDashboard() );
        dispatch( fetchRecipes( { page: 1, pageSize, q: query } ) );
        setPage( 1 );
    }

    async function handleDelete( id ) {
        if ( !id ) return;
        await dispatch( deleteRecipe( id ) );
        dispatch( fetchRecipes( { page, pageSize, q: query } ) );
        dispatch( fetchAdminDashboard() );
    }

    const recipesByCategory = dashboard?.recipesByCategory ?? [];
    const maxCategory = Math.max( ...recipesByCategory.map( ( c ) => c.count ), 1 );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100">
            <Navbar />

            <main className="pt-24 pb-2 max-w-7xl mx-auto px-4 space-y-6 mb-1">
                {/* top bar */ }
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-sm text-slate-400">
                            Manage recipes, users & analytics
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <form onSubmit={ handleSearchSubmit } className="flex gap-2">
                            <input
                                value={ queryInput }
                                onChange={ ( e ) => setQueryInput( e.target.value ) }
                                placeholder="Search recipes..."
                                className="px-4 py-2 rounded-full bg-[#07060a] focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                            <button className="p-2 rounded-full bg-[#07060a] hover:bg-[#0c0a10]">
                                <HiSearch />
                            </button>
                        </form>

                        <select
                            value={ pageSize }
                            onChange={ ( e ) => {
                                setPageSize( Number( e.target.value ) );
                                setPage( 1 );
                            } }
                            className="px-3 py-2 rounded-full bg-[#07060a]"
                        >
                            <option value={ 8 }>8 / page</option>
                            <option value={ 12 }>12 / page</option>
                            <option value={ 20 }>20 / page</option>
                            <option value={ 50 }>50 / page</option>
                        </select>

                        <button
                            onClick={ () => navigate( "/admin/recipes/create" ) }
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-black font-semibold"
                        >
                            <HiPlus /> New
                        </button>

                        <button
                            onClick={ handleRefresh }
                            className="p-2 rounded-full bg-[#07060a] hover:bg-[#0c0a10]"
                        >
                            <HiOutlineRefresh />
                        </button>
                    </div>
                </div>

                {/* stats */ }
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Recipes"
                        value={ dashboardStatus === "loading" ? "…" : totalRecipes }
                        hint="All recipes"
                        Icon={ HiFire }
                        color="bg-orange-300"
                    />
                    <StatCard
                        title="Total Users"
                        value={ dashboard?.totalUsers ?? "—" }
                        hint="Registered"
                        Icon={ RiUser3Line }
                        color="bg-blue-300"
                    />
                    <StatCard
                        title="Ingredients"
                        value={ dashboard?.totalIngredients ?? "—" }
                        hint="Indexed"
                        Icon={ RiPlantLine }
                        color="bg-emerald-300"
                    />
                </div>

                {/* table */ }
                <div className="rounded-2xl bg-[#0b0710] p-4 shadow-sm">
                    <h3 className="font-semibold mb-4">Recipes</h3>

                    { recipesStatus === "loading" ? (
                        <div className="py-12 text-center">Loading…</div>
                    ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400">
                                        <th className="text-left p-2">Title</th>
                                        <th className="text-left p-2">Category</th>
                                        <th className="text-left p-2">Created</th>
                                        <th className="text-left p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { recipes.map( ( r ) => (
                                        <tr
                                        key={ r.id }
                                        className="hover:bg-[rgba(255,255,255,0.02)] transition"
                                    >
                                        <td className="p-2">{ r.title }</td>
                                        <td className="p-2">{ r.category }</td>
                                        <td className="p-2">
                                            { new Date( r.createdAt ).toLocaleDateString() }
                                        </td>
                                        <td className="p-2 flex gap-3">
                                            <Link to={ `/recipes/${r.id}` } className="text-blue-400">
                                                <FaEye />
                                            </Link>
                                            <button
                                                onClick={ () =>
                                                    navigate( `/admin/recipes/edit/${r.id}` )
                                                }
                                                className="text-emerald-400"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={ () => handleDelete( r.id ) }
                                                className="text-red-400"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </td>
                                    </tr>
                                ) ) }
                            </tbody>
                        </table>
                    ) }

                    {/* pagination */ }
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
                        <div className="text-slate-400">
                            Showing { ( page - 1 ) * pageSize + 1 } –{ " " }
                            { Math.min( page * pageSize, totalRecipes ) } of { totalRecipes }
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={ page === 1 }
                                onClick={ () => setPage( 1 ) }
                                className="px-3 py-1 rounded-full bg-[#07060a]"
                            >
                                First
                            </button>

                            <button
                                disabled={ page === 1 }
                                onClick={ () => setPage( ( p ) => p - 1 ) }
                                className="p-2 rounded-full bg-[#07060a]"
                            >
                                <HiChevronLeft />
                            </button>

                            { getPageNumbers().map( ( p ) => (
                                <button
                                    key={ p }
                                    onClick={ () => setPage( p ) }
                                    className={ `px-3 py-1 rounded-full ${p === page
                                        ? "bg-orange-500 text-black"
                                        : "bg-[#07060a]"
                                        }` }
                                >
                                    { p }
                                </button>
                            ) ) }

                            <button
                                disabled={ page === totalPages }
                                onClick={ () => setPage( ( p ) => p + 1 ) }
                                className="p-2 rounded-full bg-[#07060a]"
                            >
                                <HiChevronRight />
                            </button>

                            <button
                                disabled={ page === totalPages }
                                onClick={ () => setPage( totalPages ) }
                                className="px-3 py-1 rounded-full bg-[#07060a]"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                </div>

                {/* analytics */ }
                <aside className="rounded-2xl bg-[#0b0710] p-4 shadow-sm">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <MdOutlineAnalytics /> Analytics
                    </h3>

                    <div className="space-y-3">
                        { recipesByCategory.map( ( c ) => (
                            <CategoryBar
                                key={ c.category }
                                label={ c.category }
                                count={ c.count }
                                max={ maxCategory }
                            />
                        ) ) }
                    </div>
                </aside>
            </main>

            <Footer />
        </div>
    );
}
