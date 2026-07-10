import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

app = FastAPI(
    title="PhishGuard MY",
    description="AI-Powered Malaysian Phishing & Scam Detection Platform",
    version="1.1.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(router)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


@app.get("/")
async def root():
    return {
        "name": "PhishGuard MY",
        "version": "1.0.0",
        "description": "AI-Powered Malaysian Phishing & Scam Detection Platform",
        "endpoints": {
            "analyze_url": "POST /api/analyze/url",
            "analyze_text": "POST /api/analyze/text",
            "submit_report": "POST /api/report",
            "statistics": "GET /api/stats",
            "threat_feed": "GET /api/threats/feed",
            "threat_patterns": "GET /api/threats/patterns",
            "health": "GET /api/health",
        },
    }
