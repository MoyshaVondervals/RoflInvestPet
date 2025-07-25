
import "../styles/aboutPage.css"
import Header from "../components/headers/Header";
import React, {useState} from "react";
import axios from "axios";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
const BugReportPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [message, setMessage] = useState('')
    const username = useSelector((state) => state.auth.username);
    const token = useSelector((state) => state.auth.token);

    const handleSubmit = async () => {

        console.log("TOKEN",token)
        console.log("USERNAME",username)
        try {


            const response = await axios.post(
                'http://localhost:8080/bugReport',
                {
                    username: username,
                    title: title,
                    text: text
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );


        }catch (error) {
            console.error('Bug report error:', error);
            setMessage(
                [error.response.data.message, error.response.data.username, error.response.data.email, error.response.data.password]
                    .filter(Boolean)
                    .join('\n')
            );
        }
    };

    return (
        <div>
            <div className="about-page">
                <div className={"about-page-container"}>
                    <h1 className="about-page-header">
                       Сообщить о проблеме
                    </h1>
                    <input
                        type="text"
                        required
                        autoFocus
                        placeholder="Заголовок"
                        autoComplete="on"
                        className="bug_report-page-title-input"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        type="text"
                        required
                        autoFocus
                        placeholder="Имя пользователя"
                        autoComplete="on"
                        className="bug_report-page-text-input"
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button type="submit" className="authority-page-submit-button button"
                            onClick={handleSubmit}>
                        Отправить
                    </button>
                    <button type="button" className="dont-have-account button"
                            onClick={() => navigate('/becomeAdminPage')}>
                        Стать админом
                    </button>
                    <div className="message">{message}</div>
                    <a href="https://github.com/MoyshaVondervals">
                        <svg height="32" viewBox="0 0 16 16" width="32" className = "socialIcons" >
                            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
export default BugReportPage;
