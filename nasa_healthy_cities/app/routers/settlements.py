from fastapi import APIRouter, Query, HTTPException
import rasterio
from rasterio.mask import mask
from shapely.geometry import Point
import geopandas as gpd
from pyproj import CRS
import math
import json

router = APIRouter(prefix="/population", tags=["Population"])

RASTER_PATH = "data/kenya_ghsl.tif"


def make_circle(lat: float, lon: float, radius_km: float):
    """
    Create a circular buffer in meters around (lat, lon).
    """
    # Start with point in WGS84
    point = Point(lon, lat)
    gdf = gpd.GeoDataFrame(geometry=[point], crs="EPSG:4326")

    # Project to a local equal-area projection (so buffer is in meters)
    local_crs = CRS.from_proj4(f"+proj=aeqd +lat_0={lat} +lon_0={lon} +units=m")
    gdf_proj = gdf.to_crs(local_crs.to_string())

    # Buffer in meters
    circle = gdf_proj.buffer(radius_km * 1000)

    # Back to WGS84 for rasterio
    circle_wgs84 = circle.to_crs("EPSG:4326")

    return json.loads(circle_wgs84.to_json())["features"][0]["geometry"]


@router.get("/")
def population_in_radius(
    lat: float = Query(..., description="Latitude in WGS84"),
    lon: float = Query(..., description="Longitude in WGS84"),
    radius_km: float = Query(5, description="Radius in kilometers")
):
    """
    Get estimated total population and density within a radius around a location.
    """
    try:
        # Create circle geometry
        circle = make_circle(lat, lon, radius_km)

        with rasterio.open(RASTER_PATH) as src:
            # Clip raster with the circle
            out_image, out_transform = mask(src, [circle], crop=True)
            data = out_image[0]

            # Remove no-data values
            data = data[data >= 0]

            if data.size == 0:
                raise HTTPException(status_code=404, detail="No population data in this radius")

            # Total population
            total_population = float(data.sum())

            # Area of circle in km²
            area_km2 = math.pi * (radius_km ** 2)

            density = total_population / area_km2

            return {
                "latitude": lat,
                "longitude": lon,
                "radius_km": radius_km,
                "total_population": round(total_population, 2),
                "population_density_per_km2": round(density, 2)
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
