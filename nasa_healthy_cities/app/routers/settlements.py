from fastapi import APIRouter, Query, HTTPException
import rasterio
from rasterio.mask import mask
from shapely.geometry import Point
import geopandas as gpd
from pyproj import CRS
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
import math
import json

router = APIRouter(prefix="/population", tags=["Population"])

RASTER_PATH = "data/kenya_ghsl.tif"

# Initialize geocoder (Kenya-restricted)
geolocator = Nominatim(user_agent="kenya_geocoder", timeout=10)


def make_circle(lat: float, lon: float, radius_km: float):
    """Create a circular buffer in meters around (lat, lon)."""
    point = Point(lon, lat)
    gdf = gpd.GeoDataFrame(geometry=[point], crs="EPSG:4326")
    local_crs = CRS.from_proj4(f"+proj=aeqd +lat_0={lat} +lon_0={lon} +units=m")
    gdf_proj = gdf.to_crs(local_crs.to_string())
    circle = gdf_proj.buffer(radius_km * 1000)
    circle_wgs84 = circle.to_crs("EPSG:4326")
    return json.loads(circle_wgs84.to_json())["features"][0]["geometry"]


def geocode_location(location: str):
    """Geocode a location name in Kenya into coordinates and metadata."""
    try:
        result = geolocator.geocode(location, country_codes='KE', addressdetails=True, exactly_one=True)
        if not result:
            raise HTTPException(status_code=404, detail=f"Could not find location '{location}' in Kenya")

        address = result.raw.get("address", {})
        return {
            "latitude": result.latitude,
            "longitude": result.longitude,
            "matched_place": result.address,
            "metadata": {
                "county": address.get("county"),
                "city": address.get("city"),
                "town": address.get("town"),
                "country": address.get("country"),
            }
        }
    except (GeocoderTimedOut, GeocoderUnavailable):
        raise HTTPException(status_code=503, detail="Geocoding service temporarily unavailable")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def population_in_radius(
    lat: float = Query(None, description="Latitude in WGS84"),
    lon: float = Query(None, description="Longitude in WGS84"),
    location: str = Query(None, description="Location name within Kenya, e.g. 'Embakasi'"),
    radius_km: float = Query(5, description="Radius in kilometers")
):
    """
    Get estimated total population and density within a radius around a location.
    You can provide either coordinates or a place name.
    """
    try:
        # Use location name if coordinates not provided
        if location and (lat is None or lon is None):
            geo_data = geocode_location(location)
            lat = geo_data["latitude"]
            lon = geo_data["longitude"]
        elif lat is None or lon is None:
            raise HTTPException(status_code=400, detail="Provide either (lat, lon) or a location name")

        # Create circle geometry
        circle = make_circle(lat, lon, radius_km)

        with rasterio.open(RASTER_PATH) as src:
            out_image, out_transform = mask(src, [circle], crop=True)
            data = out_image[0]
            data = data[data >= 0]  # remove no-data values

            if data.size == 0:
                raise HTTPException(status_code=404, detail="No population data in this radius")

            total_population = float(data.sum())
            area_km2 = math.pi * (radius_km ** 2)
            density = total_population / area_km2

            response = {
                "latitude": lat,
                "longitude": lon,
                "radius_km": radius_km,
                "total_population": round(total_population, 2),
                "population_density_per_km2": round(density, 2),
            }

            # Attach metadata if geocoded
            if location:
                response["location"] = geo_data["matched_place"]
                response["metadata"] = geo_data["metadata"]

            return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
