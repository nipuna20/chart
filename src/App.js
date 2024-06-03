import React from 'react';
import YahooFinanceChart from './Components/YahooFinanceChart';
import HorizontalData from './Components/HorizontalData';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Price Chart</h1>
        <YahooFinanceChart />
        <HorizontalData />
      </header>
    </div>
  );
}

export default App;
