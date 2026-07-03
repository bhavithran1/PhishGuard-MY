# PhishGuard MY

AI-Powered Malaysian Phishing & Scam Detection Platform

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend
```bash
cd backend
pip install -r requirements.txt
python ml/train.py          # Train the ML model
uvicorn main:app --port 8000  # Start API server
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/analyze/url | Analyze URL for phishing |
| POST | /api/analyze/text | Analyze SMS/email for scams |
| POST | /api/report | Submit threat report |
| GET | /api/stats | Dashboard statistics |
| GET | /api/threats/feed | Live threat feed |
| GET | /api/threats/patterns | Malaysian scam patterns |
| GET | /api/health | Health check |

## Project Structure

```
backend/
  main.py              # FastAPI application
  api/routes.py         # API endpoints
  api/schemas.py        # Request/response models
  ml/model.py           # PhishGuard ML model
  ml/train.py           # Training pipeline
  ml/feature_extraction.py  # URL feature engineering
  ml/malaysian_patterns.py  # Malaysian scam detection
  data/                 # Training datasets

frontend/
  src/App.tsx           # Main application
  src/api.ts            # API client
  src/components/       # React components
```
