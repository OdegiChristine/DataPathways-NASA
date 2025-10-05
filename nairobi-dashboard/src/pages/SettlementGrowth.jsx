// src/pages/SettlementGrowth.jsx
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Icon Component
const SvgIcon = ({ name, className = "", size = 20 }) => {
  const common = { 
    width: size, 
    height: size, 
    viewBox: "0 0 24 24", 
    fill: "none", 
    stroke: "currentColor", 
    strokeWidth: 2, 
    strokeLinecap: "round", 
    strokeLinejoin: "round", 
    className 
  };
  
  switch (name) {
    case "satellite":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3"/>
          <path d="M2 12l5-5 5 5-5 5-5-5z"/>
          <path d="M17 7l5 5-5 5-5-5 5-5z"/>
        </svg>
      );
    case "heat":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 000 18 9 9 0 000-18z"/>
          <path d="M8 12c2-1 4-1 6 0"/>
        </svg>
      );
    case "chart3d":
      return (
        <svg {...common}>
          <path d="M3 20h18"/>
          <path d="M3 14l6-6 6 6 6-6"/>
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9"/>
          <path d="M3 12h18"/>
          <path d="M12 3a12 12 0 010 18"/>
          <path d="M12 3a12 12 0 000 18"/>
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 12l9-7 9 7"/>
          <path d="M9 21V9"/>
          <path d="M15 21V9"/>
        </svg>
      );
    case "wheat":
      return (
        <svg {...common}>
          <path d="M12 2v20"/>
          <path d="M8 6l4 4 4-4"/>
          <path d="M8 10l4 4 4-4"/>
        </svg>
      );
    case "factory":
      return (
        <svg {...common}>
          <rect x="3" y="12" width="18" height="9"/>
          <path d="M3 12l6-3v3l6-3v6"/>
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <rect x="6" y="4" width="12" height="16" rx="2"/>
          <path d="M10 8h4"/>
          <path d="M10 12h4"/>
          <path d="M10 16h4"/>
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
  }
};

// Heatmap data generator (mock data for demonstration)
const generateHeatmapData = () => {
  const data = [];
  const centerLat = -1.286389;
  const centerLng = 36.817223;
  
  for (let i = 0; i < 150; i++) {
    const lat = centerLat + (Math.random() - 0.5) * 0.2;
    const lng = centerLng + (Math.random() - 0.5) * 0.3;
    const intensity = Math.random(); // 0 to 1
    const population = Math.floor(Math.random() * 5000) + 1000;
    
    data.push({
      lat,
      lng,
      intensity,
      population,
      type: intensity > 0.7 ? 'high' : intensity > 0.4 ? 'medium' : 'low'
    });
  }
  
  return data;
};

// Custom heatmap layer component
const HeatmapLayer = ({ data }) => {
  const map = useMap();
  
  return (
    <>
      {data.map((point, index) => (
        <CircleMarker
          key={index}
          center={[point.lat, point.lng]}
          radius={point.intensity * 15 + 5}
          fillColor={point.intensity > 0.7 ? '#ff4444' : point.intensity > 0.4 ? '#ffaa00' : '#44ff44'}
          color={point.intensity > 0.7 ? '#ff0000' : point.intensity > 0.4 ? '#cc8800' : '#00cc00'}
          weight={1}
          opacity={0.8}
          fillOpacity={point.intensity * 0.6 + 0.2}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h4 className="font-bold text-gray-800 mb-2">Settlement Density</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Intensity:</span>
                  <span className="font-bold">{Math.round(point.intensity * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Population:</span>
                  <span>{point.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className={`font-medium ${
                    point.type === 'high' ? 'text-red-600' : 
                    point.type === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {point.type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

// Custom map controls with enhanced design
const MapControls = ({ onViewChange }) => {
  const map = useMap();
  
  useEffect(() => {
    // Enhanced Legend
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-600 shadow-2xl text-white');
      div.innerHTML = `
        <h4 class="font-bold text-white text-sm mb-3 tracking-wide">SETTLEMENT HEAT MAP</h4>
        <div class="space-y-3">
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full bg-red-500 mr-3 shadow-lg shadow-red-500/30"></div>
            <span class="text-xs text-gray-200">High Density</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full bg-yellow-500 mr-3 shadow-lg shadow-yellow-500/30"></div>
            <span class="text-xs text-gray-200">Medium Density</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full bg-green-500 mr-3 shadow-lg shadow-green-500/30"></div>
            <span class="text-xs text-gray-200">Low Density</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded-full bg-purple-500 mr-3 shadow-lg shadow-purple-500/30"></div>
            <span class="text-xs text-gray-200">Growth Zones</span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-gray-600">
          <div class="text-xs text-gray-400">Data updates in real-time</div>
        </div>
      `;
      return div;
    };
    
    legend.addTo(map);
    
    // View Control Buttons
    const viewControl = L.control({ position: 'topright' });
    
    viewControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'view-control bg-black/80 backdrop-blur-xl rounded-xl p-2 border border-gray-600 shadow-2xl');
      div.innerHTML = `
        <div class="space-y-2">
          <button class="view-btn w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg" title="Satellite View">
            <span class="text-white text-sm">🛰</span>
          </button>
          <button class="view-btn w-8 h-8 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg" title="Heat Map View">
            <span class="text-white text-sm">🔥</span>
          </button>
          <button class="view-btn w-8 h-8 bg-purple-500 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg" title="3D View">
            <span class="text-white text-sm">📊</span>
          </button>
        </div>
      `;
      
      // Add event listeners
      div.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const view = btn.querySelector('span').textContent;
          onViewChange?.(view);
        });
      });
      
      return div;
    };
    
    viewControl.addTo(map);
    
    return () => {
      legend.remove();
      viewControl.remove();
    };
  }, [map, onViewChange]);
  
  return null;
};

const SettlementGrowth = () => {
  const [filters, setFilters] = useState({
    landUseType: ['residential'],
    populationDensity: [0, 3000],
    infrastructure: ['roads', 'schools'],
    excludeProtected: true,
    heatMapIntensity: 75,
    timeRange: '1y'
  });

  const [landAvailabilityData, setLandAvailabilityData] = useState([]);
  const [topAreas, setTopAreas] = useState([]);
  const [growthZones, setGrowthZones] = useState({ type: 'FeatureCollection', features: [] });
  const [trendData, setTrendData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [mapView, setMapView] = useState('default');
  const [isLoading, setIsLoading] = useState(false);

  // Default data
  const defaultTopAreas = [
    { name: 'Kasarani', suitability: 0.87, land: '245 ha', infra: 'High', score: 87 },
    { name: 'Embakasi East', suitability: 0.82, land: '189 ha', infra: 'Medium', score: 82 },
    { name: 'Ruaraka', suitability: 0.78, land: '156 ha', infra: 'High', score: 78 }
  ];

  const defaultLandAvailability = [
    { ward: 'Kasarani', land: 245, potential: 87 },
    { ward: 'Embakasi', land: 189, potential: 82 },
    { ward: 'Ruaraka', land: 156, potential: 78 },
    { ward: 'Westlands', land: 89, potential: 65 },
    { ward: 'Dagoretti', land: 134, potential: 72 },
    { ward: 'Langata', land: 167, potential: 75 }
  ];

  const defaultTrendData = [
    { month: 'Jan', growth: 45, development: 32 },
    { month: 'Feb', growth: 52, development: 38 },
    { month: 'Mar', growth: 48, development: 41 },
    { month: 'Apr', growth: 65, development: 52 },
    { month: 'May', growth: 78, development: 61 },
    { month: 'Jun', growth: 82, development: 68 }
  ];

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API calls with enhanced data
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
    
    const queryParams = new URLSearchParams({
      landUseType: filters.landUseType.join(','),
      populationDensityMin: filters.populationDensity[0],
      populationDensityMax: filters.populationDensity[1],
      infrastructure: filters.infrastructure.join(','),
      excludeProtected: filters.excludeProtected ? 'true' : 'false',
      heatMapIntensity: filters.heatMapIntensity,
      timeRange: filters.timeRange,
    });

    // Simulate API delay
    setTimeout(() => {
      setTopAreas(defaultTopAreas);
      setLandAvailabilityData(defaultLandAvailability);
      setTrendData(defaultTrendData);
      setHeatmapData(generateHeatmapData());
      setIsLoading(false);
    }, 800);

  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleViewChange = (view) => {
    setMapView(view);
    // In a real app, this would change the map tiles or visualization
    console.log('Switching to view:', view);
  };

  const FilterCard = ({ title, children }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-green-400/50">
      <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );

  // Custom gradient for bars
  const getBarGradient = (score) => {
    if (score >= 80) return 'url(#highGradient)';
    if (score >= 60) return 'url(#mediumGradient)';
    return 'url(#lowGradient)';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-x-hidden overflow-y-auto pb-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-purple-500/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

      {/* Side Panel - Futuristic Design */}
      <div className="w-96 bg-black/40 backdrop-blur-2xl border-r border-white/20 p-6 overflow-y-auto shadow-2xl relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <span className="text-white text-lg">🌍</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                URBAN INTELLIGENCE
              </h2>
              <p className="text-gray-400 text-sm">Real-time settlement analytics</p>
            </div>
          </div>
        </div>

        {/* Heat Map Intensity Control */}
        <FilterCard title="HEAT MAP INTENSITY">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Sensitivity</span>
              <span className="text-green-400 font-bold text-lg">
                {filters.heatMapIntensity}%
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.heatMapIntensity}
                onChange={(e) => handleFilterChange('heatMapIntensity', parseInt(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-lg appearance-none cursor-pointer slider-futuristic"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </FilterCard>

        {/* Time Range Filter */}
        <FilterCard title="TIME RANGE">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: '1m', label: '1M' },
              { value: '6m', label: '6M' },
              { value: '1y', label: '1Y' },
              { value: '3y', label: '3Y' },
              { value: '5y', label: '5Y' },
              { value: 'max', label: 'MAX' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterChange('timeRange', value)}
                className={`p-2 rounded-xl border transition-all duration-300 ${
                  filters.timeRange === value
                    ? 'border-green-400 bg-green-500/20 shadow-lg shadow-green-500/30'
                    : 'border-white/20 bg-white/5 hover:border-green-400/50'
                }`}
              >
                <div className="text-center text-white font-medium text-sm">
                  {label}
                </div>
              </button>
            ))}
          </div>
        </FilterCard>

        {/* Land Use Type Filter */}
        <FilterCard title="LAND USE TYPE">
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'residential', icon: '🏠', color: 'from-blue-500 to-cyan-500' },
              { type: 'agricultural', icon: '🌾', color: 'from-green-500 to-emerald-500' },
              { type: 'industrial', icon: '🏭', color: 'from-orange-500 to-red-500' },
              { type: 'mixed', icon: '🏢', color: 'from-purple-500 to-pink-500' }
            ].map(({ type, icon, color }) => (
              <button
                key={type}
                onClick={() => {
                  const newTypes = filters.landUseType.includes(type)
                    ? filters.landUseType.filter(t => t !== type)
                    : [...filters.landUseType, type];
                  handleFilterChange('landUseType', newTypes);
                }}
                className={`p-3 rounded-xl border-2 transition-all duration-300 group ${
                  filters.landUseType.includes(type)
                    ? `border-transparent bg-gradient-to-br ${color} shadow-lg`
                    : 'border-white/20 bg-white/5 hover:border-green-400/50'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl mb-1 transition-transform duration-300 group-hover:scale-110 ${
                    filters.landUseType.includes(type) ? 'text-white' : 'text-gray-300'
                  }`}>
                    {icon}
                  </div>
                  <div className={`text-xs font-medium capitalize ${
                    filters.landUseType.includes(type) ? 'text-white' : 'text-gray-400'
                  }`}>
                    {type}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </FilterCard>

        {/* Quick Stats - Enhanced */}
        <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-2xl p-6 text-white border border-white/20 backdrop-blur-lg">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            LIVE METRICS
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-green-200">Active Zones</span>
              <span className="font-bold text-lg text-cyan-300">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-200">Heat Islands</span>
              <span className="font-bold text-lg text-yellow-300">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-200">Growth Rate</span>
              <span className="font-bold text-lg text-green-300">+12.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-200">Avg. Density</span>
              <span className="font-bold text-lg text-purple-300">2,847/km²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
            Urban Growth Intelligence
          </h1>
          <p className="text-gray-400">Advanced geospatial analysis with real-time heat mapping</p>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Analyzing settlement patterns...</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-3 gap-6">
          {/* Map Container - Takes 2 columns */}
          <div className="col-span-2 bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden relative">
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  SETTLEMENT HEAT MAP
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    LIVE DATA STREAM
                  </div>
                  <div className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-lg">
                    {heatmapData.length} points
                  </div>
                </div>
              </div>
            </div>
            <div className="h-full">
              <MapContainer 
                center={[-1.286389, 36.817223]} 
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
                className="rounded-b-2xl"
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <HeatmapLayer data={heatmapData} />
                <MapControls onViewChange={handleViewChange} />
              </MapContainer>
            </div>
          </div>

          {/* Right Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Top Areas - Enhanced */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg">GROWTH HOTSPOTS</h3>
                <span className="text-green-400 text-sm font-medium bg-white/10 px-2 py-1 rounded-lg">
                  Real-time
                </span>
              </div>
              <div className="space-y-4">
                {topAreas.map((area, index) => (
                  <div key={area.name} className="group p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-green-400/50 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 
                          index === 1 ? 'bg-gradient-to-br from-gray-500 to-blue-500' : 
                          'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-green-300 transition-colors">
                            {area.name}
                          </div>
                          <div className="text-xs text-gray-400">Score: {area.score}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                          {area.score}%
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span>Land: {area.land}</span>
                      <span>Infra: {area.infra}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${area.score}%`,
                          background: `linear-gradient(90deg, #10B981, #06B6D4)`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Land Availability Chart - Enhanced */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h3 className="font-bold text-white text-lg mb-4">LAND AVAILABILITY</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={landAvailabilityData}>
                    <defs>
                      <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="ward" fontSize={10} stroke="#9CA3AF" />
                    <YAxis fontSize={10} stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="land" radius={[4, 4, 0, 0]}>
                      {landAvailabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarGradient(entry.potential)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Growth Trends - Enhanced */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h3 className="font-bold text-white text-lg mb-4">GROWTH MOMENTUM</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="month" fontSize={10} stroke="#9CA3AF" />
                    <YAxis fontSize={10} stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="growth" 
                      stroke="#8B5CF6" 
                      fill="url(#trendGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .slider-futuristic::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #06B6D4);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider-futuristic::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.6);
        }
        
        .slider-futuristic::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981, #06B6D4);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          transition: all 0.3s ease;
        }
        
        .view-control .view-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default SettlementGrowth;