import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Table, Card, Typography, Button, Space, Alert, Avatar } from "antd";
import useApiClient from "../utils/requestController";

const currency = (value) =>
    Number.isFinite(Number(value))
        ? new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 2 }).format(Number(value))
        : "—";

const Dashboard = () => {
    const api = useApiClient();
    const token = useSelector((state) => state.auth.token);
    const username = useSelector((state) => state.auth.username);
    const navigate = useNavigate();

    const [account, setAccount] = useState({ balance: 0, positions: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) return;
        const fetchAccount = async () => {
            setLoading(true);
            setError("");
            try {
                const resp = await api.get("/portfolio/account", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const payload = resp?.data || {};
                setAccount({
                    balance: payload.balance ?? 0,
                    positions: Array.isArray(payload.positions) ? payload.positions : []
                });
            } catch (e) {
                console.error("Failed to load account", e);
                setError(e?.response?.data?.message || e?.message || "Не удалось загрузить счет");
            } finally {
                setLoading(false);
            }
        };
        fetchAccount();
    }, [token]);

    const tableData = useMemo(
        () =>
            (account.positions || []).map((p) => ({
                key: p.ticker,
                ticker: p.ticker,
                name: p.name,
                quantity: Number(p.quantity),
                averagePrice: Number(p.averagePrice),
                currentPrice: Number(p.currentPrice),
                marketValue: Number(p.marketValue),
                logo: p.logo
            })),
        [account.positions]
    );

    const columns = [
        {
            title: "",
            dataIndex: "logo",
            key: "logo",
            width: 64,
            render: (logo) =>
                logo ? (
                    <Avatar src={`data:image/png;base64,${logo}`} size={40} />
                ) : (
                    <Avatar size={40} />
                )
        },
        { title: "Название", dataIndex: "name", key: "name" },
        {
            title: "Кол-во",
            dataIndex: "quantity",
            key: "quantity",
            render: (v) => Number(v).toFixed(2)
        },
        {
            title: "Средняя",
            dataIndex: "averagePrice",
            key: "averagePrice",
            render: (v) => currency(v)
        },
        {
            title: "Текущая",
            dataIndex: "currentPrice",
            key: "currentPrice",
            render: (v) => currency(v)
        },
        {
            title: "Стоимость",
            dataIndex: "marketValue",
            key: "marketValue",
            render: (v) => currency(v)
        }
    ];

    const totalPositionsValue = useMemo(
        () => (account.positions || []).reduce((sum, p) => sum + Number(p.marketValue || 0), 0),
        [account.positions]
    );

    const portfolioTotal = useMemo(
        () => Number(account.balance || 0) + totalPositionsValue,
        [account.balance, totalPositionsValue]
    );

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Card>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Typography.Title level={3} style={{ margin: 0 }}>
                            Мой брокерский счет {username ? `(${username})` : ""}
                        </Typography.Title>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            Итоговая стоимость портфеля: {currency(portfolioTotal)}
                        </Typography.Title>
                        <Typography.Text type="secondary">
                            Баланс: <strong>{currency(account.balance)}</strong>
                        </Typography.Text>
                        <Space>
                            <Button type="primary" onClick={() => navigate("/market")}>
                                Перейти к рынку
                            </Button>
                            <Button onClick={() => navigate("/news")}>Новости</Button>
                        </Space>
                    </Space>
                </Card>

                {error ? <Alert type="error" message={error} /> : null}

                <Card title="Мои позиции" loading={loading}>
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        pagination={false}
                        locale={{ emptyText: "Пока нет купленных бумаг" }}
                        onRow={(record) => ({
                            onClick: () => navigate(`/stock/${record.ticker}`)
                        })}
                        rowClassName="clickable-row"
                    />
                    <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                        <Space align="center">
                            <span role="img" aria-label="ruble">₽</span>
                            <Typography.Text>Свободные средства:</Typography.Text>
                            <Typography.Text strong>{currency(account.balance)}</Typography.Text>
                        </Space>
                    </div>
                </Card>
            </Space>
        </div>
    );
};

export default Dashboard;
