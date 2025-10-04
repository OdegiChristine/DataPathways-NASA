// src/pages/WaterPollution.jsx
import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WaterPollution = () => {
  const [selectedPollutant, setSelectedPollutant] = useState('nitrates');
  const [selectedRiver, setSelectedRiver] = useState('nairobi');

  const rivers = [
    { id: 'nairobi', name: 'Nairobi River' },
    { id: 'ngong', name: 'Ngong River' },
    { id: 'athi', name: 'Athi River' },
  ];

  const pollutants = [
    { id: 'nitrates', name: 'Nitrates', unit: 'mg/L', guideline: 10 },
    { id: 'lead', name: 'Lead', unit: 'ppb', guideline: 10 },
    { id: 'phosphate', name: 'Phosphate', unit: 'mg/L', guideline: 0.1 },
    { id: 'BOD', name: 'BOD', unit: 'mg/L', guideline: 5 },
  ];

  const sampleData = [
    { location: 'Industrial Area', nitrates: 12.4, lead: 8.2, phosphate: 0.8, BOD: 12.5 },
    { location: 'CBD Outflow', nitrates: 8.7, lead: 5.1, phosphate: 0.5, BOD: 8.2 },
    { location: 'Kibera', nitrates: 15.2, lead: 12.8, phosphate: 1.2, BOD: 18.4 },
    { location: 'Ruai', nitrates: 6.8, lead: 3.2, phosphate: 0.3, BOD: 6.1 },
  ];

  const wqiTrendData = [
    { month: 'Jan', nairobi: 65, ngong: 72, athi: 78 },
    { month: 'Feb', nairobi: 62, ngong: 70, athi: 76 },
    { month: 'Mar', nairobi: 58, ngong: 68, athi: 74 },
    { month: 'Apr', nairobi: 55, ngong: 65, athi: 72 },
    { month: 'May', nairobi: 52, ngong: 63, athi: 70 },
    { month: 'Jun', nairobi: 48, ngong: 60, athi: 68 },
    { month: 'Jul', nairobi: 45, ngong: 58, athi: 65 },
    { month: 'Aug', nairobi: 42, ngong: 55, athi: 63 },
    { month: 'Sep', nairobi: 45, ngong: 58, athi: 65 },
    { month: 'Oct', nairobi: 48, ngong: 62, athi: 68 },
    { month: 'Nov', nairobi: 52, ngong: 65, athi: 72 },
    { month: 'Dec', nairobi: 55, ngong: 68, athi: 74 },
  ];

  const insight = `Nairobi River near Industrial Area shows elevated nitrate concentrations (12.4 mg/L) exceeding recommended levels. Kibera sampling points indicate combined sewage and solid waste impacts with BOD levels at 18.4 mg/L. Recommend upstream industrial discharge tracing and weekly monitoring near informal settlements to identify contamination sources.`;

  const isExceedingGuideline = (value, pollutantId) => {
    const pollutant = pollutants.find(p => p.id === pollutantId);
    return value > pollutant.guideline;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Side Panel */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Water Quality Controls</h2>
        
        {/* River Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">River System</label>
          <select
            value={selectedRiver}
            onChange={(e) => setSelectedRiver(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {rivers.map(river => (
              <option key={river.id} value={river.id}>{river.name}</option>
            ))}
          </select>
        </div>

        {/* Pollutant Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pollutant Focus</label>
          <select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {pollutants.map(pollutant => (
              <option key={pollutant.id} value={pollutant.id}>{pollutant.name}</option>
            ))}
          </select>
        </div>

        {/* Guideline Information */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Water Quality Guideline</h4>
          <p className="text-sm text-blue-700">
            {pollutants.find(p => p.id === selectedPollutant)?.name}: {pollutants.find(p => p.id === selectedPollutant)?.guideline} {pollutants.find(p => p.id === selectedPollutant)?.unit}
          </p>
        </div>

        {/* Critical Sites */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Critical Monitoring Sites</h3>
          <div className="space-y-3">
            {sampleData.filter(site => isExceedingGuideline(site[selectedPollutant], selectedPollutant))
              .map(site => (
              <div key={site.location} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-800 mb-1">{site.location}</div>
                <div className="text-sm text-red-700">
                  {pollutants.find(p => p.id === selectedPollutant)?.name}: {site[selectedPollutant]} {pollutants.find(p => p.id === selectedPollutant)?.unit}
                </div>
                <div className="text-xs text-red-600 mt-1">Exceeds guideline</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Water Pollution Trends</h1>
          <p className="text-gray-600">River quality monitoring and contamination pattern analysis</p>
        </div>

        {/* Map and Charts Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Map Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">River Network & Sampling Points</h3>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-lg mb-2">Interactive River Map</div>
                <div className="text-sm">Showing {rivers.find(r => r.id === selectedRiver)?.name} system</div>
                <div className="mt-2 text-xs">Sample points colored by {selectedPollutant} levels</div>
              </div>
            </div>
          </div>

          {/* Pollutant Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {pollutants.find(p => p.id === selectedPollutant)?.name} Concentrations by Location
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="location" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey={selectedPollutant} 
                  fill="#1a9850" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WQI Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Quality Index Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={wqiTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="nairobi" stroke="#1a9850" strokeWidth={2} name="Nairobi River" />
              <Line type="monotone" dataKey="ngong" stroke="#fdae61" strokeWidth={2} name="Ngong River" />
              <Line type="monotone" dataKey="athi" stroke="#d73027" strokeWidth={2} name="Athi River" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Insight Box */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pollution Insights & Recommendations</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{insight}</p>
          </div>
          <div className="mt-4 flex space-x-4">
            <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
              Export Water Quality Data
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
              Generate Monitoring Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterPollution;