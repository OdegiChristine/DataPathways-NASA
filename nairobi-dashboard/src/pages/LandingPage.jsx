// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Urban Growth & Environmental Health
            <span className="block text-green-600">in Nairobi</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            An interactive dashboard identifying optimal settlement growth areas while 
            monitoring environmental risks to support sustainable urban planning and 
            decision-making for Nairobi's future development.
          </p>
          <Link
            to="/dashboard/settlement-growth"
            className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            Explore Dashboard
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              title: 'Growth Potential',
              description: 'Identify optimal settlement zones with suitability scoring',
              icon: '🗺️'
            },
            {
              title: 'Area Analysis',
              description: 'Understand drivers behind location rankings',
              icon: '📊'
            },
            {
              title: 'Air Quality',
              description: 'Monitor pollution trends and health advisories',
              icon: '🌫️'
            },
            {
              title: 'Water Quality',
              description: 'Track river contamination and WQI trends',
              icon: '💧'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Key Metrics Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Key Insights for Urban Planners
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'High Potential Zones', value: '3', unit: 'areas' },
              { label: 'Avg Suitability Score', value: '0.77', unit: '/1.0' },
              { label: 'Air Quality Hotspots', value: '5', unit: 'locations' },
              { label: 'River Monitoring Points', value: '12', unit: 'sites' }
            ].map((metric, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
                <div className="text-xs text-gray-500">{metric.unit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;