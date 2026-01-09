import { useEffect, useMemo, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const normalizeBaseUrl = (url) => {
    if (!url) return "http://localhost:8080";
    return url.endsWith("/") ? url.slice(0, -1) : url;
};

const WS_BASE = `${normalizeBaseUrl(process.env.REACT_APP_API_URL)}/ws`;

const usePriceStream = (tickers, onPrice, token) => {
    const normalizedTickers = useMemo(() => {
        if (!Array.isArray(tickers)) return [];
        return tickers
            .filter(Boolean)
            .map((t) => String(t).toUpperCase());
    }, [tickers]);

    const clientRef = useRef(null);

    useEffect(() => {
        if (!normalizedTickers.length || typeof onPrice !== "function") {
            return undefined;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_BASE),
            reconnectDelay: 5000,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            debug: () => {},
        });

        client.onConnect = () => {
            normalizedTickers.forEach((ticker) => {
                client.subscribe(`/topic/stocks/${ticker}`, (message) => {
                    try {
                        const body = JSON.parse(message?.body || "{}");
                        const price = Number(body.price);
                        if (!Number.isFinite(price)) return;
                        const ts = Number(body.timestamp);
                        const timestamp = Number.isFinite(ts) ? ts : Date.now();
                        const payloadTicker = String(body.ticker || ticker).toUpperCase();
                        onPrice(payloadTicker, { price, timestamp });
                    } catch (e) {
                        console.error("Failed to parse price update", e);
                    }
                });
            });
        };

        client.activate();
        clientRef.current = client;

        return () => {
            try {
                client.deactivate();
            } finally {
                clientRef.current = null;
            }
        };
    }, [normalizedTickers, onPrice, token]);
};

export default usePriceStream;
