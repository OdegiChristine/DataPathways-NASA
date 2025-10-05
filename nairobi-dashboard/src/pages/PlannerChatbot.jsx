// src/pages/PlannerChatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different data types
const createCustomIcon = (color, type) => {
  const iconHtml = `
    <div style="
      background: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
    ">
      ${type === 'air' ? '🌫️' : type === 'water' ? '💧' : type === 'green' ? '🌳' : type === 'comparison' ? '⚖️' : '📍'}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: 'custom-marker'
  });
};

// Map controller component
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

// Map click handler component
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e);
    },
  });
  return null;
};

// Enhanced Local Engine with comprehensive data
const LocalEngine = {
  getAirHotspots: (city = 'Nairobi', pollutant = 'PM2.5', limit = 8) => {
    const hotspots = [
      { 
        location: 'Industrial Area', 
        value: 78, 
        trend: 'rising', 
        advisory: 'Unhealthy',
        coordinates: [-1.3100, 36.8300],
        sources: ['Industrial emissions', 'Vehicle traffic'],
        recommendations: ['Emission controls', 'Traffic management']
      },
      { 
        location: 'CBD', 
        value: 65, 
        trend: 'stable', 
        advisory: 'Unhealthy for Sensitive',
        coordinates: [-1.2864, 36.8172],
        sources: ['Vehicle congestion', 'Construction'],
        recommendations: ['Public transport', 'Green buildings']
      },
      { 
        location: 'Eastleigh', 
        value: 58, 
        trend: 'rising', 
        advisory: 'Moderate',
        coordinates: [-1.2700, 36.8500],
        sources: ['Dense traffic', 'Waste burning'],
        recommendations: ['Waste management', 'Traffic optimization']
      },
      { 
        location: 'Kibera', 
        value: 52, 
        trend: 'stable', 
        advisory: 'Moderate',
        coordinates: [-1.3100, 36.7800],
        sources: ['Informal settlements', 'Biomass burning'],
        recommendations: ['Clean energy', 'Housing upgrades']
      },
      { 
        location: 'Westlands', 
        value: 45, 
        trend: 'falling', 
        advisory: 'Moderate',
        coordinates: [-1.2600, 36.8000],
        sources: ['Traffic', 'Commercial activities'],
        recommendations: ['Green spaces', 'Emission monitoring']
      }
    ];
    return { hotspots: hotspots.slice(0, limit) };
  },

  getAirTimeseries: (lat, lon, pollutant = 'PM2.5', months = 12) => {
    const baseValue = 40 + Math.sin(lat * 10) * 15 + Math.cos(lon * 10) * 10;
    const series = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const monthVariation = Math.sin(i * 0.5) * 8;
      const seasonalEffect = Math.sin(i * 0.5 + 2) * 12;
      const randomNoise = (Math.random() - 0.5) * 10;
      
      const value = Math.max(20, Math.min(120, baseValue + monthVariation + seasonalEffect + randomNoise));
      
      series.push({
        date: date.toISOString().slice(0, 7),
        value: Math.round(value),
        PM2_5: Math.round(value),
        NO2: Math.round(value * 0.6),
        CO: parseFloat((value * 0.02).toFixed(2)),
        O3: Math.round(value * 0.4),
        trend: value > baseValue + 5 ? 'rising' : value < baseValue - 5 ? 'falling' : 'stable'
      });
    }
    
    return { 
      series,
      location: { lat, lon },
      summary: {
        average: Math.round(series.reduce((a, b) => a + b.value, 0) / series.length),
        max: Math.max(...series.map(s => s.value)),
        min: Math.min(...series.map(s => s.value)),
        trend: series[0].value < series[series.length - 1].value ? 'improving' : 'deteriorating'
      }
    };
  },

  getWaterSamplingSites: () => {
    const sites = [
      {
        type: 'Feature',
        properties: {
          location: 'Nairobi River - Museum Hill',
          nitrates: 12.5,
          lead: 0.08,
          pH: 7.2,
          turbidity: 15,
          quality: 'Moderate',
          risks: ['Agricultural runoff', 'Urban drainage'],
          coordinates: [-1.2921, 36.8219]
        },
        geometry: { type: 'Point', coordinates: [36.8219, -1.2921] }
      },
      {
        type: 'Feature',
        properties: {
          location: 'Ngong River - Karen',
          nitrates: 8.2,
          lead: 0.05,
          pH: 6.8,
          turbidity: 22,
          quality: 'Good',
          risks: ['Sedimentation', 'Seasonal variations'],
          coordinates: [-1.3194, 36.7086]
        },
        geometry: { type: 'Point', coordinates: [36.7086, -1.3194] }
      },
      {
        type: 'Feature',
        properties: {
          location: 'Mathare River - Eastleigh',
          nitrates: 25.8,
          lead: 0.15,
          pH: 6.5,
          turbidity: 45,
          quality: 'Poor',
          risks: ['Industrial discharge', 'Solid waste'],
          coordinates: [-1.2700, 36.8500]
        },
        geometry: { type: 'Point', coordinates: [36.8500, -1.2700] }
      }
    ];
    
    return { features: sites };
  },

  getGreenspaceCover: (lat, lon, buffer = 1000) => {
    const urbanDensity = Math.abs(lat * 100) % 1;
    const baseCoverage = 0.25 + (1 - urbanDensity) * 0.4;
    const locationEffect = Math.sin(lat * 20) * 0.1 + Math.cos(lon * 20) * 0.1;
    const coverage = Math.max(0.1, Math.min(0.8, baseCoverage + locationEffect));
    
    return {
      coverage_pct: coverage,
      area_km2: (buffer * buffer * 1e-6 * coverage).toFixed(2),
      coordinates: { lat, lon },
      green_areas: [
        { type: 'Public Parks', area: (coverage * 0.4).toFixed(2), examples: ['Neighborhood parks', 'Playgrounds'] },
        { type: 'Forest Areas', area: (coverage * 0.3).toFixed(2), examples: ['Urban forests', 'Woodlands'] },
        { type: 'Agricultural Land', area: (coverage * 0.2).toFixed(2), examples: ['Community gardens', 'Urban farms'] },
        { type: 'Water Bodies', area: (coverage * 0.1).toFixed(2), examples: ['Rivers', 'Lakes', 'Ponds'] }
      ],
      assessment: coverage > 0.3 ? 'Adequate' : coverage > 0.15 ? 'Moderate' : 'Inadequate'
    };
  },

  getAreasComparison: () => {
    const areas = [
      {
        name: 'Ruai',
        vulnerability_score: 0.72,
        greenspace: 35,
        population_density: 2800,
        air_quality: 58,
        water_quality: 65,
        flood_risk: 'High',
        development_potential: 'Medium',
        coordinates: [-1.3200, 36.9500],
        key_issues: ['Wastewater management', 'Flood plains', 'Infrastructure gap'],
        priority_actions: ['Wastewater treatment plant', 'Flood control measures', 'Road network upgrade']
      },
      {
        name: 'Kitengela',
        vulnerability_score: 0.65,
        greenspace: 28,
        population_density: 1900,
        air_quality: 62,
        water_quality: 58,
        flood_risk: 'Medium',
        development_potential: 'High',
        coordinates: [-1.4700, 36.9500],
        key_issues: ['Rapid urbanization', 'Water scarcity', 'Soil erosion'],
        priority_actions: ['Water harvesting', 'Controlled development', 'Soil conservation']
      },
      {
        name: 'Ngong',
        vulnerability_score: 0.58,
        greenspace: 45,
        population_density: 1500,
        air_quality: 48,
        water_quality: 72,
        flood_risk: 'Low',
        development_potential: 'Medium',
        coordinates: [-1.3600, 36.6500],
        key_issues: ['Deforestation', 'Wildlife conflict', 'Tourism pressure'],
        priority_actions: ['Reforestation', 'Wildlife corridors', 'Sustainable tourism']
      }
    ];
    
    return { comparison: areas };
  },

  getExposure: (lat, lon) => {
    const urbanIndex = Math.abs(lat * 100) % 1;
    const trafficEffect = Math.sin(lon * 50) * 0.3;
    
    return {
      coordinates: { lat, lon },
      risk_factors: {
        air_pollution: Math.round(40 + urbanIndex * 30 + trafficEffect * 20),
        noise_pollution: Math.round(50 + urbanIndex * 25),
        heat_island: Math.round(urbanIndex * 40),
        flood_risk: urbanIndex > 0.7 ? 'High' : urbanIndex > 0.4 ? 'Medium' : 'Low',
        green_access: Math.round((1 - urbanIndex) * 70)
      },
      overall_risk: urbanIndex > 0.6 ? 'High' : urbanIndex > 0.3 ? 'Medium' : 'Low',
      vulnerable_groups: urbanIndex > 0.6 ? 
        ['Children', 'Elderly', 'Respiratory patients'] : 
        ['Outdoor workers', 'Sensitive populations'],
      recommendations: [
        'Install real-time air quality monitors',
        'Develop green infrastructure network',
        'Implement traffic management system',
        'Enhance public health outreach programs',
        'Establish emergency response protocols'
      ]
    };
  },

  getSpatialAnalysis: (bounds) => {
    // Simulate spatial analysis based on map bounds
    const centerLat = (bounds.south + bounds.north) / 2;
    const centerLng = (bounds.west + bounds.east) / 2;
    
    return {
      bounds,
      center: { lat: centerLat, lng: centerLng },
      analysis: {
        population_density: Math.round(2000 + Math.sin(centerLat * 10) * 1000),
        green_coverage: Math.round(25 + Math.cos(centerLng * 10) * 20),
        air_quality_index: Math.round(50 + Math.sin(centerLat * 5) * 20),
        flood_zones: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
        development_pressure: Math.round(60 + Math.sin(centerLat * 8) * 30)
      },
      recommendations: [
        'Assess infrastructure capacity',
        'Plan green space network',
        'Monitor air quality trends',
        'Evaluate flood mitigation needs'
      ]
    };
  },

  // New method for conversation context
  getFollowUpQuestions: (currentTopic) => {
    const followUps = {
      air_hotspots: [
        "What are the main sources of pollution in these areas?",
        "How can we reduce air pollution in these hotspots?",
        "Show me historical trends for these locations",
        "Compare with other cities"
      ],
      water_sampling: [
        "What are the health risks associated with these water quality levels?",
        "How can we improve water quality in these rivers?",
        "Show me treatment recommendations",
        "Compare with national standards"
      ],
      areas_comparison: [
        "Which area has the highest development potential?",
        "What are the key interventions needed?",
        "Show me detailed analysis for a specific area",
        "Compare environmental risks"
      ],
      location_analysis: [
        "What infrastructure is needed here?",
        "Show me development recommendations",
        "What are the environmental risks?",
        "Compare with surrounding areas"
      ],
      general: [
        "Tell me about urban planning best practices",
        "How can I improve environmental quality in my city?",
        "What data sources do you use?",
        "Show me sustainability metrics"
      ]
    };
    
    return followUps[currentTopic] || followUps.general;
  }
};

// Enhanced chatbot component
const PlannerChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "🌍 Welcome to Urban Intelligence Assistant! I can help you analyze environmental data, compare areas, and provide planning recommendations. You can also click on the map to get location-specific insights.",
      id: Date.now(),
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mapCenter, setMapCenter] = useState([-1.2864, 36.8172]); // Nairobi center
  const [mapZoom, setMapZoom] = useState(10);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [conversationContext, setConversationContext] = useState({
    currentTopic: 'general',
    lastLocation: null,
    followUpQuestions: []
  });
  const messagesEndRef = useRef(null);

  const suggestions = [
    { text: 'Show air quality hotspots', emoji: '🌫️', type: 'air' },
    { text: 'Analyze water quality sites', emoji: '💧', type: 'water' },
    { text: 'Compare urban areas', emoji: '⚖️', type: 'comparison' },
    { text: 'Spatial analysis of this area', emoji: '🗺️', type: 'spatial' },
    { text: 'Greenspace coverage map', emoji: '🌳', type: 'greenspace' },
    { text: 'Environmental exposure assessment', emoji: '🛡️', type: 'exposure' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseLatLon = (t) => {
    const m = t.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    return m ? { lat: parseFloat(m[1]), lon: parseFloat(m[2]) } : null;
  };

  const parseIntent = (t) => {
    const s = t.toLowerCase();
    const c = parseLatLon(t);
    
    if (s.includes('hotspot') || s.includes('air quality')) return { type: 'air_hotspots' };
    if (s.includes('air') && (s.includes('timeseries') || c)) return { type: 'air_timeseries', c };
    if (s.includes('water') && (s.includes('site') || s.includes('sampling') || s.includes('quality'))) return { type: 'water_sampling' };
    if (s.includes('greenspace') || s.includes('green space')) return { type: 'greenspace_cover', c };
    if (s.includes('compare') || s.includes('comparison')) return { type: 'areas_comparison' };
    if (s.includes('exposure') || s.includes('risk')) return { type: 'exposure', c };
    if (s.includes('spatial') || s.includes('map') || s.includes('area analysis')) return { type: 'spatial_analysis' };
    if (s.includes('hello') || s.includes('hi') || s.includes('hey')) return { type: 'greeting' };
    if (s.includes('thank') || s.includes('thanks')) return { type: 'thanks' };
    if (s.includes('help')) return { type: 'help' };
    
    return { type: 'general' };
  };

  const addMessage = (role, content, data = null) => {
    const newMessage = {
      role,
      content,
      data,
      id: Date.now() + Math.random(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const simulateTyping = async (responseText, responseData = null, followUpQuestions = []) => {
    setIsTyping(true);
    
    const thinkingTime = Math.min(2000, Math.max(800, responseText.length * 15));
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    
    const message = addMessage('assistant', responseText, responseData);
    
    // Update conversation context with follow-up questions
    if (followUpQuestions.length > 0) {
      setConversationContext(prev => ({
        ...prev,
        followUpQuestions
      }));
    }
    
    setIsTyping(false);
    return message;
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setMapCenter([lat, lng]);
    setMapZoom(14);
    
    addMessage('user', `Analyze location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    
    // Get comprehensive analysis for clicked location
    const exposure = LocalEngine.getExposure(lat, lng);
    const greenspace = LocalEngine.getGreenspaceCover(lat, lng);
    const airQuality = LocalEngine.getAirTimeseries(lat, lng);
    
    const followUps = LocalEngine.getFollowUpQuestions('location_analysis');
    
    await simulateTyping(
      `📍 **Location Analysis** (${lat.toFixed(4)}, ${lng.toFixed(4)})\n\n` +
      `**Environmental Overview:**\n` +
      `• Air Quality: ${airQuality.summary.average} μg/m³ (${airQuality.summary.trend})\n` +
      `• Greenspace: ${(greenspace.coverage_pct * 100).toFixed(1)}% coverage\n` +
      `• Overall Risk: ${exposure.overall_risk}\n\n` +
      `**Key Insights:**\n` +
      `• ${exposure.risk_factors.green_access}% green space accessibility\n` +
      `• ${exposure.risk_factors.air_pollution}/100 air pollution index\n` +
      `• Flood risk: ${exposure.risk_factors.flood_risk}\n\n` +
      `**Planning Recommendations:**\n` +
      `• ${exposure.recommendations.slice(0, 3).join('\n• ')}`,
      { type: 'location_analysis', data: { exposure, greenspace, airQuality, coordinates: { lat, lng } } },
      followUps
    );
    
    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      currentTopic: 'location_analysis',
      lastLocation: { lat, lng }
    }));
    
    // Add marker for clicked location
    setMapMarkers([{
      position: [lat, lng],
      type: 'analysis',
      title: 'Location Analysis',
      data: { exposure, greenspace, airQuality }
    }]);
  };

  const handleFollowUpQuestion = async (question) => {
    setInput('');
    addMessage('user', question);
    
    const context = conversationContext;
    
    if (context.currentTopic === 'location_analysis' && context.lastLocation) {
      const { lat, lng } = context.lastLocation;
      
      if (question.includes('infrastructure') || question.includes('development')) {
        const exposure = LocalEngine.getExposure(lat, lng);
        const greenspace = LocalEngine.getGreenspaceCover(lat, lng);
        
        await simulateTyping(
          `🏗️ **Infrastructure Recommendations** for (${lat.toFixed(4)}, ${lng.toFixed(4)})\n\n` +
          `**Based on current conditions:**\n` +
          `• Risk Level: ${exposure.overall_risk}\n` +
          `• Greenspace: ${(greenspace.coverage_pct * 100).toFixed(1)}%\n` +
          `• Flood Risk: ${exposure.risk_factors.flood_risk}\n\n` +
          `**Recommended Infrastructure:**\n` +
          `• Green stormwater management systems\n` +
          `• Air quality monitoring stations\n` +
          `• Public green spaces and parks\n` +
          `• Sustainable transportation networks\n` +
          `• Climate-resilient building standards`,
          { type: 'infrastructure_recommendations' }
        );
      } else if (question.includes('risk') || question.includes('environmental')) {
        const exposure = LocalEngine.getExposure(lat, lng);
        
        await simulateTyping(
          `🛡️ **Environmental Risk Assessment** for (${lat.toFixed(4)}, ${lng.toFixed(4)})\n\n` +
          `**Risk Factors:**\n` +
          `• Air Pollution: ${exposure.risk_factors.air_pollution}/100\n` +
          `• Noise Pollution: ${exposure.risk_factors.noise_pollution}/100\n` +
          `• Heat Island Effect: ${exposure.risk_factors.heat_island}/100\n` +
          `• Flood Risk: ${exposure.risk_factors.flood_risk}\n` +
          `• Green Access: ${exposure.risk_factors.green_access}%\n\n` +
          `**Vulnerable Groups:**\n` +
          `• ${exposure.vulnerable_groups.join('\n• ')}\n\n` +
          `**Mitigation Strategies:**\n` +
          `• ${exposure.recommendations.join('\n• ')}`,
          { type: 'risk_assessment' }
        );
      }
    }
  };

  const send = async (text) => {
    const ask = (text ?? input).trim();
    if (!ask) return;
    setInput('');
    addMessage('user', ask);
    setLoading(true);

    const intent = parseIntent(ask);
    try {
      if (intent.type === 'air_hotspots') {
        const data = LocalEngine.getAirHotspots();
        setMapMarkers(data.hotspots.map(hotspot => ({
          position: hotspot.coordinates,
          type: 'air',
          title: `${hotspot.location} - PM2.5: ${hotspot.value}`,
          data: hotspot
        })));
        setMapCenter([-1.2864, 36.8172]);
        setMapZoom(11);
        setShowMap(true);
        
        const followUps = LocalEngine.getFollowUpQuestions('air_hotspots');
        
        await simulateTyping(
          `🌫️ **Air Quality Hotspots - Nairobi**\n\n` +
          `${data.hotspots.map(h => `• ${h.location}: ${h.value} μg/m³ (${h.trend}) - ${h.advisory}`).join('\n')}\n\n` +
          `**Primary Sources:**\n` +
          `${data.hotspots.map(h => `• ${h.location}: ${h.sources.join(', ')}`).join('\n')}\n\n` +
          `**Immediate Actions:**\n` +
          `${data.hotspots.map(h => `• ${h.location}: ${h.recommendations.join(', ')}`).join('\n')}`,
          { type: 'air_hotspots', data },
          followUps
        );
        
        setConversationContext(prev => ({
          ...prev,
          currentTopic: 'air_hotspots'
        }));
        
      } else if (intent.type === 'water_sampling') {
        const data = LocalEngine.getWaterSamplingSites();
        setMapMarkers(data.features.map(site => ({
          position: site.properties.coordinates,
          type: 'water',
          title: `${site.properties.location} - Quality: ${site.properties.quality}`,
          data: site.properties
        })));
        setShowMap(true);
        
        const followUps = LocalEngine.getFollowUpQuestions('water_sampling');
        
        await simulateTyping(
          `💧 **Water Quality Monitoring Network**\n\n` +
          `${data.features.map(s => 
            `• ${s.properties.location}\n  - Nitrates: ${s.properties.nitrates} mg/L\n  - Lead: ${s.properties.lead} mg/L\n  - Quality: ${s.properties.quality}\n  - Risks: ${s.properties.risks.join(', ')}`
          ).join('\n\n')}\n\n` +
          `**Priority Interventions:**\n` +
          `• Upgrade wastewater treatment at critical points\n• Implement riparian buffer zones\n• Enhance stormwater management\n• Community water quality monitoring`,
          { type: 'water_sampling', data },
          followUps
        );
        
        setConversationContext(prev => ({
          ...prev,
          currentTopic: 'water_sampling'
        }));
        
      } else if (intent.type === 'areas_comparison') {
        const data = LocalEngine.getAreasComparison();
        setMapMarkers(data.comparison.map(area => ({
          position: area.coordinates,
          type: 'comparison',
          title: `${area.name} - Vulnerability: ${(area.vulnerability_score * 100).toFixed(0)}%`,
          data: area
        })));
        setShowMap(true);
        
        const followUps = LocalEngine.getFollowUpQuestions('areas_comparison');
        
        await simulateTyping(
          `⚖️ **Urban Area Comparative Analysis**\n\n` +
          `${data.comparison.map(area => 
            `**${area.name}**\n` +
            `• Vulnerability: ${(area.vulnerability_score * 100).toFixed(0)}%\n` +
            `• Greenspace: ${area.greenspace}%\n` +
            `• Air Quality: ${area.air_quality}/100\n` +
            `• Development Potential: ${area.development_potential}\n` +
            `• Key Issues: ${area.key_issues.join(', ')}\n` +
            `• Priority Actions: ${area.priority_actions.join('; ')}`
          ).join('\n\n')}`,
          { type: 'areas_comparison', data },
          followUps
        );
        
        setConversationContext(prev => ({
          ...prev,
          currentTopic: 'areas_comparison'
        }));
        
      } else if (intent.type === 'spatial_analysis') {
        setShowMap(true);
        await simulateTyping(
          `🗺️ **Spatial Analysis Mode Activated**\n\n` +
          `Click anywhere on the map to get detailed environmental analysis for that location.\n\n` +
          `**Available Analyses:**\n` +
          `• Air quality trends and hotspots\n• Water quality monitoring\n• Greenspace coverage\n• Environmental exposure\n• Flood risk assessment\n• Development potential\n\n` +
          `**How to use:**\n` +
          `1. Click on any location on the map\n` +
          `2. I'll provide comprehensive analysis\n` +
          `3. Use the data for planning decisions`
        );
      } else if (intent.type === 'greeting') {
        await simulateTyping(
          `👋 Hello! I'm your Urban Intelligence Assistant. I can help you with:\n\n` +
          `• Environmental data analysis\n• Urban planning recommendations\n• Risk assessment and mapping\n• Sustainability planning\n\n` +
          `What would you like to explore today? You can click on the map or ask me about specific locations or topics!`
        );
      } else if (intent.type === 'thanks') {
        await simulateTyping(
          `You're welcome! 😊 I'm glad I could help with your urban planning needs. Is there anything else you'd like to know about environmental data, risk assessment, or urban development?`
        );
      } else if (intent.type === 'help') {
        await simulateTyping(
          `🆘 **How to use Urban Intelligence Assistant:**\n\n` +
          `**1. Ask about specific data:**\n` +
          `• "Show air quality hotspots"\n` +
          `• "Analyze water quality"\n` +
          `• "Compare urban areas"\n\n` +
          `**2. Click on the map:**\n` +
          `• Click any location for detailed analysis\n` +
          `• View environmental risks and recommendations\n` +
          `• Get planning insights\n\n` +
          `**3. Follow-up questions:**\n` +
          `• Ask for more details after any analysis\n` +
          `• Request specific recommendations\n` +
          `• Compare different scenarios\n\n` +
          `**4. Use quick suggestions:**\n` +
          `• Click the buttons above for common queries\n` +
          `• Toggle map visibility as needed`
        );
      } else {
        await simulateTyping(
          `🤖 **Urban Intelligence Assistant**\n\n` +
          `I specialize in comprehensive urban environmental analysis. Here's what I can help you with:\n\n` +
          `🌫️ **Air Quality Management**\n• Real-time hotspot analysis\n• Pollution trend forecasting\n• Source apportionment studies\n• Mitigation strategy development\n\n` +
          `💧 **Water Resources**\n• Quality monitoring network\n• Pollution source tracking\n• Watershed management\n• Treatment optimization\n\n` +
          `🌳 **Greenspace Planning**\n• Coverage analysis\n• Accessibility assessment\n• Biodiversity corridors\n• Climate resilience planning\n\n` +
          `⚖️ **Comparative Analysis**\n• Area vulnerability assessment\n• Development potential mapping\n• Risk prioritization\n• Investment planning\n\n` +
          `🛡️ **Exposure Assessment**\n• Multi-hazard risk analysis\n• Community vulnerability\n• Adaptation planning\n• Emergency response\n\n` +
          `🗺️ **Spatial Intelligence**\n• Interactive mapping\n• Location-specific insights\n• Spatial pattern analysis\n• Planning optimization`
        );
      }
    } catch (e) {
      await simulateTyping('⚠️ I encountered an issue processing your request. Please try rephrasing your question or check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex-1 flex">
        {/* Chat Panel */}
        <div className={`${showMap ? 'w-1/2' : 'w-full'} flex flex-col p-4 transition-all duration-300`}>
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">🌍</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-700 bg-clip-text text-transparent">
                    Urban Intelligence Assistant
                  </h1>
                  <p className="text-gray-600 text-sm">AI-powered environmental planning and analysis</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-full border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => send(suggestion.text)}
                  disabled={loading || isTyping}
                >
                  <span>{suggestion.emoji}</span>
                  <span>{suggestion.text}</span>
                </button>
              ))}
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-full border border-green-200 bg-white text-green-700 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span>{showMap ? '💬' : '🗺️'}</span>
                <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
              </button>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-2xl px-4 py-3 ${message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      {message.data && (
                        <div className="mt-2 text-xs text-gray-500">
                          {message.data.type === 'location_analysis' && '📍 Location Analysis Provided'}
                          {message.data.type === 'air_hotspots' && '🌫️ Air Quality Data'}
                          {message.data.type === 'water_sampling' && '💧 Water Quality Data'}
                          {message.data.type === 'areas_comparison' && '⚖️ Comparative Analysis'}
                          {message.data.type === 'infrastructure_recommendations' && '🏗️ Infrastructure Recommendations'}
                          {message.data.type === 'risk_assessment' && '🛡️ Risk Assessment'}
                        </div>
                      )}
                      <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Follow-up Questions */}
                {conversationContext.followUpQuestions.length > 0 && !loading && !isTyping && (
                  <div className="mb-3 flex justify-start">
                    <div className="max-w-[90%]">
                      <p className="text-xs text-gray-500 mb-2">Follow-up questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {conversationContext.followUpQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleFollowUpQuestion(question)}
                            className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-gray-700"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {(loading || isTyping) && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-200 max-w-[90%]">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Analyzing urban data...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Ask about air quality, water resources, urban planning, or click the map..."
                      className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      disabled={loading || isTyping}
                    />
                  </div>
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading || isTyping}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-md"
                  >
                    {loading || isTyping ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Panel */}
        {showMap && (
          <div className="w-1/2 p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg h-full overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Interactive Analysis Map</h3>
                <p className="text-sm text-gray-600">Click anywhere for location analysis</p>
              </div>
              <div className="h-full">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-b-2xl"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapController center={mapCenter} zoom={mapZoom} />
                  <MapClickHandler onMapClick={handleMapClick} />
                  
                  {mapMarkers.map((marker, index) => (
                    <Marker
                      key={index}
                      position={marker.position}
                      icon={createCustomIcon(
                        marker.type === 'air' ? '#ef4444' :
                        marker.type === 'water' ? '#3b82f6' :
                        marker.type === 'comparison' ? '#8b5cf6' :
                        marker.type === 'analysis' ? '#10b981' :
                        '#6b7280',
                        marker.type
                      )}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h4 className="font-bold text-gray-800 mb-2">{marker.title}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            {marker.type === 'air' && (
                              <>
                                <div>Value: {marker.data.value} μg/m³</div>
                                <div>Trend: {marker.data.trend}</div>
                                <div>Advisory: {marker.data.advisory}</div>
                                <div className="mt-2">
                                  <strong>Sources:</strong> {marker.data.sources.join(', ')}
                                </div>
                              </>
                            )}
                            {marker.type === 'water' && (
                              <>
                                <div>Nitrates: {marker.data.nitrates} mg/L</div>
                                <div>Lead: {marker.data.lead} mg/L</div>
                                <div>pH: {marker.data.pH}</div>
                                <div>Quality: {marker.data.quality}</div>
                              </>
                            )}
                            {marker.type === 'comparison' && (
                              <>
                                <div>Vulnerability: {(marker.data.vulnerability_score * 100).toFixed(0)}%</div>
                                <div>Greenspace: {marker.data.greenspace}%</div>
                                <div>Development: {marker.data.development_potential}</div>
                                <div className="mt-2">
                                  <strong>Key Issues:</strong> {marker.data.key_issues.join(', ')}
                                </div>
                              </>
                            )}
                            {marker.type === 'analysis' && (
                              <>
                                <div>Air Quality: {marker.data.airQuality.summary.average} μg/m³</div>
                                <div>Greenspace: {Math.round(marker.data.greenspace.coverage_pct * 100)}%</div>
                                <div>Risk Level: {marker.data.exposure.overall_risk}</div>
                                <div className="mt-2">
                                  <strong>Recommendations:</strong> {marker.data.exposure.recommendations.slice(0, 2).join(', ')}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Click handler indicator */}
                  <div className="leaflet-top leaflet-right">
                    <div className="leaflet-control leaflet-bar bg-white p-2 rounded shadow border">
                      <div className="text-xs text-blue-600 font-medium">
                        🗺️ Click Map to Analyze
                      </div>
                    </div>
                  </div>
                </MapContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannerChatbot;