import './App.css';
import './styles/styles.css';
import {Route, Routes, BrowserRouter} from "react-router-dom";


import RegisterPage from "./pages/register-page";
import WelcomePage from "./pages/WelcomePage"
import LoginPage from "./pages/login-page";
import AboutProjectPage from "./pages/aboutPages/AboutProjectPage"
import PrivateRoute from "./PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Header from "./components/headers/Header";
import AboutDevelopmentPage from "./pages/aboutPages/AboutDevelopment";
import BugReportPage from "./pages/BugReportPage";
import BecomeAdminPage from "./pages/BecomeAdminPage";
import AdminDashboard from "./pages/adminPages/AdminDashboard";
import AdmStocks from "./pages/adminPages/AdmStocks";
import AddNewStock from "./pages/adminPages/AddNewStockPage";
import DeleteStock from "./pages/adminPages/DeleteStock";

import MyProfilePage from "./pages/MyProfilePage";


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
                        <Route path ="/adminDashboard" element={<PrivateRoute element={<AdminDashboard />} requiredRole="ROLE_ADMIN" />} />
                        <Route path="/admStocks" element={<PrivateRoute element={<AdmStocks />} requiredRole="ROLE_ADMIN" />} />
                        <Route path="/newStock" element={<PrivateRoute element={<AddNewStock />} requiredRole="ROLE_ADMIN" />} />
                        <Route path="/deleteStock" element={<PrivateRoute element={<DeleteStock />} requiredRole="ROLE_ADMIN" />} />
                        <Route path="/myProfile" element={<PrivateRoute element={<MyProfilePage />} />} />
                    </Routes>
                </BrowserRouter>
            </div>

    );
}

export default App;
