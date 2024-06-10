import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import {
    ChartCanvas,
    Chart,
    LineSeries,
    AreaSeries,
    BarSeries,
    CandlestickSeries,
    XAxis,
    YAxis,
    CrossHairCursor,
    discontinuousTimeScaleProvider,
    sma,
    ema,
    macd,
    rsi,
    bollingerBand,
    OHLCTooltip,
    MACDSeries,
    RSISeries,
    BollingerSeries,
    MouseCoordinateX,
    MouseCoordinateY,
    EdgeIndicator,
    ZoomButtons,
    lastVisibleItemBasedZoomAnchor,
    CurrentCoordinate,
    MovingAverageTooltip,

} from "react-financial-charts";
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import SingleValueTooltip from "./SingleValueTooltip";



const ChartContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 10px;
  max-width: 1300px;
  max-height: 600px;
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FinanceChart = () => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);
    const [chartType, setChartType] = useState("line");
    const [indicators, setIndicators] = useState([]);
    const [interval, setInterval] = useState("1d");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3001/api/finance-chart?interval=${interval}`
                );
                const data = response.data.chart.result[0];
                const candleData = data.timestamp.map((ts, index) => ({
                    date: new Date(ts * 1000),
                    open: data.indicators.quote[0].open[index],
                    high: data.indicators.quote[0].high[index],
                    low: data.indicators.quote[0].low[index],
                    close: data.indicators.quote[0].close[index],
                    volume: data.indicators.quote[0].volume[index],
                }));

                // Calculate indicators
                const sma10 = sma()
                    .options({ windowSize: 10 })
                    .merge((d, c) => {
                        d.sma10 = c;
                    })
                    .accessor((d) => d.sma10);

                const ema30 = ema()
                    .options({ windowSize: 30 })
                    .merge((d, c) => {
                        d.ema30 = c;
                    })
                    .accessor((d) => d.ema30);

                const macdCalc = macd()
                    .options({ fast: 12, slow: 26, signal: 9 })
                    .merge((d, c) => {
                        d.macd = c;
                    })
                    .accessor((d) => d.macd);

                const rsiCalc = rsi()
                    .options({ windowSize: 14 })
                    .merge((d, c) => {
                        d.rsi = c;
                    })
                    .accessor((d) => d.rsi);

                const bollingerCalc = bollingerBand()
                    .options({ windowSize: 20, multiplier: 2 })
                    .merge((d, c) => {
                        d.bb = c;
                    })
                    .accessor((d) => d.bb);

                // Apply indicators to data
                sma10(candleData);
                ema30(candleData);
                macdCalc(candleData);
                rsiCalc(candleData);
                bollingerCalc(candleData);

                setChartData(candleData);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, [chartType, indicators, interval]);

    const handleChartTypeChange = (event) => {
        setChartType(event.target.value);
    };

    const handleIndicatorsChange = (event) => {
        const selectedIndicators = Array.from(
            event.target.selectedOptions,
            (option) => option.value
        );
        setIndicators(selectedIndicators);
    };

    const handleIntervalChange = (event) => {
        setInterval(event.target.value);
    };

    const renderIndicators = () => {
        return indicators.map((indicator) => {
            switch (indicator) {
                case "RSI":
                    return (
                        <Chart
                            key="rsi"
                            id="rsi"
                            yExtents={[0, 100]}
                            height={150}
                            origin={(w, h) => [0, h - 300]}
                        >
                            <YAxis axisAt="right" orient="right" ticks={2} />
                            <RSISeries yAccessor={(d) => d.rsi} />
                        </Chart>
                    );
                case "MACD":
                    return (
                        <Chart
                            key="macd"
                            id="macd"
                            yExtents={(d) => d.macd}
                            height={150}
                            origin={(w, h) => [0, h - 450]}
                        >
                            <YAxis axisAt="right" orient="right" ticks={2} />
                            <MACDSeries yAccessor={(d) => d.macd} />
                        </Chart>
                    );
                case "BollingerBands":
                    return (
                        <Chart
                            key="bollinger"
                            id="bollinger"
                            yExtents={(d) => [
                                d.bb ? d.bb.top : undefined,
                                d.bb ? d.bb.bottom : undefined,
                            ]}
                        >
                            <BollingerSeries
                                yAccessor={(d) => d.bb}
                                strokeStyle={{
                                    top: "purple",
                                    middle: "purple",
                                    bottom: "purple",
                                }}
                            />
                        </Chart>
                    );
                case "MovingAverage":
                    return (
                        <Chart
                            key="movingAverage"
                            id="movingAverage"
                            yExtents={(d) => [d.high, d.low]}
                        >
                            <LineSeries yAccessor={(d) => d.close} stroke="#ff7f0e" />
                            <LineSeries yAccessor={(d) => d.sma10} stroke="#1f77b4" />
                            <LineSeries yAccessor={(d) => d.ema30} stroke="#2ca02c" />
                        </Chart>
                    );
                default:
                    return null;
            }
        });
    };

    const renderChart = () => {
        if (!chartData) return null;

        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
            (d) => d.date
        );
        const { data, xScale, xAccessor, displayXAccessor } =
            xScaleProvider(chartData);
        const xExtents = [xAccessor(data[data.length - 1]), xAccessor(data[0])];

        return (
            <ChartCanvas
                height={400}
                width={1300}
                ratio={1}
                margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
                seriesName="AAPL"
                data={data}
                xScale={xScale}
                xAccessor={xAccessor}
                displayXAccessor={displayXAccessor}
                xExtents={xExtents}
                zoomAnchor={lastVisibleItemBasedZoomAnchor}
            >
                <Chart id={1} yExtents={(d) => [d.high, d.low]}>
                    <XAxis axisAt="bottom" orient="bottom" />
                    <YAxis axisAt="left" orient="left" ticks={5} />
                    {chartType === "line" && <LineSeries yAccessor={(d) => d.close} />}
                    {chartType === "area" && <AreaSeries yAccessor={(d) => d.close} />}
                    {chartType === "bar" && <BarSeries yAccessor={(d) => d.close} />}
                    {chartType === "candle" && <CandlestickSeries />}
                    {chartType === "hollowCandle" && (
                        <CandlestickSeries
                            wickStroke={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                            fill={(d) => (d.close > d.open ? "none" : "#FF0000")}
                            stroke={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                        />
                    )}
                    {chartType === "coloredBar" && (
                        <CandlestickSeries
                            wickStroke={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                            fill={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                            stroke={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                        />
                    )}
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}
                    />
                    <MouseCoordinateY
                        at="left"
                        orient="left"
                        displayFormat={format(".2f")}
                    />
                    <EdgeIndicator
                        itemType="last"
                        orient="right"
                        edgeAt="right"
                        yAccessor={(d) => d.close}
                        fill={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                    />
                    <CurrentCoordinate yAccessor={(d) => d.close} fill="#ff7f0e" />
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}
                    />
                    <MouseCoordinateY
                        at="left"
                        orient="left"
                        displayFormat={format(".2f")}
                    />
                    <OHLCTooltip origin={[-40, 0]} />
                    <MovingAverageTooltip
                        origin={[-38, 15]}
                        options={[
                            {
                                yAccessor: (d) => d.sma10,
                                type: "SMA",
                                stroke: "#1f77b4",
                                windowSize: 10,
                            },
                            {
                                yAccessor: (d) => d.ema30,
                                type: "EMA",
                                stroke: "#2ca02c",
                                windowSize: 30,
                            },
                        ]}
                    />
                    <SingleValueTooltip
                        forSeries={data[data.length - 1]}
                        label="OHL Values"
                        origin={[10, 10]}
                    />
                    <ZoomButtons onReset={() => console.log("zoom reset")} />
                </Chart>
                {renderIndicators()}
                <CrossHairCursor />
            </ChartCanvas>
        );
    };


    return (
        <ChartContainer>
            <a href="/table">table</a>
            <h2>AAPL Stock Price Chart</h2>
            <ControlPanel>
                <div>
                    <label htmlFor="chartType">Select Chart Type: </label>
                    <select
                        id="chartType"
                        value={chartType}
                        onChange={handleChartTypeChange}
                    >
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="area">Area</option>
                        <option value="candle">Candle</option>
                        <option value="hollowCandle">Hollow Candle</option>
                        <option value="coloredBar">Colored Bar</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="indicators">Select Indicators: </label>
                    <select
                        id="indicators"
                        multiple={true}
                        value={indicators}
                        onChange={handleIndicatorsChange}
                    >
                        <option value="RSI">RSI</option>
                        <option value="MACD">MACD</option>
                        <option value="BollingerBands">Bollinger Bands</option>
                        <option value="MovingAverage">Moving Average</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="interval">Select Time Interval: </label>
                    <select
                        id="interval"
                        value={interval}
                        onChange={handleIntervalChange}
                    >
                        <option value="1m">1 Minute</option>
                        <option value="5m">5 Minutes</option>
                        <option value="15m">15 Minutes</option>
                        <option value="30m">30 Minutes</option>
                        <option value="1h">1 Hour</option>
                        <option value="1d">1 Day</option>
                        <option value="1w">1 Week</option>
                        <option value="1mo">1 Month</option>
                        <option value="1y">1 Year</option>
                    </select>
                </div>
            </ControlPanel>
            {error ? (
                <div style={{ color: "red" }}>Error fetching data: {error}</div>
            ) : (
                renderChart()
            )}
        </ChartContainer>
    );
};

export default FinanceChart;
