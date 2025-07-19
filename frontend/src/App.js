import './App.css';
import './styles/styles.css';
import {RouterProvider, createBrowserRouter, Route, Routes, BrowserRouter} from "react-router-dom";


import RegisterPage from "./components/register-page";
import WelcomePage from "./pages/WelcomePage"
import LoginPage from "./components/login-page";
import AboutProjectPage from "./pages/AboutProjectPage"
import PrivateRoute from "./PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Header from "./components/headers/Header";
import AboutDevelopmentPage from "./pages/AboutDevelopment";

function App() {

    return (

            <div className="App">
                <BrowserRouter>
                    <Header />
                    <Routes>
                        <Route path="/" element={<WelcomePage />} />
                        <Route path="/auth/sign-in" element={<LoginPage />} />
                        <Route path="/auth/sign-up" element={<RegisterPage />} />
                        <Route path="/about" element={<AboutProjectPage />} />
                        <Route path="/aboutDevelopment" element={<AboutDevelopmentPage/>}/>
                        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                    </Routes>
                </BrowserRouter>
            </div>

    );
}

export default App;
