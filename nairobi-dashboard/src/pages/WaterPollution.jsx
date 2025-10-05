// src/pages/WaterPollution.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom futuristic marker
const createCustomIcon = (color, isCritical = false) => {
  return L.divIcon({
    className: 'custom-water-marker',
    html: `
      <div class="relative">
        ${isCritical ? `
          <div class="absolute inset-0 animate-ping rounded-full ${color} opacity-75"></div>
        ` : ''}
        <div class="relative w-6 h-6 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const WaterHeatmapLayer = ({ points, radius = 25, blur = 20, max = 1.0 }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points.length === 0) return;
    
    const heatmap = L.heatLayer(points, { 
      radius, 
      blur, 
      max, 
      gradient: { 
        0.0: '#3B82F6', 
        0.3: '#06B6D4', 
        0.5: '#10B981', 
        0.7: '#F59E0B', 
        0.9: '#EF4444',
        1.0: '#DC2626' 
      } 
    }).addTo(map);
    
    return () => {
      map.removeLayer(heatmap);
    };
  }, [map, points, radius, blur, max]);
  
  return null;
};

const WaterMapLegend = () => {
  const map = useMap();
  
  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 shadow-2xl');
      div.innerHTML = `
        <h4 class="font-bold text-white text-sm mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CONTAMINATION INTENSITY</h4>
        <div class="space-y-2">
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Low</span></div>
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-cyan-500 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Moderate</span></div>
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">High</span></div>
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-yellow-500 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Very High</span></div>
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-red-600 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Critical</span></div>
        </div>
      `;
      return div;
    };
    
    legend.addTo(map);
    
    return () => {
      legend.remove();
    };
  }, [map]);
  
  return null;
};

const AnimatedWaterBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/10"></div>
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${20 + Math.random() * 15}s`
          }}
        />
      ))}
      {/* Wave patterns */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
    </div>
  );
};

const WaterPollution = () => {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

  const [selectedPollutant, setSelectedPollutant] = useState('nitrates');
  const [selectedRiver, setSelectedRiver] = useState('nairobi');
  const [samplingPoints, setSamplingPoints] = useState([]);
  const [sampleData, setSampleData] = useState([]);
  const [wqiTrendData, setWqiTrendData] = useState([]);
  const [heatPoints, setHeatPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultSampleData = [
    { location: 'Industrial Area', nitrates: 12.4, lead: 8.2, phosphate: 0.8, BOD: 12.5, wqi: 45 },
    { location: 'CBD Outflow', nitrates: 8.7, lead: 5.1, phosphate: 0.5, BOD: 8.2, wqi: 62 },
    { location: 'Kibera', nitrates: 15.2, lead: 12.8, phosphate: 1.2, BOD: 18.4, wqi: 38 },
    { location: 'Ruai', nitrates: 6.8, lead: 3.2, phosphate: 0.3, BOD: 6.1, wqi: 72 },
  ];

  const defaultWqiTrendData = [
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

  const rivers = [
    { id: 'nairobi', name: 'Nairobi River', color: '#10B981' },
    { id: 'ngong', name: 'Ngong River', color: '#F59E0B' },
    { id: 'athi', name: 'Athi River', color: '#EF4444' },
  ];

  const pollutants = [
    { id: 'nitrates', name: 'Nitrates', unit: 'mg/L', guideline: 10, color: '#3B82F6', icon: '🧪' },
    { id: 'lead', name: 'Lead', unit: 'ppb', guideline: 10, color: '#8B5CF6', icon: '⚗️' },
    { id: 'phosphate', name: 'Phosphate', unit: 'mg/L', guideline: 0.1, color: '#06B6D4', icon: '🌊' },
    { id: 'BOD', name: 'BOD', unit: 'mg/L', guideline: 5, color: '#F59E0B', icon: '🦠' },
  ];

  const samplingCoordinates = {
    'Industrial Area': [-1.31, 36.83],
    'CBD Outflow': [-1.286, 36.817],
    'Kibera': [-1.31, 36.78],
    'Ruai': [-1.30, 36.90]
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE}/water/sampling-sites?river=${selectedRiver}`)
      .then(res => res.json())
      .then(data => {
        setSamplingPoints(data.features || []);
        setSampleData(data.features?.map(f => f.properties) || defaultSampleData);
        
        // Generate heatmap points from sample data
        const points = (data.features || defaultSampleData).map(item => {
          const coords = samplingCoordinates[item.properties?.location || item.location];
          const value = item.properties?.[selectedPollutant] || item[selectedPollutant];
          const guideline = pollutants.find(p => p.id === selectedPollutant)?.guideline || 1;
          const intensity = Math.min(value / (guideline * 2), 1.0);
          return [coords[0], coords[1], intensity];
        });
        setHeatPoints(points);
      })
      .catch(() => {
        setSamplingPoints([]);
        setSampleData(defaultSampleData);
        // Generate default heatmap points
        const points = defaultSampleData.map(item => {
          const coords = samplingCoordinates[item.location];
          const value = item[selectedPollutant];
          const guideline = pollutants.find(p => p.id === selectedPollutant)?.guideline || 1;
          const intensity = Math.min(value / (guideline * 2), 1.0);
          return [coords[0], coords[1], intensity];
        });
        setHeatPoints(points);
      })
      .finally(() => setIsLoading(false));
  }, [selectedRiver, selectedPollutant]);

  useEffect(() => {
    fetch(`${API_BASE}/water/wqi-trend`)
      .then(res => res.json())
      .then(setWqiTrendData)
      .catch(() => setWqiTrendData(defaultWqiTrendData));
  }, []);

  const insight = `Nairobi River near Industrial Area shows elevated nitrate concentrations (12.4 mg/L) exceeding recommended levels. Kibera sampling points indicate combined sewage and solid waste impacts with BOD levels at 18.4 mg/L. Recommend upstream industrial discharge tracing and weekly monitoring near informal settlements to identify contamination sources.`;

  const isExceedingGuideline = (value, pollutantId) => {
    const pollutant = pollutants.find(p => p.id === pollutantId);
    return value > pollutant.guideline;
  };

  const getWqiStatus = (wqi) => {
    if (wqi >= 80) return { text: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (wqi >= 60) return { text: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    if (wqi >= 40) return { text: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (wqi >= 20) return { text: 'Poor', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { text: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getPollutantColor = () => {
    return pollutants.find(p => p.id === selectedPollutant)?.color || '#06B6D4';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-x-hidden overflow-y-auto pb-6">
      <AnimatedWaterBackground />
      
      {/* Side Panel - Futuristic Glass Morphism */}
      <div className="w-80 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 p-6 overflow-y-auto relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">💧</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              WATER QUALITY CONTROL
            </h2>
          </div>
          <p className="text-gray-400 text-sm">Advanced river monitoring system</p>
        </div>
        
        {/* River Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">RIVER SYSTEM</label>
          <div className="space-y-2">
            {rivers.map(river => (
              <button
                key={river.id}
                onClick={() => setSelectedRiver(river.id)}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                  selectedRiver === river.id 
                    ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 font-medium">{river.name}</span>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: river.color }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pollutant Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">POLLUTANT FOCUS</label>
          <div className="grid grid-cols-2 gap-2">
            {pollutants.map(pollutant => (
              <button
                key={pollutant.id}
                onClick={() => setSelectedPollutant(pollutant.id)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                  selectedPollutant === pollutant.id 
                    ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{pollutant.icon}</div>
                  <div className="text-xs font-medium text-gray-300">{pollutant.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Guideline Information */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400">📊</span>
            <h4 className="font-semibold text-blue-400">QUALITY GUIDELINE</h4>
          </div>
          <p className="text-blue-300/80 text-sm">
            {pollutants.find(p => p.id === selectedPollutant)?.name}: {pollutants.find(p => p.id === selectedPollutant)?.guideline} {pollutants.find(p => p.id === selectedPollutant)?.unit}
          </p>
        </div>

        {/* Critical Sites */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">CRITICAL SITES</h3>
            <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">ALERT</span>
          </div>
          <div className="space-y-3">
            {sampleData.filter(site => isExceedingGuideline(site[selectedPollutant], selectedPollutant))
              .map((site, index) => (
              <div key={index} className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm group hover:border-red-400/50 transition-all">
                <div className="font-semibold text-red-400 mb-1 group-hover:text-red-300 transition-colors">{site.location}</div>
                <div className="text-sm text-red-300/80">
                  {pollutants.find(p => p.id === selectedPollutant)?.name}: <strong>{site[selectedPollutant]} {pollutants.find(p => p.id === selectedPollutant)?.unit}</strong>
                </div>
                <div className="text-xs text-red-400/60 mt-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  Exceeds guideline
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            RIVER QUALITY INTELLIGENCE
          </h1>
          <p className="text-gray-400">Advanced contamination tracking and water quality analysis</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'WATER QUALITY INDEX', value: '58', trend: 'Poor', color: 'text-yellow-400', status: getWqiStatus(58) },
            { label: 'ACTIVE SENSORS', value: '16', trend: 'Online', color: 'text-green-400' },
            { label: 'CRITICAL SITES', value: '3', trend: 'Alert', color: 'text-red-400' },
            { label: 'DATA ACCURACY', value: '96%', trend: 'High', color: 'text-cyan-400' }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 hover:border-cyan-400/30 transition-all group">
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className="flex items-end justify-between">
                <div className={`text-2xl font-bold ${stat.color} group-hover:scale-105 transition-transform`}>{stat.value}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${stat.status?.bg || 'bg-gray-700/50'} ${stat.status?.color || 'text-gray-400'}`}>
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Map Section */}
          <div className="flex-1 lg:flex-[2] bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 shadow-2xl">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  {selectedRiver.toUpperCase()} RIVER CONTAMINATION MAP
                </h3>
                <div className="flex items-center gap-2 text-cyan-400 text-sm">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  LIVE MONITORING
                </div>
              </div>
              <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-gray-700/50">
                <MapContainer 
                  center={[-1.286389, 36.817223]} 
                  zoom={12} 
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-xl"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <WaterHeatmapLayer
                    points={heatPoints}
                    radius={35}
                    blur={25}
                    max={1.0}
                  />
                  <WaterMapLegend />
                  {sampleData.map((site, idx) => {
                    const position = samplingCoordinates[site.location];
                    const value = site[selectedPollutant];
                    const guideline = pollutants.find(p => p.id === selectedPollutant)?.guideline || 0;
                    const isCritical = value > guideline;
                    const markerColor = isCritical ? 'bg-red-500' : 'bg-green-500';
                    const wqiStatus = getWqiStatus(site.wqi);
                    
                    return (
                      <Marker 
                        key={idx} 
                        position={position}
                        icon={createCustomIcon(markerColor, isCritical)}
                      >
                        <Popup className="custom-popup">
                          <div className="text-center p-3 bg-gray-900 rounded-xl min-w-[200px]">
                            <h3 className="font-bold text-white mb-2 text-lg">{site.location}</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-cyan-400">WQI:</span>
                                <span className={`font-semibold ${wqiStatus.color}`}>{site.wqi} - {wqiStatus.text}</span>
                              </div>
                              <div className="border-t border-gray-700 pt-2">
                                <p className="text-cyan-400 mb-1">{pollutants.find(p => p.id === selectedPollutant)?.name}</p>
                                <p className="text-white text-lg font-bold">{value} {pollutants.find(p => p.id === selectedPollutant)?.unit}</p>
                                <p className={`text-xs ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
                                  {isCritical ? '❌ Exceeds Guideline' : '✅ Within Limits'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Pollutant Bar Chart */}
            <div className="flex-1 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  {pollutants.find(p => p.id === selectedPollutant)?.name} LEVELS
                </h3>
                <div className="text-cyan-400 text-sm">
                  {pollutants.find(p => p.id === selectedPollutant)?.unit}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sampleData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={getPollutantColor()} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={getPollutantColor()} stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="location" stroke="#9CA3AF" angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(55, 65, 81, 0.5)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)'
                      }}
                    />
                    <Bar 
                      dataKey={selectedPollutant} 
                      fill="url(#barGradient)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* WQI Trend Chart */}
            <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">WATER QUALITY INDEX TREND</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wqiTrendData}>
                    <defs>
                      {rivers.map(river => (
                        <linearGradient key={river.id} id={`color${river.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={river.color} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={river.color} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(55, 65, 81, 0.5)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)'
                      }}
                    />
                    <Legend />
                    {rivers.map(river => (
                      <Area 
                        key={river.id}
                        type="monotone" 
                        dataKey={river.id} 
                        stroke={river.color}
                        fill={`url(#color${river.id})`}
                        strokeWidth={2}
                        name={river.name}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Box */}
        <div className="mt-6 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-200">POLLUTION INSIGHTS & RECOMMENDATIONS</h3>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed text-sm">{insight}</p>
          </div>
          <div className="mt-4 flex space-x-4">
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25">
              Export Water Quality Data
            </button>
            <button className="px-6 py-3 border border-gray-600 text-gray-300 text-sm rounded-xl hover:bg-gray-800/50 hover:border-cyan-400/30 transition-all">
              Generate Monitoring Plan
            </button>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(17, 24, 39, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(55, 65, 81, 0.5);
          border-radius: 12px;
          color: white;
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(17, 24, 39, 0.95);
        }
      `}</style>
    </div>
  );
};

export default WaterPollution;