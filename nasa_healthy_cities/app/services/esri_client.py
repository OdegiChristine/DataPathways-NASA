# ESRI/OSM client for MVP: queries Overpass API with graceful fallback to local stubs
from typing import Dict, Any, List
import requests

from .utils import geojson_feature_collection, geojson_point, haversine_distance, circle_bbox

# Overpass API endpoint (public). If network fails, we fallback to local stubs.
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Fallback placeholder datasets for MVP (Nairobi area approximations)
WATER_BODIES_FALLBACK = [
    {"name": "Nairobi River", "lat": -1.2833, "lon": 36.8167},
    {"name": "Mathare River", "lat": -1.2650, "lon": 36.8650},
]

HEALTH_FACILITIES_FALLBACK = [
    {"name": "Kenyatta National Hospital", "lat": -1.3002, "lon": 36.8060},
    {"name": "Mbagathi Hospital", "lat": -1.3105, "lon": 36.7929},
    {"name": "Mama Lucy Kibaki Hospital", "lat": -1.2815, "lon": 36.9159},
]


def _overpass_query(query: str, timeout: int = 20) -> Dict[str, Any] | None:
    try:
        resp = requests.post(OVERPASS_URL, data=query, timeout=timeout)
        resp.raise_for_status()
        return resp.json()
    except Exception:
        return None


def _elements_to_features(elements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    features: List[Dict[str, Any]] = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        # Prefer node coordinates; for ways/relations, use 'center' provided by Overpass 'out center'
        if el.get("type") == "node":
            lat, lon = el.get("lat"), el.get("lon")
        else:
            center = el.get("center") or {}
            lat, lon = center.get("lat"), center.get("lon")
        if lat is None or lon is None:
            continue
        props = {"name": name} if name else {}
        # include key tags for context
        for key in ("amenity", "healthcare", "waterway", "natural"):
            if key in tags:
                props[key] = tags[key]
        features.append(geojson_point(lat, lon, props))
    return features


def nearby_water(lat: float, lon: float, radius_km: float = 10.0) -> Dict[str, Any]:
    # Build bbox in degrees using circle approximation
    bbox = circle_bbox(lat, lon, int(radius_km * 1000))
    min_lon, min_lat, max_lon, max_lat = bbox
    # Overpass expects bbox in (south,west,north,east) => (min_lat, min_lon, max_lat, max_lon)
    south, west, north, east = min_lat, min_lon, max_lat, max_lon
    q = f"""
    [out:json][timeout:25];
    (
      way["waterway"="river"]({south},{west},{north},{east});
      relation["waterway"="river"]({south},{west},{north},{east});
      way["natural"="water"]({south},{west},{north},{east});
      relation["natural"="water"]({south},{west},{north},{east});
    );
    out center;
    """
    data = _overpass_query(q)
    if data and "elements" in data:
        features = _elements_to_features(data["elements"])
        return geojson_feature_collection(features)
    # Fallback to local stubs if network fails or no data
    features: List[Dict[str, Any]] = []
    for wb in WATER_BODIES_FALLBACK:
        d = haversine_distance(lat, lon, wb["lat"], wb["lon"])
        if d <= radius_km:
            features.append(geojson_point(wb["lat"], wb["lon"], {"name": wb["name"], "distance_km": round(d, 2)}))
    return geojson_feature_collection(features)


def nearby_health_facilities(lat: float, lon: float, radius_km: float = 10.0) -> Dict[str, Any]:
    bbox = circle_bbox(lat, lon, int(radius_km * 1000))
    min_lon, min_lat, max_lon, max_lat = bbox
    south, west, north, east = min_lat, min_lon, max_lat, max_lon
    # Healthcare facilities via amenity or healthcare keys
    q = f"""
    [out:json][timeout:25];
    (
      node["amenity"~"hospital|clinic|doctors|pharmacy"]({south},{west},{north},{east});
      way["amenity"~"hospital|clinic|doctors|pharmacy"]({south},{west},{north},{east});
      relation["amenity"~"hospital|clinic|doctors|pharmacy"]({south},{west},{north},{east});
      node["healthcare"]({south},{west},{north},{east});
      way["healthcare"]({south},{west},{north},{east});
      relation["healthcare"]({south},{west},{north},{east});
    );
    out center;
    """
    data = _overpass_query(q)
    if data and "elements" in data:
        features = _elements_to_features(data["elements"])
        return geojson_feature_collection(features)
    # Fallback to local stubs if network fails or no data
    features: List[Dict[str, Any]] = []
    for hf in HEALTH_FACILITIES_FALLBACK:
        d = haversine_distance(lat, lon, hf["lat"], hf["lon"])
        if d <= radius_km:
            features.append(geojson_point(hf["lat"], hf["lon"], {"name": hf["name"], "distance_km": round(d, 2)}))
    return geojson_feature_collection(features)