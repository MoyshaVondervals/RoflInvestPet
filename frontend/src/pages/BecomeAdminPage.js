import React, {useState} from 'react'


import '../styles/login-page.css'
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {setAuthData, updateRole} from "../redux/authSlice";

const BecomeAdminPage = () => {
    const [message, setMessage] = useState('')
    const [admPasswd, setPassword] = useState('')
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const navigate = useNavigate();
    const username = useSelector((state) => state.auth.username);



    const handleSubmit = async () => {
        try{

            const response = await axios.post('http://localhost:8080/getAdmin',{
                admPasswd
            }
            ,{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            console.log("before "+username, " ", token)

            dispatch(updateRole("ROLE_ADMIN"));
            console.log("after "+username, " ", token)
            console.log("ADM")
            navigate('/dashboard');

        }catch (error) {
            console.error('Register failed:', error);
            setMessage(
                [error.response.data.message]
                    .filter(Boolean)
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
                            Введите код доступа
                        </h1>

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



export default BecomeAdminPage
