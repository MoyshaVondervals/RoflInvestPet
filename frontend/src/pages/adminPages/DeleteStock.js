import React, { useState} from 'react'
import '../../styles/login-page.css'
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import useApiClient from "../../utils/requestController";



const DeleteStock = () => {
    const api = useApiClient();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [message, setMessage] = useState('')
    const [ticker, setTicker] = useState('')
    const token = useSelector((state) => state.auth.token);

    const handleSubmit = async () => {
        try{

            const response = await api.post('/stocks/deleteStock',{
                    ticker: ticker.toUpperCase()
                }
                ,{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })


        }catch (error) {
            console.error('Failed to delete stock:', error);
            if (error.response && error.response.data) {
                const errorMessages = Object.values(error.response.data)
                    .filter(Boolean)
                    .join('\n\n');

                setMessage(errorMessages);
            } else {
                setMessage("Сервер не отвечает");
            }
        }

    }
    return (
        <div>

            <div className="login-page-wrapper">
                <div className={`authority-page-container1`}>
                    <div className="authority-page-container2">
                        <h1 className="authority-page-header">
                            Удалить акцию
                        </h1>
                        <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Тикер"
                            autoComplete="on"
                            className="authority-page-input input"
                            onChange={(e) => setTicker(e.target.value)}
                        />


                        <button type="submit" className="authority-page-delete-button button"
                                onClick={handleSubmit}>
                            Удалить
                        </button>
                        <div className="message">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default DeleteStock;