import React, {Fragment, useState} from 'react'

import PropTypes from 'prop-types'

import '../styles/login-page.css'
import NotAuthorizedHeader from "./headers/not-authorized-header";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {setAuthData} from "../redux/authSlice";
import Header from "./headers/Header";

const RegisterPage = () => {
  const [message, setMessage] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch();
  const navigate = useNavigate();



  const handleSubmit = async () => {
    try{
      if (!username || !email || !password){
        setMessage("Заполните все поля")
      }
      const response = await axios.post('http://localhost:8080/auth/sign-up',{
        username,
        email,
        password
      })
      dispatch(setAuthData({
        token: response.data.token,
        username: response.data.username
      }));


      navigate('/dashboard');

    }catch (error) {
      console.error('Login failed:', error);
      setMessage(
          [error.response.data.username, error.response.data.email, error.response.data.password]
              .filter(Boolean) // убираем undefined/null
              .join('\n')
      );
    }

  }
  return (
      <div>

        <div className="login-page-wrapper">
          <div className="authority-page-container1">
            <div className="authority-page-container2">
              <h1 className="authority-page-header">
                Регистрация
              </h1>
              <input
                type="text"
                required
                autoFocus
                placeholder="Имя пользователя"
                autoComplete="on"
                className="authority-page-input input"
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="text"
                required
                placeholder="Электронная почта"
                autoComplete="on"
                className="authority-page-input input"
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                placeholder="Пароль"
                className="authority-page-input input"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="authority-page-submit-button button"
              onClick={handleSubmit}>
                Регистрация

              </button>
              <div className="message">{message}</div>
            </div>
          </div>
        </div>
      </div>
  )
}

RegisterPage.defaultProps = {
  button: undefined,
  heading: undefined,
}

RegisterPage.propTypes = {
  button: PropTypes.element,
  heading: PropTypes.element,
}

export default RegisterPage
