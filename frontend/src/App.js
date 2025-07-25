import './App.css';
import './styles/styles.css';
import {RouterProvider, createBrowserRouter, Route, Routes, BrowserRouter} from "react-router-dom";


import RegisterPage from "./pages/register-page";
import WelcomePage from "./pages/WelcomePage"
import LoginPage from "./pages/login-page";
import AboutProjectPage from "./pages/AboutProjectPage"
import PrivateRoute from "./PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Header from "./components/headers/Header";
import AboutDevelopmentPage from "./pages/AboutDevelopment";
import BugReportPage from "./pages/BugReportPage";
import BecomeAdminPage from "./pages/BecomeAdminPage";


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
                        <Route path="/bugReportPage" element={<PrivateRoute element={<BugReportPage />} />} />
                        <Route path="/becomeAdminPage" element={<PrivateRoute element={<BecomeAdminPage />} />} />

                    </Routes>
                </BrowserRouter>
            </div>

    );
}

export default App;
