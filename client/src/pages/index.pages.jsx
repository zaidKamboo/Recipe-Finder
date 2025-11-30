import React from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { routes } from '../utils/index.utils';

const AllPages = () => <BrowserRouter>
    <Routes>
        {
            routes.map( ( { path, element } ) =>
                <Route key={ path } path={ path } element={ element } /> )
        }
    </Routes>
</BrowserRouter>

export default AllPages;