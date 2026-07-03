import re

MALAYSIAN_SCAM_PATTERNS = {
    "traffic_summons": {
        "keywords": [
            "saman", "summons", "trafik", "traffic", "jpj", "pdrm",
            "denda", "fine", "bayar segera", "pay immediately",
            "notis saman", "unpaid summon", "traffic violation",
            "outstanding fine", "penalty notice",
        ],
        "description": "Traffic summons scam — fake PDRM/JPJ messages demanding fine payment",
        "severity": "high",
    },
    "bank_impersonation": {
        "keywords": [
            "maybank2u", "cimbclicks", "rhb now", "pbe", "mybank",
            "akaun anda", "your account", "suspended", "digantung",
            "verify your", "sahkan akaun", "unusual activity",
            "aktiviti luar biasa", "transaction alert", "tac code",
            "one-time password", "card blocked", "kad disekat",
            "update banking", "kemaskini perbankan",
        ],
        "description": "Bank impersonation — fake alerts from Malaysian banks",
        "severity": "critical",
    },
    "ewallet_fraud": {
        "keywords": [
            "touch n go", "touchngo", "tng ewallet", "grabpay",
            "boost", "shopeepay", "bigpay", "gopay",
            "wallet anda", "your wallet", "top up failed",
            "claim reward", "tuntut hadiah", "cashback",
            "reload failed", "tambah nilai gagal",
        ],
        "description": "E-wallet fraud — fake Touch 'n Go, GrabPay, Boost messages",
        "severity": "high",
    },
    "government_impersonation": {
        "keywords": [
            "lhdn", "hasil", "cukai", "tax refund", "pulangan cukai",
            "kwsp", "epf", "i-sinar", "i-akaun", "socso", "perkeso",
            "mcmc", "skmm", "bpr", "bkm", "bantuan", "subsidi",
            "spr", "mysejahtera", "kkm", "moh",
            "kementerian", "ministry", "jabatan", "department",
        ],
        "description": "Government impersonation — fake LHDN, KWSP, MCMC messages",
        "severity": "critical",
    },
    "delivery_scam": {
        "keywords": [
            "pos malaysia", "poslaju", "pos laju", "j&t", "jnt express",
            "dhl", "fedex", "ninja van", "parcel", "bungkusan",
            "delivery failed", "penghantaran gagal", "tracking",
            "penjejakan", "customs fee", "bayaran kastam",
            "reschedule delivery", "jadual semula",
        ],
        "description": "Delivery scam — fake Pos Malaysia, J&T, courier notifications",
        "severity": "medium",
    },
    "investment_scam": {
        "keywords": [
            "pelaburan", "investment", "guaranteed return",
            "pulangan terjamin", "forex", "crypto", "bitcoin",
            "ethereum", "passive income", "pendapatan pasif",
            "skim cepat kaya", "get rich quick", "mlm",
            "roi", "compound interest", "faedah berganda",
        ],
        "description": "Investment/money game scam — fake forex, crypto, MLM schemes",
        "severity": "high",
    },
    "romance_scam": {
        "keywords": [
            "love scam", "dating", "military officer", "pegawai tentera",
            "send money", "hantar duit", "western union", "moneygram",
            "stuck overseas", "terperangkap", "hospital bills",
            "inheritance", "warisan", "gold investment",
        ],
        "description": "Romance/love scam — social engineering via dating platforms",
        "severity": "medium",
    },
    "job_scam": {
        "keywords": [
            "kerja dari rumah", "work from home", "part time job",
            "kerja sambilan", "commission", "komisen", "data entry",
            "like and subscribe", "rating task", "easy money",
            "duit mudah", "telegram group", "whatsapp group",
            "daily income", "pendapatan harian",
        ],
        "description": "Job scam — fake work-from-home, task-based fraud",
        "severity": "high",
    },
    "qr_phishing": {
        "keywords": [
            "scan qr", "imbas qr", "qr code", "kod qr",
            "scan to pay", "imbas untuk bayar", "duitnow qr",
            "scan for discount", "imbas untuk diskaun",
        ],
        "description": "QR phishing (quishing) — malicious QR codes in public spaces",
        "severity": "high",
    },
}

MANGLISH_INDICATORS = [
    r"\blah\b", r"\bla\b", r"\bleh\b", r"\bkan\b", r"\bni\b",
    r"\btu\b", r"\bje\b", r"\bjer\b", r"\bkot\b", r"\bgeh\b",
    r"\bmeh\b", r"\bweh\b", r"\bbro\b", r"\bsis\b", r"\bboss\b",
    r"\btapau\b", r"\bgostan\b", r"\bkena\b",
]

URGENCY_PHRASES = [
    "segera", "immediately", "urgent", "dalam 24 jam", "within 24 hours",
    "sebelum", "before", "hari ini", "today", "sekarang", "now",
    "last chance", "peluang terakhir", "act now", "bertindak sekarang",
    "akaun akan ditutup", "account will be closed",
    "akan digantung", "will be suspended",
]

SUSPICIOUS_ACTIONS = [
    "klik", "click", "tap", "tekan", "press",
    "muat turun", "download", "install", "pasang",
    "log masuk", "log in", "sign in", "daftar masuk",
    "masukkan", "enter", "provide", "berikan",
    "hantar", "send", "transfer", "pindah",
    "sahkan", "verify", "confirm", "pengesahan",
]


def analyze_text_for_scam(text: str) -> dict:
    text_lower = text.lower()
    results = {
        "is_suspicious": False,
        "risk_score": 0.0,
        "matched_patterns": [],
        "urgency_detected": False,
        "suspicious_actions": [],
        "manglish_detected": False,
        "details": [],
    }

    score = 0.0

    for pattern_name, pattern_data in MALAYSIAN_SCAM_PATTERNS.items():
        matched_keywords = [kw for kw in pattern_data["keywords"] if kw.lower() in text_lower]
        if matched_keywords:
            severity_weight = {"critical": 30, "high": 20, "medium": 10}.get(pattern_data["severity"], 5)
            score += severity_weight * min(len(matched_keywords), 3)
            results["matched_patterns"].append({
                "pattern": pattern_name,
                "description": pattern_data["description"],
                "severity": pattern_data["severity"],
                "matched_keywords": matched_keywords[:5],
            })

    urgency_matches = [p for p in URGENCY_PHRASES if p.lower() in text_lower]
    if urgency_matches:
        results["urgency_detected"] = True
        score += 15 * min(len(urgency_matches), 3)
        results["details"].append(f"Urgency language detected: {', '.join(urgency_matches[:3])}")

    action_matches = [a for a in SUSPICIOUS_ACTIONS if a.lower() in text_lower]
    if action_matches:
        results["suspicious_actions"] = action_matches[:5]
        score += 10 * min(len(action_matches), 3)

    manglish_count = sum(1 for pattern in MANGLISH_INDICATORS if re.search(pattern, text_lower))
    if manglish_count >= 2:
        results["manglish_detected"] = True
        score += 5

    url_pattern = re.compile(r'https?://[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+')
    urls_found = url_pattern.findall(text)
    if urls_found:
        score += 10
        results["details"].append(f"Contains {len(urls_found)} URL(s)")

    if re.search(r"(?:rm|myr|ringgit)\s*[\d,]+", text_lower):
        score += 10
        results["details"].append("Contains monetary amounts in MYR")

    phone_pattern = re.compile(r"(?:\+?6?0\d[\s-]?\d{4}[\s-]?\d{4}|\b01\d[\s-]?\d{3,4}[\s-]?\d{4}\b)")
    if phone_pattern.search(text):
        score += 5
        results["details"].append("Contains Malaysian phone number")

    results["risk_score"] = min(score, 100) / 100.0
    results["is_suspicious"] = results["risk_score"] >= 0.3

    return results
