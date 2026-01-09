import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, InputNumber, Space, Card, Typography, Alert } from "antd";
import StockChart from "../../components/StockChart";
import useApiClient from "../../utils/requestController";
import usePriceStream from "../../hooks/usePriceStream";

const StockPage = () => {
    const { ticker } = useParams();
    const token = useSelector((state) => state.auth.token);
    const api = useApiClient();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [logo, setLogo] = useState("");
    const [points, setPoints] = useState([]);
    const [error, setError] = useState("");
    const [account, setAccount] = useState({ balance: 0, positions: [] });
    const [tradeQty, setTradeQty] = useState(1);
    const [tradeLoading, setTradeLoading] = useState(false);
    const [tradeError, setTradeError] = useState("");

    const fetchedTickersRef = useRef(new Set());
    const normalizedTicker = useMemo(
        () => (ticker ? String(ticker).toUpperCase() : ""),
        [ticker]
    );

    const handleLivePrice = useCallback(
        (_ticker, payload) => {
            const price = Number(payload?.price);
            if (!Number.isFinite(price)) return;
            const ts = Number(payload?.timestamp);
            const timestamp = Number.isFinite(ts) ? ts : Date.now();
            setPoints((prev) => [...prev, { timestamp, price }]);
        },
        [setPoints]
    );

    const subscriptionTickers = useMemo(
        () => (normalizedTicker ? [normalizedTicker] : []),
        [normalizedTicker]
    );

    usePriceStream(subscriptionTickers, handleLivePrice, token);

    useEffect(() => {
        if (!normalizedTicker) return;

        const key = normalizedTicker;
        if (fetchedTickersRef.current.has(key)) {
            return;
        }
        fetchedTickersRef.current.add(key);

        setLoading(true);
        setError("");
        setPoints([]);
        setName("");
        setLogo("");

        (async () => {
            try {
                const resp = await api.post(
                    "/stocks/getStockPrices",
                    { ticker: key },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const payload = resp?.data;
                const p = Array.isArray(payload?.prices) ? payload.prices : [];
                const t = Array.isArray(payload?.timestamps) ? payload.timestamps : [];

                const len = Math.min(p.length, t.length);
                const merged = new Array(len);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = { timestamp: t[i], price: Number(p[i]) };
                }

                setName(typeof payload?.name === "string" ? payload.name : "");
                setLogo(typeof payload?.logo === "string" ? payload.logo : "");
                setPoints(merged);
            } catch (e) {
                fetchedTickersRef.current.delete(key);

                console.error("Error fetching stock prices:", e);
                const message =
                    e?.response?.data
                        ? Object.values(e.response.data).filter(Boolean).join("\n\n")
                        : (e?.message || "Сервер не отвечает");
                setError(message);
            } finally {
                setLoading(false);
            }
        })();

    }, [normalizedTicker, token]);

    const title = useMemo(() => {
        const base = normalizedTicker;
        return name ? `${base} · ${name}` : base || "График цены";
    }, [normalizedTicker, name]);

    const currentPrice = useMemo(() => {
        if (!points.length) return null;
        const last = points[points.length - 1];
        return Number(last.price);
    }, [points]);

    const position = useMemo(() => {
        const list = Array.isArray(account.positions) ? account.positions : [];
        return list.find((p) => String(p.ticker || "").toUpperCase() === normalizedTicker);
    }, [account.positions, normalizedTicker]);

    useEffect(() => {
        if (!token) return;
        const loadAccount = async () => {
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
            }
        };
        loadAccount();
    }, [token]);

    const handleRetry = async () => {
        const key = normalizedTicker;
        fetchedTickersRef.current.delete(key);
        setLoading(true);
        setError("");
        try {
            const resp = await api.post(
                "/stocks/getStockPrices",
                { ticker: key },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const payload = resp?.data;
            const p = Array.isArray(payload?.prices) ? payload.prices : [];
            const t = Array.isArray(payload?.timestamps) ? payload.timestamps : [];
            const len = Math.min(p.length, t.length);
            const merged = new Array(len);
            for (let i = 0; i < len; i += 1) {
                merged[i] = { timestamp: t[i], price: Number(p[i]) };
            }

            setName(typeof payload?.name === "string" ? payload.name : "");
            setLogo(typeof payload?.logo === "string" ? payload.logo : "");
            setPoints(merged);
            fetchedTickersRef.current.add(key);
        } catch (e) {
            console.error("Error fetching stock prices:", e);
            const message =
                e?.response?.data
                    ? Object.values(e.response.data).filter(Boolean).join("\n\n")
                    : (e?.message || "Сервер не отвечает");
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleTrade = async (action) => {
        if (!normalizedTicker || !token) return;
        setTradeLoading(true);
        setTradeError("");
        try {
            const resp = await api.post(
                action === "sell" ? "/portfolio/sell" : "/portfolio/buy",
                { ticker: normalizedTicker, quantity: Number(tradeQty) },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const payload = resp?.data || {};
            setAccount({
                balance: payload.balance ?? 0,
                positions: Array.isArray(payload.positions) ? payload.positions : []
            });
        } catch (e) {
            console.error("Trade failed", e);
            const msg =
                e?.response?.data?.message ||
                (e?.response?.data ? Object.values(e.response.data).filter(Boolean).join("\n") : null) ||
                e?.message ||
                "Не удалось выполнить операцию";
            setTradeError(msg);
        } finally {
            setTradeLoading(false);
        }
    };

    const isAuthenticated = Boolean(token);

    return (
        <div style={{ padding: 12, maxWidth: 1200, margin: "0 auto" }}>
            {loading ? (
                <div style={{ padding: 12 }}>
                    Загружаю данные для {String(ticker).toUpperCase()}…
                </div>
            ) : null}

            {error ? (
                <div style={{ padding: 12, color: "crimson", whiteSpace: "pre-line" }}>
                    Ошибка: {error}
                    <div style={{ marginTop: 8 }}>
                        <button onClick={handleRetry} type="button">Повторить</button>
                    </div>
                </div>
            ) : null}

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <StockChart
                    data={points}
                    height={420}
                    initialTimeframe="1h"
                    theme="light"
                    locale="ru-RU"
                    title={title}
                    logo={logo}
                />

                <Card title="Торговля" bordered>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                        <Space size="large" wrap>
                            <Typography.Text>
                                Баланс:{" "}
                                <strong>
                                    {Number(account.balance || 0).toLocaleString("ru-RU", {
                                        style: "currency",
                                        currency: "RUB",
                                        maximumFractionDigits: 2
                                    })}
                                </strong>
                            </Typography.Text>
                            <Typography.Text>
                                Текущая цена:{" "}
                                <strong>
                                    {Number.isFinite(currentPrice)
                                        ? `${Number(currentPrice).toFixed(2)} ₽`
                                        : "—"}
                                </strong>
                            </Typography.Text>
                            <Typography.Text>
                                Моя позиция:{" "}
                                <strong>
                                    {position ? Number(position.quantity).toFixed(2) : 0} шт
                                </strong>
                            </Typography.Text>
                        </Space>

                        {tradeError ? <Alert type="error" message={tradeError} /> : null}

                        <Space align="center" wrap>
                            <Typography.Text>Количество:</Typography.Text>
                            <InputNumber
                                min={0.01}
                                step={1}
                                value={tradeQty}
                                onChange={(v) => setTradeQty(Number(v) || 0)}
                            />
                            <Button
                                type="primary"
                                disabled={!isAuthenticated}
                                loading={tradeLoading}
                                onClick={() => handleTrade("buy")}
                            >
                                Купить
                            </Button>
                            <Button
                                danger
                                disabled={!isAuthenticated || !position}
                                loading={tradeLoading}
                                onClick={() => handleTrade("sell")}
                            >
                                Продать
                            </Button>
                            {!isAuthenticated ? (
                                <Typography.Text type="secondary">
                                    Войдите, чтобы торговать
                                </Typography.Text>
                            ) : null}
                        </Space>
                    </Space>
                </Card>
            </Space>
        </div>
    );
};

export default StockPage;
