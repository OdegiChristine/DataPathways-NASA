// src/pages/WhyTheseAreas.jsx
import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

const WhyTheseAreas = () => {
  const [summaryMetrics, setSummaryMetrics] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [selectedArea, setSelectedArea] = useState('Industrial Area');
  const [timeRange, setTimeRange] = useState('5y');
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced default data for Industrial Area, Eastleigh, Westlands
  const defaultSummary = [
    { 
      title: 'Development Score', 
      value: '88/100', 
      status: 'Excellent', 
      color: 'from-green-500 to-emerald-500',
      trend: '+12%',
      icon: '📊'
    },
    { 
      title: 'Infrastructure Index', 
      value: '92/100', 
      status: 'Advanced', 
      color: 'from-blue-500 to-cyan-500',
      trend: '+8%',
      icon: '🏗️'
    },
    { 
      title: 'Economic Viability', 
      value: '85/100', 
      status: 'High', 
      color: 'from-purple-500 to-pink-500',
      trend: '+15%',
      icon: '💰'
    },
    { 
      title: 'Environmental Impact', 
      value: '76/100', 
      status: 'Moderate', 
      color: 'from-orange-500 to-red-500',
      trend: '-5%',
      icon: '🌿'
    },
  ];

  const defaultRadar = [
    { 
      subject: 'Infrastructure', 
      'Industrial Area': 92, 
      'Eastleigh': 78, 
      'Westlands': 88, 
      fullMark: 100 
    },
    { 
      subject: 'Land Value', 
      'Industrial Area': 75, 
      'Eastleigh': 82, 
      'Westlands': 95, 
      fullMark: 100 
    },
    { 
      subject: 'Accessibility', 
      'Industrial Area': 88, 
      'Eastleigh': 85, 
      'Westlands': 90, 
      fullMark: 100 
    },
    { 
      subject: 'Growth Potential', 
      'Industrial Area': 90, 
      'Eastleigh': 80, 
      'Westlands': 85, 
      fullMark: 100 
    },
    { 
      subject: 'Environmental', 
      'Industrial Area': 65, 
      'Eastleigh': 72, 
      'Westlands': 82, 
      fullMark: 100 
    },
    { 
      subject: 'Community Impact', 
      'Industrial Area': 70, 
      'Eastleigh': 85, 
      'Westlands': 88, 
      fullMark: 100 
    },
  ];

  const defaultBarData = [
    { category: 'Transport', 'Industrial Area': 88, 'Eastleigh': 82, 'Westlands': 92 },
    { category: 'Utilities', 'Industrial Area': 85, 'Eastleigh': 75, 'Westlands': 90 },
    { category: 'Commercial', 'Industrial Area': 90, 'Eastleigh': 88, 'Westlands': 95 },
    { category: 'Residential', 'Industrial Area': 70, 'Eastleigh': 85, 'Westlands': 88 },
    { category: 'Green Space', 'Industrial Area': 60, 'Eastleigh': 68, 'Westlands': 80 },
  ];

  const areaDetails = {
    'Industrial Area': {
      narrative: `Industrial Area leads with exceptional infrastructure readiness (92/100) and strategic accessibility scores. The area offers 45 hectares of redevelopable industrial land with direct highway access and existing utility corridors. High growth potential (90/100) is driven by ongoing commercial rezoning initiatives and proximity to major transport networks. Environmental impact requires mitigation strategies, particularly around air quality and green space integration.`,
      strengths: ['Advanced infrastructure', 'Strategic location', 'Redevelopment potential'],
      challenges: ['Environmental concerns', 'Limited green space', 'Traffic congestion'],
      recommendations: ['Mixed-use development', 'Green corridor integration', 'Smart traffic management']
    },
    'Eastleigh': {
      narrative: `Eastleigh demonstrates strong economic viability with high land value scores (82/100) and excellent community integration. The area's dense urban fabric supports vibrant commercial activity but requires infrastructure upgrades. High population density presents both opportunities for mixed-use development and challenges for service delivery. Community impact scores are favorable, reflecting established social networks and economic resilience.`,
      strengths: ['Economic vitality', 'Community cohesion', 'Commercial density'],
      challenges: ['Infrastructure strain', 'Limited open space', 'Parking shortages'],
      recommendations: ['Infrastructure modernization', 'Vertical development', 'Public space creation']
    },
    'Westlands': {
      narrative: `Westlands excels in environmental quality (82/100) and premium infrastructure, making it ideal for high-value development. The area boasts balanced scores across all metrics with particularly strong performance in commercial viability and residential appeal. While land costs are premium, the return on investment potential remains high due to established prestige and comprehensive urban amenities.`,
      strengths: ['Premium infrastructure', 'Environmental quality', 'High land value'],
      challenges: ['High development costs', 'Gentrification risks', 'Limited available land'],
      recommendations: ['Luxury mixed-use', 'Sustainable design', 'Heritage preservation']
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call with enhanced data
    setTimeout(() => {
      setSummaryMetrics(defaultSummary);
      setRadarData(defaultRadar);
      setBarData(defaultBarData);
      setNarrative(areaDetails[selectedArea].narrative);
      setIsLoading(false);
    }, 1200);
  }, [selectedArea, timeRange]);

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setNarrative(areaDetails[area].narrative);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}/100</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const AreaCard = ({ area, isSelected, onClick }) => (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 transform hover:scale-105 ${
        isSelected 
          ? 'border-green-400 bg-gradient-to-br from-green-500/20 to-emerald-500/20 shadow-2xl shadow-green-500/30' 
          : 'border-white/20 bg-white/5 hover:border-green-400/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">{area}</h3>
        <div className={`w-3 h-3 rounded-full ${
          area === 'Industrial Area' ? 'bg-green-400' :
          area === 'Eastleigh' ? 'bg-blue-400' : 'bg-purple-400'
        }`}></div>
      </div>
      <div className="space-y-2">
        {areaDetails[area].strengths.map((strength, index) => (
          <div key={index} className="flex items-center text-sm text-green-300">
            <span className="mr-2">✓</span>
            {strength}
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyzing urban development data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-purple-500/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-2">
              Urban Development Intelligence
            </h1>
            <p className="text-gray-400 text-lg">Comparative analysis of strategic growth zones in Nairobi</p>
          </div>

          {/* Time Range Filter */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex space-x-2 bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
              {['1y', '3y', '5y', 'Max'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    timeRange === range
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-gray-400">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Live Data</span>
              </div>
            </div>
          </div>

          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {summaryMetrics.map((metric, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-green-400/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{metric.icon}</div>
                  <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${metric.color} text-white font-medium`}>
                    {metric.status}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">{metric.title}</h3>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                  <span className={`text-sm font-medium ${
                    metric.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Area Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {['Industrial Area', 'Eastleigh', 'Westlands'].map(area => (
              <AreaCard
                key={area}
                area={area}
                isSelected={selectedArea === area}
                onClick={() => handleAreaSelect(area)}
              />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Radar Chart */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                Multi-Dimensional Analysis
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#4B5563" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    />
                    <Radar 
                      name="Industrial Area" 
                      dataKey="Industrial Area" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6} 
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Eastleigh" 
                      dataKey="Eastleigh" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6} 
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Westlands" 
                      dataKey="Westlands" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.6} 
                      strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-8 mt-6">
                {['Industrial Area', 'Eastleigh', 'Westlands'].map((area, index) => (
                  <div key={area} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      index === 0 ? 'bg-green-400' : 
                      index === 1 ? 'bg-blue-400' : 'bg-purple-400'
                    }`}></div>
                    <span className="text-sm text-gray-300">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-pulse"></span>
                Infrastructure Category Breakdown
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Industrial Area" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Eastleigh" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Westlands" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse"></span>
                Strategic Analysis: {selectedArea}
              </h3>
              <div className="flex space-x-3">
                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105">
                  📊 Export Analysis
                </button>
                <button className="px-6 py-3 border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-all duration-300">
                  📄 Generate Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Narrative */}
              <div className="lg:col-span-2">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">{narrative}</p>
                </div>
              </div>

              {/* Key Insights */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-green-400 font-bold mb-3 flex items-center">
                    <span className="mr-2">🚀</span>
                    Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {areaDetails[selectedArea].strengths.map((strength, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-orange-400 font-bold mb-3 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Challenges
                  </h4>
                  <ul className="space-y-2">
                    {areaDetails[selectedArea].challenges.map((challenge, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3"></span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-blue-400 font-bold mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {areaDetails[selectedArea].recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyTheseAreas;