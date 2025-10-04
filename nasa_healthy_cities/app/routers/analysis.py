# Routers for analysis endpoints (heatmap upload and exposure)
from fastapi import APIRouter, UploadFile, File, HTTPException

from ..utils.helpers import validate_coordinates, geojson_point
from ..services.analyzer import summarize_geotiff, estimate_exposure
from ..services.data_loader import fetch_population_density

router = APIRouter()


@router.post("/heatmap/upload")
async def upload_heatmap(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith((".tif", ".tiff")):
            raise HTTPException(status_code=400, detail="File must be a GeoTIFF (.tif/.tiff)")
        # Rasterio can read file-like objects
        summary = summarize_geotiff(file.file)
        return {"summary": summary, "visualization_link": None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Heatmap processing error: {e}")


@router.get("/exposure/{lat}/{lon}")
def exposure(lat: float, lon: float):
    try:
        validate_coordinates(lat, lon)
        pop = fetch_population_density(lat, lon)
        # Simple risk index placeholder (0..1)
        risk_index = 0.5
        est = estimate_exposure(pop.get("population_density"), risk_index)
        return geojson_point(lat, lon, {"population": pop, "exposure": est})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exposure error: {e}")