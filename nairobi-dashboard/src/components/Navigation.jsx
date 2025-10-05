// src/components/Navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard/settlement-growth', label: 'Settlement Growth' },
    { path: '/dashboard/why-these-areas', label: 'Why These Areas' },
    { path: '/dashboard/air-pollution', label: 'Air Pollution' },
    { path: '/dashboard/water-pollution', label: 'Water Pollution' },
    { path: '/dashboard/assistant', label: 'AI Assistant' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg"></div>
              <span className="font-bold text-gray-800 text-lg">
                Urban Insights
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-green-600 bg-green-50 border-b-2 border-green-600'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
              Share View
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;