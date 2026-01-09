import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, Tag } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import useApiClient from "../../utils/requestController";
import { sectorEnum, availableForEnum } from '../../utils/enums';
import StocksTable from "../../components/StocksTable";
import usePriceStream from "../../hooks/usePriceStream";

const AdmStocks = () => {
    const api = useApiClient();
    const token = useSelector((state) => state.auth.token);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();



    useEffect(() => {
        const fetchStocks = async () => {
            try {
                setLoading(true);
                const response = await api.get('/stocks/getStocksList', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const formattedStocks = response.data.map((stock, index) => ({
                    key: index + 1,
                    ticker: String(stock.ticker || "").toUpperCase(),
                    name: stock.name,
                    sector: sectorEnum[stock.sector] || stock.sector,
                    lastPrice: stock.lastPrice,
                    status: availableForEnum[stock.status] || stock.status,
                    logo: stock.logoBase64
                        ? <img src={`data:image/png;base64,${stock.logoBase64}`} alt="Logo" style={{ width: '50px' }} className="stock-logo" />
                        : 'No logo',
                }));

                setStocks(formattedStocks);
            } catch (error) {
                console.error('Error fetching stocks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, [token]);

    const tickers = useMemo(
        () => stocks.map((s) => s.ticker).filter(Boolean),
        [stocks]
    );

    const handleLivePrice = useCallback((incomingTicker, payload) => {
        const price = Number(payload?.price);
        if (!Number.isFinite(price)) return;
        const normalizedTicker = String(incomingTicker || "").toUpperCase();
        setStocks((prev) =>
            prev.map((stock) =>
                String(stock.ticker || "").toUpperCase() === normalizedTicker
                    ? { ...stock, lastPrice: price }
                    : stock
            )
        );
    }, []);

    usePriceStream(tickers, handleLivePrice, token);




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

                <StocksTable
                    data={stocks}
                    loading={loading}
                    onRowClick={(record) => {
                        console.log('Clicked ticker:', record.ticker);
                    }}
                />
            </div>
        </div>
    );
};

export default AdmStocks;
