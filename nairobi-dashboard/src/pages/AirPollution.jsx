// src/pages/AirPollution.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { MapContainer, TileLayer, useMap, Marker, Popup, useMapEvents } from 'react-leaflet';
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

// Custom futuristic marker with dynamic sizing based on pollution level
const createCustomIcon = (pollutionLevel, isSelected = false) => {
  const size = isSelected ? 24 : 16 + (pollutionLevel / 20);
  const pulseSize = isSelected ? 32 : 20 + (pollutionLevel / 15);
  
  const getColor = (level) => {
    if (level >= 75) return 'bg-red-500';
    if (level >= 50) return 'bg-orange-500';
    if (level >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return L.divIcon({
    className: `custom-pulse-marker ${isSelected ? 'selected' : ''}`,
    html: `
      <div class="relative">
        <div class="absolute inset-0 animate-ping rounded-full ${getColor(pollutionLevel)} opacity-75" 
             style="width: ${pulseSize}px; height: ${pulseSize}px; margin: -${(pulseSize - size) / 2}px;"></div>
        <div class="relative rounded-full ${getColor(pollutionLevel)} border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
             style="width: ${size}px; height: ${size}px;">
          ${isSelected ? '📍' : ''}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Enhanced Heatmap Layer with dynamic intensity
const HeatmapLayer = ({ points, radius = 25, blur = 20, max = 1.0, intensity = 1.0 }) => {
  const map = useMap();
  
  useEffect(() => {
    if (points.length === 0) return;
    
    const adjustedPoints = points.map(point => [
      point[0], point[1], point[2] * intensity
    ]);
    
    const heatmap = L.heatLayer(adjustedPoints, { 
      radius: radius * intensity, 
      blur: blur * intensity, 
      max, 
      gradient: { 
        0.0: '#3B82F6', 
        0.2: '#10B981', 
        0.4: '#F59E0B', 
        0.6: '#F97316', 
        0.8: '#EF4444',
        1.0: '#DC2626' 
      } 
    }).addTo(map);
    
    return () => {
      map.removeLayer(heatmap);
    };
  }, [map, points, radius, blur, max, intensity]);
  
  return null;
};

// Map Click Handler for adding custom points
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Enhanced Map Legend with interactive elements
const MapLegend = ({ onIntensityChange, heatIntensity }) => {
  const map = useMap();
  
  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 shadow-2xl');
      div.innerHTML = `
        <h4 class="font-bold text-white text-sm mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">POLLUTION INTENSITY</h4>
        <div class="space-y-2 mb-4">
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Good (0-25)</span></div>
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Moderate (26-50)</span></div>
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-yellow-500 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Unhealthy (51-75)</span></div>
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-orange-500 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Very Unhealthy (76-100)</span></div>
          <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-red-600 mr-2 shadow-lg"></div><span class="text-xs text-gray-300">Hazardous (100+)</span></div>
        </div>
        <div class="space-y-2">
          <label class="text-xs text-gray-300 block">Heat Intensity: <span class="text-cyan-400">${Math.round(heatIntensity * 100)}%</span></label>
          <input type="range" min="0.1" max="2" step="0.1" value="${heatIntensity}" 
                 class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan" 
                 onchange="this.dispatchEvent(new CustomEvent('intensityChange', { detail: parseFloat(this.value) }))">
        </div>
      `;
      
      // Add event listener for the slider
      const slider = div.querySelector('input');
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        onIntensityChange(value);
      });
      
      return div;
    };
    
    legend.addTo(map);
    
    return () => {
      legend.remove();
    };
  }, [map, onIntensityChange, heatIntensity]);
  
  return null;
};

// Enhanced Tooltip Component
const CustomTooltip = ({ active, payload, label, selectedPollutant }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const getAdvisory = (val) => {
      if (val >= 75) return { level: 'Hazardous', color: 'text-red-400', bg: 'bg-red-500/20' };
      if (val >= 50) return { level: 'Very Unhealthy', color: 'text-orange-400', bg: 'bg-orange-500/20' };
      if (val >= 25) return { level: 'Unhealthy', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      return { level: 'Good', color: 'text-green-400', bg: 'bg-green-500/20' };
    };
    
    const advisory = getAdvisory(value);
    
    return (
      <div className="bg-gray-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-4 shadow-2xl min-w-[200px]">
        <p className="text-white font-bold mb-2 border-b border-gray-700 pb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">{selectedPollutant}:</span>
            <span className="text-white font-bold">{value} μg/m³</span>
          </div>
          <div className={`px-2 py-1 rounded-lg text-center text-xs font-medium ${advisory.bg} ${advisory.color} border ${advisory.color.replace('text', 'border')}/30`}>
            {advisory.level}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Prediction Toggle Component
const PredictionToggle = ({ showPredictions, onToggle, accuracy }) => (
  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${showPredictions ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
      <span className="text-gray-300 text-sm">Show Predictions</span>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={showPredictions}
        onChange={onToggle}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
    </label>
  </div>
);

const AirPollution = () => {
  const [selectedPollutant, setSelectedPollutant] = useState('PM2.5');
  const [timeRange, setTimeRange] = useState('12months');
  const [seriesData, setSeriesData] = useState([]);
  const [hotspotsData, setHotspotsData] = useState([]);
  const [heatPoints, setHeatPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [heatIntensity, setHeatIntensity] = useState(1.0);
  const [showPredictions, setShowPredictions] = useState(false);
  const [customPoints, setCustomPoints] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const defaultSeries = [
    { date: 'Jan', PM2_5: 45, NO2: 32, CO: 1.2, O3: 28, predicted: 48 },
    { date: 'Feb', PM2_5: 52, NO2: 35, CO: 1.4, O3: 26, predicted: 55 },
    { date: 'Mar', PM2_5: 48, NO2: 38, CO: 1.3, O3: 29, predicted: 51 },
    { date: 'Apr', PM2_5: 65, NO2: 42, CO: 1.6, O3: 25, predicted: 68 },
    { date: 'May', PM2_5: 78, NO2: 48, CO: 1.8, O3: 23, predicted: 82 },
    { date: 'Jun', PM2_5: 82, NO2: 52, CO: 2.1, O3: 22, predicted: 85 },
    { date: 'Jul', PM2_5: 75, NO2: 45, CO: 1.9, O3: 24, predicted: 78 },
    { date: 'Aug', PM2_5: 68, NO2: 40, CO: 1.7, O3: 26, predicted: 72 },
    { date: 'Sep', PM2_5: 58, NO2: 36, CO: 1.5, O3: 27, predicted: 62 },
    { date: 'Oct', PM2_5: 52, NO2: 34, CO: 1.4, O3: 28, predicted: 56 },
    { date: 'Nov', PM2_5: 48, NO2: 33, CO: 1.3, O3: 29, predicted: 52 },
    { date: 'Dec', PM2_5: 42, NO2: 30, CO: 1.2, O3: 30, predicted: 46 },
  ];

  const defaultHotspots = [
    { location: 'Industrial Area', value: 78, trend: 'rising', advisory: 'Unhealthy', color: 'bg-red-500', coords: [-1.31, 36.83] },
    { location: 'CBD', value: 65, trend: 'stable', advisory: 'Unhealthy for Sensitive', color: 'bg-orange-500', coords: [-1.286389, 36.817223] },
    { location: 'Eastleigh', value: 58, trend: 'rising', advisory: 'Moderate', color: 'bg-yellow-500', coords: [-1.27, 36.85] },
    { location: 'Kibera', value: 52, trend: 'stable', advisory: 'Moderate', color: 'bg-yellow-500', coords: [-1.31, 36.78] },
    { location: 'Westlands', value: 45, trend: 'falling', advisory: 'Moderate', color: 'bg-yellow-500', coords: [-1.26, 36.80] },
  ];

  const pollutants = [
    { name: 'PM2.5', color: '#EF4444', icon: '🫧', unit: 'μg/m³', description: 'Fine particulate matter' },
    { name: 'NO₂', color: '#3B82F6', icon: '🌫️', unit: 'ppb', description: 'Nitrogen dioxide' },
    { name: 'CO', color: '#8B5CF6', icon: '💨', unit: 'ppm', description: 'Carbon monoxide' },
    { name: 'O₃', color: '#10B981', icon: '☀️', unit: 'ppb', description: 'Ozone' }
  ];

  // Enhanced data fetching with error handling
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const monthsMap = { '3months': 3, '6months': 6, '12months': 12, '2years': 24 };
      const months = monthsMap[timeRange] || 12;
      
      const [seriesRes, hotspotsRes, heatmapRes] = await Promise.allSettled([
        fetch(`${API_BASE}/air/timeseries?pollutant=${selectedPollutant}&months=${months}`),
        fetch(`${API_BASE}/air/hotspots?city=Nairobi&pollutant=${selectedPollutant}&limit=5`),
        fetch(`${API_BASE}/air/heatmap?city=Nairobi&pollutant=${selectedPollutant}&limit=50`)
      ]);

      const seriesData = seriesRes.status === 'fulfilled' ? await seriesRes.value.json() : { series: [] };
      const hotspotsData = hotspotsRes.status === 'fulfilled' ? await hotspotsRes.value.json() : { hotspots: [] };
      const heatmapData = heatmapRes.status === 'fulfilled' ? await heatmapRes.value.json() : { features: [] };

      setSeriesData(seriesData.series || defaultSeries);
      setHotspotsData(hotspotsData.hotspots || defaultHotspots);
      
      const points = heatmapData.features ? heatmapData.features.map(f => [
        f.geometry.coordinates[1],
        f.geometry.coordinates[0],
        f.properties.value / 100
      ]) : [];
      setHeatPoints(points.length ? points : generateMockHeatPoints());

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setSeriesData(defaultSeries);
      setHotspotsData(defaultHotspots);
      setHeatPoints(generateMockHeatPoints());
    } finally {
      setIsLoading(false);
    }
  }, [selectedPollutant, timeRange]);

  // Generate mock heat points for demonstration
  const generateMockHeatPoints = () => {
    const points = [];
    const centerLat = -1.286389;
    const centerLng = 36.817223;
    
    for (let i = 0; i < 30; i++) {
      const lat = centerLat + (Math.random() - 0.5) * 0.1;
      const lng = centerLng + (Math.random() - 0.5) * 0.1;
      const intensity = Math.random() * 0.8 + 0.2;
      points.push([lat, lng, intensity]);
    }
    
    return points;
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMapClick = (latlng) => {
    const newPoint = {
      id: Date.now(),
      latlng,
      pollutionLevel: Math.random() * 100,
      timestamp: new Date().toISOString()
    };
    setCustomPoints(prev => [...prev, newPoint]);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    // In a real app, you might fetch detailed data for this location
  };

  const getDataKey = () => {
    return selectedPollutant === 'PM2.5' ? 'PM2_5' : 
           selectedPollutant === 'NO₂' ? 'NO2' : 
           selectedPollutant === 'O₃' ? 'O3' : 
           selectedPollutant;
  };

  const getPollutantColor = () => {
    return pollutants.find(p => p.name === selectedPollutant)?.color || '#10B981';
  };

  const getPollutantUnit = () => {
    return pollutants.find(p => p.name === selectedPollutant)?.unit || 'μg/m³';
  };

  // Enhanced time series data with predictions
  const enhancedSeriesData = showPredictions ? seriesData.map(item => ({
    ...item,
    [getDataKey() + '_predicted']: item.predicted
  })) : seriesData;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-cyan-900/10"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Side Panel */}
      <div className="w-80 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 p-6 overflow-y-auto relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-white text-lg">🌫️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AIR QUALITY AI
              </h2>
              <p className="text-gray-400 text-sm">Intelligent environmental monitoring</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`p-3 rounded-xl border transition-all duration-300 ${
              comparisonMode 
                ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20' 
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="text-center text-xs text-gray-300">
              <div className="text-lg mb-1">📊</div>
              Compare
            </div>
          </button>
          <button className="p-3 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-gray-600 transition-all duration-300">
            <div className="text-center text-xs text-gray-300">
              <div className="text-lg mb-1">📤</div>
              Export
            </div>
          </button>
        </div>
        
        {/* Pollutant Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">SELECT POLLUTANT</label>
          <div className="grid grid-cols-2 gap-2">
            {pollutants.map(pollutant => (
              <button
                key={pollutant.name}
                onClick={() => setSelectedPollutant(pollutant.name)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 group ${
                  selectedPollutant === pollutant.name 
                    ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20' 
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1 group-hover:scale-110 transition-transform">{pollutant.icon}</div>
                  <div className="text-xs font-medium text-gray-300">{pollutant.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Pollutant Info */}
        <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Current</span>
            <span className="text-cyan-400 text-sm font-medium">{selectedPollutant}</span>
          </div>
          <div className="text-xs text-gray-400">
            {pollutants.find(p => p.name === selectedPollutant)?.description}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Unit: {getPollutantUnit()}
          </div>
        </div>

        {/* Time Range & Predictions */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">TIME RANGE</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="2years">Last 2 Years</option>
            </select>
          </div>
          
          <PredictionToggle 
            showPredictions={showPredictions}
            onToggle={() => setShowPredictions(!showPredictions)}
            accuracy={94.2}
          />
        </div>

        {/* Hotspots List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">POLLUTION HOTSPOTS</h3>
            <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-full">LIVE</span>
          </div>
          <div className="space-y-3">
            {hotspotsData.map((spot, index) => (
              <div 
                key={index}
                onClick={() => handleLocationSelect(spot)}
                className={`p-3 bg-gray-800/30 rounded-xl border backdrop-blur-sm transition-all cursor-pointer group ${
                  selectedLocation?.location === spot.location
                    ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20'
                    : 'border-gray-700/50 hover:border-cyan-400/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-200 group-hover:text-cyan-300 transition-colors">
                    {spot.location}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    spot.advisory === 'Unhealthy' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    spot.advisory === 'Unhealthy for Sensitive' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}>
                    {spot.advisory}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">
                    {selectedPollutant}: <strong className="text-gray-200">{spot.value} {getPollutantUnit()}</strong>
                  </span>
                  <span className={`text-xs ${
                    spot.trend === 'rising' ? 'text-red-400' : 
                    spot.trend === 'falling' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {spot.trend === 'rising' ? '↗️' : spot.trend === 'falling' ? '↘️' : '→'} {spot.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Advisory */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">⚠️</span>
            <h4 className="font-semibold text-yellow-400">HEALTH ADVISORY</h4>
          </div>
          <p className="text-yellow-300/80 text-sm">
            {selectedPollutant} levels in Industrial Area exceed WHO guidelines. Sensitive groups should limit outdoor activities.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                URBAN AIR QUALITY INTELLIGENCE
              </h1>
              <p className="text-gray-400">Advanced environmental monitoring with AI-powered predictions</p>
            </div>
            <div className="flex items-center gap-4">
              {isLoading && (
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Updating...</span>
                </div>
              )}
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-all duration-300 flex items-center gap-2"
              >
                <span>🔄</span>
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'AIR QUALITY INDEX', value: '156', trend: '+12%', color: 'text-orange-400', icon: '📊' },
            { label: 'ACTIVE SENSORS', value: '24', trend: 'Online', color: 'text-green-400', icon: '📡' },
            { label: 'PREDICTION ACCURACY', value: '94.2%', trend: 'High', color: 'text-cyan-400', icon: '🤖' },
            { label: 'DATA COVERAGE', value: '92%', trend: 'Optimal', color: 'text-blue-400', icon: '🌐' }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 hover:border-cyan-400/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">{stat.label}</div>
                <div className="text-lg">{stat.icon}</div>
              </div>
              <div className="flex items-end justify-between">
                <div className={`text-2xl font-bold ${stat.color} group-hover:scale-105 transition-transform`}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.trend}</div>
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
                  {selectedPollutant} HEAT MAP ANALYSIS
                  {comparisonMode && <span className="text-cyan-400 ml-2 text-sm">• Comparison Mode</span>}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-cyan-400 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    LIVE DATA STREAM
                  </div>
                  <button 
                    onClick={() => setCustomPoints([])}
                    className="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    Clear Points
                  </button>
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
                  <HeatmapLayer
                    points={heatPoints}
                    radius={30}
                    blur={25}
                    max={1.0}
                    intensity={heatIntensity}
                  />
                  <MapClickHandler onMapClick={handleMapClick} />
                  <MapLegend 
                    onIntensityChange={setHeatIntensity}
                    heatIntensity={heatIntensity}
                  />
                  
                  {/* Hotspot Markers */}
                  {hotspotsData.map((spot) => (
                    <Marker 
                      key={spot.location}
                      position={spot.coords}
                      icon={createCustomIcon(spot.value, selectedLocation?.location === spot.location)}
                      eventHandlers={{
                        click: () => handleLocationSelect(spot),
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="text-center p-2 bg-gray-900 rounded-lg min-w-[200px]">
                          <h3 className="font-bold text-white mb-2">{spot.location}</h3>
                          <div className="space-y-2 text-sm">
                            <p className="text-cyan-400">
                              {selectedPollutant}: <strong>{spot.value} {getPollutantUnit()}</strong>
                            </p>
                            <p className="text-gray-300">
                              Trend: <span className={
                                spot.trend === 'rising' ? 'text-red-400' : 
                                spot.trend === 'falling' ? 'text-green-400' : 'text-gray-400'
                              }>{spot.trend}</span>
                            </p>
                            <p className={
                              spot.advisory === 'Unhealthy' ? 'text-red-400' :
                              spot.advisory === 'Unhealthy for Sensitive' ? 'text-orange-400' : 'text-yellow-400'
                            }>
                              Advisory: {spot.advisory}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Custom Points */}
                  {customPoints.map(point => (
                    <Marker
                      key={point.id}
                      position={point.latlng}
                      icon={createCustomIcon(point.pollutionLevel)}
                    >
                      <Popup>
                        <div className="text-center p-2 bg-gray-900 rounded-lg">
                          <h3 className="font-bold text-white mb-2">Custom Point</h3>
                          <p className="text-cyan-400">
                            {selectedPollutant}: {point.pollutionLevel.toFixed(1)} {getPollutantUnit()}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Added: {new Date(point.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Time Series Chart */}
            <div className="flex-1 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  TREND ANALYSIS {showPredictions && <span className="text-cyan-400 text-sm">• With Predictions</span>}
                </h3>
                <div className="text-cyan-400 text-sm">
                  {timeRange.replace('months', 'M').replace('years', 'Y')}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enhancedSeriesData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={getPollutantColor()} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={getPollutantColor()} stopOpacity={0.1}/>
                      </linearGradient>
                      {showPredictions && (
                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      )}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      content={<CustomTooltip selectedPollutant={selectedPollutant} />}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={getDataKey()} 
                      stroke={getPollutantColor()} 
                      fill="url(#colorValue)" 
                      strokeWidth={3}
                      name="Actual"
                    />
                    {showPredictions && (
                      <Area 
                        type="monotone" 
                        dataKey={getDataKey() + '_predicted'} 
                        stroke="#8B5CF6" 
                        fill="url(#colorPredicted)" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Predicted"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Charts & Info */}
            <div className="grid grid-cols-2 gap-4">
              {/* Pollutant Comparison */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 shadow-2xl">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">POLLUTANT LEVELS</h4>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'PM2.5', value: 65 },
                      { name: 'NO₂', value: 42 },
                      { name: 'CO', value: 1.8 },
                      { name: 'O₃', value: 28 }
                    ]}>
                      <Bar dataKey="value" fill={getPollutantColor()} radius={[4, 4, 0, 0]} />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                      <YAxis stroke="#9CA3AF" fontSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4 shadow-2xl">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">SYSTEM STATUS</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Data Pipeline</span>
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Last Update</span>
                    <span className="text-cyan-400 text-sm">Just now</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">AI Model</span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                </div>
              </div>
            </div>
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
        .slider-cyan::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(6, 182, 212, 0.4);
        }
        .slider-cyan::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(6, 182, 212, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AirPollution;