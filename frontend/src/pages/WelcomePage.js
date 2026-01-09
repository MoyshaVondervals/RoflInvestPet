import { useNavigate } from "react-router-dom";
import "../styles/welcome.css";

const WelcomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-page">
            <div className="floating-dollars" aria-hidden="true" />
            <div className="welcome-content">
                <section className="hero">
                    <div className="hero-text">
                        <p className="pill">Инвестпесочница RoflInvest</p>
                        <h1>
                            Соберите портфель, наблюдайте за ценами в реальном времени и учитесь инвестировать без риска.
                        </h1>

                        <div className="cta-row">

                        </div>

                    </div>
                </section>

                <section className="feature-grid">
                    <div className="feature">
                        <div className="icon-bubble">⚡</div>
                        <h3>Потоковые цены</h3>
                        <p>Получайте обновления котировок в реальном времени, следите за волатильностью и динамикой с красивыми графиками.</p>
                    </div>
                    <div className="feature">
                        <div className="icon-bubble">🧠</div>
                        <h3>ИИ-новости</h3>
                        <p>События, которые двигают рынок: генератор новостей формирует импакты по секторам и скоростям роста.</p>
                    </div>
                    <div className="feature">
                        <div className="icon-bubble">🛡️</div>
                        <h3>Безопасно пробовать</h3>
                        <p>Торгуйте в симуляции, учитесь управлять позициями и лимитами, пока готовите себя к реальному рынку.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WelcomePage;
