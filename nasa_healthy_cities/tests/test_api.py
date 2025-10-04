import json
from fastapi.testclient import TestClient
from nasa_healthy_cities.app.main import app

client = TestClient(app)

NAIROBI = {"lat": -1.286389, "lon": 36.817223}


def test_healthcheck():
    r = client.get("/healthcheck")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_climate_endpoint():
    r = client.get(f"/climate/{NAIROBI['lat']}/{NAIROBI['lon']}")
    # External call may fail offline; ensure we handle gracefully
    assert r.status_code in (200, 502)


def test_airquality_endpoint():
    r = client.get(f"/airquality/{NAIROBI['lat']}/{NAIROBI['lon']}")
    assert r.status_code == 200


def test_greenspace_endpoint():
    r = client.get(f"/greenspace/cover/{NAIROBI['lat']}/{NAIROBI['lon']}")
    assert r.status_code == 200
    data = r.json()
    # Analysis greenspace response
    assert "coverage_pct" in data and "ndvi" in data


def test_exposure_endpoint():
    r = client.get(f"/exposure/{NAIROBI['lat']}/{NAIROBI['lon']}")
    assert r.status_code == 200


def test_heatmap_requires_file():
    r = client.post("/heatmap/upload")
    assert r.status_code == 422


def test_water_endpoint():
    r = client.get(f"/water/{NAIROBI['lat']}/{NAIROBI['lon']}")
    assert r.status_code == 200
    data = r.json()
    assert "nearby_water" in data and "risk_score" in data
    assert data["nearby_water"]["type"] == "FeatureCollection"
    assert isinstance(data["risk_score"], (int, float))


def test_healthfacilities_endpoint():
    r = client.get(f"/healthfacilities/{NAIROBI['lat']}/{NAIROBI['lon']}")
    assert r.status_code == 200
    data = r.json()
    assert data["type"] == "FeatureCollection"
    assert isinstance(data["features"], list)


def test_risk_endpoint():
    r = client.get(f"/risk/{NAIROBI['lat']}/{NAIROBI['lon']}")
    assert r.status_code == 200
    data = r.json()
    assert "components" in data and "vulnerability_score" in data
    assert isinstance(data["vulnerability_score"], (int, float))