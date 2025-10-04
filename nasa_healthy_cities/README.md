# Data Pathways to Healthy Cities and Human Settlements

A hackathon project for the **NASA Space Apps Challenge 2025**.
We use NASA Earth observation data and socio-economic datasets to analyze urban health indicators (climate, air quality, urban heat islands, and population exposure).

This backend is built with Python + FastAPI and exposes APIs for fetching NASA data and performing analysis.

## 🚀 Tech Stack

- Backend: Python, FastAPI, Uvicorn
- Data Processing: Pandas, GeoPandas, Rasterio, Shapely
- Visualization (optional): Plotly, Folium
- Deployment: Render / Vercel (frontend), Streamlit (optional dashboards)

## ⚡️ Features

Fetch climate and environmental data from NASA POWER API

Load and analyze geospatial datasets (GeoTIFF, Shapefiles, GeoJSON)

Perform basic analysis (urban heat stress, hotspots, etc.)

Provide JSON endpoints for integration with a frontend dashboard

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/OdegiChristine/DataPathways-NASA.git
cd nasa-healthy-cities
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload
```

Server runs at:
👉 `http://127.0.0.1:8000`

Docs: 👉 `http://127.0.0.1:8000/docs`
