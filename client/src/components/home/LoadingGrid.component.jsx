import React from "react";

export default function LoadingGrid( { columns = 3 } ) {
    const count = columns * 2;
    return (
        <div className={ `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-6` }>
            { Array.from( { length: count } ).map( ( _, i ) => (
                <div key={ i } className="animate-pulse bg-gray-100 dark:bg-slate-700 rounded-xl p-4">
                    <div className="w-full h-36 bg-gray-200 dark:bg-slate-600 rounded-md mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-1/2" />
                </div>
            ) ) }
        </div>
    );
}
