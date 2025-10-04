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