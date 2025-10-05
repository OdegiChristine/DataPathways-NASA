# Settlement growth router
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any

from ..utils.helpers import validate_coordinates
from ..services.esri_client import nearby_health_facilities
from ..services.nasa_client import ndvi_summary

router = APIRouter()


@router.get("/settlement/suitability/{lat}/{lon}")
def settlement_suitability(
    lat: float,
    lon: float,
    land_use: List[str] = Query(["residential"]),
    max_population_density: int = Query(3000, ge=0),
    infrastructure: List[str] = Query(["roads", "schools"]),
    exclude_protected: bool = Query(True),
):
    try:
        validate_coordinates(lat, lon)
        ndvi = ndvi_summary(lat, lon, buffer_m=2000, threshold=0.3)
        green_pct = ndvi["properties"]["ndvi"].get("vegetation_coverage_percent") or 50.0
        health = nearby_health_facilities(lat, lon, radius_km=5.0)
        facility_count = len(health.get("features", []))
        # Simple suitability combining green and health access, penalize high pop density
        pop_penalty = 0.0
        if max_population_density and max_population_density < 1000:
            pop_penalty = 10.0
        elif max_population_density < 2000:
            pop_penalty = 5.0
        score = max(0.0, min(100.0, 0.6 * green_pct + 0.4 * min(100.0, 20.0 * facility_count) - pop_penalty))
        return {
            "filters": {
                "land_use": land_use,
                "max_population_density": max_population_density,
                "infrastructure": infrastructure,
                "exclude_protected": exclude_protected,
            },
            "components": {
                "greenspace_percent": green_pct,
                "facility_count": facility_count,
            },
            "suitability_score": round(score, 1),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Settlement suitability error: {e}")


@router.get("/settlement/top-areas")
def top_areas():
    """Return top candidate areas with stubbed metrics; can later be driven by grid search."""
    try:
        return {
            "areas": [
                {"name": "Ruai", "suitability": 82, "land": 18, "infra": 71},
                {"name": "Kitengela", "suitability": 78, "land": 15, "infra": 68},
                {"name": "Ngong", "suitability": 71, "land": 12, "infra": 65},
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Top areas error: {e}")


@router.get("/settlement/land-availability")
def land_availability():
    try:
        return {
            "by_ward": [
                {"ward": "Ruai", "land": 18},
                {"ward": "Kitengela", "land": 15},
                {"ward": "Ngong", "land": 12},
                {"ward": "Embakasi", "land": 8},
                {"ward": "Kasarani", "land": 6},
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Land availability error: {e}")


@router.get("/settlement/growth-map")
def growth_map():
    try:
        # Stub GeoJSON for settlement growth zones; integrate with NASA/ESRI data later
        features = [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [36.95, -1.25], [36.98, -1.25], [36.98, -1.22], [36.95, -1.22], [36.95, -1.25]
                    ]]
                },
                "properties": {"name": "Ruai", "growth_score": 82, "color": "#00FF00"}
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [36.85, -1.45], [36.88, -1.45], [36.88, -1.42], [36.85, -1.42], [36.85, -1.45]
                    ]]
                },
                "properties": {"name": "Kitengela", "growth_score": 78, "color": "#FFFF00"}
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [36.70, -1.40], [36.73, -1.40], [36.73, -1.37], [36.70, -1.37], [36.70, -1.40]
                    ]]
                },
                "properties": {"name": "Ngong", "growth_score": 71, "color": "#FF0000"}
            }
        ]
        return {"type": "FeatureCollection", "features": features}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Growth map error: {str(e)}")