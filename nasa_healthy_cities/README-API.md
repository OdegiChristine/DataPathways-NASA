# Data Pathways to Healthy Cities API (FastAPI)

Backend for the NASA Space Apps Challenge 2025: Nairobi urban health indicators (climate, air quality, urban heat island, greenspace, and population exposure).

## Quick Start

1) Create and activate a virtual environment
2) Install dependencies
3) Run the server

```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell
pip install -r nasa_healthy_cities/requirements.txt
uvicorn nasa_healthy_cities.app.main:app --reload --port 8000
```

Open docs: http://localhost:8000/docs and http://localhost:8000/redoc

## Endpoints

- GET /healthcheck
- GET /climate/{lat}/{lon}
- POST /heatmap/upload (multipart/form-data with a GeoTIFF)
- GET /airquality/{lat}/{lon}
- GET /greenspace/{lat}/{lon}
- GET /exposure/{lat}/{lon}

Coordinates example (Nairobi CBD): lat=-1.286389, lon=36.817223

### Usage Examples

Climate (Nairobi):
```bash
curl "http://localhost:8000/climate/-1.286389/36.817223"
```

Heatmap upload:
```bash
curl -X POST -F file=@/path/to/modis_lst.tif http://localhost:8000/heatmap/upload
```

Air quality (placeholder):
```bash
curl "http://localhost:8000/airquality/-1.286389/36.817223"
```

Greenspace (placeholder):
```bash
curl "http://localhost:8000/greenspace/-1.286389/36.817223"
```

Population Exposure (placeholder density):
```bash
curl "http://localhost:8000/exposure/-1.286389/36.817223"
```

## Environment Variables

- Set integration keys when adding real data sources.

## Testing

```bash
pip install -r nasa_healthy_cities/requirements.txt
pytest -q
```