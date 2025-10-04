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
    r = client.get(f"/greenspace/{NAIROBI['lat']}/{NAIROBI['lon']}")
    assert r.status_code == 200


def test_exposure_endpoint():
    r = client.get(f"/exposure/{NAIROBI['lat']}/{NAIROBI['lon']}")
    assert r.status_code == 200


def test_heatmap_requires_file():
    r = client.post("/heatmap/upload")
    assert r.status_code == 422