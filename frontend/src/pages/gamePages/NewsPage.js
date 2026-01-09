import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import "../../styles/NewsPage.css";
import useApiClient from "../../utils/requestController";

const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export default function NewsPage() {
    const api = useApiClient();
    const token = useSelector((state) => state.auth.token);
    const [news, setNews] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null);
    const [error, setError] = useState("");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const loadNews = async () => {
            try {
                const resp = await api.get("/news", {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });
                const items = Array.isArray(resp?.data) ? resp.data : [];
                setNews(items);
            } catch (e) {
                console.error("Failed to load news", e);
                setError(e?.response?.data?.message || e?.message || "Не удалось загрузить новости");
            } finally {
                setLoaded(true);
            }
        };
        loadNews();
    }, [token]);

    const list = useMemo(
        () => (Array.isArray(news) ? news : []).map((n) => ({
            id: n.id,
            title: n.title,
            content: n.text,
            date: fmtDate(n.createdAt)
        })),
        [news]
    );

    return (
        <div className="news-page">
            <h1 className="news-title">Финансовые новости</h1>
            {error ? <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div> : null}

            <div className="news-list">
                {list.length === 0 && loaded ? (
                    <div className="news-card-container">
                        <div className="news-card">
                            <h2 className="news-card-title">Новостей пока нет</h2>
                            <p className="news-card-text">Загляните позже.</p>
                        </div>
                    </div>
                ) : (
                    list.map((item) => (
                        <div
                            key={item.id}
                            className="news-card-container"
                            onClick={() => setSelectedNews(item)}
                        >
                            <div className="news-card">
                                <h2 className="news-card-title">{item.title}</h2>
                                <p className="news-date">от {item.date}</p>
                                <p className="news-card-text">{item.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedNews && (
                <div className="modal-overlay" onClick={() => setSelectedNews(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{selectedNews.title}</h2>
                        <p className="modal-date">от {selectedNews.date}</p>
                        <p className="modal-content">{selectedNews.content}</p>
                        <button className="modal-close" onClick={() => setSelectedNews(null)}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
}
