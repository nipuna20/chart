import React, { useEffect, useRef, memo, useState } from "react";
import "./style.css";

function TradingViewWidget() {
    const container = useRef(null);
    const [yahooData, setYahooData] = useState(null);

    useEffect(() => {
        // Fetch Yahoo Finance data
        fetch("http://localhost:3001/api/finance-chart")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                setYahooData(data);
                console.log("Yahoo Finance data fetched:", data);
            })
            .catch((error) => {
                console.error("Error fetching Yahoo Finance data:", error);
            });

        // Load TradingView widget script
        if (container.current) {
            const script = document.createElement("script");
            script.src =
                "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.onload = () => {
                console.log("TradingView widget script loaded successfully.");
            };
            script.onerror = (error) => {
                console.error("Error loading TradingView widget script:", error);
            };
            script.textContent = JSON.stringify({
                autosize: true,
                symbol: "NASDAQ:AAPL",
                timezone: "Etc/UTC",
                theme: "dark",
                style: "1",
                locale: "en",
                withdateranges: true,
                range: "YTD",
                hide_side_toolbar: false,
                allow_symbol_change: true,
                details: true,
                hotlist: true,
                calendar: true,
                show_popup_button: true,
                popup_width: "1000",
                popup_height: "650",
                support_host: "https://www.tradingview.com",
            });

            container.current.appendChild(script);

            return () => {
                if (container.current) {
                    container.current.innerHTML = "";
                }
            };
        }
    }, []);

    return (
        <div
            className="tradingview-widget-container"
            ref={container}
            style={{ height: "100%", width: "100%" }}
        >
            <div
                className="tradingview-widget-container__widget"
                style={{ height: "calc(100% - 32px)", width: "100%" }}
            ></div>
            <div className="tradingview-widget-copyright">
                <a
                    href="https://www.tradingview.com/"
                    rel="noopener nofollow"
                    target="_blank"
                >
                    <span className="blue-text">Track all markets on TradingView</span>
                </a>
            </div>
        </div>
    );
}


export default memo(TradingViewWidget);
