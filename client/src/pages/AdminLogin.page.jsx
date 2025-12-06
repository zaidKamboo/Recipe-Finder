// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
    HiShieldCheck,
    HiLockClosed,
    HiAtSymbol,
    HiEye,
    HiEyeOff,
} from "react-icons/hi";
import { loginAdmin, fetchAdminProfile } from "../store/slices/admin.slice";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";

export default function AdminLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [ email, setEmail ] = useState( "" );
    const [ password, setPassword ] = useState( "" );
    const [ showPassword, setShowPassword ] = useState( false );
    const [ remember, setRemember ] = useState( true );

    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState( null );

    async function handleSubmit( e ) {
        e.preventDefault();
        setError( null );

        if ( !email || !password ) {
            setError( "Please provide both email and password." );
            return;
        }

        setLoading( true );
        try {
            // send admin credentials to admin-specific thunk
            const payload = { username: email, password }; // your backend expects `username` (per admin controllers)
            const res = await dispatch( loginAdmin( payload ) ).unwrap();

            // backend returns { message, admin: { id, username } }
            // fetch profile to populate store (optional but useful)
            try {
                await dispatch( fetchAdminProfile() ).unwrap();
            } catch ( pfErr ) {
                // non-fatal: show in console but continue to dashboard
                // (you may want to show a small warning in UI instead)
                // eslint-disable-next-line no-console
                console.warn( "Failed to fetch admin profile after login:", pfErr );
            }

            // navigate to admin dashboard
            navigate( "/admin/dashboard" );
        } catch ( err ) {
            // err will be the rejectWithValue payload or an Error object
            const msg =
                typeof err === "string"
                    ? err
                    : err?.message || err?.data?.message || "Login failed";
            setError( msg );
        } finally {
            setLoading( false );
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#07040a] via-[#120617] to-[#24122a] text-slate-100">
            <Navbar />
            <main className="pt-24 pb-12 px-4">
                <div className="w-full max-w-xl mx-auto">
                    <div className="relative rounded-3xl border border-[#2b1e2b] bg-gradient-to-b from-[#0b0710]/80 to-[#1e0f1a]/80 shadow-2xl overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-[#ff7a1a]/20 to-[#ff3b00]/10 blur-3xl pointer-events-none" />
                        <div className="p-8 md:p-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black text-2xl shadow">
                                    <HiShieldCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold">Admin Sign in</h2>
                                    <div className="text-sm text-slate-400">Access the admin dashboard</div>
                                </div>
                            </div>

                            <form onSubmit={ handleSubmit } className="space-y-4" noValidate>
                                <div>
                                    <label className="text-xs text-slate-400">Email / Username</label>
                                    <div className="mt-2 relative">
                                        <input
                                            type="email"
                                            value={ email }
                                            onChange={ ( e ) => setEmail( e.target.value ) }
                                            placeholder="admin@example.com"
                                            className="w-full pl-12 pr-3 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                            autoComplete="username"
                                            disabled={ loading }
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <HiAtSymbol className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400">Password</label>
                                    <div className="mt-2 relative">
                                        <input
                                            type={ showPassword ? "text" : "password" }
                                            value={ password }
                                            onChange={ ( e ) => setPassword( e.target.value ) }
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-14 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                            autoComplete="current-password"
                                            disabled={ loading }
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <HiLockClosed className="w-5 h-5" />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={ () => setShowPassword( ( s ) => !s ) }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1 rounded-md hover:bg-white/3 transition"
                                            aria-label={ showPassword ? "Hide password" : "Show password" }
                                            disabled={ loading }
                                        >
                                            { showPassword ? <HiEye className="w-5 h-5" /> : <HiEyeOff className="w-5 h-5" /> }
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-slate-400">
                                    <label className="inline-flex items-center gap-2 select-none">
                                        <input
                                            type="checkbox"
                                            checked={ remember }
                                            onChange={ ( e ) => setRemember( e.target.checked ) }
                                            className="w-4 h-4 rounded bg-[#08060a] border border-[#2b1e2b] accent-orange-500"
                                            disabled={ loading }
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <Link to="/forgot-password" className="text-orange-300 hover:underline">
                                        Forgot?
                                    </Link>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={ loading }
                                        className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow-lg hover:brightness-95 disabled:opacity-60 transition"
                                    >
                                        { loading ? (
                                            <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-black animate-spin" />
                                        ) : (
                                            <>
                                                <HiShieldCheck className="w-5 h-5" />
                                                <span>Sign in</span>
                                            </>
                                        ) }
                                    </button>
                                </div>

                                { error && <div className="text-sm text-red-400 mt-1">{ error }</div> }
                            </form>

                            <div className="mt-6 text-sm text-slate-400 text-center">
                                Not an admin?{ " " }
                                <Link to="/login" className="text-orange-300 hover:underline">
                                    Sign in as user
                                </Link>
                            </div>

                            <div className="mt-6 border-t border-[#2b1e2b] pt-4 text-xs text-slate-500">
                                <div className="flex items-center justify-between">
                                    <span>Secure admin access • 2-step verification recommended</span>
                                    <span className="text-slate-400">v1.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
