# Greenspace router
from fastapi import APIRouter, HTTPException, Query

from ..utils.helpers import validate_coordinates
from ..services.analysis import greenspace_cover

router = APIRouter()


@router.get("/greenspace/cover/{lat}/{lon}")
def greenspace(lat: float, lon: float, buffer: int = Query(1000, ge=100, le=5000), threshold: float = Query(0.3, ge=-1.0, le=1.0)):
    try:
        validate_coordinates(lat, lon)
        return greenspace_cover(lat, lon, buffer_m=buffer, threshold=threshold)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Greenspace endpoint error: {e}")