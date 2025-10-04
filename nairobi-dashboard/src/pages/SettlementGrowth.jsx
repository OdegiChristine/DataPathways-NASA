// src/pages/SettlementGrowth.jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SettlementGrowth = () => {
  const [filters, setFilters] = useState({
    landUseType: ['residential'],
    populationDensity: [0, 3000],
    infrastructure: ['roads', 'schools'],
    excludeProtected: true,
  });

  const landAvailabilityData = [
    { ward: 'Ruai', land: 18 },
    { ward: 'Kitengela', land: 15 },
    { ward: 'Ngong', land: 12 },
    { ward: 'Embakasi', land: 8 },
    { ward: 'Kasarani', land: 6 },
  ];

  const topAreas = [
    { name: 'Ruai', suitability: '82%', land: '18 ha', infra: '71/100' },
    { name: 'Kitengela', suitability: '78%', land: '15 ha', infra: '68/100' },
    { name: 'Ngong', suitability: '71%', land: '12 ha', infra: '65/100' },
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Side Panel */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters & Controls</h2>
        
        {/* Land Use Type Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Land Use Type</label>
          <div className="space-y-2">
            {['residential', 'agricultural', 'industrial', 'mixed'].map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.landUseType.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.landUseType, type]
                      : filters.landUseType.filter(t => t !== type);
                    handleFilterChange('landUseType', newTypes);
                  }}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-600 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Population Density Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Population Density: {filters.populationDensity[0]} - {filters.populationDensity[1]} ppl/km²
          </label>
          <input
            type="range"
            min="0"
            max="5000"
            value={filters.populationDensity[1]}
            onChange={(e) => handleFilterChange('populationDensity', [filters.populationDensity[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Infrastructure Access */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Infrastructure Access</label>
          <div className="space-y-2">
            {['roads', 'schools', 'hospitals', 'electricity'].map(infra => (
              <label key={infra} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.infrastructure.includes(infra)}
                  onChange={(e) => {
                    const newInfra = e.target.checked
                      ? [...filters.infrastructure, infra]
                      : filters.infrastructure.filter(i => i !== infra);
                    handleFilterChange('infrastructure', newInfra);
                  }}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-600 capitalize">{infra}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Protected Areas Toggle */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.excludeProtected}
              onChange={(e) => handleFilterChange('excludeProtected', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-600">Exclude Protected Areas</span>
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Map Container */}
        <div className="flex-1 relative bg-gray-100">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-xl font-semibold mb-2">Nairobi Settlement Growth Map</div>
              <div className="text-sm mb-4">Interactive map showing potential growth zones</div>
              <div className="flex justify-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span className="text-xs">Low Suitability</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-xs">Medium Suitability</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span className="text-xs">High Suitability</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">Map integration ready for GeoJSON data</div>
            </div>
          </div>
        </div>

        {/* Bottom Insights Bar */}
        <div className="h-48 bg-white border-t border-gray-200 p-4">
          <div className="flex h-full space-x-6">
            {/* Top 3 Areas */}
            <div className="w-1/3">
              <h3 className="font-semibold text-gray-800 mb-3">Top 3 Potential Growth Areas</h3>
              <div className="space-y-3">
                {topAreas.map((area, index) => (
                  <div key={area.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500' : 
                        index === 1 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}></div>
                      <span className="font-medium text-gray-800">{area.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Suitability: {area.suitability}</div>
                      <div className="text-xs text-gray-500">Land: {area.land} • Infra: {area.infra}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Land Availability Chart */}
            <div className="w-2/3">
              <h3 className="font-semibold text-gray-800 mb-3">Land Availability by Ward (ha)</h3>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={landAvailabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="ward" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="land" fill="#1a9850" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlementGrowth;