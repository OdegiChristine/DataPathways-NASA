from fastapi import FastAPI
from routers import air_quality, settlements, geocode

app = FastAPI(
    title="Data Pathways to Healthy Cities API",
    description="Backend to analyze NASA & urban datasets",
    version="0.1.0"
)

# Register routers
#app.include_router(air_quality.router)
app.include_router(settlements.router)
app.include_router(geocode.router)

@app.get("/")
def root():
    return {"message": "NASA Healthy Cities Backend is running 🚀"}
