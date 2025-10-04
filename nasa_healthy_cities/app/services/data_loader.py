# Data loading services: NASA POWER for climate, and stubs for air quality, NDVI, population
from __future__ import annotations

import datetime as dt
from typing import Dict, Any, List

import pandas as pd
import requests
import numpy as np
import rasterio
from pathlib import Path
from rasterio.warp import transform as rio_transform

from .utils import circle_bbox
from ..utils.helpers import load_env

DEFAULT_DAYS = 30
POWER_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
POWER_PARAMETERS = ["T2M", "PRECTOTCORR", "ALLSKY_SFC_SW_DWN"]


def _power_url(lat: float, lon: float, start: str, end: str) -> str:
    params = ",".join(POWER_PARAMETERS)
    return (
        f"{POWER_BASE_URL}?parameters={params}&start={start}&end={end}&latitude={lat}"
        f"&longitude={lon}&community=RE&format=JSON"
    )


def fetch_climate_daily(lat: float, lon: float, days: int = DEFAULT_DAYS) -> pd.DataFrame:
    end_date = dt.date.today()
    start_date = end_date - dt.timedelta(days=days)
    start = start_date.strftime("%Y%m%d")
    end = end_date.strftime("%Y%m%d")

    url = _power_url(lat, lon, start, end)
    resp = requests.get(url, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    # POWER JSON structure: data["properties"]["parameter"][PARAM] keyed by date string
    parameter = data.get("properties", {}).get("parameter", {})
    rows: List[Dict[str, Any]] = []
    for date_str in parameter.get("T2M", {}).keys():
        rows.append({
            "date": dt.datetime.strptime(date_str, "%Y%m%d").date(),
            "T2M": parameter.get("T2M", {}).get(date_str),
            "PRECTOTCORR": parameter.get("PRECTOTCORR", {}).get(date_str),
            "ALLSKY_SFC_SW_DWN": parameter.get("ALLSKY_SFC_SW_DWN", {}).get(date_str),
        })
    df = pd.DataFrame(rows)
    return df


def climate_stats(df: pd.DataFrame) -> Dict[str, Any]:
    if df.empty:
        return {"summary": {}, "anomalies": {}}
    stats = {
        "T2M": {
            "mean": float(df["T2M"].mean()),
            "max": float(df["T2M"].max()),
        },
        "PRECTOTCORR": {
            "mean": float(df["PRECTOTCORR"].mean()),
            "max": float(df["PRECTOTCORR"].max()),
        },
        "ALLSKY_SFC_SW_DWN": {
            "mean": float(df["ALLSKY_SFC_SW_DWN"].mean()),
            "max": float(df["ALLSKY_SFC_SW_DWN"].max()),
        },
    }
    # Extended anomalies: delta (last - mean), z-score, and percentile rank of last value
    anomalies = {}
    for k in ["T2M", "PRECTOTCORR", "ALLSKY_SFC_SW_DWN"]:
        try:
            last = float(df[k].iloc[-1])
            mu = float(df[k].mean())
            sigma = float(df[k].std())
            delta = last - mu
            zscore = (delta / sigma) if (sigma and sigma > 0) else None
            percentile = float(((df[k] <= last).mean()) * 100.0)
            anomalies[k] = {"delta": float(delta), "zscore": (float(zscore) if zscore is not None else None), "percentile": percentile}
        except Exception:
            anomalies[k] = {"delta": None, "zscore": None, "percentile": None}
    return {"summary": stats, "anomalies": anomalies}


def fetch_air_quality(lat: float, lon: float) -> Dict[str, Any]:
    # Placeholder: In a full implementation, integrate MODIS AOD or Sentinel-5P (TROPOMI)
    # Here we return a proxy risk level based on climate summary if available.
    return {
        "aod": None,
        "pm25_proxy": None,
        "risk_level": "unknown",
        "notes": "Air quality integration pending (MODIS AOD/TROPOMI).",
    }


def fetch_ndvi(lat: float, lon: float, buffer_m: int = 1000, threshold: float = 0.3) -> Dict[str, Any]:
    """Compute NDVI metrics around a point from a local raster tile if available.
    Returns average NDVI value and vegetation coverage percent within buffer window.
    The raster path can be set via NDVI_PATH environment variable; alternatively set NDVI_DIR or place files in sample_data/NDIV.
    """
    try:
        ndvi_path_env = load_env("NDVI_PATH", default="")
        ndvi_dir_env = load_env("NDVI_DIR", default="")
        path: Path | None = None

        if ndvi_path_env:
            candidate = Path(ndvi_path_env)
            if candidate.exists():
                path = candidate
        else:
            # Determine directory to search
            if ndvi_dir_env:
                search_dir = Path(ndvi_dir_env)
            else:
                base_dir = Path(__file__).resolve().parents[2]
                search_dir = base_dir / "sample_data" / "NDIV"

            # Gather candidates (prefer filenames containing NDVI)
            candidates: List[Path] = []
            if search_dir.exists() and search_dir.is_dir():
                candidates = list(search_dir.glob("*.tif")) + list(search_dir.glob("*.tiff"))
                candidates_ndvi = [p for p in candidates if "NDVI" in p.name.upper()]
                use_list = candidates_ndvi if candidates_ndvi else candidates
                if use_list:
                    # Pick the most recently modified file
                    path = sorted(use_list, key=lambda p: p.stat().st_mtime, reverse=True)[0]

        if not path or not path.exists():
            searched = []
            if ndvi_path_env:
                searched.append(ndvi_path_env)
            if ndvi_dir_env:
                searched.append(ndvi_dir_env)
            else:
                base_dir = Path(__file__).resolve().parents[2]
                searched.append(str(base_dir / "sample_data" / "NDIV"))
            return {
                "value": None,
                "vegetation_coverage_percent": None,
                "source": "none",
                "notes": f"NDVI raster not found. Checked: {', '.join(searched)}. Set NDVI_PATH or NDVI_DIR.",
            }

        with rasterio.open(path) as src:
            # Compute bounding box in WGS84
            west, south, east, north = circle_bbox(lat, lon, buffer_m)

            # Transform bounds to dataset CRS if needed
            bounds: tuple[float, float, float, float]
            crs = src.crs
            if crs and str(crs).upper() not in ("EPSG:4326", "WGS84"):
                xs = [west, east, west, east]
                ys = [south, south, north, north]
                tx, ty = rio_transform("EPSG:4326", crs, xs, ys)
                xmin, xmax = min(tx), max(tx)
                ymin, ymax = min(ty), max(ty)
                bounds = (xmin, ymin, xmax, ymax)
            else:
                bounds = (west, south, east, north)

            # Compute window from bounds
            window = src.window(*bounds)
            window = window.round_offsets().round_shape()

            # Clamp window within raster dimensions
            row_off, col_off = int(window.row_off), int(window.col_off)
            height, width = int(window.height), int(window.width)
            row_off = max(0, min(row_off, src.height - 1))
            col_off = max(0, min(col_off, src.width - 1))
            height = max(0, min(height, src.height - row_off))
            width = max(0, min(width, src.width - col_off))
            if height == 0 or width == 0:
                return {
                    "value": None,
                    "vegetation_coverage_percent": None,
                    "source": "local_raster",
                    "notes": "Window outside raster bounds",
                }

            safe_window = rasterio.windows.Window(col_off, row_off, width, height)
            arr = src.read(1, window=safe_window, masked=True)

            if arr.size == 0 or np.ma.count(arr) == 0:
                return {
                    "value": None,
                    "vegetation_coverage_percent": None,
                    "source": "local_raster",
                    "notes": "Empty window or all nodata",
                }

            # Normalize NDVI if values appear scaled integers (e.g., MODIS scale factor 0.0001)
            scale_factor = 1.0
            try:
                max_val = float(np.ma.max(arr))
                min_val = float(np.ma.min(arr))
                if (np.issubdtype(arr.dtype, np.integer) and (max_val > 1.0 or min_val < -1.0)) or (max_val > 1.5 or min_val < -1.5):
                    scale_factor = 10000.0
            except Exception:
                pass
            arr_norm = arr if scale_factor == 1.0 else (arr / scale_factor)

            mean_ndvi = float(np.ma.mean(arr_norm))
            coverage_pct = float(100.0 * np.ma.mean(arr_norm >= threshold))
            return {
                "value": mean_ndvi,
                "vegetation_coverage_percent": round(coverage_pct, 2),
                "source": "local_raster",
                "threshold": threshold,
                "buffer_m": buffer_m,
                "notes": f"Computed from NDVI raster {path.name}; scale_factor={scale_factor}",
            }
    except Exception as e:
        return {
            "value": None,
            "vegetation_coverage_percent": None,
            "source": "error",
            "notes": f"NDVI computation error: {e}",
        }


def fetch_population_density(lat: float, lon: float) -> Dict[str, Any]:
    # Placeholder WorldPop/SEDAC integration. For Nairobi, you may later plug in local datasets.
    return {
        "population_density": None,
        "source": "WorldPop/SEDAC (to integrate)",
    }