# Cross-layer risk router
from fastapi import APIRouter, HTTPException

from ..utils.helpers import validate_coordinates
from ..services.analysis import vulnerability_index

router = APIRouter()


@router.get("/risk/{lat}/{lon}")
def risk(lat: float, lon: float):
    try:
        validate_coordinates(lat, lon)
        return vulnerability_index(lat, lon)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk endpoint error: {e}")