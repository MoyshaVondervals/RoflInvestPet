import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import "../styles/StockCharts.css";

/**
 * Пропсы:
 * - data: [{ timestamp: number | string | Date, price: number }]
 * - height?: number (по умолчанию 380)
 * - initialTimeframe?: "1m" | "5m" | "1h" | "4h" | "1d" | "1w" | "1M"
 * - theme?: "light" | "dark" (по умолчанию "light")
 * - locale?: BCP47 строка локали (напр. "ru-RU"), по умолчанию "ru-RU"
 * - title?: string (заголовок над графиком)
 * - logo?: string (base64 png без префикса data:)
 */
export default function StockChart({
                                       data,
                                       height = 380,
                                       initialTimeframe = "1h",
                                       theme = "light",
                                       locale = "ru-RU",
                                       title = "График цены",
                                       logo = ""
                                   }) {
    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const tooltipRef = useRef(null);
    const resizeObserverRef = useRef(null);

    const [timeframe, setTimeframe] = useState(initialTimeframe);
    const [containerWidth, setContainerWidth] = useState(0);

    const palette = useMemo(() => {
        const sberGreen = "#21A038";
        const sberGreenDark = "#0E7C3A";
        const positive = sberGreen;
        const negative = "#D64545";
        const textLight = "#0D0D0E";
        const textDark = "#ECEFF3";
        const gridLight = "#E6EBF2";
        const gridDark = "#374151";
        return theme === "dark"
            ? {
                bg: "#0F1115",
                text: textDark,
                grid: gridDark,
                line: positive,
                areaTop: "rgba(33,160,56,0.25)",
                areaBottom: "rgba(33,160,56,0.02)",
                btnBg: "#151922",
                btnBgActive: "#1E2633",
                btnText: textDark,
                btnAccent: sberGreenDark,
                border: "#1F2937",
                crosshair: "#96F2A2",
                negative
            }
            : {
                bg: "#FFFFFF",
                text: textLight,
                grid: gridLight,
                line: positive,
                areaTop: "rgba(33,160,56,0.25)",
                areaBottom: "rgba(33,160,56,0.02)",
                btnBg: "#F2F5F7",
                btnBgActive: "#E6EEF0",
                btnText: textLight,
                btnAccent: sberGreen,
                border: "#E6EBF2",
                crosshair: "#0E7C3A",
                negative
            };
    }, [theme]);

    // Нормализация входных данных
    const normalizedData = useMemo(() => {
        const toMs = (t) => {
            if (typeof t === "number") return t;
            if (t instanceof Date) return t.getTime();
            return new Date(t).getTime();
        };
        const arr = (Array.isArray(data) ? data : [])
            .map((d) => ({ ts: toMs(d.timestamp), price: Number(d.price) }))
            .filter((d) => Number.isFinite(d.ts) && Number.isFinite(d.price))
            .sort((a, b) => a.ts - b.ts);
        return arr;
    }, [data]);

    const timeframeToMs = useCallback((tf) => {
        const M = 60_000;
        const H = 60 * M;
        const D = 24 * H;
        switch (tf) {
            case "1m": return 1 * M;
            case "5m": return 5 * M;
            case "1h": return 1 * H;
            case "4h": return 4 * H;
            case "1d": return 1 * D;
            case "1w": return 7 * D;
            case "1M": return 30 * D;
            default:   return 1 * H;
        }
    }, []);

    // Агрегация по таймфрейму (last в бакете)
    const aggregateByInterval = useCallback((arr, intervalMs) => {
        if (arr.length === 0) return [];
        const buckets = new Map();
        for (const point of arr) {
            const bucketKey = Math.floor(point.ts / intervalMs) * intervalMs;
            buckets.set(bucketKey, point); // last
        }
        return Array.from(buckets.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([bucketTs, p]) => ({
                time: Math.floor(bucketTs / 1000),
                value: p.price,
                _ts: bucketTs
            }));
    }, []);

    // Десемплинг под ширину
    const downsampleToPixelBudget = useCallback((points, pxWidth) => {
        const minPoints = 60;
        const targetPerPx = 0.7;
        const targetCount = Math.max(minPoints, Math.floor(pxWidth * targetPerPx));
        if (points.length <= targetCount) return points;

        const step = Math.ceil(points.length / targetCount);
        const out = [];
        for (let i = 0; i < points.length; i += step) out.push(points[i]);
        if (out[out.length - 1] !== points[points.length - 1]) out.push(points[points.length - 1]);
        return out;
    }, []);

    // Подготовка данных под текущую ширину и ТФ
    const prepared = useMemo(() => {
        const intervalMs = timeframeToMs(timeframe);
        const aggregated = aggregateByInterval(normalizedData, intervalMs);
        return downsampleToPixelBudget(aggregated, Math.max(containerWidth, 320));
    }, [normalizedData, timeframe, timeframeToMs, aggregateByInterval, downsampleToPixelBudget, containerWidth]);

    // Форматтеры
    const dtfDate = useMemo(
        () => new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit" }),
        [locale]
    );
    const dtfDateTime = useMemo(
        () => new Intl.DateTimeFormat(locale, { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
        [locale]
    );
    const nf = useMemo(
        () => new Intl.NumberFormat(locale, { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 6 }),
        [locale]
    );

    // Инициализация графика
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (!tooltipRef.current) {
            const tip = document.createElement("div");
            tip.className = "sc-tooltip";
            container.appendChild(tip);
            tooltipRef.current = tip;
        }

        const chart = createChart(container, {
            autoSize: false,
            width: container.clientWidth,
            height,
            layout: {
                background: { color: palette.bg },
                textColor: palette.text,
                fontSize: 12,
                fontFamily: "Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            },
            rightPriceScale: {
                borderColor: palette.border,
                scaleMargins: { top: 0.15, bottom: 0.15 }
            },
            timeScale: {
                borderColor: palette.border,
                fixLeftEdge: false,
                fixRightEdge: false,
                rightOffset: 8,
                timeVisible: ["1m", "5m", "1h", "4h"].includes(timeframe),
                secondsVisible: false,
                barSpacing: 6
            },
            grid: {
                vertLines: { color: palette.grid },
                horzLines: { color: palette.grid }
            },
            crosshair: {
                mode: CrosshairMode.Magnet,
                vertLine: {
                    color: palette.crosshair,
                    labelBackgroundColor: palette.crosshair,
                    width: 1,
                    style: 0
                },
                horzLine: {
                    color: palette.crosshair,
                    labelBackgroundColor: palette.crosshair,
                    width: 1,
                    style: 0
                }
            },
            handleScroll: true,
            handleScale: true
        });

        const series = chart.addAreaSeries({
            lineColor: palette.line,
            topColor: palette.areaTop,
            bottomColor: palette.areaBottom,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            crosshairMarkerVisible: true
        });

        chartRef.current = chart;
        seriesRef.current = series;

        // Tooltip
        const tip = tooltipRef.current;
        const updateTip = (param) => {
            if (!param || !param.time || !tip) {
                tip.style.display = "none";
                return;
            }
            const price = param.seriesData.get(series);
            if (!price || typeof price.value !== "number") {
                tip.style.display = "none";
                return;
            }
            const ms = Number(param.time) * 1000;
            const label = ["1m", "5m", "1h", "4h"].includes(timeframe) ? dtfDateTime.format(ms) : dtfDate.format(ms);
            tip.innerHTML = `
        <div class="sc-tip-row"><span>${label}</span></div>
        <div class="sc-tip-row sc-tip-price">${nf.format(price.value)}</div>
      `;
            const rect = container.getBoundingClientRect();
            const x = param.point?.x ?? 0;
            const y = param.point?.y ?? 0;
            const left = Math.min(Math.max(8, x + 12), rect.width - 140);
            const top = Math.min(Math.max(8, y - 10), rect.height - 48);
            tip.style.display = "block";
            tip.style.left = `${left}px`;
            tip.style.top = `${top}px`;
        };

        chart.subscribeCrosshairMove(updateTip);

        // Resize
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = Math.floor(entry.contentRect.width);
                chart.applyOptions({ width: w, height });
                setContainerWidth(w);
            }
            chart.timeScale().scrollToRealTime();
        });
        ro.observe(container);
        resizeObserverRef.current = ro;

        return () => {
            chart.unsubscribeCrosshairMove(updateTip);
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
            if (tooltipRef.current) {
                tooltipRef.current.remove();
                tooltipRef.current = null;
            }
        };
    }, [height, palette.bg, palette.text, palette.grid, palette.border, palette.crosshair, palette.line, palette.areaTop, palette.areaBottom, timeframe]); // форматтеры не включаем, чтобы не пересоздавать по локали

    // Обновление данных серии
    useEffect(() => {
        if (seriesRef.current) {
            seriesRef.current.setData(prepared);
            chartRef.current?.timeScale().fitContent();
        }
    }, [prepared]);

    // ---------- ЗУМ ----------
    const zoomBy = useCallback((ratio) => {
        const ts = chartRef.current?.timeScale();
        if (!ts) return;
        const lr = ts.getVisibleLogicalRange();
        if (!lr || lr.from == null || lr.to == null) return;

        const from = Number(lr.from);
        const to = Number(lr.to);
        const cx = (from + to) / 2;
        const half = (to - from) / 2;

        const minHalf = 2;
        let newHalf = half * ratio;
        if (newHalf < minHalf) newHalf = minHalf;

        ts.setVisibleLogicalRange({ from: cx - newHalf, to: cx + newHalf });
    }, []);

    const handleFit = useCallback(() => {
        chartRef.current?.timeScale().fitContent();
    }, []);

    const handleZoomIn = useCallback(() => {
        zoomBy(0.8);
    }, [zoomBy]);

    const handleZoomOut = useCallback(() => {
        zoomBy(1.25);
    }, [zoomBy]);

    // Клавиши +/- для зума
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onKey = (e) => {
            if (e.key === "+" || e.key === "=") {
                handleZoomIn();
            } else if (e.key === "-" || e.key === "_") {
                handleZoomOut();
            }
        };
        el.addEventListener("keydown", onKey);
        return () => el.removeEventListener("keydown", onKey);
    }, [handleZoomIn, handleZoomOut]);

    const tfButtons = [
        { key: "1m", label: "1м" },
        { key: "5m", label: "5м" },
        { key: "1h", label: "1ч" },
        { key: "4h", label: "4ч" },
        { key: "1d", label: "День" },
        { key: "1w", label: "Неделя" },
        { key: "1M", label: "Месяц" }
    ];

    return (
        <div className={`sc-card ${theme === "dark" ? "sc-dark" : "sc-light"}`}>
            <div className="sc-header">
                <div className="sc-title">
                    {logo ? (
                        <img
                            src={`data:image/png;base64,${logo}`}
                            alt="Logo"
                            style={{ width: "50px", height: "50px", objectFit: "contain", marginRight: 8 }}
                            className="stock-logo"
                        />
                    ) : null}
                    {title}
                </div>
                <div className="sc-toolbar">
                    <div className="sc-tf-group" role="tablist" aria-label="Таймфрейм">
                        {tfButtons.map((b) => (
                            <button
                                key={b.key}
                                className={`sc-btn sc-btn-tf ${timeframe === b.key ? "active" : ""}`}
                                onClick={() => setTimeframe(b.key)}
                                type="button"
                            >
                                {b.label}
                            </button>
                        ))}
                    </div>
                    <div className="sc-zoom-group">
                        <button className="sc-btn" type="button" onClick={handleZoomOut} aria-label="Отдалить">–</button>
                        <button className="sc-btn" type="button" onClick={handleZoomIn} aria-label="Приблизить">+</button>
                        <button className="sc-btn sc-btn-accent" type="button" onClick={handleFit} aria-label="Сброс">Сброс</button>
                    </div>
                </div>
            </div>

            <div
                className="sc-chart-wrap"
                ref={containerRef}
                tabIndex={0}
                aria-label="Интерактивный график цены"
            />

            <div className="sc-footer">
                <span className="sc-foot-label">Последняя цена:</span>
                <span className="sc-foot-value">
          {prepared.length ? nf.format(prepared[prepared.length - 1].value) : "—"}
        </span>
            </div>
        </div>
    );
}
