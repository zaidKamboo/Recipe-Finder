import React from "react";
import Navbar from "../components/common/Navbar.component";
import Footer from "../components/common/Footer.component";
import { GiKnifeFork } from "react-icons/gi";
import { HiHeart, HiUsers, HiLightningBolt } from "react-icons/hi";
import { Link } from "react-router-dom";
export default function About() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100 transition-colors">
            <Navbar />

            {/* Header / Intro */ }
            <header className="pt-24 pb-12 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="inline-flex items-center justify-center mb-4">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black shadow">
                            <GiKnifeFork className="w-6 h-6" />
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold drop-shadow mb-4">
                        About Recipe Finder
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed">
                        We're building the most enjoyable way to discover, save, and cook delicious food —
                        powered by smart search, personalization, and a beautiful cooking experience.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

                {/* Section: Our Mission */ }
                <section className="mb-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-orange-300 mb-4">
                            Our Mission
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-lg">
                            Cooking should be simple, inspiring, and accessible for everyone — whether you’re a
                            beginner, a home chef, or someone trying new cuisines.
                            <br /><br />
                            Recipe Finder brings the world's best recipes together in one clean,
                            beautiful space where you can search, learn, save, and enjoy cooking
                            without distractions.
                        </p>
                    </div>
                </section>

                {/* Section: Why We Built This */ }
                <section className="mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0b0710] to-[#221322] border border-[#2b1e2b] text-center">
                            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1b0b12] border border-[#2b1e2b] mx-auto mb-3">
                                <HiHeart className="w-7 h-7 text-orange-300" />
                            </span>
                            <h3 className="text-lg font-semibold text-orange-300">Made with passion</h3>
                            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                                A platform built by food lovers — every feature designed to make cooking enjoyable and stress-free.
                            </p>
                        </div>

                        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0b0710] to-[#221322] border border-[#2b1e2b] text-center">
                            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1b0b12] border border-[#2b1e2b] mx-auto mb-3">
                                <HiUsers className="w-7 h-7 text-orange-300" />
                            </span>
                            <h3 className="text-lg font-semibold text-orange-300">Built for everyone</h3>
                            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                                From students to families to chefs — our tools adapt to your cooking style, preferences, and routine.
                            </p>
                        </div>

                        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0b0710] to-[#221322] border border-[#2b1e2b] text-center">
                            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#1b0b12] border border-[#2b1e2b] mx-auto mb-3">
                                <HiLightningBolt className="w-7 h-7 text-orange-300" />
                            </span>
                            <h3 className="text-lg font-semibold text-orange-300">Fast & intuitive</h3>
                            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
                                Lightning-fast search, clean UI, no clutter — just the recipes you want, when you want them.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section: Our Story */ }
                <section className="mb-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-orange-300 mb-4">
                            Our Story
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-lg">
                            Recipe Finder started with a simple problem:
                            <br /><br />
                            <em>Finding good recipes quickly was harder than it needed to be.</em>
                            <br /><br />
                            Too many ads, messy sites, low-quality instructions — and no central place to save everything.
                            <br /><br />
                            So we built a platform that gives you:
                            <br />
                            • powerful search
                            • simple organization
                            • clean recipe pages
                            • cooking-friendly features
                            • and a beautiful modern design
                            <br /><br />
                            And we’re just getting started.
                        </p>
                    </div>
                </section>

                {/* Call to Action */ }
                <section className="text-center">
                    <h3 className="text-xl font-bold text-orange-300 mb-3">
                        Join thousands of home cooks discovering great food every day
                    </h3>

                    <p className="text-slate-300 mb-6">
                        Explore recipes, save your favorites, and bring better cooking into your daily routine.
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black font-semibold hover:brightness-95 transition shadow"
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
