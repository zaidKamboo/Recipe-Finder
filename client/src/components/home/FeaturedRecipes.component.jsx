import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import RecipeCard from "./RecipeCard.component"; // we will use real RecipeCard if store has data
import LoadingGrid from "./LoadingGrid.component";
import { Link } from "react-router-dom";

/**
 * Small local demo card used only when there are no real recipes to display.
 * Matches the dark Halloween theme used across your app.
 */
function DemoRecipeCard( { recipe } ) {
    // create inline SVG placeholder with recipe title
    const makePlaceholder = ( title = "Recipe" ) => {
        const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='800' height='520' viewBox='0 0 800 520'>
        <defs>
          <linearGradient id='g' x1='0' x2='1'>
            <stop offset='0' stop-color='#3a0f0f'/>
            <stop offset='1' stop-color='#ff7a1a'/>
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' fill='#120617'/>
        <circle cx='640' cy='140' r='160' fill='url(#g)' opacity='0.12'/>
        <g fill='#ffd8b2' font-family='system-ui, Arial, sans-serif' text-anchor='middle'>
          <text x='50%' y='45%' font-size='40' font-weight='700'>${escapeXml( title )}</text>
          <text x='50%' y='62%' font-size='20' fill='#f3e0d0' opacity='0.85'>${escapeXml(
            recipe.subtitle ?? "Demo · 25 min"
        )}</text>
        </g>
      </svg>
    `;
        return `data:image/svg+xml;utf8,${encodeURIComponent( svg )}`;
    };

    return (
        <article className="rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#0b0710] to-[#221322] border border-[#2b1e2b]">
            <div className="w-full h-44 sm:h-48 bg-slate-900">
                <img
                    src={ recipe.image || makePlaceholder( recipe.title ) }
                    alt={ recipe.title }
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-orange-300">{ recipe.title }</h3>
                <p className="text-sm text-slate-300 mt-1">{ recipe.description }</p>

                <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                        { recipe.time ?? "25 min" } · { recipe.servings ?? "4 servings" }
                    </div>
                    <Link
                        to={ recipe.link ?? "/recipes" }
                        className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-br from-[#ff7a1a] to-[#ff3b00] text-black text-sm font-semibold"
                    >
                        View
                    </Link>
                </div>
            </div>
        </article>
    );
}

/* helper to escape a string placed into SVG text nodes */
function escapeXml( unsafe = "" ) {
    return String( unsafe )
        .replaceAll( "&", "&amp;" )
        .replaceAll( "<", "&lt;" )
        .replaceAll( ">", "&gt;" )
        .replaceAll( '"', "&quot;" )
        .replaceAll( "'", "&apos;" );
}

export default function FeaturedRecipes() {
    const dispatch = useDispatch();
    const { items = [], status } = useSelector( ( s ) => s.recipes ?? { items: [], status: "idle" } );

    // demo data used only when items is empty
    const demoData = [
        {
            id: "demo-1",
            title: "Creamy Tomato Pasta",
            subtitle: "Comfort · 25 min",
            description: "Rich tomato sauce with a hint of cream and basil.",
            time: "25 min",
            servings: "4 servings",
        },
        {
            id: "demo-2",
            title: "Spicy Pumpkin Risotto",
            subtitle: "Autumn · 40 min",
            description: "Creamy risotto with roasted pumpkin and warming spices.",
            time: "40 min",
            servings: "3 servings",
        },
        {
            id: "demo-3",
            title: "Black Garlic Ramen",
            subtitle: "Savory · 30 min",
            description: "Deep umami broth topped with marinated egg and greens.",
            time: "30 min",
            servings: "2 servings",
        },
        {
            id: "demo-4",
            title: "Witch's Herb Salad",
            subtitle: "Fresh · 10 min",
            description: "Mixed greens with zesty citrus-herb vinaigrette.",
            time: "10 min",
            servings: "2 servings",
        },
        {
            id: "demo-5",
            title: "Charred Veg Skewers",
            subtitle: "Grill · 20 min",
            description: "Smoky skewers glazed with a sticky chili sauce.",
            time: "20 min",
            servings: "4 servings",
        },
        {
            id: "demo-6",
            title: "Dark Chocolate Mousse",
            subtitle: "Dessert · 50 min",
            description: "Silky mousse with bitter dark chocolate and sea salt.",
            time: "50 min",
            servings: "6 servings",
        },
    ];

    // if you need to fetch featured recipes from API, uncomment & adapt
    // useEffect(() => {
    //   dispatch(fetchRecipes({ page: 1, pageSize: 6, featured: true }));
    // }, [dispatch]);

    const hasRealData = Array.isArray( items ) && items.length > 0;
    const listToRender = hasRealData ? items.slice( 0, 6 ) : demoData;

    return (
        <section className="bg-gradient-to-br from-[#08050a] to-[#221322] rounded-2xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Featured recipes</h2>
                <Link to="/recipes" className="text-[#ffb48a] text-sm hover:underline">
                    View all
                </Link>
            </div>

            { status === "loading" ? (
                <LoadingGrid columns={ 3 } />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    { listToRender.map( ( r ) =>
                        hasRealData ? (
                            // if real RecipeCard component exists, use it
                            // ensure RecipeCard supports dark theme or wrap as needed
                            <div key={ r.id ?? r._id } className="">
                                {/* try to use the project's RecipeCard if available */ }
                                {/* eslint-disable-next-line react/jsx-no-undef */ }
                                { typeof window !== "undefined" && typeof window.RecipeCard !== "undefined" ? (
                                    <RecipeCard recipe={ r } />
                                ) : (
                                    <DemoRecipeCard recipe={ r } />
                                ) }
                            </div>
                        ) : (
                            <DemoRecipeCard key={ r.id } recipe={ r } />
                        )
                    ) }
                </div>
            ) }
        </section>
    );
}
