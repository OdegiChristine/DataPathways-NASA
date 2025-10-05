# Water quality router
from fastapi import APIRouter, HTTPException

from ..utils.helpers import validate_coordinates
from ..services.analysis import water_risk

router = APIRouter()


@router.get("/water/{lat}/{lon}")
def water(lat: float, lon: float):
    try:
        validate_coordinates(lat, lon)
        return water_risk(lat, lon)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Water endpoint error: {e}")


@router.get("/water/sampling-sites")
def sampling_sites(river: str = "nairobi", pollutant: str = "nitrates"):
    try:
        # Stub sampling data with GeoJSON; integrate with ESRI later
        features = [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [36.8219, -1.2921]},  # Industrial Area approx
                "properties": {"location": "Industrial Area", "nitrates": 12.4, "lead": 8.2, "phosphate": 0.8, "BOD": 12.5}
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [36.8172, -1.2864]},  # CBD
                "properties": {"location": "CBD Outflow", "nitrates": 8.7, "lead": 5.1, "phosphate": 0.5, "BOD": 8.2}
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [36.7667, -1.3167]},  # Kibera
                "properties": {"location": "Kibera", "nitrates": 15.2, "lead": 12.8, "phosphate": 1.2, "BOD": 18.4}
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [36.9667, -1.2500]},  # Ruai
                "properties": {"location": "Ruai", "nitrates": 6.8, "lead": 3.2, "phosphate": 0.3, "BOD": 6.1}
            },
        ]
        return {"type": "FeatureCollection", "features": features}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sampling sites error: {e}")


@router.get("/water/wqi-trend")
def wqi_trend():
    try:
        trend = [
            {"month": "Jan", "nairobi": 65, "ngong": 72, "athi": 78},
            {"month": "Feb", "nairobi": 62, "ngong": 70, "athi": 76},
            {"month": "Mar", "nairobi": 58, "ngong": 68, "athi": 74},
            {"month": "Apr", "nairobi": 55, "ngong": 65, "athi": 72},
            {"month": "May", "nairobi": 52, "ngong": 63, "athi": 70},
            {"month": "Jun", "nairobi": 48, "ngong": 60, "athi": 68},
            {"month": "Jul", "nairobi": 45, "ngong": 58, "athi": 65},
            {"month": "Aug", "nairobi": 42, "ngong": 55, "athi": 63},
            {"month": "Sep", "nairobi": 45, "ngong": 58, "athi": 65},
            {"month": "Oct", "nairobi": 48, "ngong": 62, "athi": 68},
            {"month": "Nov", "nairobi": 52, "ngong": 65, "athi": 72},
            {"month": "Dec", "nairobi": 55, "ngong": 68, "athi": 74},
        ]
        return {"trend": trend}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"WQI trend error: {e}")