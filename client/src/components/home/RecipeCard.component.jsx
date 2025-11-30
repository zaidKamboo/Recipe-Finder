import React from "react";
import { Link } from "react-router-dom";

export default function RecipeCard( { recipe } ) {
    // defensive fields so UI doesn't crash if recipe shape is different
    const id = recipe?.id ?? recipe?._id;
    const title = recipe?.title ?? "Untitled";
    const image = recipe?.image ?? recipe?.cover ?? "/placeholder.jpg";
    const summary = recipe?.summary ?? recipe?.description ?? "";

    return (
        <article className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 shadow hover:shadow-lg transition">
            <Link to={ `/recipes/${id}` } className="block">
                <div className="w-full h-44 rounded-md overflow-hidden mb-3 bg-gray-200">
                    <img
                        src={ image }
                        alt={ title }
                        className="w-full h-full object-cover"
                        onError={ ( e ) => ( e.target.src = "/placeholder.jpg" ) }
                    />
                </div>
                <h3 className="font-semibold text-lg">{ title }</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                    { summary }
                </p>
            </Link>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>{ recipe?.duration ? `${recipe.duration} min` : "—" }</span>
                <Link to={ `/recipes/${id}` } className="text-indigo-600">
                    Open
                </Link>
            </div>
        </article>
    );
}
