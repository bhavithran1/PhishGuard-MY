import os
import joblib
import numpy as np
from .feature_extraction import extract_url_features, FEATURE_NAMES
from .malaysian_patterns import analyze_text_for_scam

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trained")


class PhishGuardModel:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        model_path = os.path.join(MODEL_DIR, "phishing_model.joblib")
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            print(f"Warning: Model not found at {model_path}. Run train.py first.")

    def analyze_url(self, url: str) -> dict:
        features = extract_url_features(url)
        feature_vector = np.array([[features[name] for name in FEATURE_NAMES]])

        if self.model is not None:
            proba = self.model.predict_proba(feature_vector)[0]
            phishing_score = float(proba[1])
            prediction = int(self.model.predict(feature_vector)[0])
        else:
            phishing_score = self._heuristic_score(features)
            prediction = 1 if phishing_score >= 0.5 else 0

        risk_level = "critical" if phishing_score >= 0.85 else \
                     "high" if phishing_score >= 0.65 else \
                     "medium" if phishing_score >= 0.4 else \
                     "low"

        risk_factors = []
        if features["has_ip_address"]:
            risk_factors.append("Uses raw IP address instead of domain name")
        if features["has_suspicious_tld"]:
            risk_factors.append("Uses suspicious top-level domain")
        if features["is_shortener"]:
            risk_factors.append("Uses URL shortener to hide destination")
        if features["has_brand_keyword"]:
            risk_factors.append("Contains brand name — possible impersonation")
        if features["has_login_keyword"]:
            risk_factors.append("Contains login/verification keywords")
        if features["has_redirect"]:
            risk_factors.append("Contains redirect parameters")
        if features["url_length"] > 100:
            risk_factors.append("Unusually long URL")
        if features["num_subdomains"] > 3:
            risk_factors.append("Excessive subdomains")
        if not features["has_https"]:
            risk_factors.append("Does not use HTTPS encryption")
        if features["hostname_entropy"] > 4.0:
            risk_factors.append("High randomness in hostname — may be auto-generated")
        if features["digit_ratio"] > 0.3:
            risk_factors.append("High ratio of digits in URL")

        return {
            "url": url,
            "is_phishing": prediction == 1,
            "confidence": phishing_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "features": {k: round(v, 4) if isinstance(v, float) else v for k, v in features.items()},
        }

    def analyze_text(self, text: str) -> dict:
        result = analyze_text_for_scam(text)

        import re
        urls = re.findall(r'https?://[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+', text)
        url_analyses = []
        for url in urls[:5]:
            url_analysis = self.analyze_url(url)
            url_analyses.append(url_analysis)
            if url_analysis["is_phishing"]:
                result["risk_score"] = max(result["risk_score"], url_analysis["confidence"])

        result["embedded_urls"] = url_analyses
        result["risk_level"] = "critical" if result["risk_score"] >= 0.85 else \
                               "high" if result["risk_score"] >= 0.65 else \
                               "medium" if result["risk_score"] >= 0.4 else \
                               "low"

        return result

    def _heuristic_score(self, features: dict) -> float:
        score = 0.0
        if features["has_ip_address"]:
            score += 0.25
        if features["has_suspicious_tld"]:
            score += 0.2
        if features["has_brand_keyword"] and features["has_suspicious_tld"]:
            score += 0.3
        if features["has_login_keyword"]:
            score += 0.1
        if not features["has_https"]:
            score += 0.1
        if features["url_length"] > 100:
            score += 0.1
        if features["num_subdomains"] > 3:
            score += 0.1
        if features["hostname_entropy"] > 4.0:
            score += 0.1
        if features["is_shortener"]:
            score += 0.15
        return min(score, 1.0)
