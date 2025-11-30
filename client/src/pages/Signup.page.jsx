import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";
import { HiUser, HiMail, HiLockClosed } from "react-icons/hi";

/**
 * Simple password strength estimator (very lightweight)
 * returns 'weak' | 'medium' | 'strong'
 */
function estimatePasswordStrength( pw = "" ) {
    if ( !pw ) return "";
    let score = 0;
    if ( pw.length >= 8 ) score++;
    if ( /[A-Z]/.test( pw ) ) score++;
    if ( /[0-9]/.test( pw ) ) score++;
    if ( /[^A-Za-z0-9]/.test( pw ) ) score++;
    if ( score <= 1 ) return "weak";
    if ( score === 2 || score === 3 ) return "medium";
    return "strong";
}

export default function Signup() {
    const navigate = useNavigate();

    // form state
    const [ name, setName ] = useState( "" );
    const [ email, setEmail ] = useState( "" );
    const [ password, setPassword ] = useState( "" );
    const [ confirm, setConfirm ] = useState( "" );
    const [ showPwd, setShowPwd ] = useState( false );
    const [ agree, setAgree ] = useState( false );

    // UX state
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState( "" );

    const pwStrength = useMemo( () => estimatePasswordStrength( password ), [ password ] );

    const isValidEmail = ( e ) => /\S+@\S+\.\S+/.test( e );

    async function handleSignup( e ) {
        e.preventDefault();
        setError( "" );

        // simple validations
        if ( !name.trim() ) {
            setError( "Please enter your name." );
            return;
        }
        if ( !email.trim() || !isValidEmail( email ) ) {
            setError( "Please enter a valid email address." );
            return;
        }
        if ( !password ) {
            setError( "Please enter a password." );
            return;
        }
        if ( password.length < 6 ) {
            setError( "Password should be at least 6 characters." );
            return;
        }
        if ( password !== confirm ) {
            setError( "Passwords do not match." );
            return;
        }
        if ( !agree ) {
            setError( "Please accept terms & privacy to continue." );
            return;
        }

        setLoading( true );
        try {
            // TODO: replace this mock with your API / Redux action
            await new Promise( ( res ) => setTimeout( res, 900 ) );

            // demo: navigate to recipes or dashboard after signup
            navigate( "/recipes" );
        } catch ( err ) {
            setError( "Signup failed. Please try again." );
        } finally {
            setLoading( false );
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100 transition-colors">
            <Navbar />

            <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="rounded-2xl bg-gradient-to-br from-[#0b0710] to-[#221322] border border-[#2b1e2b] shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black mx-auto mb-3">
                            <HiUser className="w-6 h-6" />
                        </div>

                        <h1 className="text-2xl font-extrabold">Create your account</h1>
                        <p className="text-sm text-slate-400 mt-1">Join Recipe Finder — save recipes, build collections, and explore.</p>
                    </div>

                    <form onSubmit={ handleSignup } className="space-y-4" noValidate>
                        {/* Name */ }
                        <label className="block">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <HiUser className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    value={ name }
                                    onChange={ ( e ) => setName( e.target.value ) }
                                    placeholder="Full name"
                                    aria-label="Full name"
                                    className="w-full pl-12 pr-4 py-3 rounded-full bg-[#0a0710] border border-[#2b1e2b] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                        </label>

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
                                    placeholder="Create a password"
                                    aria-label="Password"
                                    className="w-full pl-12 pr-28 py-3 rounded-full bg-[#0a0710] border border-[#2b1e2b] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />

                                <button
                                    type="button"
                                    onClick={ () => setShowPwd( ( s ) => !s ) }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-[#1b0b12] border border-[#2b1e2b] text-sm text-slate-300 hover:bg-[#241322] transition"
                                    aria-pressed={ showPwd }
                                >
                                    { showPwd ? "Hide" : "Show" }
                                </button>
                            </div>

                            {/* password strength hint */ }
                            { password && (
                                <div className="mt-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">Strength:</span>
                                        <span
                                            className={ `inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${pwStrength === "weak"
                                                ? "bg-red-700 text-red-100"
                                                : pwStrength === "medium"
                                                    ? "bg-yellow-800 text-yellow-100"
                                                    : "bg-green-700 text-green-100"
                                                }` }
                                        >
                                            { pwStrength }
                                        </span>
                                    </div>
                                </div>
                            ) }
                        </label>

                        {/* Confirm Password */ }
                        <label className="block">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <HiLockClosed className="w-5 h-5" />
                                </span>
                                <input
                                    type={ showPwd ? "text" : "password" }
                                    value={ confirm }
                                    onChange={ ( e ) => setConfirm( e.target.value ) }
                                    placeholder="Confirm password"
                                    aria-label="Confirm password"
                                    className="w-full pl-12 pr-4 py-3 rounded-full bg-[#0a0710] border border-[#2b1e2b] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </div>
                        </label>

                        {/* Terms */ }
                        <div className="flex items-start gap-3">
                            <label className="inline-flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={ agree }
                                    onChange={ ( e ) => setAgree( e.target.checked ) }
                                    className="rounded border-[#2b1e2b] bg-[#0b0710] text-orange-400 focus:ring-orange-400"
                                />
                                <span className="text-sm text-slate-300">
                                    I agree to the{ " " }
                                    <Link to="/terms" className="text-slate-100 hover:text-orange-300 rounded-full px-2 py-1">
                                        Terms & Policies
                                    </Link>
                                </span>
                            </label>
                        </div>

                        {/* Error */ }
                        { error && <div className="text-sm text-red-400">{ error }</div> }

                        {/* Submit */ }
                        <div>
                            <button
                                type="submit"
                                onClick={ handleSignup }
                                disabled={ loading }
                                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow hover:brightness-95 transition disabled:opacity-60"
                            >
                                { loading ? "Creating account..." : "Create account" }
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        Already have an account?{ " " }
                        <Link to="/login" className="text-slate-100 hover:text-orange-300 rounded-full px-2 py-1">
                            Sign in
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
