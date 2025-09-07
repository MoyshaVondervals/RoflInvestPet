import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import StockChart from "../../components/StockChart";
import useApiClient from "../../utils/requestController";

const StockPage = () => {
    const { ticker } = useParams();
    const token = useSelector((state) => state.auth.token);
    const api = useApiClient();

    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [logo, setLogo] = useState("");
    const [points, setPoints] = useState([]); // [{ timestamp, price }]
    const [error, setError] = useState("");

    // Гард от повторных запросов (включая двойной вызов эффектов в StrictMode)
    const fetchedTickersRef = useRef(new Set());

    useEffect(() => {
        if (!ticker) return;

        const key = String(ticker).toUpperCase();
        if (fetchedTickersRef.current.has(key)) {
            // Уже грузили для этого тикера — просто выходим
            return;
        }
        fetchedTickersRef.current.add(key);

        setLoading(true);
        setError("");

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
                // Ожидаем: { name: string, logo: string(base64), prices: number[], timestamps: number[] }
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
                // Если запрос упал — разрешим повторить вручную (см. кнопку ниже)
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

    }, [ticker]);

    const title = useMemo(() => {
        const base = String(ticker || "").toUpperCase();
        return name ? `${base} · ${name}` : base || "График цены";
    }, [ticker, name]);

    const handleRetry = async () => {
        const key = String(ticker || "").toUpperCase();
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

    return (
        <div style={{ padding: 12 }}>
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

            <StockChart
                data={points}
                height={420}
                initialTimeframe="1h"
                theme="light"
                locale="ru-RU"
                title={title}
                logo={logo}
            />
        </div>
    );
};

export default StockPage;
