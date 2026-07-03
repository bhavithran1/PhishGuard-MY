from pydantic import BaseModel


class URLAnalysisRequest(BaseModel):
    url: str


class TextAnalysisRequest(BaseModel):
    text: str


class ReportRequest(BaseModel):
    type: str  # "url" | "sms" | "email" | "qr"
    content: str
    reporter_email: str | None = None
    description: str | None = None


class URLAnalysisResponse(BaseModel):
    url: str
    is_phishing: bool
    confidence: float
    risk_level: str
    risk_factors: list[str]
    features: dict


class TextAnalysisResponse(BaseModel):
    is_suspicious: bool
    risk_score: float
    risk_level: str
    matched_patterns: list[dict]
    urgency_detected: bool
    suspicious_actions: list[str]
    manglish_detected: bool
    details: list[str]
    embedded_urls: list[dict]


class ReportResponse(BaseModel):
    report_id: str
    status: str
    message: str
