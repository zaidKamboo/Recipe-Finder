import About from "../pages/AboutUs.page";
import AddRecipe from "../pages/AddRecipe.page";
import AdminDashboard from "../pages/AdminDashboard.page";
import AdminLogin from "../pages/AdminLogin.page";
import EditRecipe from "../pages/EditRecipe.page";
import Features from "../pages/Features.page";
import Home from "../pages/Home.page";
import Login from "../pages/Login.page";
import Profile from "../pages/Profile.page";
import Recipe from "../pages/Recipe.page";
import Recipes from "../pages/Recipes.page";
import Signup from "../pages/Signup.page";
import Terms from "../pages/Terms.page";

export const routes = [
    { path: "/", element: <Home /> },
    { path: "/recipes", element: <Recipes /> },
    { path: "/recipes/:id", element: <Recipe /> },
    { path: "/features", element: <Features /> },
    { path: "/about", element: <About /> },
    { path: "/terms", element: <Terms /> },
    { path: "/login", element: <Login /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/dashboard", element: <AdminDashboard /> },
    { path: "/admin/recipes/edit/:id", element: <EditRecipe /> },
    { path: "/admin/recipes/create", element: <AddRecipe /> },
    { path: "/signup", element: <Signup /> },
    { path: "/profile", element: <Profile /> },
]