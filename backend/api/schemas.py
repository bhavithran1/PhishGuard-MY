from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class URLAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    url: str = Field(min_length=1, max_length=2048, description="A URL or domain to assess")


class TextAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    text: str = Field(min_length=1, max_length=10_000, description="Message text with sensitive data removed")


class ReportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    type: Literal["url", "sms", "email", "qr", "social", "call", "other"]
    route: Literal["signal", "urgent", "vulnerability"]
    incident_type: Literal[
        "phishing", "fraud", "malware", "account_takeover",
        "data_breach", "vulnerability", "other",
    ]
    content_hash: str = Field(pattern=r"^[a-f0-9]{64}$")
    content_length: int = Field(ge=1, le=4_800)
    impersonated_entity: str | None = Field(default=None, max_length=120)
    first_seen: str | None = Field(default=None, max_length=40)
    state: str | None = Field(default=None, max_length=60)
    consent_to_review: Literal[True]

    @field_validator("first_seen")
    @classmethod
    def validate_first_seen_shape(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        if "T" not in value:
            raise ValueError("Use a date and time value")
        return value


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
    duplicate_count: int
    official_route: Literal["cyber999", "nsrc_997", "mycert_cvd"]
