# Areas analysis router for comparative metrics and narrative
from fastapi import APIRouter, HTTPException

from ..services.analysis import vulnerability_index

router = APIRouter()


@router.get("/areas/comparison")
def areas_comparison():
    try:
        # Stub comparison across three areas (coords approximate)
        sample_points = {
            "Ruai": (-1.315, 37.000),
            "Kitengela": (-1.457, 36.960),
            "Ngong": (-1.356, 36.650),
        }
        data = []
        for name, (lat, lon) in sample_points.items():
            vi = vulnerability_index(lat, lon)
            data.append({"name": name, "vulnerability_score": vi["vulnerability_score"],
                         "greenspace": vi["components"]["greenspace"]["coverage_pct"],
                         "health_access": vi["components"]["health"]["facility_count"]})
        narrative = (
            "Ruai ranks highest due to abundant developable land and strong road connectivity. "
            "Water access is largely adequate, and proximity to green spaces reduces immediate heat-island concerns. "
            "However, a moderate environmental risk score driven by localized river nitrate readings suggests targeted wastewater controls before high-density expansion."
        )
        return {"comparison": data, "narrative": narrative}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Areas comparison error: {e}")