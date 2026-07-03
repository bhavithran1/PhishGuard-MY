import re
import math
from urllib.parse import urlparse, parse_qs
import tldextract


SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club", ".work",
    ".buzz", ".surf", ".icu", ".cam", ".rest", ".monster", ".cyou",
    ".cfd", ".sbs", ".click", ".link", ".info", ".bid", ".stream",
}

BRAND_KEYWORDS = {
    "maybank", "cimb", "rhb", "publicbank", "ambank", "bankislam",
    "hongleong", "ocbc", "uob", "hsbc", "bsn", "affin", "alliance",
    "touchngo", "grabpay", "boost", "shopeepay", "bigpay", "gopay",
    "netflix", "spotify", "apple", "microsoft", "google", "facebook",
    "instagram", "whatsapp", "telegram", "lazada", "shopee",
    "pos-malaysia", "poslaju", "jnt", "dhl", "fedex",
    "lhdn", "pdrm", "jpj", "mcmc", "kwsp", "epf", "socso",
    "myeg", "mysejahtera",
}

SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd",
    "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc",
    "rb.gy", "s.id", "v.gd",
}


def entropy(text: str) -> float:
    if not text:
        return 0.0
    freq = {}
    for c in text:
        freq[c] = freq.get(c, 0) + 1
    length = len(text)
    return -sum((count / length) * math.log2(count / length) for count in freq.values())


def extract_url_features(url: str) -> dict:
    features = {}

    features["url_length"] = len(url)
    features["num_dots"] = url.count(".")
    features["num_hyphens"] = url.count("-")
    features["num_underscores"] = url.count("_")
    features["num_slashes"] = url.count("/")
    features["num_at"] = url.count("@")
    features["num_ampersand"] = url.count("&")
    features["num_equals"] = url.count("=")
    features["num_digits"] = sum(c.isdigit() for c in url)
    features["num_special"] = sum(not c.isalnum() and c not in ".-_/:" for c in url)
    features["has_https"] = 1 if url.startswith("https") else 0
    features["has_ip_address"] = 1 if re.search(r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url) else 0

    try:
        parsed = urlparse(url if "://" in url else f"http://{url}")
        hostname = parsed.hostname or ""
        path = parsed.path or ""
        query = parsed.query or ""
    except Exception:
        hostname = ""
        path = ""
        query = ""

    features["hostname_length"] = len(hostname)
    features["path_length"] = len(path)
    features["query_length"] = len(query)
    features["num_subdomains"] = max(0, hostname.count(".") - 1)
    features["path_depth"] = path.count("/") - 1 if path else 0
    features["num_params"] = len(parse_qs(query))

    features["hostname_entropy"] = entropy(hostname)
    features["path_entropy"] = entropy(path)
    features["url_entropy"] = entropy(url)

    ext = tldextract.extract(url)
    domain = ext.domain
    suffix = f".{ext.suffix}" if ext.suffix else ""
    features["domain_length"] = len(domain)
    features["has_suspicious_tld"] = 1 if suffix.lower() in SUSPICIOUS_TLDS else 0
    features["is_shortener"] = 1 if f"{ext.domain}.{ext.suffix}".lower() in SHORTENER_DOMAINS else 0

    url_lower = url.lower()
    features["has_brand_keyword"] = 1 if any(kw in url_lower for kw in BRAND_KEYWORDS) else 0

    features["digit_ratio"] = features["num_digits"] / max(len(url), 1)
    features["special_ratio"] = features["num_special"] / max(len(url), 1)

    features["has_login_keyword"] = 1 if any(
        kw in url_lower for kw in ["login", "signin", "verify", "secure", "account", "update", "confirm", "bank", "password"]
    ) else 0
    features["has_redirect"] = 1 if any(
        kw in url_lower for kw in ["redirect", "url=", "link=", "goto=", "return=", "next=", "rurl="]
    ) else 0
    features["has_data_uri"] = 1 if "data:" in url_lower else 0
    features["has_double_slash_redirect"] = 1 if url.count("//") > 1 else 0

    return features


FEATURE_NAMES = list(extract_url_features("https://example.com").keys())
