import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement, BarElement } from 'chart.js'; // Import BarElement

import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement, BarElement); // Register BarElement

const ChartContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const FinanceChart = () => {
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/finance-chart');
                const data = response.data.chart.result[0];
                const timestamps = data.timestamp.map(ts => new Date(ts * 1000).toLocaleDateString());
                const prices = data.indicators.quote[0].close;
                const volumes = data.indicators.quote[0].volume;

                setChartData({
                    labels: timestamps,
                    datasets: [
                        {
                            label: 'AAPL Stock Price',
                            data: prices,
                            type: 'line',
                            borderColor: 'rgba(75,192,192,1)',
                            backgroundColor: 'rgba(75,192,192,0.2)',
                            fill: true,
                            yAxisID: 'y-axis-1',
                        },
                        {
                            label: 'Volume',
                            data: volumes,
                            type: 'bar',
                            backgroundColor: 'rgba(75,192,192,0.2)',
                            yAxisID: 'y-axis-2',
                        },
                    ],
                });
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <ChartContainer>
            <h2>AAPL Stock Price Chart</h2>
            {error ? (
                <div style={{ color: 'red' }}>Error fetching data: {error}</div>
            ) : (
                chartData && (
                    <Line
                        data={chartData}
                        options={{
                            scales: {
                                x: {
                                    type: 'category',
                                    position: 'bottom',
                                },
                                y: {
                                    beginAtZero: true,
                                },
                            },
                        }}
                    />
                )
            )}
        </ChartContainer>
    );
};

export default FinanceChart;
