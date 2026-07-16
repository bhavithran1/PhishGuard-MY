# PhishGuard MY — Student Edition

A student-led Malaysian scam-prevention learning platform. It helps students pause before clicking, recognise common scam cues, practise safe reasoning, and find the appropriate official next step.

## What it offers

- Link and message safety checks for common Malaysia-specific scam signals
- A practical learning path: pressure tactics, safe verification, and evidence preservation
- A clearly labelled scenario library and “Spot the Phish” practice activity
- A three-step national signal relay that routes financial-loss emergencies to NSRC 997, new scam/cyber incidents to Cyber999, and vulnerabilities to MyCERT coordinated disclosure
- A browser-side privacy scan and agency-ready evidence pack that the student reviews before using an official channel
- An urgent action guide linking to official services: NSRC, PDRM Semak Mule, and Cyber999

## Important scope

PhishGuard MY is decision support and educational software. It is **not** a bank, law-enforcement service, or official reporting channel, and it does not automatically forward reports to any agency. The Contribute flow prepares a privacy-checked report pack and opens the correct official destination; the reporter remains responsible for reviewing and sending it. A low-risk result is not proof that a message or link is safe.

For a financial loss in Malaysia, contact the relevant bank or provider immediately and call the National Scam Response Centre at **997**. For cyber incidents such as phishing or a data breach, use the official [Cyber999 channels](https://www.cybersecurity.my/portal-main/services/cyber999-overview). Before a transaction, check suspicious accounts or phone numbers through [PDRM Semak Mule](https://semakmule.rmp.gov.my).

Never submit passwords, OTP/TACs, PINs, full card details, IC numbers, or other sensitive information.

## Run locally

Requirements: Python 3.10+ and Node.js 18+.

```bash
# Terminal 1
cd backend
pip install -r requirements.txt
python ml/train.py
uvicorn main:app --host 127.0.0.1 --port 8000

# Terminal 2
cd frontend
npm install
npm run dev
```

Open the Vite URL printed by the frontend (normally `http://localhost:5173/PhishGuard-MY/`).

## Release configuration

The API accepts cross-origin requests only from local development URLs by default. Set the deployed frontend origin explicitly:

```bash
export CORS_ALLOW_ORIGINS="https://your-domain.example"
export MAX_SESSION_RECORDS="1000"
```

`MAX_SESSION_RECORDS` is bounded between 100 and 10,000. The current prototype keeps only short-lived, in-memory aggregate analysis metadata. Raw analysis input is not added to telemetry. Reports are deliberately recorded as privacy-minimised metadata only and are lost when the process restarts. The browser creates a one-way fingerprint for duplicate detection; raw evidence and the generated report pack are not sent to the PhishGuard API.

Before accepting real reports in production, implement and document: encrypted persistent storage, access control, retention/deletion policy, abuse controls and rate limiting, a designated review team, consent records, and a formally authorised official-agency handoff. A future structured feed should use approved MyCERT MISP membership or another written agency agreement; do not represent that integration as active until it has been agreed and tested.

## Verification

```bash
cd frontend && npm run build && npm run lint
cd .. && PYTHONPATH=backend python -m compileall -q backend
```

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/analyze/url` | Analyse a link for phishing risk signals |
| `POST` | `/api/analyze/text` | Analyse message text for scam patterns |
| `POST` | `/api/report` | Queue privacy-minimised signal metadata and a duplicate fingerprint for review |
| `GET` | `/api/stats` | Session aggregate and illustrative practice data |
| `GET` | `/api/threats/feed` | Educational scenario cards |
| `GET` | `/api/threats/patterns` | Malaysian scam-pattern reference |
| `GET` | `/api/cybersquad/challenge` | Practice challenge items |
| `GET` | `/api/cybersquad/leaderboard` | Illustrative programme scoreboard |
| `GET` | `/api/health` | Service health |

The current dashboard, scenario cards, and CyberSquad scores are labelled illustrative. Treat official sources—not this demo data—as the source of current national incident statistics or active campaigns.
