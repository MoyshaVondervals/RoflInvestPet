import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Table, Tag, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { availableForEnum, sectorEnum } from "../../utils/enums";
import useApiClient from "../../utils/requestController";
import { useSelector } from "react-redux";
import StocksTable from "../../components/StocksTable";
import {useNavigate} from "react-router-dom";
import usePriceStream from "../../hooks/usePriceStream";

const MarkerPage = () => {
    const [loading, setLoading] = useState(false);
    const [stocks, setStocks] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const navigate = useNavigate();

    const api = useApiClient();
    const token = useSelector((state) => state.auth.token);

    const getStatusTag = (status) => {
        switch (status) {
            case 'Базовый':
                return <Tag color="green">Базовый</Tag>;
            case 'Квалифицированный':
                return <Tag color="blue">Квалифицированный</Tag>;
            case 'Супер квалифицированный':
                return <Tag color="purple">Супер квалифицированный</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Поиск по ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Поиск
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters && handleReset(clearFilters);
                            handleSearch(selectedKeys, confirm, dataIndex)
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Сброс
                    </Button>

                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                        style={{color: '#1fa038'}}
                    >
                        Закрыть
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1fa038' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#1fa03855', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

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
                <div className="table-panel">
                    <StocksTable
                        data={stocks}
                        loading={loading}
                        onRowClick={(record) => {
                            console.log('Clicked ticker:', record.ticker);
                            navigate(`/stock/${record.ticker}`);

                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarkerPage;
