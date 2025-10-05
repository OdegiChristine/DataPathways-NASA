from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="population_api")
loc = geolocator.geocode("Westlands, Nairobi, Kenya")

print(loc.address)
print((loc.latitude, loc.longitude))
