import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart,
  ChartCanvas,
  BarSeries,
  CandlestickSeries,
  XAxis,
  YAxis,
  CrossHairCursor,
  LineSeries,
  MACDSeries,
  RSISeries,
  BollingerSeries,
  discontinuousTimeScaleProvider,
  sma,
  ema,
  macd,
  rsi,
  bollingerBand,
  OHLCTooltip,
} from "react-financial-charts";
import { scaleTime } from "d3-scale";
import * as d3 from "d3";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  BarElement
);

const ChartContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FinanceChart = () => {
  const [chartData, setChartData] = useState(null);
  const [candlestickData, setCandlestickData] = useState(null);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("line");
  const [indicators, setIndicators] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/finance-chart"
        );
        const data = response.data.chart.result[0];
        const timestamps = data.timestamp.map((ts) =>
          new Date(ts * 1000).toLocaleDateString()
        );
        const prices = data.indicators.quote[0].close;
        const volumes = data.indicators.quote[0].volume;

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

        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: "AAPL Stock Price",
              data: prices,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              fill: chartType === "area",
              yAxisID: "y-axis-1",
              type:
                chartType === "line" || chartType === "area" ? "line" : "bar",
            },
            {
              label: "Volume",
              data: volumes,
              backgroundColor: "rgba(75,192,192,0.2)",
              yAxisID: "y-axis-2",
              type: "bar",
            },
          ],
        });

        setCandlestickData(candleData);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, [chartType, indicators]); // Add chartType and indicators as dependencies to useEffect

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

    const commonOptions = {
      scales: {
        x: {
          type: "category",
          position: "bottom",
        },
        y: {
          beginAtZero: true,
        },
      },
    };

    switch (chartType) {
      case "line":
        return <Line data={chartData} options={commonOptions} />;
      case "bar":
        return <Bar data={chartData} options={commonOptions} />;
      case "area":
        return (
          <Line
            data={{
              ...chartData,
              datasets: chartData.datasets.map((dataset) => ({
                ...dataset,
                fill: true,
              })),
            }}
            options={commonOptions}
          />
        );
      case "candle":
        if (!candlestickData) return <div>Loading...</div>;
        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
          (d) => d.date
        );
        const { data, xScale, xAccessor, displayXAccessor } =
          xScaleProvider(candlestickData);
        const xExtents = [xAccessor(data[data.length - 1]), xAccessor(data[0])];
        return (
          <ChartCanvas
            height={600}
            width={900}
            ratio={1}
            margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
            seriesName="AAPL"
            data={data}
            xScale={xScale}
            xAccessor={xAccessor}
            displayXAccessor={displayXAccessor}
            xExtents={xExtents}
          >
            <Chart id={1} yExtents={(d) => [d.high, d.low]}>
              <XAxis axisAt="bottom" orient="bottom" />
              <YAxis axisAt="left" orient="left" ticks={5} />
              <CandlestickSeries />
              <LineSeries yAccessor={(d) => d.close} />
              <OHLCTooltip origin={[-40, 0]} />
            </Chart>
            <Chart
              id={2}
              yExtents={(d) => d.volume}
              height={150}
              origin={(w, h) => [0, h - 150]}
            >
              <BarSeries yAccessor={(d) => d.volume} />
            </Chart>
            {renderIndicators()}
            <CrossHairCursor />
          </ChartCanvas>
        );
      case "hollowCandle":
        if (!candlestickData) return <div>Loading...</div>;
        const hollowCandleXScaleProvider =
          discontinuousTimeScaleProvider.inputDateAccessor((d) => d.date);
        const {
          data: hollowCandleData,
          xScale: hollowCandleXScale,
          xAccessor: hollowCandleXAccessor,
          displayXAccessor: hollowCandleDisplayXAccessor,
        } = hollowCandleXScaleProvider(candlestickData);
        const hollowCandleXExtents = [
          hollowCandleXAccessor(hollowCandleData[hollowCandleData.length - 1]),
          hollowCandleXAccessor(hollowCandleData[0]),
        ];
        return (
          <ChartCanvas
            height={600}
            width={900}
            ratio={1}
            margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
            seriesName="AAPL"
            data={hollowCandleData}
            xScale={hollowCandleXScale}
            xAccessor={hollowCandleXAccessor}
            displayXAccessor={hollowCandleDisplayXAccessor}
            xExtents={hollowCandleXExtents}
          >
            <Chart id={1} yExtents={(d) => [d.high, d.low]}>
              <XAxis axisAt="bottom" orient="bottom" />
              <YAxis axisAt="left" orient="left" ticks={5} />
              <CandlestickSeries
                wickStroke={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                fill={(d) => (d.close > d.open ? "none" : "#FF0000")}
                stroke={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
              />
              <LineSeries yAccessor={(d) => d.close} />
              <OHLCTooltip origin={[-40, 0]} />
            </Chart>
            <Chart
              id={2}
              yExtents={(d) => d.volume}
              height={150}
              origin={(w, h) => [0, h - 150]}
            >
              <BarSeries yAccessor={(d) => d.volume} />
            </Chart>
            {renderIndicators()}
            <CrossHairCursor />
          </ChartCanvas>
        );
      case "coloredBar":
        if (!candlestickData) return <div>Loading...</div>;
        const coloredBarXScaleProvider =
          discontinuousTimeScaleProvider.inputDateAccessor((d) => d.date);
        const {
          data: coloredBarData,
          xScale: coloredBarXScale,
          xAccessor: coloredBarXAccessor,
          displayXAccessor: coloredBarDisplayXAccessor,
        } = coloredBarXScaleProvider(candlestickData);
        const coloredBarXExtents = [
          coloredBarXAccessor(coloredBarData[coloredBarData.length - 1]),
          coloredBarXAccessor(coloredBarData[0]),
        ];
        return (
          <ChartCanvas
            height={600}
            width={900}
            ratio={1}
            margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
            seriesName="AAPL"
            data={coloredBarData}
            xScale={coloredBarXScale}
            xAccessor={coloredBarXAccessor}
            displayXAccessor={coloredBarDisplayXAccessor}
            xExtents={coloredBarXExtents}
          >
            <Chart id={1} yExtents={(d) => [d.high, d.low]}>
              <XAxis axisAt="bottom" orient="bottom" />
              <YAxis axisAt="left" orient="left" ticks={5} />
              <CandlestickSeries
                wickStroke={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                fill={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
                stroke={(d) => (d.close > d.open ? "#6BA583" : "#FF0000")}
              />
              <LineSeries yAccessor={(d) => d.close} />
              <OHLCTooltip origin={[-40, 0]} />
            </Chart>
            <Chart
              id={2}
              yExtents={(d) => d.volume}
              height={150}
              origin={(w, h) => [0, h - 150]}
            >
              <BarSeries yAccessor={(d) => d.volume} />
            </Chart>
            {renderIndicators()}
            <CrossHairCursor />
          </ChartCanvas>
        );
      default:
        return null;
    }
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
