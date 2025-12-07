    import React from "react";
    import FeaturedRecipes from "../components/home/FeaturedRecipes.component";
    import Categories from "../components/home/Categories.component";
    import Footer from "../components/common/Footer.component";
    import Hero from "../components/home/Hero.component";
    import Navbar from "../components/common/Navbar.component";
    import TrendingRecipes from "../components/home/TrendingRecipes.component";
import HowItWorks from "../components/home/HowItWorks.component";

    export default function Home() {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#06040a] via-[#120617] to-[#24122a] text-slate-100 transition-colors">
                <Navbar />
                <div className="pt-20">
                    <Hero />
                    <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
                        <section className="mb-12">
                            <FeaturedRecipes />
                        </section>

                        <section className="mb-12">
                            <HowItWorks />
                        </section>
                        <section className="mb-12">
                            <Categories />
                        </section>


                        <section className="mb-20">
                            <TrendingRecipes />
                        </section>
                    </main>
                </div>

                <Footer />
            </div>
        );
    }
