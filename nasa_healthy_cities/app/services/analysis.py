# Analysis functions for MVP
from typing import Dict, Any

from .nasa_client import climate_summary, ndvi_summary, air_quality_summary
from .esri_client import nearby_water, nearby_health_facilities


def water_risk(lat: float, lon: float) -> Dict[str, Any]:
    nearby = nearby_water(lat, lon)
    risk = min(100, 20 * len(nearby.get("features", [])))  # simple proxy
    return {"nearby_water": nearby, "risk_score": risk}


def greenspace_cover(lat: float, lon: float, buffer_m: int = 1000, threshold: float = 0.3) -> Dict[str, Any]:
    ndvi = ndvi_summary(lat, lon, buffer_m=buffer_m, threshold=threshold)
    props = ndvi["properties"].get("ndvi", {})
    # Prefer coverage from raster computation; fallback to value * 100
    coverage_pct = props.get("vegetation_coverage_percent")
    if coverage_pct is None:
        value = props.get("value")
        coverage_pct = round((value * 100.0) if value is not None else 40.0, 1)
    return {"ndvi": ndvi, "coverage_pct": coverage_pct, "buffer_m": buffer_m, "threshold": threshold}


def health_access(lat: float, lon: float) -> Dict[str, Any]:
    nearby = nearby_health_facilities(lat, lon)
    count = len(nearby.get("features", []))
    return {"nearby_facilities": nearby, "facility_count": count}


def vulnerability_index(lat: float, lon: float) -> Dict[str, Any]:
    water = water_risk(lat, lon)
    green = greenspace_cover(lat, lon)
    health = health_access(lat, lon)
    # composite simple scoring (0..100)
    risk = 0.4 * water["risk_score"] + 0.3 * (100 - green["coverage_pct"]) + 0.3 * max(0, 100 - 20 * health["facility_count"])  # crude
    return {
        "components": {"water": water, "greenspace": green, "health": health},
        "vulnerability_score": round(risk, 1),
    }