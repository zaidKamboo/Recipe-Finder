import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";
import { HiMail, HiLockClosed } from "react-icons/hi";

export default function Login() {
    const navigate = useNavigate();
    const [ email, setEmail ] = useState( "" );
    const [ password, setPassword ] = useState( "" );
    const [ showPwd, setShowPwd ] = useState( false );
    const [ remember, setRemember ] = useState( false );
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState( "" );

    const isValidEmail = ( e ) => /\S+@\S+\.\S+/.test( e );

    async function handleLogin( e ) {
        e.preventDefault();
        setError( "" );

        if ( !email.trim() || !password ) {
            setError( "Please enter both email and password." );
            return;
        }
        if ( !isValidEmail( email ) ) {
            setError( "Please enter a valid email address." );
            return;
        }

        setLoading( true );

        try {
            await new Promise( ( res ) => setTimeout( res, 700 ) );
            navigate( "/recipes" );
        } catch ( err ) {
            setError( "Login failed. Check credentials and try again." );
        } finally {
            setLoading( false );
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100 transition-colors">
            <Navbar />

            <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="rounded-2xl bg-gradient-to-br from-[#0b0710] to-[#221322] border border-[#2b1e2b] shadow-lg p-8">

                    {/* Header */ }
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black mx-auto mb-3">
                            <svg viewBox="0 0 24 24" className="w-6 h-6">
                                <path fill="currentColor" d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z"></path>
                            </svg>
                        </div>

                        <h1 className="text-2xl font-extrabold">Welcome back</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Sign in to your Recipe Finder account
                        </p>
                    </div>

                    {/* Form */ }
                    <form onSubmit={ handleLogin } className="space-y-4">
                        {/* Email */ }
                        <label className="block">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <HiMail className="w-5 h-5" />
                                </span>
                                <input
                                    type="email"
                                    value={ email }
                                    onChange={ ( e ) => setEmail( e.target.value ) }
                                    placeholder="you@example.com"
                                    aria-label="Email"
                                    className="w-full pl-12 pr-4 py-3 rounded-full bg-[#0a0710] border border-[#2b1e2b] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                        </label>

                        {/* Password */ }
                        <label className="block">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <HiLockClosed className="w-5 h-5" />
                                </span>

                                <input
                                    type={ showPwd ? "text" : "password" }
                                    value={ password }
                                    onChange={ ( e ) => setPassword( e.target.value ) }
                                    placeholder="Password"
                                    aria-label="Password"
                                    className="w-full pl-12 pr-28 py-3 rounded-full bg-[#0a0710] border border-[#2b1e2b] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />

                                <button
                                    type="button"
                                    onClick={ () => setShowPwd( ( s ) => !s ) }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-[#1b0b12] border border-[#2b1e2b] text-sm text-slate-300 hover:bg-[#241322] transition"
                                >
                                    { showPwd ? "Hide" : "Show" }
                                </button>
                            </div>
                        </label>

                        {/* Remember / Forgot */ }
                        <div className="flex items-center justify-between">
                            <label className="inline-flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={ remember }
                                    onChange={ ( e ) => setRemember( e.target.checked ) }
                                    className="rounded border-[#2b1e2b] bg-[#0b0710] text-orange-400 focus:ring-orange-400"
                                />
                                <span className="text-sm text-slate-300">Remember me</span>
                            </label>

                            <Link
                                to="/forgot"
                                className="text-sm text-slate-300 hover:text-orange-300 transition rounded-full px-2 py-1"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Error */ }
                        { error && <div className="text-sm text-red-400">{ error }</div> }

                        {/* Submit */ }
                        <div>
                            <button
                                type="submit"
                                disabled={ loading }
                                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow hover:brightness-95 transition disabled:opacity-60"
                            >
                                { loading ? "Signing in..." : "Sign in" }
                            </button>
                        </div>
                    </form>

                    {/* Bottom link */ }
                    <div className="mt-6 text-center text-sm text-slate-400">
                        Don’t have an account?{ " " }
                        <Link
                            to="/signup"
                            className="text-slate-100 hover:text-orange-300 rounded-full px-2 py-1"
                        >
                            Create one
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
