import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

app = FastAPI(
    title="PhishGuard MY",
    description="AI-Powered Malaysian Phishing & Scam Detection Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


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
