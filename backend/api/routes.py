import uuid
import os
from datetime import datetime, timedelta
import random

from fastapi import APIRouter

from .schemas import (
    URLAnalysisRequest, URLAnalysisResponse,
    TextAnalysisRequest, TextAnalysisResponse,
    ReportRequest, ReportResponse,
)
from ml.model import PhishGuardModel

router = APIRouter(prefix="/api")
model = PhishGuardModel()

analysis_history: list[dict] = []
reports: list[dict] = []


def _session_record_limit() -> int:
    try:
        requested_limit = int(os.getenv("MAX_SESSION_RECORDS", "1000"))
    except ValueError:
        requested_limit = 1000
    return max(100, min(requested_limit, 10_000))


MAX_SESSION_RECORDS = _session_record_limit()


def _append_session_record(records: list[dict], record: dict) -> None:
    """Keep the prototype's in-memory aggregates bounded and short-lived."""
    records.append(record)
    if len(records) > MAX_SESSION_RECORDS:
        del records[:-MAX_SESSION_RECORDS]


@router.post("/analyze/url", response_model=URLAnalysisResponse)
async def analyze_url(request: URLAnalysisRequest):
    result = model.analyze_url(request.url)
    _append_session_record(analysis_history, {
        "type": "url",
        "is_suspicious": result["is_phishing"],
        "categories": [],
        "timestamp": datetime.now().isoformat(),
    })
    return result


@router.post("/analyze/text", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    result = model.analyze_text(request.text)
    _append_session_record(analysis_history, {
        "type": "text",
        "is_suspicious": result["is_suspicious"],
        "categories": [pattern["pattern"] for pattern in result["matched_patterns"]],
        "timestamp": datetime.now().isoformat(),
    })
    return result


@router.post("/report", response_model=ReportResponse)
async def submit_report(request: ReportRequest):
    report_id = f"PG-{uuid.uuid4().hex[:8].upper()}"
    report = {
        "report_id": report_id,
        "type": request.type,
        "content_length": len(request.content),
        "has_callback_email": request.reporter_email is not None,
        "has_context": request.description is not None,
        "status": "local_only",
        "timestamp": datetime.now().isoformat(),
    }
    _append_session_record(reports, report)
    return ReportResponse(
        report_id=report_id,
        status="local_only",
        message="Your report metadata was recorded in this local project session. It was not forwarded to any agency. Use the official action pathways for an urgent or formal report.",
    )


@router.get("/stats")
async def get_stats():
    return {
        "total_analyses": len(analysis_history),
        "threats_detected": sum(
            1 for a in analysis_history
            if a["is_suspicious"]
        ),
        "reports_submitted": len(reports),
        "threat_categories": _get_threat_category_stats(),
        "malaysia_stats": {
            "total_incidents_2025": 7782,
            "fraud_percentage": 72,
            "total_losses_rm_billion": 1.58,
            "top_attack_types": [
                {"type": "Phishing", "percentage": 66, "count": 5136},
                {"type": "Fraud", "percentage": 18, "count": 1401},
                {"type": "Intrusion", "percentage": 8, "count": 623},
                {"type": "Malware", "percentage": 4, "count": 311},
                {"type": "Other", "percentage": 4, "count": 311},
            ],
            "top_targeted_sectors": [
                {"sector": "Banking & Finance", "percentage": 38},
                {"sector": "E-commerce", "percentage": 22},
                {"sector": "Government Services", "percentage": 15},
                {"sector": "Telecommunications", "percentage": 12},
                {"sector": "E-wallet / Fintech", "percentage": 8},
                {"sector": "Others", "percentage": 5},
            ],
            "monthly_trend": _generate_monthly_trend(),
        },
    }


@router.get("/threats/feed")
async def get_threat_feed():
    threats = _generate_threat_feed()
    return {"threats": threats, "total": len(threats)}


@router.get("/threats/patterns")
async def get_threat_patterns():
    from ml.malaysian_patterns import MALAYSIAN_SCAM_PATTERNS
    patterns = []
    for name, data in MALAYSIAN_SCAM_PATTERNS.items():
        patterns.append({
            "name": name,
            "description": data["description"],
            "severity": data["severity"],
            "keyword_count": len(data["keywords"]),
            "sample_keywords": data["keywords"][:5],
        })
    return {"patterns": patterns}


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model.model is not None,
        "version": "1.0.0",
        "name": "PhishGuard MY",
    }


def _get_threat_category_stats() -> list[dict]:
    categories = {}
    for a in analysis_history:
        for category in a["categories"]:
            categories[category] = categories.get(category, 0) + 1
    return [{"category": k, "count": v} for k, v in sorted(categories.items(), key=lambda x: -x[1])]


def _generate_monthly_trend() -> list[dict]:
    base = datetime(2025, 1, 1)
    trend = []
    base_count = 580
    for i in range(12):
        month = base + timedelta(days=30 * i)
        variation = random.randint(-50, 80)
        trend.append({
            "month": month.strftime("%b %Y"),
            "incidents": base_count + variation + (i * 15),
        })
    return trend


def _generate_threat_feed() -> list[dict]:
    sample_threats = [
        {
            "type": "bank_impersonation",
            "severity": "critical",
            "title": "Maybank TAC Verification Scam",
            "description": "Fake SMS requesting TAC code verification via malicious link",
            "target": "Maybank customers",
            "vector": "SMS (Smishing)",
        },
        {
            "type": "traffic_summons",
            "severity": "high",
            "title": "PDRM Traffic Summons Payment Scam",
            "description": "Phishing site impersonating JPJ/PDRM for fine collection",
            "target": "Malaysian drivers",
            "vector": "SMS + Phishing Website",
        },
        {
            "type": "ewallet_fraud",
            "severity": "high",
            "title": "Touch 'n Go eWallet Reward Claim",
            "description": "Fake reward notification redirecting to credential harvesting page",
            "target": "TNG eWallet users",
            "vector": "Push Notification + Phishing",
        },
        {
            "type": "government_impersonation",
            "severity": "critical",
            "title": "LHDN Tax Refund Phishing",
            "description": "Email impersonating LHDN offering tax refund via fake portal",
            "target": "Malaysian taxpayers",
            "vector": "Email Phishing",
        },
        {
            "type": "delivery_scam",
            "severity": "medium",
            "title": "Pos Laju Customs Fee Scam",
            "description": "Fake delivery notification requesting customs clearance payment",
            "target": "Online shoppers",
            "vector": "SMS + Fake Website",
        },
        {
            "type": "job_scam",
            "severity": "high",
            "title": "Telegram Part-Time Job Fraud",
            "description": "Task-based scam requiring upfront deposit via Telegram group",
            "target": "Job seekers",
            "vector": "Telegram + WhatsApp",
        },
        {
            "type": "qr_phishing",
            "severity": "high",
            "title": "DuitNow QR Code Tampering",
            "description": "Malicious QR stickers placed over legitimate payment codes",
            "target": "Retail customers",
            "vector": "QR Code (Quishing)",
        },
        {
            "type": "investment_scam",
            "severity": "high",
            "title": "Crypto Investment WhatsApp Group",
            "description": "Fake investment platform promising guaranteed returns",
            "target": "Retail investors",
            "vector": "WhatsApp + Fake Platform",
        },
    ]

    base_time = datetime.now()
    for i, threat in enumerate(sample_threats):
        threat["id"] = f"TH-{uuid.uuid4().hex[:6].upper()}"
        threat["timestamp"] = (base_time - timedelta(hours=i * 3, minutes=random.randint(0, 59))).isoformat()
        threat["status"] = "active"
        threat["reports"] = random.randint(5, 150)

    return sample_threats


CHALLENGE_POOL = [
    {"type": "url", "content": "http://maybank2u-secure-login.tk/verify", "is_scam": True, "explanation": "Uses suspicious .tk TLD and impersonates Maybank"},
    {"type": "url", "content": "https://www.maybank2u.com.my/", "is_scam": False, "explanation": "Official Maybank domain with .com.my TLD"},
    {"type": "url", "content": "https://pdrm-saman-check.ga/bayar-denda", "is_scam": True, "explanation": "Fake PDRM site using .ga TLD — real PDRM uses pdrm.gov.my"},
    {"type": "url", "content": "https://www.lhdn.gov.my/", "is_scam": False, "explanation": "Official LHDN government domain"},
    {"type": "url", "content": "http://192.168.1.1/bank/login.php", "is_scam": True, "explanation": "Uses raw IP address — banks never host login pages on IPs"},
    {"type": "url", "content": "https://www.grab.com/my/", "is_scam": False, "explanation": "Official Grab Malaysia domain"},
    {"type": "url", "content": "https://touchngo-reward-claim.top/wallet", "is_scam": True, "explanation": "Fake TNG site using suspicious .top TLD"},
    {"type": "url", "content": "https://www.tngdigital.com.my/", "is_scam": False, "explanation": "Official Touch 'n Go Digital domain"},
    {"type": "sms", "content": "PDRM: Anda mempunyai saman trafik RM300. Bayar segera di http://pdrm-saman.tk/bayar sebelum akaun digantung.", "is_scam": True, "explanation": "Urgency language + fake URL + PDRM impersonation. PDRM doesn't send payment links via SMS."},
    {"type": "sms", "content": "Maybank: Unusual activity detected. Your account will be suspended. Verify now: http://maybank2u-secure.xyz/login", "is_scam": True, "explanation": "Fear-based urgency + phishing URL. Maybank uses official app notifications, not SMS links."},
    {"type": "sms", "content": "Your Pos Laju parcel has arrived at the sorting center. Track at https://www.pos.com.my/track", "is_scam": False, "explanation": "Uses official pos.com.my domain — legitimate tracking notification"},
    {"type": "sms", "content": "Tahniah! Anda memenangi RM5000 cashback Touch n Go eWallet. Tuntut hadiah: http://tng-reward.top/claim", "is_scam": True, "explanation": "Too-good-to-be-true prize + suspicious .top domain + urgency to claim"},
    {"type": "sms", "content": "LHDN: Pulangan cukai anda RM2,350 telah diluluskan. Masukkan butiran bank di http://lhdn-refund.cf/tuntut", "is_scam": True, "explanation": "LHDN processes refunds through official MyTax portal, never via SMS links"},
    {"type": "sms", "content": "Reminder: Your KWSP contribution statement for June 2025 is now available. View at https://www.kwsp.gov.my", "is_scam": False, "explanation": "Official KWSP domain — legitimate notification"},
    {"type": "sms", "content": "Part time job! RM200-500/day, just like & subscribe videos from home. Join Telegram group: t.me/easy_money_my", "is_scam": True, "explanation": "Classic job scam pattern — unrealistic pay, vague tasks, Telegram recruitment"},
    {"type": "sms", "content": "J&T Express: Penghantaran gagal. Bayaran kastam RM45.90 diperlukan. Klik: http://jnt-customs.buzz/pay", "is_scam": True, "explanation": "Fake customs fee + suspicious .buzz domain. J&T uses official jnt.com.my domain."},
]

UNIVERSITIES = [
    {"name": "Universiti Malaya", "code": "UM", "city": "Kuala Lumpur", "members": 342, "scams_reported": 1247, "challenges_completed": 8920, "rank": 1},
    {"name": "Universiti Teknologi Malaysia", "code": "UTM", "city": "Johor Bahru", "members": 289, "scams_reported": 1089, "challenges_completed": 7651, "rank": 2},
    {"name": "Universiti Kebangsaan Malaysia", "code": "UKM", "city": "Bangi", "members": 256, "scams_reported": 934, "challenges_completed": 6890, "rank": 3},
    {"name": "Universiti Sains Malaysia", "code": "USM", "city": "Penang", "members": 231, "scams_reported": 876, "challenges_completed": 6234, "rank": 4},
    {"name": "Universiti Putra Malaysia", "code": "UPM", "city": "Serdang", "members": 198, "scams_reported": 723, "challenges_completed": 5412, "rank": 5},
    {"name": "Universiti Teknologi MARA", "code": "UiTM", "city": "Shah Alam", "members": 412, "scams_reported": 687, "challenges_completed": 4987, "rank": 6},
    {"name": "Universiti Islam Antarabangsa", "code": "IIUM", "city": "Gombak", "members": 167, "scams_reported": 534, "challenges_completed": 3890, "rank": 7},
    {"name": "Multimedia University", "code": "MMU", "city": "Cyberjaya", "members": 145, "scams_reported": 489, "challenges_completed": 3456, "rank": 8},
]


@router.get("/cybersquad/challenge")
async def get_challenge():
    items = random.sample(CHALLENGE_POOL, min(5, len(CHALLENGE_POOL)))
    challenge = []
    for item in items:
        challenge.append({
            "id": uuid.uuid4().hex[:8],
            "type": item["type"],
            "content": item["content"],
            "is_scam": item["is_scam"],
            "explanation": item["explanation"],
        })
    return {"challenges": challenge, "total": len(challenge), "time_limit_seconds": 60}


@router.get("/cybersquad/leaderboard")
async def get_leaderboard():
    top_hunters = [
        {"rank": 1, "handle": "ph1sh_hunt3r", "university": "UM", "xp": 12450, "badge": "guardian", "scams_caught": 342},
        {"rank": 2, "handle": "cyb3r_s1s", "university": "UTM", "xp": 11200, "badge": "guardian", "scams_caught": 298},
        {"rank": 3, "handle": "sc4m_bust3r", "university": "UKM", "xp": 9870, "badge": "sentinel", "scams_caught": 267},
        {"rank": 4, "handle": "n3tw0rk_n1nj4", "university": "USM", "xp": 8930, "badge": "sentinel", "scams_caught": 234},
        {"rank": 5, "handle": "z3r0_d4y", "university": "UPM", "xp": 7650, "badge": "hunter", "scams_caught": 198},
        {"rank": 6, "handle": "m4l4y_sh13ld", "university": "UiTM", "xp": 6540, "badge": "hunter", "scams_caught": 156},
        {"rank": 7, "handle": "d4t4_gu4rd", "university": "IIUM", "xp": 5890, "badge": "analyst", "scams_caught": 134},
        {"rank": 8, "handle": "f1r3w4ll_my", "university": "MMU", "xp": 4320, "badge": "analyst", "scams_caught": 98},
    ]
    return {
        "hunters": top_hunters,
        "universities": UNIVERSITIES,
        "total_members": sum(u["members"] for u in UNIVERSITIES),
        "total_scams_reported": sum(u["scams_reported"] for u in UNIVERSITIES),
        "total_challenges": sum(u["challenges_completed"] for u in UNIVERSITIES),
    }
