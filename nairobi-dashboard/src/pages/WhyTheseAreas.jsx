// src/pages/WhyTheseAreas.jsx
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const WhyTheseAreas = () => {
  const summaryMetrics = [
    { title: 'Land Use Score', value: '0.82/1.0', status: 'High', color: 'green' },
    { title: 'Water Access %', value: '82%', status: 'Adequate', color: 'blue' },
    { title: 'Infrastructure Index', value: '71/100', status: 'Good', color: 'purple' },
    { title: 'Proximity to Green', value: '72%', status: 'High', color: 'green' },
  ];

  const radarData = [
    { subject: 'Land Use', Ruai: 82, Kitengela: 78, Ngong: 71, fullMark: 100 },
    { subject: 'Water Access', Ruai: 82, Kitengela: 75, Ngong: 68, fullMark: 100 },
    { subject: 'Infrastructure', Ruai: 71, Kitengela: 68, Ngong: 65, fullMark: 100 },
    { subject: 'Green Proximity', Ruai: 72, Kitengela: 65, Ngong: 58, fullMark: 100 },
    { subject: 'Env Risk Score', Ruai: 28, Kitengela: 35, Ngong: 42, fullMark: 100 },
  ];

  const narrative = `Ruai ranks highest due to abundant developable land (18 ha available) and strong road connectivity (infrastructure index 71). Water access is largely adequate (82% households within 500m), and proximity to green spaces reduces immediate heat-island concerns. However, a moderate environmental risk score (33/100) driven by localized river nitrate readings suggests targeted wastewater controls before high-density expansion.`;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Why These Areas?</h1>
          <p className="text-gray-600 mb-8">Comparative analysis of top potential growth zones</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryMetrics.map((metric, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h3>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-800">{metric.value}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    metric.color === 'green' ? 'bg-green-100 text-green-800' :
                    metric.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {metric.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparative Performance Analysis</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Ruai" dataKey="Ruai" stroke="#1a9850" fill="#1a9850" fillOpacity={0.6} />
                  <Radar name="Kitengela" dataKey="Kitengela" stroke="#fdae61" fill="#fdae61" fillOpacity={0.6} />
                  <Radar name="Ngong" dataKey="Ngong" stroke="#d73027" fill="#d73027" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {['Ruai', 'Kitengela', 'Ngong'].map((area, index) => (
                <div key={area} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    index === 0 ? 'bg-green-500' : 
                    index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative Box */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Area Justification & Recommendations</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">{narrative}</p>
            </div>
            <div className="mt-4 flex space-x-4">
              <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                Export Analysis
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyTheseAreas;