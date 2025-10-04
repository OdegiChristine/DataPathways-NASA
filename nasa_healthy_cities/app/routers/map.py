# Simple Leaflet map frontend for Nairobi to visualize greenspace NDVI and health facilities
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter()

@router.get("/map", response_class=HTMLResponse)
def map_page():
    html = """
    <!DOCTYPE html>
    <html lang=\"en\">
    <head>
      <meta charset=\"UTF-8\" />
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
      <title>Nairobi Health & Greenspace Map</title>
      <link rel=\"stylesheet\" href=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css\" integrity=\"sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=\" crossorigin=\"\" />
      <style>
        html, body { height: 100%; margin: 0; }
        #app { display: flex; height: 100%; }
        #map { flex: 1; }
        #sidebar { width: 360px; max-width: 40%; background: #f7f7f9; border-left: 1px solid #ddd; padding: 12px; overflow: auto; }
        .row { margin-bottom: 10px; }
        label { display: block; font-weight: 600; margin-bottom: 4px; }
        input { width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 8px 10px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .metric { background: white; border: 1px solid #ddd; border-radius: 6px; padding: 8px; margin-bottom: 8px; }
        .metric h4 { margin: 0 0 6px 0; }
      </style>
    </head>
    <body>
      <div id=\"app\">
        <div id=\"map\"></div>
        <div id=\"sidebar\">
          <h3>Nairobi Urban Health & Greenspace</h3>
          <div class=\"row\">
            <label for=\"buffer\">Buffer (meters)</label>
            <input id=\"buffer\" type=\"number\" min=\"100\" step=\"100\" value=\"1500\" />
          </div>
          <div class=\"row\">
            <label for=\"threshold\">NDVI threshold (0.0–1.0)</label>
            <input id=\"threshold\" type=\"number\" min=\"0\" max=\"1\" step=\"0.05\" value=\"0.35\" />
          </div>
          <div class=\"row\">
            <button id=\"clear\">Clear Layers</button>
          </div>
          <div class=\"metric\" id=\"metrics\">
            <h4>Click anywhere on the map to query</h4>
            <div id=\"metrics-content\"></div>
          </div>
          <div class=\"metric\">
            <h4>Tips</h4>
            <ul>
              <li>Use threshold 0.3–0.4 for greenspace coverage.</li>
              <li>Buffer 1000–2000 m works well for neighborhood analysis.</li>
            </ul>
          </div>
        </div>
      </div>
      <script src=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js\" integrity=\"sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=\" crossorigin=\"\"></script>
      <script>
        const center = [-1.286389, 36.817223]; // Nairobi CBD
        const map = L.map('map').setView(center, 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const facilityLayer = L.layerGroup().addTo(map);
        const bufferLayer = L.layerGroup().addTo(map);
        const pointLayer = L.layerGroup().addTo(map);

        const metricsEl = document.getElementById('metrics-content');
        const bufferInput = document.getElementById('buffer');
        const thresholdInput = document.getElementById('threshold');
        const clearBtn = document.getElementById('clear');

        clearBtn.addEventListener('click', () => {
          facilityLayer.clearLayers();
          bufferLayer.clearLayers();
          pointLayer.clearLayers();
          metricsEl.innerHTML = '';
        });

        function fmt(n) { return typeof n === 'number' ? n.toFixed(2) : n; }

        async function queryAt(lat, lon) {
          const buffer = parseFloat(bufferInput.value || '1500');
          const threshold = parseFloat(thresholdInput.value || '0.35');
          // Marker and buffer
          const pt = L.circleMarker([lat, lon], { radius: 6, color: '#c62828' }).addTo(pointLayer);
          const circle = L.circle([lat, lon], { radius: buffer, color: '#1976d2', fillOpacity: 0.05 }).addTo(bufferLayer);

          try {
            // Greenspace NDVI coverage
            const gUrl = `/greenspace/cover/${lat}/${lon}?buffer=${buffer}&threshold=${threshold}`;
            const gResp = await fetch(gUrl);
            const gJson = await gResp.json();
            const ndvi = gJson?.ndvi?.properties?.ndvi || {};

            // Health facilities
            const hUrl = `/healthfacilities/${lat}/${lon}`;
            const hResp = await fetch(hUrl);
            const hJson = await hResp.json();
            facilityLayer.clearLayers();
            if (hJson?.features) {
              hJson.features.forEach(f => {
                const [lonF, latF] = f.geometry.coordinates;
                const name = f.properties?.name || 'Health facility';
                const tags = Object.entries(f.properties || {}).filter(([k]) => ['name','amenity','healthcare','distance_km'].includes(k)).map(([k,v]) => `${k}: ${v}`).join('<br/>');
                L.marker([latF, lonF]).bindPopup(`<strong>${name}</strong><br/>${tags}`).addTo(facilityLayer);
              });
            }

            metricsEl.innerHTML = `
              <div><strong>Lat/Lon:</strong> ${fmt(lat)}, ${fmt(lon)}</div>
              <div><strong>Buffer:</strong> ${fmt(buffer)} m | <strong>Threshold:</strong> ${fmt(threshold)}</div>
              <hr/>
              <div><strong>Mean NDVI:</strong> ${fmt(ndvi.value)}</div>
              <div><strong>Coverage ≥ threshold:</strong> ${fmt(ndvi.vegetation_coverage_percent)} %</div>
              <div style=\"font-size: 12px; color: #555;\"><em>${ndvi.notes || ''}</em></div>
              <hr/>
              <div><strong>Health facilities returned:</strong> ${hJson?.features?.length || 0}</div>
            `;

            pt.bindPopup(`Mean NDVI: ${fmt(ndvi.value)}<br/>Coverage ≥ threshold: ${fmt(ndvi.vegetation_coverage_percent)}%`).openPopup();
          } catch (e) {
            metricsEl.innerHTML = `<span style=\"color: #c62828\">Error: ${e}</span>`;
          }
        }

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          queryAt(lat, lng);
        });

        // Initial query at CBD
        queryAt(center[0], center[1]);
      </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)