import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    HiMenu,
    HiX,
    HiHome,
    HiSparkles,
    HiLogin,
    HiUserAdd,
} from "react-icons/hi";
import { GiKnifeFork } from "react-icons/gi"; // food icon

export default function Navbar() {
    const [ open, setOpen ] = useState( false );

    return (
        <nav
            className="fixed top-0 left-0 w-full z-50 bg-[#0a060d]/80 backdrop-blur-md shadow-lg border-b border-[#2b1e2b]"
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
                {/* Logo */ }
                <Link
                    to="/"
                    className="flex items-center gap-3 text-2xl font-extrabold tracking-wide text-orange-400 drop-shadow"
                    aria-label="RecipeFinder home"
                >
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black">
                        <GiKnifeFork className="w-5 h-5" />
                    </span>
                    <span>RecipeFinder</span>
                </Link>

                {/* Desktop Menu */ }
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition font-medium"
                        aria-label="Home"
                    >
                        <HiHome className="w-5 h-5" aria-hidden />
                        <span>Home</span>
                    </Link>

                    <Link
                        to="/features"
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition font-medium"
                        aria-label="Features"
                    >
                        <HiSparkles className="w-5 h-5" aria-hidden />
                        <span>Features</span>
                    </Link>

                    <Link
                        to="/login"
                        className="flex items-center gap-2 px-3 py-2 rounded-full font-semibold bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] text-slate-200 border border-slate-700 transition"
                        aria-label="Login"
                    >
                        <HiLogin className="w-5 h-5" aria-hidden />
                        <span>Login</span>
                    </Link>

                    <Link
                        to="/signup"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow hover:brightness-95 transition"
                        aria-label="Sign up"
                    >
                        <HiUserAdd className="w-5 h-5" aria-hidden />
                        <span>Sign Up</span>
                    </Link>
                </div>

                {/* Mobile Menu Button */ }
                <button
                    className="md:hidden text-slate-200 text-3xl p-2 rounded-full hover:bg-[rgba(255,255,255,0.03)] transition"
                    onClick={ () => setOpen( !open ) }
                    aria-expanded={ open }
                    aria-controls="mobile-menu"
                    aria-label={ open ? "Close menu" : "Open menu" }
                >
                    { open ? <HiX /> : <HiMenu /> }
                </button>
            </div>

            <div
                id="mobile-menu"
                className={ `md:hidden transform-gpu transition-all duration-200 ${open ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    } overflow-hidden bg-[#0a060d]/95 backdrop-blur-xl border-t border-[#2b1e2b]` }
            >
                <div className="px-5 py-4 space-y-3">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                        onClick={ () => setOpen( false ) }
                    >
                        <HiHome className="w-6 h-6" />
                        <span>Home</span>
                    </Link>

                    <Link
                        to="/features"
                        className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                        onClick={ () => setOpen( false ) }
                    >
                        <HiSparkles className="w-6 h-6" />
                        <span>Features</span>
                    </Link>

                    <Link
                        to="/login"
                        className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                        onClick={ () => setOpen( false ) }
                    >
                        <HiLogin className="w-6 h-6" />
                        <span>Login</span>
                    </Link>

                    <Link
                        to="/signup"
                        className="flex items-center gap-3 px-3 py-2 rounded-full text-slate-200 hover:text-orange-300 transition"
                        onClick={ () => setOpen( false ) }
                    >
                        <HiUserAdd className="w-6 h-6" />
                        <span>Sign Up</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
