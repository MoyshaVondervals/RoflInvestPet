import React, { useState } from "react";
import "../../styles/NewsPage.css";



const newsData = [
    { id: 1, title: "Акции Сбера выросли на 3%", content: "Сегодня акции Сбербанка показали рост на 3% благодаря позитивным прогнозам аналитиков...", date: "21.08.2025" },
    { id: 2, title: "Индекс МосБиржи обновил рекорд", content: "Индекс Московской биржи достиг нового исторического максимума, превысив отметку 3400 пунктов...", date: "20.08.2025" },
    { id: 3, title: "Курс рубля укрепился", content: "На фоне повышения цен на нефть курс рубля окреп по отношению к доллару и евро...", date: "19.08.2025" },
    { id: 4, title: "Инвесторы ожидают заседание ЦБ", content: "На следующей неделе состоится заседание Банка России, где будет обсуждаться ключевая ставка...", date: "18.08.2025" },
    { id: 5, title: "Tesla показала рекордную прибыль", content: "Американская компания Tesla опубликовала отчёт, превысивший ожидания инвесторов...", date: "17.08.2025" },
    { id: 6, title: "Apple анонсировала новые продукты", content: "На презентации в Купертино Apple представила обновлённые версии iPhone и MacBook...", date: "16.08.2025" },
    { id: 7, title: "Сбер запускает новый сервис для инвесторов", content: "Компания Сбер представила инновационный сервис для анализа инвестиционных портфелей...", date: "15.08.2025" },
    { id: 8, title: "Нефть подорожала на мировых рынках", content: "Стоимость нефти марки Brent выросла на 2% после новостей о сокращении добычи...", date: "14.08.2025" },
    { id: 9, title: "Рынок недвижимости стабилизировался", content: "Аналитики отмечают замедление роста цен на недвижимость и стабилизацию рынка...", date: "13.08.2025" },
    { id: 10, title: "Криптовалюты снова в плюсе", content: "Биткойн и Ethereum демонстрируют рост на фоне повышенного интереса инвесторов...", date: "12.08.2025" }
];

export default function NewsPage() {
    const [selectedNews, setSelectedNews] = useState(null);

    return (
        <div className="news-page">
            <h1 className="news-title">Финансовые новости</h1>

            <div className="news-list">
                {newsData.map((news) => (
                    <div
                        key={news.id}
                        className="news-card-container"
                        onClick={() => setSelectedNews(news)}
                    >
                        <div className="news-card">
                            <h2 className="news-card-title">{news.title}</h2>
                            <p className="news-date">от {news.date}</p>
                            <p className="news-card-text">{news.content}</p>
                        </div>
                    </div>
                ))}
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
