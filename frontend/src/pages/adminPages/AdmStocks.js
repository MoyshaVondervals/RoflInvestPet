import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {useNavigate} from "react-router-dom";
import useApiClient from "../../utils/requestController";

const AdmStocks = () => {
    const api = useApiClient();
    const token = useSelector((state) => state.auth.token);
    const [stocks, setStocks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await api.get('/stocks/getStocksList', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });


                // Преобразуем данные для таблицы
                const formattedStocks = response.data.map((stock, index) => ({
                    key: index + 1,
                    ticker: stock.ticker,
                    name: stock.name,
                    sector: stock.sector,
                    lastPrice: stock.lastPrice,
                    status: stock.status,
                    logo: stock.logoBase64
                        ? <img src={`data:image/png;base64,${stock.logoBase64}`} alt="Logo" style={{ width: '50px' }} className="stock-logo" />
                        : 'No logo'
                }));

                setStocks(formattedStocks);
            } catch (error) {
                console.error('Error fetching stocks:', error);
            } finally {
            }
        };

        fetchStocks();
    }, [token]);

    const columns = [
        {
            title: 'Логотип',
            dataIndex: 'logo',
            key: 'logo',
        },
        {
            title: 'Тикер',
            dataIndex: 'ticker',
            key: 'ticker',
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Сектор',
            dataIndex: 'sector',
            key: 'sector',
        },
        {
            title: 'Цена',
            dataIndex: 'lastPrice',
            key: 'lastPrice',
            render: (price) => `$${price.toFixed(2)}`
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
        },
    ];

    return (
        <div className="admin-dashboard">
            <div className="admin-dashboard-container-row">
                <div className="menu-panel">
                    <div className="dashboard-menu-unit" onClick={() => navigate('/newStock')}>
                        <h1>Новая бумага</h1>
                        <p>Создать новую ценную бумагу</p>
                    </div>

                    <div className="dashboard-menu-unit" onClick={() => navigate('/deleteStock')}>
                        <h1>Удалить бумагу</h1>
                        <p>Удалить бумагу и вернуть за неё деньги</p>
                    </div>
                </div>

                <div className="table-panel">
                    <Table dataSource={stocks} columns={columns} />
                </div>
            </div>
        </div>
    );
};

export default AdmStocks;