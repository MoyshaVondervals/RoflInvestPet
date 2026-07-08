import './App.css';
import './styles/styles.css';
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";

import RegisterPage from "./pages/authorityPages/register-page";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/authorityPages/login-page";
import AboutProjectPage from "./pages/aboutPages/AboutProjectPage";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Header from "./components/headers/Header";
import AboutDevelopmentPage from "./pages/aboutPages/AboutDevelopment";
import BugReportPage from "./pages/BugReportPage";
import AdminDashboard from "./pages/adminPages/AdminDashboard";
import AdmStocks from "./pages/adminPages/AdmStocks";
import AddNewStock from "./pages/adminPages/AddNewStockPage";
import DeleteStock from "./pages/adminPages/DeleteStock";

import MyProfilePage from "./pages/MyProfilePage";
import NewsPage from "./pages/gamePages/NewsPage";
import MarkerPage from "./pages/gamePages/markerpage";
import StockPage from "./pages/gamePages/StockPage";

function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#1fa038",
                    colorSuccess: "#1fa038",
                    colorError: "#e3401b",
                },
            }}
        >
            <div className="App app-shell">
                <div className="app-dollars" aria-hidden="true" />
                <div className="app-content">
                    <BrowserRouter>
                        <Header />
                        <Routes>
                            <Route path="/" element={<WelcomePage />} />
                            <Route path="/auth/sign-in" element={<LoginPage />} />
                            <Route path="/auth/sign-up" element={<RegisterPage />} />
                            <Route path="/about" element={<AboutProjectPage />} />
                            <Route path="/aboutDevelopment" element={<AboutDevelopmentPage />} />
                            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                            <Route path="/bugReportPage" element={<PrivateRoute element={<BugReportPage />} />} />
                            <Route path="/news" element={<PrivateRoute element={<NewsPage />} />} />
                            <Route path="/market" element={<PrivateRoute element={<MarkerPage />} />} />
                            <Route path="/stock/:ticker" element={<StockPage />} />
                            <Route path="/adminDashboard" element={<PrivateRoute element={<AdminDashboard />} requiredRole="ROLE_ADMIN" />} />
                            <Route path="/admStocks" element={<PrivateRoute element={<AdmStocks />} requiredRole="ROLE_ADMIN" />} />
                            <Route path="/newStock" element={<PrivateRoute element={<AddNewStock />} requiredRole="ROLE_ADMIN" />} />
                            <Route path="/deleteStock" element={<PrivateRoute element={<DeleteStock />} requiredRole="ROLE_ADMIN" />} />
                            <Route path="/myProfile" element={<PrivateRoute element={<MyProfilePage />} />} />
                        </Routes>
                    </BrowserRouter>
                </div>
            </div>
        </ConfigProvider>
    );
}

export default App;
