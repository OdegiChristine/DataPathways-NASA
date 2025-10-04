# Analysis services: process raster GeoTIFF for heat maps and estimate exposure
from __future__ import annotations

from typing import Dict, Any

import numpy as np
import rasterio


def summarize_geotiff(path_or_file) -> Dict[str, Any]:
    """Compute basic stats from a GeoTIFF (e.g., MODIS LST)."""
    with rasterio.open(path_or_file) as src:
        arr = src.read(1, masked=True)
        transform = src.transform
        nodata = src.nodata
        bbox = src.bounds
        crs = src.crs.to_string() if src.crs else None
        stats = {
            "count": int(np.ma.count(arr)),
            "mean": float(np.ma.mean(arr)),
            "max": float(np.ma.max(arr)),
            "min": float(np.ma.min(arr)),
            "nodata": nodata,
            "bbox": [bbox.left, bbox.bottom, bbox.right, bbox.top],
            "crs": crs,
        }
        return {"stats": stats, "transform": tuple(transform)}


def estimate_exposure(pop_density: float, risk_index: float, area_km2: float = 25.0) -> Dict[str, Any]:
    """A simple heuristic exposure estimate: population_density * area * risk_index."""
    if pop_density is None or risk_index is None:
        return {"estimated_exposed": None, "notes": "Insufficient inputs"}
    exposed = pop_density * area_km2 * max(risk_index, 0)
    return {"estimated_exposed": float(exposed), "area_km2": area_km2}