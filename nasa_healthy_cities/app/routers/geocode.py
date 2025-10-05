from fastapi import APIRouter, Query, HTTPException
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

router = APIRouter(prefix="/geocode", tags=["Geocoding"])

# Initialize geocoder
geolocator = Nominatim(user_agent="kenya_geocoder", timeout=10)

@router.get("/")
def geocode_location(
    location: str = Query(..., description="Place name within Kenya, e.g., 'Embakasi' or 'Kibera'")
):
    """
    Geocode a place name within Kenya to latitude/longitude and return place metadata.
    """
    try:
        # Restrict search to Kenya
        result = geolocator.geocode(location, country_codes='KE', addressdetails=True, exactly_one=True)
        if not result:
            raise HTTPException(status_code=404, detail=f"Could not find location '{location}' in Kenya")

        address = result.raw.get("address", {})

        return {
            "query": location,
            "matched_place": result.address,
            "latitude": result.latitude,
            "longitude": result.longitude,
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
