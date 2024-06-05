import React from "react";
import YahooFinanceChart from "./Components/YahooFinanceChart";
import HorizontalData from "./Components/HorizontalData";
import styled from "styled-components";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Price Chart</h1>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<YahooFinanceChart />} />
            <Route path="/table" element={<HorizontalData />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
