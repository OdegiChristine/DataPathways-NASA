# Data loading services: NASA POWER for climate, and stubs for air quality, NDVI, population
from __future__ import annotations

import datetime as dt
from typing import Dict, Any, List

import pandas as pd
import requests

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
    # Simple anomaly: last value - mean
    anomalies = {}
    for k in ["T2M", "PRECTOTCORR", "ALLSKY_SFC_SW_DWN"]:
        try:
            anomalies[k] = float(df[k].iloc[-1] - df[k].mean())
        except Exception:
            anomalies[k] = None
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


def fetch_ndvi(lat: float, lon: float) -> Dict[str, Any]:
    # Placeholder NDVI / greenspace metric. A proper integration would query MODIS/VIIRS tiles.
    return {
        "ndvi": None,
        "vegetation_coverage_percent": None,
        "notes": "NDVI integration pending (MODIS/VIIRS).",
    }


def fetch_population_density(lat: float, lon: float) -> Dict[str, Any]:
    # Placeholder WorldPop/SEDAC integration. For Nairobi, you may later plug in local datasets.
    return {
        "population_density": None,
        "source": "WorldPop/SEDAC (to integrate)",
    }