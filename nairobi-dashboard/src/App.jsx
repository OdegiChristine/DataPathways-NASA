// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import SettlementGrowth from './pages/SettlementGrowth';
import WhyTheseAreas from './pages/WhyTheseAreas';
import AirPollution from './pages/AirPollution';
import WaterPollution from './pages/WaterPollution';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard/settlement-growth" element={<SettlementGrowth />} />
          <Route path="/dashboard/why-these-areas" element={<WhyTheseAreas />} />
          <Route path="/dashboard/air-pollution" element={<AirPollution />} />
          <Route path="/dashboard/water-pollution" element={<WaterPollution />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;