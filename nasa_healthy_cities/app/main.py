# FastAPI application entrypoint for Data Pathways to Healthy Cities and Human Settlements
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import nasa, analysis

app = FastAPI(
    title="Data Pathways to Healthy Cities API",
    description="FastAPI backend exposing NASA Earth observation and socio-economic analytics for urban health.",
    version="0.1.0",
)

# CORS (allow local dev and typical frontends)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Healthcheck
@app.get("/healthcheck")
def healthcheck():
    return {"status": "ok", "service": "data-pathways-healthy-cities"}

# Routers
app.include_router(nasa.router, prefix="")
app.include_router(analysis.router, prefix="")

# Optional dev entry
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)