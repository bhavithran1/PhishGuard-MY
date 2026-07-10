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
    type: Literal["url", "sms", "email", "qr"]
    content: str = Field(min_length=1, max_length=10_000)
    reporter_email: str | None = Field(default=None, max_length=254)
    description: str | None = Field(default=None, max_length=2_000)

    @field_validator("reporter_email")
    @classmethod
    def validate_email_shape(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        if "@" not in value or value.startswith("@") or value.endswith("@"):
            raise ValueError("Enter a valid callback email address")
        return value.lower()


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
