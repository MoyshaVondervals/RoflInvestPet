import React, {useState} from 'react'

import '../../styles/login-page.css'
import imageCompression from "browser-image-compression";
import axios from "axios";
import {useSelector} from "react-redux";
import useApiClient from "../../utils/requestController";

const AddNewStock = () => {
    const api = useApiClient();
    const [message, setMessage] = useState('')
    const [logo, setLogo] = useState('')
    const [ticker, setTicker] = useState('')
    const [name, setName] = useState('')
    const [sector, setSector] = useState('')
    const [lastPrice, setLastPrice] = useState('')
    const [availableFor, setAvailableFor] = useState('')
    const token = useSelector((state) => state.auth.token);

    const handleSubmit = async () => {
        try {
            if (!ticker || !name || !sector || !lastPrice || !availableFor || !logo) {
                setMessage("Заполните все поля");
                return;
            }
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 256,
                useWebWorker: true,
            };
            const compressedFile = await imageCompression(logo, options);

            const formData = new FormData();
            const payload = {
                ticker: ticker.toUpperCase(),
                name,
                sector,
                lastPrice: parseFloat(lastPrice),
                status: availableFor
            };

            formData.append("payload", new Blob([JSON.stringify(payload)], {
                type: "application/json"
            }));

            formData.append("logo", compressedFile);

            const response = await api.post('/stocks/newStock', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            setMessage("Акция успешно добавлена");
            setTicker('');
            setName('');
            setSector('');
            setLastPrice('');
            setAvailableFor('');
            setLogo(null);

        } catch (error) {
            console.error('Failed to add stock:', error);
            if (error.response && error.response.data) {
                const errorMessages = Object.values(error.response.data)
                    .filter(Boolean)
                    .join('\n\n');

                setMessage(errorMessages);
            } else {
                setMessage("Сервер не отвечает");
            }
        }
    };
    return (
        <div>

            <div className="login-page-wrapper">
                <div className="authority-page-container1">
                    <div className="authority-page-container2">
                        <h1 className="authority-page-header">
                            Добавление новой акции
                        </h1>
                        <label className="authority-page-input file-input-label">
                            <span>Загрузить логотип</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogo(e.target.files[0])}
                            />
                        </label>
                        <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Тикер"
                            autoComplete="on"
                            className="authority-page-input input"
                            onChange={(e) => setTicker(e.target.value)}
                        />
                        <input
                            type="text"
                            required
                            placeholder="Имя бумаги"
                            autoComplete="on"
                            className="authority-page-input input"
                            onChange={(e) => setName(e.target.value)}
                        />
                        <select
                            className="authority-page-select"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                        >
                            <option disabled selected value="">Выберите сектор</option>
                            <option value="ENERGY">Энергетика</option>
                            <option value="HEALTHCARE">Здравоохранение</option>
                            <option value="AGRICULTURE">Сельское хозяйство и пищевая промышленность</option>
                            <option value="LOGISTICS">Логистика и транспорт</option>
                            <option value="MANUFACTURING">Промышленное производство</option>
                            <option value="METALLURGY">Металлургия</option>
                            <option value="RESOURCE_EXTRACTION">Добыча ресурсов</option>
                            <option value="CONSTRUCTION">Строительство и недвижимость</option>
                            <option value="FINANCIAL">Финансовый сектор</option>
                            <option value="SOFTWARE">Программное обеспечение (ПО)</option>
                            <option value="NETWORK_TECHNOLOGIES">Сетевые технологии и телеком</option>
                            <option value="RETAIL">Розничная торговля (Ритейл)</option>
                            <option value="SCIENCE_EDUCATION">Наука и образование</option>
                            <option value="ENTERTAINMENT_MEDIA">Развлечения и медиа</option>
                        </select>

                        <input
                            type="text"
                            inputMode="decimal"
                            className="authority-page-input"
                            placeholder="Цена за лот"
                            name="lastPrice"
                            value={lastPrice}
                            onChange={(e) => {
                                const raw = e.target.value.replace(',', '.');

                                const isValid = /^(\d+)?(\.\d{0,2})?$/.test(raw);
                                if (isValid || raw === '') {
                                    setLastPrice(raw);
                                }
                            }}
                        />

                        <select
                            className="authority-page-select"
                            value={availableFor}
                            onChange={(e) => setAvailableFor(e.target.value)}
                        >
                            <option value="" disabled>Доступно для</option>
                            <option value="BASIC">Базовый</option>
                            <option value="QUALIFIED">Квалифицированный</option>
                            <option value="SUPER_QUALIFIED">Супер-квалифицированный</option>
                        </select>

                        <button type="submit" className="authority-page-submit-button button"
                                onClick={handleSubmit}>
                            Разместить бумагу

                        </button>
                        <div className="message">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddNewStock
