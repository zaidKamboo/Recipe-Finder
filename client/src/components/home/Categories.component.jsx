import React from "react";
import { Link } from "react-router-dom";
import {
    GiCroissant,
    GiHotMeal,
    GiFruitBowl,
    GiCupcake,
    GiHamburger,
    GiNoodles,
    GiChickenOven,
    GiPieSlice,
} from "react-icons/gi";

const CATEGORIES = [
    { key: "breakfast", label: "Breakfast", icon: GiCroissant },
    { key: "quick", label: "Quick & Easy", icon: GiHotMeal },
    { key: "vegetarian", label: "Vegetarian", icon: GiFruitBowl },
    { key: "dessert", label: "Dessert", icon: GiCupcake },
    { key: "fastfood", label: "Fast Food", icon: GiHamburger },
    { key: "asian", label: "Asian", icon: GiNoodles },
    { key: "nonveg", label: "Non-Veg", icon: GiChickenOven },
    { key: "baking", label: "Baking", icon: GiPieSlice },
];

export default function Categories() {
    return (
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#08050a] to-[#221322] border border-[#2b1e2b] shadow-xl text-slate-100">
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-3">
                <span className="inline-flex w-8 h-8 justify-center items-center rounded-lg bg-[#1a0b14] border border-[#3b2332] text-orange-300">
                    🍽️
                </span>
                Explore Categories
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                { CATEGORIES.map( ( c ) => {
                    const Icon = c.icon;
                    return (
                        <Link
                            key={ c.key }
                            to={ `/recipes?category=${c.key}` }
                            className="
                group flex flex-col items-start p-4 rounded-xl 
                bg-gradient-to-br from-[#0b0710] to-[#221322] 
                border border-[#2b1e2b] shadow-md transition 
                hover:-translate-y-1 hover:shadow-2xl hover:border-[#ff7a1a]
              "
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#160a11] border border-[#3a2333] text-orange-300 text-2xl">
                                    <Icon />
                                </span>
                                <span className="font-semibold text-slate-200">{ c.label }</span>
                            </div>

                            <div className="mt-2 text-xs text-slate-400 group-hover:text-orange-300 transition">
                                Popular choices · Explore now
                            </div>
                        </Link>
                    );
                } ) }
            </div>
        </div>
    );
}
