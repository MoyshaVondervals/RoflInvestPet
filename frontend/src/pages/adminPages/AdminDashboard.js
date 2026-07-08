import '../../styles/admDashboard.css'
import {useNavigate} from "react-router-dom";
const AdminDashboard = () => {
    const navigate = useNavigate();
    return(
        <div>
            <div className="admin-dashboard">
                <div className="admin-dashboard-container">
                    <div className="menu">
                        <div className="admin dashboard-menu-unit" id = "about-stocks-button"
                        onClick={() => navigate('/admStocks')}>
                            <h1>Акции</h1>
                            <p>Управление акциями в игре</p>
                        </div>
                        <div className="admin dashboard-menu-unit" id = "about-users-button">
                            <h1>Пользователи</h1>
                            <p>Управление пользователями</p>
                        </div>
                        <div className="admin dashboard-menu-unit" id = "game-settings-button">
                            <h1>Настройки</h1>
                            <p>Управление настройками игрового процесса</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AdminDashboard;
