# Utility helpers for validation, env, and GeoJSON
import os
from typing import Any, Dict, Optional, List
from fastapi import HTTPException


def validate_coordinates(lat: float, lon: float) -> None:
    if lat < -90 or lat > 90:
        raise HTTPException(status_code=422, detail="Latitude must be between -90 and 90")
    if lon < -180 or lon > 180:
        raise HTTPException(status_code=422, detail="Longitude must be between -180 and 180")


def load_env(name: str, default: Optional[str] = None, required: bool = False) -> str:
    val = os.getenv(name, default)
    if required and (val is None or val == ""):
        raise RuntimeError(f"Missing required environment variable: {name}")
    return val or ""


def geojson_point(lat: float, lon: float, properties: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
        "properties": properties or {},
    }


def bbox_from_point(lat: float, lon: float, buffer_km: float = 5.0) -> Dict[str, Any]:
    """Approximate a bounding box polygon around a point using degree conversion.
    1 degree latitude ~ 111 km; longitude depends on latitude.
    Returns a GeoJSON Polygon without requiring shapely.
    """
    deg_lat = buffer_km / 111.0
    import math
    deg_lon = buffer_km / (111.0 * max(math.cos(math.radians(max(min(lat, 89.9), -89.9))), 1e-6))
    west, east = lon - deg_lon, lon + deg_lon
    south, north = lat - deg_lat, lat + deg_lat
    coords: List[List[float]] = [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],  # close ring
    ]
    return {
        "type": "Feature",
        "geometry": {"type": "Polygon", "coordinates": [coords]},
        "properties": {"buffer_km": buffer_km},
    }