# Health facilities router
from fastapi import APIRouter, HTTPException

from ..utils.helpers import validate_coordinates
from ..services.esri_client import nearby_health_facilities

router = APIRouter()


@router.get("/healthfacilities/{lat}/{lon}")
def healthfacilities(lat: float, lon: float, radius_km: float = 10.0):
    try:
        validate_coordinates(lat, lon)
        return nearby_health_facilities(lat, lon, radius_km=radius_km)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health facilities endpoint error: {e}")