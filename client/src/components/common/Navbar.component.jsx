// src/components/common/Navbar.component.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HiMenu,
    HiX,
    HiHome,
    HiSparkles,
    HiLogin,
    HiUserAdd,
    HiLogout,
    HiUser,
} from "react-icons/hi";
import { GiKnifeFork } from "react-icons/gi";
import { MdOutlineAnalytics } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectCurrentUser } from "../../store/slices/auth.slice";
import { selectAdmin, logoutAdmin } from "../../store/slices/admin.slice";

export default function Navbar() {
    const [ open, setOpen ] = useState( false );
    const user = useSelector( selectCurrentUser );
    const admin = useSelector( selectAdmin );
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function handleLogout() {
        if ( admin && admin.username ) {
            dispatch( logoutAdmin() );
            navigate( "/admin/login" );
            return;
        }
        dispatch( logout() );
        navigate( "/login" );
    }

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a060d]/80 backdrop-blur-md shadow-lg border-b border-[#2b1e2b]">
            <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
                {/* LOGO */ }
                <Link
                    to="/"
                    className="flex items-center gap-3 text-2xl font-extrabold tracking-wide text-orange-400"
                >
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black">
                        <GiKnifeFork className="w-5 h-5" />
                    </span>
                    <span>RecipeFinder</span>
                </Link>

                {/* DESKTOP MENU */ }
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                    >
                        <HiHome className="w-5 h-5" />
                        <span>Home</span>
                    </Link>

                    <Link
                        to="/features"
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                    >
                        <HiSparkles className="w-5 h-5" />
                        <span>Features</span>
                    </Link>

                    {/* ADMIN VIEW */ }
                    { admin && admin.username ? (
                        <>
                            <Link
                                to="/admin/dashboard"
                                className="flex items-center gap-2 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition bg-[rgba(255,255,255,0.01)] border border-[#22121a]"
                            >
                                <MdOutlineAnalytics className="w-5 h-5 text-orange-300" />
                                <span>Dashboard</span>
                            </Link>

                            <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-[#1b0b12] text-slate-200 border border-[#2b1e2b]">
                                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1b0b12] text-orange-300">
                                    { admin.username[ 0 ]?.toUpperCase() ?? "A" }
                                </div>
                                <div className="text-sm">
                                    <div className="font-medium">{ admin.username }</div>
                                    <div className="text-xs text-slate-400">Administrator</div>
                                </div>
                            </div>

                            <button
                                onClick={ handleLogout }
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[#ff3b00] to-[#d70000] text-black font-semibold shadow hover:brightness-90 transition"
                            >
                                <HiLogout className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : user ? (
                        // Logged-in non-admin user
                        <>
                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-2 py-1 rounded-full bg-[#1b0b12] text-slate-200 border border-[#2b1e2b]"
                            >
                                { user.profilePic ? (
                                    <img
                                        src={ user.profilePic }
                                        alt={ user.name ?? "User" }
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-[#2b1820] text-orange-300">
                                        <HiUser className="w-5 h-5" />
                                    </span>
                                ) }
                                <span className="hidden sm:inline">{ user.name ?? "User" }</span>
                            </Link>

                            <button
                                onClick={ handleLogout }
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[#ff3b00] to-[#d70000] text-black font-semibold shadow hover:brightness-90 transition"
                            >
                                <HiLogout className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        // Not logged in
                        <>
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-2 px-3 py-2 rounded-full font-semibold bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] text-slate-200 border border-slate-700 transition"
                                    >
                                        <HiLogin className="w-5 h-5" />
                                        <span>Login</span>
                                    </Link>

                                    <Link
                                        to="/signup"
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow hover:brightness-95 transition"
                                    >
                                        <HiUserAdd className="w-5 h-5" />
                                        <span>Sign Up</span>
                                    </Link>

                            <Link
                                to="/admin/login"
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b0b12] text-orange-300 border border-[#2b1e2b] hover:bg-[#2b1820] transition font-semibold"
                            >
                                <HiUser className="w-5 h-5" />
                                <span>Admin Login</span>
                            </Link>
                        </>
                    ) }
                </div>

                {/* MOBILE MENU TOGGLE */ }
                <button
                    className="md:hidden text-slate-200 text-3xl p-2 rounded-full hover:bg-[rgba(255,255,255,0.03)] transition"
                    onClick={ () => setOpen( !open ) }
                    aria-expanded={ open }
                    aria-label="Toggle menu"
                >
                    { open ? <HiX /> : <HiMenu /> }
                </button>
            </div>

            {/* MOBILE MENU PANEL */ }
            <div
                className={ `md:hidden transition-all duration-200 ${open ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    } overflow-hidden bg-[#0a060d]/95 backdrop-blur-xl border-t border-[#2b1e2b]` }
            >
                <div className="px-5 py-4 space-y-3">
                    <Link
                        to="/"
                        onClick={ () => setOpen( false ) }
                        className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                    >
                        <HiHome className="w-6 h-6" />
                        <span>Home</span>
                    </Link>

                    <Link
                        to="/features"
                        onClick={ () => setOpen( false ) }
                        className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                    >
                        <HiSparkles className="w-6 h-6" />
                        <span>Features</span>
                    </Link>

                    { admin && admin.username ? (
                        <>
                            <Link
                                to="/admin/dashboard"
                                onClick={ () => setOpen( false ) }
                                className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition bg-[rgba(255,255,255,0.01)] border border-[#22121a]"
                            >
                                <MdOutlineAnalytics className="w-6 h-6 text-orange-300" />
                                <span>Dashboard</span>
                            </Link>

                            <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#1b0b12] text-slate-200 border border-[#2b1e2b]">
                                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1b0b12] text-orange-300">
                                    { admin.username[ 0 ]?.toUpperCase() ?? "A" }
                                </div>
                                <div>
                                    <div className="font-medium">{ admin.username }</div>
                                    <div className="text-xs text-slate-400">Administrator</div>
                                </div>
                            </div>

                            <button
                                onClick={ () => {
                                    setOpen( false );
                                    handleLogout();
                                } }
                                className="flex items-center gap-3 px-3 py-2 rounded-full bg-gradient-to-br from-[#ff3b00] to-[#d70000] text-black font-semibold"
                            >
                                <HiLogout className="w-6 h-6" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : user ? (
                        <>
                            <Link
                                to="/profile"
                                onClick={ () => setOpen( false ) }
                                className="flex items-center gap-3 px-3 py-2 rounded-full bg-[#1b0b12] text-slate-200 border border-[#2b1e2b]"
                            >
                                { user.profilePic ? (
                                    <img src={ user.profilePic } alt={ user.name ?? "User" } className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                    <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-[#2b1820] text-orange-300">
                                        <HiUser className="w-5 h-5" />
                                    </span>
                                ) }
                                <span>{ user.name ?? "User" }</span>
                            </Link>

                            <button
                                onClick={ () => {
                                    setOpen( false );
                                    handleLogout();
                                } }
                                className="flex items-center gap-3 px-3 py-2 rounded-full bg-gradient-to-br from-[#ff3b00] to-[#d70000] text-black font-semibold"
                            >
                                <HiLogout className="w-6 h-6" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                                    <Link
                                        to="/login"
                                        onClick={ () => setOpen( false ) }
                                        className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                                    >
                                        <HiLogin className="w-6 h-6" />
                                        <span>Login</span>
                                    </Link>

                                    <Link
                                        to="/signup"
                                        onClick={ () => setOpen( false ) }
                                        className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                                    >
                                        <HiUserAdd className="w-6 h-6" />
                                        <span>Sign Up</span>
                                    </Link>

                            <Link
                                to="/admin/login"
                                onClick={ () => setOpen( false ) }
                                className="flex items-center gap-3 px-3 py-2 rounded-full text-orange-300 border border-[#2b1e2b] hover:bg-[#2b1820] transition"
                            >
                                <HiUser className="w-6 h-6" />
                                <span>Admin Login</span>
                            </Link>
                        </>
                    ) }
                </div>
            </div>
        </nav>
    );
}
