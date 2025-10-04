// src/pages/AirPollution.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AirPollution = () => {
  const [selectedPollutant, setSelectedPollutant] = useState('PM2.5');
  const [timeRange, setTimeRange] = useState('12months');

  const pollutants = ['PM2.5', 'NO₂', 'CO', 'O₃'];
  
  const timeSeriesData = [
    { date: 'Jan', PM2_5: 45, NO2: 32, CO: 1.2, O3: 28 },
    { date: 'Feb', PM2_5: 52, NO2: 35, CO: 1.4, O3: 26 },
    { date: 'Mar', PM2_5: 48, NO2: 38, CO: 1.3, O3: 29 },
    { date: 'Apr', PM2_5: 65, NO2: 42, CO: 1.6, O3: 25 },
    { date: 'May', PM2_5: 78, NO2: 48, CO: 1.8, O3: 23 },
    { date: 'Jun', PM2_5: 82, NO2: 52, CO: 2.1, O3: 22 },
    { date: 'Jul', PM2_5: 75, NO2: 45, CO: 1.9, O3: 24 },
    { date: 'Aug', PM2_5: 68, NO2: 40, CO: 1.7, O3: 26 },
    { date: 'Sep', PM2_5: 58, NO2: 36, CO: 1.5, O3: 27 },
    { date: 'Oct', PM2_5: 52, NO2: 34, CO: 1.4, O3: 28 },
    { date: 'Nov', PM2_5: 48, NO2: 33, CO: 1.3, O3: 29 },
    { date: 'Dec', PM2_5: 42, NO2: 30, CO: 1.2, O3: 30 },
  ];

  const hotspots = [
    { location: 'Industrial Area', value: 78, trend: 'rising', advisory: 'Unhealthy' },
    { location: 'CBD', value: 65, trend: 'stable', advisory: 'Unhealthy for Sensitive' },
    { location: 'Eastleigh', value: 58, trend: 'rising', advisory: 'Moderate' },
    { location: 'Kibera', value: 52, trend: 'stable', advisory: 'Moderate' },
    { location: 'Westlands', value: 45, trend: 'falling', advisory: 'Moderate' },
  ];

  const getAdvisoryColor = (advisory) => {
    switch (advisory) {
      case 'Unhealthy': return 'bg-red-100 text-red-800';
      case 'Unhealthy for Sensitive': return 'bg-orange-100 text-orange-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Side Panel */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Air Quality Controls</h2>
        
        {/* Pollutant Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pollutant</label>
          <select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {pollutants.map(pollutant => (
              <option key={pollutant} value={pollutant}>{pollutant}</option>
            ))}
          </select>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="2years">Last 2 Years</option>
          </select>
        </div>

        {/* Hotspots List */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top 5 Pollution Hotspots</h3>
          <div className="space-y-3">
            {hotspots.map((spot, index) => (
              <div key={spot.location} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-800">{spot.location}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getAdvisoryColor(spot.advisory)}`}>
                    {spot.advisory}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{selectedPollutant}: {spot.value} μg/m³</span>
                  <span className={`text-xs ${
                    spot.trend === 'rising' ? 'text-red-600' : 
                    spot.trend === 'falling' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {spot.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Advisory */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Health Advisory</h4>
          <p className="text-sm text-yellow-700">
            PM2.5 levels in Industrial Area exceed WHO guidelines. Sensitive groups should limit outdoor activities.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Air Pollution Trends</h1>
          <p className="text-gray-600">Real-time monitoring and historical analysis of air quality across Nairobi</p>
        </div>

        {/* Map Placeholder */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">Air Quality Heatmap</div>
              <div className="text-sm">Interactive map showing {selectedPollutant} concentrations</div>
              <div className="mt-4 flex justify-center space-x-4">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <div className="w-4 h-4 bg-red-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="h-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedPollutant} Trends - Last 12 Months
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'μg/m³', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedPollutant === 'PM2.5' ? 'PM2_5' : selectedPollutant} 
                stroke="#1a9850" 
                strokeWidth={2}
                dot={{ fill: '#1a9850' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AirPollution;