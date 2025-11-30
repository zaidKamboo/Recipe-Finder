// --- SAME IMPORTS ---
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";
import {
    HiSparkles,
    HiChartBar,
    HiShieldCheck,
    HiOutlinePuzzle,
    HiChevronDown,
    HiSearch,
} from "react-icons/hi";
import { GiKnifeFork } from "react-icons/gi";

const FEATURES = [
    {
        key: "discover",
        title: "Smart Recipe Discovery",
        desc: "Find recipes instantly with intelligent search, filters, and personalized suggestions.",
        icon: HiSearch,
    },
    {
        key: "collections",
        title: "Save & Organize",
        desc: "Create your own collections — Breakfast Ideas, Meal Prep, Favorites, Weekend Specials, and more.",
        icon: HiSparkles,
    },
    {
        key: "analytics",
        title: "Trending & Popular",
        desc: "Explore trending dishes, popular cuisines, and top-rated recipes loved by users.",
        icon: HiChartBar,
    },
    {
        key: "secure",
        title: "Secure & Private",
        desc: "Your saved recipes, preferences, and notes are encrypted and securely stored.",
        icon: HiShieldCheck,
    },
    {
        key: "integrations",
        title: "Kitchen Friendly Tools",
        desc: "Export ingredients, connect with your shopping apps, and use cooking timers & prep modes.",
        icon: HiOutlinePuzzle,
    },
];

const FAQ = [
    {
        q: "Can I save my favorite recipes?",
        a: "Yes! You can bookmark any recipe and organize them into personalized collections.",
    },
    {
        q: "Do you provide vegetarian or healthy options?",
        a: "Absolutely. You can filter recipes by cuisine, diet type, difficulty, and more.",
    },
    {
        q: "Is Recipe Finder free to use?",
        a: "Most features are completely free. Optional premium tools offer deeper personalization.",
    },
];

export default function Features() {
    const [ openFaq, setOpenFaq ] = useState( null );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100 transition-colors">
            <Navbar />

            {/* HERO SECTION */ }
            <header className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        {/* Brand icon */ }
                        <div className="inline-flex items-center justify-center mb-4">
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black mr-3 shadow">
                                <GiKnifeFork className="w-6 h-6" />
                            </span>
                            <span className="text-sm uppercase tracking-wider text-slate-300">
                                Recipe Finder
                            </span>
                        </div>

                        {/* Title */ }
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 drop-shadow">
                            Your all-in-one platform for discovering amazing food
                        </h1>

                        {/* Description */ }
                        <p className="text-lg text-slate-300 mb-6">
                            Search, save, organize, and explore the best recipes — all in a simple, elegant, and modern interface built for everyday cooks.
                        </p>

                        {/* CTA Buttons */ }
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <Link
                                to="/recipes"
                                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow hover:brightness-95 transition"
                            >
                                <HiSparkles className="w-5 h-5" />
                                Browse Recipes
                            </Link>

                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#2b1e2b] bg-[rgba(255,255,255,0.02)] text-slate-200 hover:bg-[rgba(255,255,255,0.03)] transition"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */ }
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

                {/* FEATURE GRID */ }
                <section className="mb-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        { FEATURES.map( ( f ) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={ f.key }
                                    className="rounded-2xl bg-gradient-to-br from-[#0b0710] to-[#221322] border border-[#2b1e2b] p-6 shadow hover:scale-[1.02] transform transition"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 inline-flex w-12 h-12 items-center justify-center rounded-full bg-[#1b0b12] border border-[#2b1e2b]">
                                            <Icon className="w-6 h-6 text-orange-300" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-orange-300">{ f.title }</h3>
                                            <p className="mt-1 text-sm text-slate-300">{ f.desc }</p>

                                            <div className="mt-4">
                                                <button
                                                    disabled
                                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#120617] border border-[#2b1e2b] text-sm text-slate-300 opacity-70 cursor-default"
                                                >
                                                    Learn more
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        } ) }
                    </div>
                </section>

                {/* SPOTLIGHT / SUGGESTION DEMO */ }
                <section className="mb-12 rounded-2xl overflow-hidden border border-[#2b1e2b] bg-gradient-to-br from-[#0a0710] to-[#1f1320] p-6">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-orange-300">Try our Smart Search</h3>
                            <p className="mt-2 text-slate-300">
                                Search by ingredients, cuisines, difficulty, or cooking method.
                                Get instant suggestions while typing.
                            </p>

                            <div className="mt-4 max-w-md w-full">
                                <label className="relative block">
                                    <input
                                        aria-label="Demo search"
                                        placeholder="Try: pasta, biryani, pancakes..."
                                        className="w-full pl-10 pr-4 py-3 rounded-full bg-[#0b0710] border border-[#2b1e2b] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                </label>
                            </div>
                        </div>

                        {/* Trending Box */ }
                        <div className="w-full lg:w-1/3">
                            <div className="rounded-2xl p-4 bg-[#120617] border border-[#2b1e2b] text-sm text-slate-300">
                                <div className="font-semibold text-orange-300">Popular This Week</div>
                                <ul className="mt-3 space-y-2">
                                    <li className="flex items-center justify-between">
                                        <span>Paneer Butter Masala</span>
                                        <span className="text-xs text-slate-500">4.9★</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span>Chicken Biryani</span>
                                        <span className="text-xs text-slate-500">4.8★</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span>Chocolate Lava Cake</span>
                                        <span className="text-xs text-slate-500">4.7★</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */ }
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>

                    <div className="space-y-3">
                        { FAQ.map( ( f, i ) => (
                            <div
                                key={ i }
                                className="rounded-2xl border border-[#2b1e2b] bg-gradient-to-br from-[#0b0710] to-[#221322] overflow-hidden"
                            >
                                <button
                                    onClick={ () => setOpenFaq( openFaq === i ? null : i ) }
                                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
                                >
                                    <div className="font-medium text-slate-100">{ f.q }</div>

                                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1b0b12] border border-[#2b1e2b]">
                                        <HiChevronDown className={ `w-5 h-5 transition-transform ${openFaq === i ? "rotate-180" : ""}` } />
                                    </span>
                                </button>

                                { openFaq === i && (
                                    <div className="px-5 pb-4 text-slate-300 text-sm">
                                        { f.a }
                                    </div>
                                ) }
                            </div>
                        ) ) }
                    </div>
                </section>

                {/* CTA */ }
                <section className="mb-20 text-center">
                    <h3 className="text-xl font-bold text-orange-300 mb-3">
                        Start your cooking journey today
                    </h3>

                    <p className="text-slate-300 mb-6">
                        Explore new dishes, save your favorites, and cook with confidence.
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold shadow hover:brightness-95 transition"
                        >
                            Create Account
                        </Link>

                        <Link
                            to="/recipes"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#2b1e2b] bg-[rgba(255,255,255,0.02)] text-slate-200 hover:bg-[rgba(255,255,255,0.03)] transition"
                        >
                            Browse Recipes
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
