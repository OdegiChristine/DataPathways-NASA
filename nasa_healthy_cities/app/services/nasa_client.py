# NASA client wrapper for MVP
from typing import Dict, Any

from .utils import geojson_point
from ..services.data_loader import fetch_climate_daily, climate_stats, fetch_ndvi, fetch_air_quality


def climate_summary(lat: float, lon: float) -> Dict[str, Any]:
    df = fetch_climate_daily(lat, lon)
    stats = climate_stats(df)
    return geojson_point(lat, lon, {"climate": stats})


def ndvi_summary(lat: float, lon: float, buffer_m: int = 1000, threshold: float = 0.3) -> Dict[str, Any]:
    ndvi = fetch_ndvi(lat, lon, buffer_m=buffer_m, threshold=threshold)
    return geojson_point(lat, lon, {"ndvi": ndvi})


def air_quality_summary(lat: float, lon: float) -> Dict[str, Any]:
    aq = fetch_air_quality(lat, lon)
    return geojson_point(lat, lon, {"air_quality": aq})