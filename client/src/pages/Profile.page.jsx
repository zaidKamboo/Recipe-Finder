import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";
import { fetchCurrentUser, updateProfile, selectAuthStatus, selectAuthError } from "../store/slices/auth.slice";
import api from "../api";
import { HiRefresh, HiCamera, HiX, HiPencil, HiSave } from "react-icons/hi";

export default function Profile() {
    const dispatch = useDispatch();
    const user = useSelector( ( s ) => s.auth.user ?? null );
    const authStatus = useSelector( selectAuthStatus );
    const authError = useSelector( selectAuthError );
    const [ editing, setEditing ] = useState( false );
    const [ loading, setLoading ] = useState( false );
    const [ saving, setSaving ] = useState( false );
    const [ message, setMessage ] = useState( null );
    const [ error, setError ] = useState( null );

    const [ name, setName ] = useState( "" );
    const [ preferencesText, setPreferencesText ] = useState( "" );
    const [ oldPassword, setOldPassword ] = useState( "" );
    const [ newPassword, setNewPassword ] = useState( "" );
    const [ profileFile, setProfileFile ] = useState( null );
    const [ previewUrl, setPreviewUrl ] = useState( null );

    const fileInputRef = useRef( null );

    useEffect( () => {
        setLoading( true );
        dispatch( fetchCurrentUser() )
            .unwrap()
            .catch( ( e ) => {
                setError( typeof e === "string" ? e : e?.message ?? "Failed to load profile" );
            } )
            .finally( () => setLoading( false ) );
    }, [ dispatch ] );

    useEffect( () => {
        if ( !user ) return;
        setName( user.name ?? "" );
        try {
            setPreferencesText( JSON.stringify( user.preferences ?? {}, null, 2 ) );
        } catch ( e ) {
            setPreferencesText( "" );
        }
        setPreviewUrl( user.profilePic?.url ?? null );
    }, [ user ] );

    function onFileChange( e ) {
        const f = e.target.files?.[ 0 ] ?? null;
        setProfileFile( f );
        if ( f ) {
            const url = URL.createObjectURL( f );
            setPreviewUrl( url );
        } else {
            setPreviewUrl( user?.profilePic?.url ?? null );
        }
    }

    async function handleSave( e ) {
        e.preventDefault();
        setError( null );
        setMessage( null );

        let preferences;
        if ( preferencesText.trim() ) {
            try {
                preferences = JSON.parse( preferencesText );
            } catch ( err ) {
                setError( "Preferences must be valid JSON." );
                return;
            }
        } else {
            preferences = {};
        }

        const form = new FormData();
        form.append( "name", name.trim() );
        form.append( "preferences", JSON.stringify( preferences ) );
        if ( profileFile ) form.append( "profilePic", profileFile );
        if ( oldPassword || newPassword ) {
            if ( !oldPassword || !newPassword ) {
                setError( "To change password provide both old and new password." );
                return;
            }
            form.append( "oldPassword", oldPassword );
            form.append( "newPassword", newPassword );
        }

        setSaving( true );
        setError( null );
        try {
            const res = await dispatch( updateProfile( form ) ).unwrap();
            setMessage( res?.message ?? "Profile updated" );
            await dispatch( fetchCurrentUser() ).unwrap();
            setEditing( false );
            setOldPassword( "" );
            setNewPassword( "" );
            setProfileFile( null );
        } catch ( err ) {
            let msg = "Update failed";
            if ( err ) {
                if ( typeof err === "string" ) msg = err;
                else if ( err.message ) msg = err.message;
                else if ( err?.data?.message ) msg = err.data.message;
            }
            setError( msg );
        } finally {
            setSaving( false );
        }
    }

    async function handleRefresh() {
        setLoading( true );
        setError( null );
        setMessage( null );
        try {
            await dispatch( fetchCurrentUser() ).unwrap();
            setMessage( "Profile refreshed" );
        } catch ( err ) {
            setError( err ?? "Failed to refresh" );
        } finally {
            setLoading( false );
        }
    }

    const busy = loading || authStatus === "loading";

    const disabledUiClass = !editing || saving || busy ? "opacity-70 pointer-events-none" : "";

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#07040a] via-[#120617] to-[#24122a] text-slate-100">
            <Navbar />
            <main className="max-w-5xl mx-auto px-6 py-24">
                <div className="relative rounded-3xl bg-[linear-gradient(180deg,#0b0710_0%,#1e0f1a_100%)] border border-[#2b1e2b] shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_10%_10%,rgba(255,122,26,0.06),transparent)] pointer-events-none" />
                    <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-44 h-44 bg-gradient-to-br from-[#1b0b12] to-[#29101a] rounded-2xl overflow-hidden border border-[#3b232f] flex items-center justify-center transition-transform transform-gpu group-hover:scale-105">
                                    { busy ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-orange-500 animate-spin" />
                                        </div>
                                    ) : previewUrl ? (
                                        <img src={ previewUrl } alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-[#2b1820] text-orange-300 text-2xl">👤</div>
                                            <div className="text-slate-400 text-sm">No picture</div>
                                        </div>
                                    ) }
                                </div>

                                <button
                                    onClick={ () => editing && fileInputRef.current?.click() }
                                    disabled={ !editing || saving || busy }
                                    className={ `absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black text-sm shadow-lg hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed` }
                                >
                                    <HiCamera className="w-4 h-4" />
                                    Upload
                                </button>

                                <input ref={ fileInputRef } onChange={ onFileChange } type="file" accept="image/*" className="hidden" />
                            </div>

                            <div className="w-full">
                                <div className="text-xs text-slate-400 mb-1">Profile</div>
                                <div className="text-lg font-semibold">{ user?.name ?? "—" }</div>
                                <div className="text-sm text-slate-500">{ user?.email ?? "—" }</div>
                            </div>

                            <div className="w-full flex flex-col gap-2">
                                <button
                                    onClick={ handleRefresh }
                                    disabled={ busy }
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.03)] text-slate-200 hover:bg-[rgba(255,255,255,0.06)] transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <HiRefresh className="w-4 h-4" />
                                    Refresh
                                </button>

                                <button
                                    onClick={ () => { setEditing( ( s ) => !s ); setMessage( null ); setError( null ); } }
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow-lg"
                                >
                                    <HiPencil className="w-4 h-4" />
                                    { editing ? "Cancel" : "Edit profile" }
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <form onSubmit={ handleSave } className="space-y-6">
                                <div className={ `grid grid-cols-1 md:grid-cols-2 gap-4 ${disabledUiClass}` }>
                                    <div>
                                        <label className="text-sm text-slate-300">Full name</label>
                                        <input
                                            value={ name }
                                            onChange={ ( e ) => setName( e.target.value ) }
                                            disabled={ !editing || saving || busy }
                                            className={ `w-full mt-2 px-4 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${!editing ? "opacity-80" : ""}` }
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-300">Email</label>
                                        <input
                                            value={ user?.email ?? "" }
                                            disabled
                                            className="w-full mt-2 px-4 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className={ disabledUiClass }>
                                    <label className="text-sm text-slate-300">Preferences (JSON)</label>
                                    <textarea
                                        value={ preferencesText }
                                        onChange={ ( e ) => setPreferencesText( e.target.value ) }
                                        disabled={ !editing || saving || busy }
                                        rows={ 6 }
                                        className={ `w-full mt-2 px-4 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100 font-mono text-xs ${!editing ? "opacity-80" : ""}` }
                                    />
                                </div>

                                <div className={ `grid grid-cols-1 md:grid-cols-2 gap-4 ${disabledUiClass}` }>
                                    <div>
                                        <label className="text-sm text-slate-300">Old password</label>
                                        <input
                                            type="password"
                                            value={ oldPassword }
                                            onChange={ ( e ) => setOldPassword( e.target.value ) }
                                            disabled={ !editing || saving || busy }
                                            className="w-full mt-2 px-4 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-300">New password</label>
                                        <input
                                            type="password"
                                            value={ newPassword }
                                            onChange={ ( e ) => setNewPassword( e.target.value ) }
                                            disabled={ !editing || saving || busy }
                                            className="w-full mt-2 px-4 py-3 rounded-xl bg-[#08060a] border border-[#2b1e2b] text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        disabled={ !editing || saving || busy }
                                        type="submit"
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <HiSave className="w-4 h-4" />
                                        { saving ? "Saving..." : "Save changes" }
                                    </button>

                                    { editing && (
                                        <button
                                            type="button"
                                            onClick={ () => { setEditing( false ); setMessage( null ); setError( null ); } }
                                            className="px-4 py-3 rounded-full bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-slate-200 transition"
                                        >
                                            <HiX className="inline w-4 h-4 mr-2" />
                                            Cancel
                                        </button>
                                    ) }
                                </div>

                                { ( message || error || authError ) && (
                                    <div className="mt-2">
                                        { message && <div className="text-sm text-green-400">{ message }</div> }
                                        { error && <div className="text-sm text-red-400">{ error }</div> }
                                        { !error && authError && <div className="text-sm text-red-400">{ typeof authError === "string" ? authError : String( authError ) }</div> }
                                    </div>
                                ) }
                            </form>

                            <div className="mt-8 border-t border-[#2b1e2b] pt-6">
                                <h3 className="text-sm text-slate-400 mb-3">Account details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
                                    <div>
                                        <div className="text-slate-400">Created</div>
                                        <div className="mt-1">{ user?.createdAt ? new Date( user.createdAt ).toLocaleString() : "—" }</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400">Last updated</div>
                                        <div className="mt-1">{ user?.updatedAt ? new Date( user.updatedAt ).toLocaleString() : "—" }</div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <div className="text-slate-400 mb-2">Profile JSON preview</div>
                                        <pre className="max-h-40 overflow-auto p-4 rounded-xl bg-[#06040a] text-xs text-slate-300">{ JSON.stringify( user ?? {}, null, 2 ) }</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    { busy && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-orange-500 animate-spin" />
                        </div>
                    ) }
                </div>
            </main>
            <Footer />
        </div>
    );
}
