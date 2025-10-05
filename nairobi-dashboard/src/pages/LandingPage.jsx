// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import videoSrc from '../assets/video.mp4';
import { FaCity, FaThermometerHalf, FaExclamationTriangle, FaChartBar, FaGlobeAfrica, FaUsers, FaRocket, FaWind, FaWater, FaChartLine } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen scroll-smooth relative overflow-hidden bg-gradient-to-br from-white via-green-50 to-emerald-50">
      

      {/* Geometric Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-grid-pattern"></div>
        </div>
      </div>

      <div className="relative z-10 pb-32">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <div className="text-center mb-20 relative">
  <video autoPlay loop muted playsInline loading="lazy" className="absolute inset-0 w-full h-full object-cover z-0" src={videoSrc} />
            {/* Modern Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-green-200 bg-white/80 backdrop-blur-sm text-green-700 uppercase tracking-wider text-sm font-medium mb-8 shadow-lg shadow-green-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>INTELLIGENT URBAN ANALYTICS</span>
              </div>
              <div className="w-px h-4 bg-green-300"></div>
              <span>NAIROBI 2025</span>
            </div>
            
            <h1 className="mt-8 text-6xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-green-800 to-emerald-700">
                Urban
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                Insights
              </span>
            </h1>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light mb-8">
                Advanced geospatial intelligence platform for sustainable urban development. 
                <span className="text-green-600 font-medium"> Monitoring environmental health </span>
                while identifying optimal growth patterns for Nairobi's future.
              </p>
              
              {/* Status Indicator */}
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-green-200 shadow-lg shadow-green-50 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 text-sm font-medium">SYSTEMS: ONLINE</span>
                </div>
                <div className="w-px h-4 bg-green-300"></div>
                <span className="text-gray-500 text-sm font-medium">DATA STREAM: ACTIVE</span>
              </div>
            </div>

            <Link
              to="/dashboard/settlement-growth"
              className="group inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
            >
              <span>EXPLORE DASHBOARD</span>
              <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              {
                title: 'Settlement Growth',
                description: 'AI-powered suitability analysis for optimal urban expansion zones',
                icon: <FaCity className="text-2xl text-green-600" />,
                status: 'Active',
                metric: '3 High Potential Zones'
              },
              {
                title: 'Environmental Monitoring',
                description: 'Real-time air and water quality tracking with predictive analytics',
                icon: <FaThermometerHalf className="text-2xl text-green-600" />,
                status: 'Live',
                metric: '17 Sensors Online'
              },
              {
                title: 'Risk Assessment',
                description: 'Multi-factor environmental risk overlay and advisory system',
                icon: <FaExclamationTriangle className="text-2xl text-green-600" />,
                status: 'Analyzing',
                metric: '5 Active Alerts'
              },
              {
                title: 'Data Intelligence',
                description: 'Machine learning insights with explainable AI recommendations',
                icon: <FaChartBar className="text-2xl text-green-600" />,
                status: 'Processing',
                metric: '94% Accuracy'
              }
            ].map((module, index) => (
              <div key={index} className="relative group">
                <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-green-100 hover:border-green-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-100">
                  {/* Module Header */}
                  <div className="flex items-center justify-between mb-4">
                    {module.icon}
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full border border-green-200">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 text-xs font-medium">{module.status}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{module.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{module.description}</p>
                  
                  <div className="text-green-700 text-sm font-medium border-t border-green-100 pt-3">
                    {module.metric}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Data Section */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border border-green-100 p-8 mb-16 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600">
                Live Urban Data
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 text-sm font-medium">Real-time Feed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Air Quality Index', value: '156', trend: '+12%', unit: 'AQI', color: 'text-orange-600' },
                { label: 'Water Quality Score', value: '72', trend: 'Stable', unit: 'WQI', color: 'text-cyan-600' },
                { label: 'Growth Suitability', value: '0.77', trend: 'Optimal', unit: 'Score', color: 'text-green-600' },
                { label: 'Data Coverage', value: '92%', trend: 'Complete', unit: 'Coverage', color: 'text-emerald-600' }
              ].map((metric, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-2xl border border-green-100 hover:border-green-300 transition-all group shadow-sm">
                  <div className="text-gray-500 text-sm font-medium mb-2">{metric.label}</div>
                  <div className={`text-4xl font-black ${metric.color} mb-2 group-hover:scale-110 transition-transform`}>
                    {metric.value}
                  </div>
                  <div className="text-gray-400 text-xs">{metric.unit}</div>
                  <div className="text-green-600 text-xs font-medium mt-2">{metric.trend}</div>
                </div>
              ))}
            </div>

            {/* Data Visualization */}
            <div className="mt-8 p-6 bg-green-50/50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium text-sm">Data Stream Visualization</span>
              </div>
              <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-width rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="sticky top-4 z-50 mb-16">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-green-100 p-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { name: 'Settlement Analysis', href: '#settlement', icon: <FaCity className="text-lg text-green-600" /> },
                  { name: 'Environment Monitor', href: '#environment', icon: <FaGlobeAfrica className="text-lg text-green-600" /> },
                  { name: 'Data Methodology', href: '#methodology', icon: <FaChartBar className="text-lg text-green-600" /> },
                  { name: 'Our Team', href: '#team', icon: <FaUsers className="text-lg text-green-600" /> },
                  { name: 'Get Started', href: '#start', icon: <FaRocket className="text-lg text-green-600" /> }
                ].map((nav, index) => (
                  <a
                    key={index}
                    href={nav.href}
                    className="group flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 shadow-sm"
                  >
                    {nav.icon}
                    <span className="text-gray-700 font-medium text-sm group-hover:text-green-700 transition-colors">
                      {nav.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Module Sections */}
          <section id="modules" className="mb-20">
            <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 mb-12">
              Platform Modules
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {[
                {
                  title: 'Settlement Growth Intelligence',
                  to: '/dashboard/settlement-growth',
                  icon: <FaCity className="text-4xl text-green-600" />,
                  description: 'Advanced geospatial analysis for optimal urban expansion zones using multi-factor suitability scoring',
                  features: ['Land Availability', 'Infrastructure Readiness', 'Service Proximity', 'Environmental Constraints'],
                  status: 'Active'
                },
                {
                  title: 'Air Quality Monitoring',
                  to: '/dashboard/air-pollution',
                  icon: <FaWind className="text-4xl text-green-600" />,
                  description: 'Real-time pollution monitoring with predictive analytics and health advisory systems',
                  features: ['PM2.5 Tracking', 'NO₂ Levels', 'O₃ Concentrations', 'Health Advisories'],
                  status: 'Live'
                },
                {
                  title: 'Water Quality Surveillance',
                  to: '/dashboard/water-pollution',
                  icon: <FaWater className="text-4xl text-green-600" />,
                  description: 'Comprehensive river quality monitoring with contamination pattern analysis',
                  features: ['WQI Tracking', 'Parameter Exceedances', 'Source Identification', 'Trend Analysis'],
                  status: 'Monitoring'
                },
                {
                  title: 'Analytics Intelligence',
                  to: '/dashboard/why-these-areas',
                  icon: <FaChartLine className="text-4xl text-green-600" />,
                  description: 'Explainable AI insights revealing the drivers behind area rankings and recommendations',
                  features: ['Factor Analysis', 'Impact Scoring', 'Recommendation Engine', 'Risk Assessment'],
                  status: 'Analyzing'
                }
              ].map((module, index) => (
                <Link
                  key={index}
                  to={module.to}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-2xl border border-green-100 p-8 hover:border-green-300 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-green-100"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-4xl">{module.icon}</div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full border border-green-200">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 text-xs font-medium">{module.status}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">
                    {module.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {module.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {module.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-50 rounded-full text-green-700 text-xs border border-green-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-medium text-sm group-hover:translate-x-2 transition-transform">
                      Access Module →
                    </span>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section id="start" className="text-center">
            <div className="bg-gradient-to-r from-white to-green-50 rounded-3xl border border-green-200 p-12 shadow-xl">
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join urban planners and environmental scientists using advanced geospatial intelligence to shape Nairobi's sustainable future.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  to="/dashboard/settlement-growth"
                  className="group flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
                >
                  <span>LAUNCH DASHBOARD</span>
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <a
                  href="#methodology"
                  className="group flex items-center gap-4 px-12 py-6 bg-white text-gray-700 font-bold text-lg rounded-2xl border border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-300 shadow-lg"
                >
                  <span>VIEW METHODOLOGY</span>
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-green-100 p-12 shadow-lg">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">UI</span>
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold text-lg">Urban Insights</div>
                      <div className="text-green-600 text-sm font-medium">Intelligent Urban Analytics</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Advanced geospatial intelligence for sustainable urban development in Nairobi.
                  </p>
                </div>
                
                {[
                  {
                    title: 'PLATFORM MODULES',
                    links: [
                      { name: 'Settlement Growth', to: '/dashboard/settlement-growth' },
                      { name: 'Air Quality Monitor', to: '/dashboard/air-pollution' },
                      { name: 'Water Quality', to: '/dashboard/water-pollution' },
                      { name: 'Analytics Engine', to: '/dashboard/why-these-areas' }
                    ]
                  },
                  {
                    title: 'RESOURCES',
                    links: [
                      { name: 'Methodology', href: '#methodology' },
                      { name: 'Data Sources', href: '#sources' },
                      { name: 'API Documentation', href: '#api' },
                      { name: 'System Status', href: '#status' }
                    ]
                  },
                  {
                    title: 'SUPPORT',
                    links: [
                      { name: 'Contact Team', href: 'mailto:contact@urbaninsights.local' },
                      { name: 'Technical Support', href: '#support' },
                      { name: 'Feature Requests', href: '#features' },
                      { name: 'Bug Reports', href: '#bugs' }
                    ]
                  }
                ].map((section, index) => (
                  <div key={index}>
                    <h3 className="text-green-700 font-bold mb-4 text-sm uppercase tracking-wider">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.links.map((link, idx) => (
                        <li key={idx}>
                          {link.to ? (
                            <Link to={link.to} className="text-gray-600 hover:text-green-700 transition-colors text-sm">
                              {link.name}
                            </Link>
                          ) : (
                            <a href={link.href} className="text-gray-600 hover:text-green-700 transition-colors text-sm">
                              {link.name}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-green-200 pt-8 text-center">
                <div className="text-gray-500 text-sm">
                  © 2025 Urban Insights • Sustainable Urban Development Platform
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.1; }
        }
        @keyframes pulse-width {
          0%, 100% { width: 0%; }
          50% { width: 100%; }
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        .animate-pulse-width {
          animation: pulse-width 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;