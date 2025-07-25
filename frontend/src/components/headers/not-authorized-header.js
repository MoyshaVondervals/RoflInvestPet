import React, { useState, useEffect } from 'react';
import '../../styles/header.css';
import logo from "../../styles/resources/roflInves.jpg"
import {useNavigate} from "react-router-dom";

const NotAuthorizedHeader = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const mobileNavigate = (route) =>{
    navigate(route)
    toggleMobileMenu()
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
      <header className="header">
        <div className="navbar">
          <img
              alt="Логотип"
              src={logo}
              onClick={() => navigate('/')}
              className="logo"

          />

          {/* Десктопное меню */}
          <div className="desktop-menu">
            <nav className="nav-links">
              <a className="nav-link" onClick={() => navigate("/about")}>О проекте</a>
              <a  className="nav-link" onClick={() => navigate("/aboutDevelopment")}>О разработке</a>
              <a  className="nav-link" onClick={() => navigate('/auth/sign-in')}>Сообщить о проблеме</a>
            </nav>
            <div className="auth-buttons">
              <button className="login-btn button">
                <span onClick={() => navigate('/auth/sign-in')}>Вход</span>
              </button>
              <button className="register-btn button">
                <span onClick={() => navigate('/auth/sign-up')}>Регистрация</span>
              </button>
            </div>
          </div>

          {/* Бургер-меню */}
          <div className="burger-menu" onClick={toggleMobileMenu}>
            <svg viewBox="0 0 1024 1024" className="burger-icon">
              <path d="M128 554.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667zM128 298.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667zM128 810.667h768c23.552 0 42.667-19.115 42.667-42.667s-19.115-42.667-42.667-42.667h-768c-23.552 0-42.667 19.115-42.667 42.667s19.115 42.667 42.667 42.667z"></path>
            </svg>
            <button className="login-btn button" id = "logBut">
              <span onClick={() => navigate('/auth/sign-in')}>Вход</span>
            </button>
            <button className="register-btn button" >
              <span onClick={() => navigate('/auth/sign-up')} >Регистрация</span>
            </button>
          </div>



          {/* Мобильное меню */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}>
            <div className="mobile-nav">
              <div className="mobile-top">
                <img
                    alt="Логотип"
                    src={logo}
                    className="mobile-logo"
                    onClick={() => navigate('/')}
                />
                <div className="close-menu" onClick={toggleMobileMenu}>
                  <svg viewBox="0 0 1024 1024" className="close-icon">
                    <path d="M810 274l-238 238 238 238-60 60-238-238-238 238-60-60 238-238-238-238 60-60 238 238 238-238z"></path>
                  </svg>
                </div>
              </div>
              <nav className="mobile-links">
                <a  className="mobile-link" onClick={()=>mobileNavigate("/about")}>О проекте</a>
                <a  className="mobile-link" onClick={()=>mobileNavigate("/aboutDevelopment")}>Разработчик</a>
              </nav>
              <div className="mobile-auth-buttons">
                <button className="mobile-login button" onClick={() => mobileNavigate('/auth/sign-in')}>
                  <span>Вход</span>
                </button>
                <button className="mobile-register button" onClick={() => mobileNavigate('/auth/sign-up')}>
                  <span>Регистрация</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>
  );
};

export default NotAuthorizedHeader;