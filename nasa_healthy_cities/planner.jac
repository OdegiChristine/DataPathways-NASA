# -------------------------------------------------
# 0.  Imports & global config
# -------------------------------------------------
import:py os;
import:py json;
import:py datetime;
import:py from datetime import datetime as dt;
import:py from math import sin, cos, random;

# any Python LLM client you like
import:py from openai import OpenAI;
global llm_client = OpenAI();          # env-var OPENAI_API_KEY

# -------------------------------------------------
# 1.  Pure-python helpers (no LLM)
# -------------------------------------------------
node Utils {

    can random_range(low, high) -> float:  # helper
    return low + (random() * (high-low));

    can fmt_coord(lat, lon) -> str:
    return f"{lat:.4f}, {lon:.4f}";
}

# -------------------------------------------------
# 2.  Data generators  (mirror your JS LocalEngine)
# -------------------------------------------------
walker genAirHotspots {
#  /hotspots  (GET)
    has city: str = "Nairobi";
    has pollutant: str = "PM2.5";
    has limit: int = 8;

    can build by llm::byLLM {
        prompt: """
        Generate a JSON list (max {limit} items) of air-quality hotspots for {city}.
        Each object must contain:
          location<str>, value<int>, trend<str>, advisory<str>,
          coordinates<[lat,lon]>, sources<list[str]>, recommendations<list[str]>
        Return **only** the JSON array, no extra text.
        """;
        max_tokens: 800;
        temperature: 0.3;
    }

    report: {
        "hotspots": build()
    };
}

walker genAirTimeseries {
#  /timeseries  (GET)
    has lat: float;
    has lon: float;
    has pollutant: str = "PM2.5";
    has months: int = 12;

    can build_series by llm::byLLM {
        prompt: """
        Produce a monthly time-series (last {months} months) for {pollutant}
        at location ({lat}, {lon}).  Each month needs:
           date<str> as YYYY-MM,
           value<int>, PM2_5<int>, NO2<int>, CO<float>, O3<int>, trend<str>
        Base the series on realistic seasonal patterns for East-Africa.
        Return **only** the JSON array.
        """;
        max_tokens: 1200;
        temperature: 0.25;
    }

    report: {
        "series": build_series(),
        "location": {"lat": lat, "lon": lon},
        "summary": gen_summary(build_series())
    };
}

can gen_summary(series: list) -> dict {
    values = [it["value"] for it in series];
    return {
        "average": round(sum(values)/len(values)),
        "max": max(values),
        "min": min(values),
        "trend": "improving" if values[0] < values[-1] else "deteriorating"
    };
}

walker genWaterSites {
#  /water  (GET)
    can build by llm::byLLM {
        prompt: """
        Generate 3 realistic water-sampling GeoJSON Features around Nairobi.
        Properties: location<str>, nitrates<float>, lead<float>, pH<float>,
        turbidity<int>, quality<str>, risks<list[str]>.
        Return **only** the FeatureCollection JSON.
        """;
        max_tokens: 700;
    }
    report: build();
}

walker genGreenspaceCover {
#  /greenspace  (GET)
    has lat: float;
    has lon: float;
    has buffer: int = 1000;

    can build by llm::byLLM {
        prompt: """
        Estimate greenspace coverage for a {buffer}m buffer around
        ({lat}, {lon}) in Nairobi.  Return JSON:
        {coverage_pct<float 0-1>, area_km2<str>, green_areas<list>,
        assessment<str>}
        """;
        max_tokens: 500;
    }
    report: build();
}

walker genAreasComparison {
#  /compare  (GET)
    can build by llm::byLLM {
        prompt: """
        Compare 3 Nairobi periphery towns (Ruai, Kitengela, Ngong).
        Return JSON list with: name<str>, vulnerability_score<float 0-1>,
        greenspace<int>, population_density<int>, air_quality<int>,
        water_quality<int>, flood_risk<str>, development_potential<str>,
        coordinates<[lat,lon]>, key_issues<list>, priority_actions<list>
        """;
        max_tokens: 1000;
    }
    report: {"comparison": build()};
}

walker genExposure {
#  /exposure  (GET)
    has lat: float;
    has lon: float;

    can build by llm::byLLM {
        prompt: """
        Multi-hazard exposure profile for location ({lat}, {lon}).
        JSON format:
        {risk_factors:{air_pollution<int>, noise_pollution<int>,
        heat_island<int>, flood_risk<str>, green_access<int>},
        overall_risk<str>, vulnerable_groups<list>,
        recommendations<list[str>]}
        """;
        max_tokens: 700;
    }
    report: build();
}

walker genFollowUpQuestions {
#  /followups  (GET)
    has topic: str;

    can build by llm::byLLM {
        prompt: """
        Given the conversation topic "{topic}" in an urban-planning chatbot,
        suggest 4 short follow-up questions a user might ask.
        Return JSON list of strings only.
        """;
        max_tokens: 200;
    }
    report: {"questions": build()};
}

# -------------------------------------------------
# 3.  FastAPI-style entry walkers  (auto-routed)
# -------------------------------------------------
#  Jac will auto-create REST endpoints:
#   GET  /hotspots        -> walker hotspots
#   GET  /timeseries      -> walker timeseries
#   GET  /water           -> walker water
#   GET  /greenspace      -> walker greenspace
#   GET  /compare         -> walker compare
#   GET  /exposure        -> walker exposure
#   GET  /followups       -> walker followups
# -------------------------------------------------
walker hotspots   :> genAirHotspots;
walker timeseries :> genAirTimeseries;
walker water      :> genWaterSites;
walker greenspace :> genGreenspaceCover;
walker compare    :> genAreasComparison;
walker exposure   :> genExposure;
walker followups  :> genFollowUpQuestions;