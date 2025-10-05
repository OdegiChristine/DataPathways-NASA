# Air quality router
from fastapi import APIRouter, HTTPException, Query

from ..utils.helpers import validate_coordinates
from ..services.air_service import get_air_timeseries, get_hotspots

router = APIRouter()


@router.get("/air/{lat}/{lon}/timeseries")
def air_timeseries(lat: float, lon: float, pollutant: str = Query("PM2.5"), months: int = Query(12, ge=1, le=24)):
    try:
        validate_coordinates(lat, lon)
        data = get_air_timeseries(lat, lon, pollutant=pollutant, months=months)
        return {"lat": lat, "lon": lon, "pollutant": pollutant, "months": months, "series": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Air timeseries error: {e}")


@router.get("/air/hotspots")
def air_hotspots(city: str = Query("Nairobi"), pollutant: str = Query("PM2.5"), limit: int = Query(5, ge=1, le=20)):
    try:
        items = get_hotspots(city=city, pollutant=pollutant, limit=limit)
        return {"city": city, "pollutant": pollutant, "hotspots": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Air hotspots error: {e}")

@router.get("/air/heatmap")
def air_heatmap(city: str = Query("Nairobi"), pollutant: str = Query("PM2.5"), limit: int = Query(50, ge=1, le=100)):
    try:
        hotspots = get_hotspots(city=city, pollutant=pollutant, limit=limit)
        features = []
        for spot in hotspots:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [spot.get('lon', 0), spot.get('lat', 0)]},
                "properties": {"value": spot.get('value', 0), "location": spot.get('location', '')}
            })
        return {"type": "FeatureCollection", "features": features}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Air heatmap error: {str(e)}")