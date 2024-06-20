import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const TableContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f2f2f2;
  text-align: left;
`;

const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
`;

const HorizontalData = () => {
    const [tableData, setTableData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/finance-chart');
                const data = response.data.chart.result[0];
                const timestamps = data.timestamp.map(ts => new Date(ts * 1000).toLocaleDateString());
                const prices = data.indicators.quote[0].close;
                const volumes = data.indicators.quote[0].volume;
                const opens = data.indicators.quote[0].open;
                const highs = data.indicators.quote[0].high;
                const lows = data.indicators.quote[0].low;

                const combinedData = timestamps.map((timestamp, index) => ({
                    timestamp,
                    price: prices[index].toFixed(3),
                    volume: volumes[index],
                    open: opens[index].toFixed(3),
                    high: highs[index].toFixed(3),
                    low: lows[index].toFixed(3)
                }));

                setTableData(combinedData);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
    }, []);

    return (
        <TableContainer>
            <h2>AAPL Stock Data Table</h2>
            {error ? (
                <div style={{ color: 'red' }}>Error fetching data: {error}</div>
            ) : (
                tableData && (
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>Date</TableHeader>
                                <TableHeader>Stock Price</TableHeader>
                                <TableHeader>Volume</TableHeader>
                                <TableHeader>Open</TableHeader>
                                <TableHeader>High</TableHeader>
                                <TableHeader>Low</TableHeader>
                                <TableHeader>Close</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index}>
                                    <TableCell>{row.timestamp}</TableCell>
                                    <TableCell>{row.price}</TableCell>
                                    <TableCell>{row.volume}</TableCell>
                                    <TableCell>{row.open}</TableCell>
                                    <TableCell>{row.high}</TableCell>
                                    <TableCell>{row.low}</TableCell>
                                    <TableCell>{row.price}</TableCell>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )
            )}
        </TableContainer>
    );
};

export default HorizontalData;
