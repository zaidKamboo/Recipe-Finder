import About from "../pages/AboutUs.page";
import Features from "../pages/Features.page";
import Home from "../pages/Home.page";
import Login from "../pages/Login.page";
import Recipes from "../pages/Recipes.page";
import Signup from "../pages/Signup.page";
import Terms from "../pages/Terms.page";

export const routes = [
    { path: "/", element: <Home /> },
    { path: "/recipes", element: <Recipes /> },
    { path: "/features", element: <Features /> },
    { path: "/about", element: <About /> },
    { path: "/terms", element: <Terms /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
]