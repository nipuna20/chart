import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TradingViewWidget from "./Components/TradingViewWidget";
import HorizontalData from "./Components/Historical";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TradingViewWidget />} />
        <Route path="/table" element={<HorizontalData />} />
      </Routes>
    </Router>
  );
}

export default App;

