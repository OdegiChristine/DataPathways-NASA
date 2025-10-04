# Routers for NASA-related endpoints
from fastapi import APIRouter, HTTPException

from ..utils.helpers import validate_coordinates, geojson_point
from ..services.data_loader import (
    fetch_climate_daily,
    climate_stats,
    fetch_air_quality,
    fetch_ndvi,
)

router = APIRouter()


@router.get("/climate/{lat}/{lon}")
def get_climate(lat: float, lon: float):
    try:
        validate_coordinates(lat, lon)
        df = fetch_climate_daily(lat, lon)
        stats = climate_stats(df)
        return geojson_point(lat, lon, {"climate": stats, "days": len(df)})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Climate data error: {e}")


@router.get("/airquality/{lat}/{lon}")
def get_airquality(lat: float, lon: float):
    try:
        validate_coordinates(lat, lon)
        aq = fetch_air_quality(lat, lon)
        return geojson_point(lat, lon, {"air_quality": aq})
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Air quality error: {e}")


@router.get("/greenspace/{lat}/{lon}")
def get_greenspace(lat: float, lon: float):
    try:
        validate_coordinates(lat, lon)
        ndvi = fetch_ndvi(lat, lon)
        return geojson_point(lat, lon, {"greenspace": ndvi})
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Greenspace error: {e}")