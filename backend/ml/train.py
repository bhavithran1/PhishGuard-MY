"""
Train phishing URL detection model using real-world data.
Uses the GregaVrbancic 88K dataset + Malaysian-specific samples.
"""
import json
import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.feature_extraction import FEATURE_NAMES, extract_url_features

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trained")

MALAYSIAN_PHISHING_SAMPLES = [
    "http://maybank2u-secure-login.tk/verify",
    "https://cimb-clicks-update.xyz/account/verify.php",
    "http://rhb-online-banking.ml/login",
    "https://touchngo-reward-claim.top/wallet",
    "http://lhdn-tax-refund.cf/cukai/pulangan",
    "https://pdrm-saman-check.ga/bayar-denda",
    "http://pos-malaysia-tracking.work/parcel/status",
    "http://192.168.1.1/maybank/login.php",
    "https://kwsp-isinar.club/pengeluaran",
    "http://grabpay-cashback.buzz/claim",
    "https://shopee-prize.icu/winner-confirmation",
    "http://lazada-lucky-draw.cam/hadiah",
    "https://boost-ewallet-verify.surf/update",
    "http://jnt-express-delivery.monster/reschedule",
    "https://maybank-secure.click/tac-verification",
    "http://cimb-alert.link/unusual-activity",
    "https://rhb-reward-points.info/redeem",
    "http://epf-withdrawal.bid/i-akaun",
    "https://myeg-renew.stream/roadtax",
    "http://bank-islam-update.rest/kemaskini",
    "http://ambank-verify.cyou/sahkan-akaun",
    "https://public-bank-alert.cfd/transaction",
    "http://hsbc-malaysia.sbs/secure-login",
    "https://touch-n-go-topup.click/reload-failed",
    "http://mcmc-notice.xyz/skmm-amaran",
    "https://jpj-summon-payment.top/denda-trafik",
    "http://socso-perkeso-claim.ga/tuntutan",
    "https://bkm-bantuan.cf/permohonan",
    "http://bigpay-upgrade.tk/premium-account",
    "https://netflix-my-renew.ml/subscription",
    "http://spotify-payment-update.ga/billing",
    "http://duitnow-transfer-confirm.xyz/sahkan",
    "https://whatsapp-verify.top/nombor-telefon",
    "http://instagram-login.club/masuk",
    "https://facebook-security-my.work/keselamatan",
    "http://tng-ewallet-reward.buzz/hadiah-tunai",
    "https://poslaju-customs.icu/bayaran-kastam",
    "http://grab-driver-bonus.cam/claim-bonus",
    "https://shopee-seller.surf/pengesahan-akaun",
    "http://lazada-order-problem.monster/masalah-pesanan",
]

LEGITIMATE_MY_SAMPLES = [
    "https://www.maybank2u.com.my/",
    "https://www.cimbclicks.com.my/",
    "https://www2.rhbgroup.com/",
    "https://www.pbebank.com/",
    "https://www.tngdigital.com.my/",
    "https://www.grab.com/my/",
    "https://shopee.com.my/",
    "https://www.lazada.com.my/",
    "https://www.pos.com.my/",
    "https://www.jtexpress.my/",
    "https://www.lhdn.gov.my/",
    "https://www.kwsp.gov.my/",
    "https://www.perkeso.gov.my/",
    "https://www.mcmc.gov.my/",
    "https://www.jpj.gov.my/",
    "https://www.pdrm.gov.my/",
    "https://www.myeg.com.my/",
    "https://www.bankislam.com/",
    "https://www.ambank.com.my/",
    "https://www.hlb.com.my/",
    "https://www.uob.com.my/",
    "https://www.hsbc.com.my/",
    "https://www.bsn.com.my/",
    "https://www.affinbank.com.my/",
    "https://www.alliancebank.com.my/",
    "https://www.bigpayme.com/",
    "https://www.boostapp.com/",
    "https://shopeepay.com.my/",
    "https://www.netflix.com/my/",
    "https://www.spotify.com/my-en/",
    "https://www.apple.com/my/",
    "https://www.google.com.my/",
    "https://www.facebook.com/",
    "https://www.instagram.com/",
    "https://web.whatsapp.com/",
    "https://www.nacsa.gov.my/",
    "https://www.cybersecurity.my/",
    "https://www.mycert.org.my/",
    "https://www.bnm.gov.my/",
    "https://www.sc.com.my/",
    "https://www.bursamalaysia.com/",
]


def generate_features_from_urls(urls: list[str], label: int) -> pd.DataFrame:
    rows = []
    for url in urls:
        try:
            feats = extract_url_features(url)
            feats["label"] = label
            rows.append(feats)
        except Exception as e:
            print(f"  Skipping {url}: {e}")
    return pd.DataFrame(rows)


def load_preextracted_dataset() -> pd.DataFrame | None:
    csv_path = os.path.join(DATA_DIR, "phishing_urls.csv")
    if not os.path.exists(csv_path):
        return None

    df = pd.read_csv(csv_path)
    if "phishing" not in df.columns:
        return None

    feature_mapping = {
        "url_length": "length_url",
        "num_dots": "qty_dot_url",
        "num_hyphens": "qty_hyphen_url",
        "num_underscores": "qty_underline_url",
        "num_slashes": "qty_slash_url",
        "num_at": "qty_at_url",
        "num_ampersand": "qty_and_url",
        "num_equals": "qty_equal_url",
        "hostname_length": "length_hostname",
        "path_length": "length_url",
        "num_subdomains": "qty_dot_domain",
        "path_depth": "qty_slash_directory",
        "num_params": "qty_params",
        "has_https": "tls_ssl_certificate",
        "has_ip_address": "server_client_domain",
    }

    mapped_rows = []
    sample_size = min(20000, len(df))
    phishing = df[df["phishing"] == 1].sample(n=min(sample_size // 2, len(df[df["phishing"] == 1])), random_state=42)
    legit = df[df["phishing"] == 0].sample(n=min(sample_size // 2, len(df[df["phishing"] == 0])), random_state=42)
    sampled = pd.concat([phishing, legit])

    for _, row in sampled.iterrows():
        features = {}
        for our_feat in FEATURE_NAMES:
            if our_feat in feature_mapping and feature_mapping[our_feat] in row.index:
                val = row[feature_mapping[our_feat]]
                features[our_feat] = float(val) if pd.notna(val) else 0.0
            else:
                features[our_feat] = 0.0

        if "length_url" in row.index and pd.notna(row["length_url"]):
            features["url_length"] = float(row["length_url"])
        if "qty_dot_url" in row.index:
            features["num_dots"] = float(row["qty_dot_url"]) if pd.notna(row["qty_dot_url"]) else 0.0
        if "qty_hyphen_url" in row.index:
            features["num_hyphens"] = float(row["qty_hyphen_url"]) if pd.notna(row["qty_hyphen_url"]) else 0.0
        if "qty_underline_url" in row.index:
            features["num_underscores"] = float(row["qty_underline_url"]) if pd.notna(row["qty_underline_url"]) else 0.0
        if "qty_slash_url" in row.index:
            features["num_slashes"] = float(row["qty_slash_url"]) if pd.notna(row["qty_slash_url"]) else 0.0
        if "qty_at_url" in row.index:
            features["num_at"] = float(row["qty_at_url"]) if pd.notna(row["qty_at_url"]) else 0.0
        if "qty_and_url" in row.index:
            features["num_ampersand"] = float(row["qty_and_url"]) if pd.notna(row["qty_and_url"]) else 0.0
        if "qty_equal_url" in row.index:
            features["num_equals"] = float(row["qty_equal_url"]) if pd.notna(row["qty_equal_url"]) else 0.0
        if "length_hostname" in row.index:
            features["hostname_length"] = float(row["length_hostname"]) if pd.notna(row["length_hostname"]) else 0.0
        if "qty_dot_domain" in row.index:
            features["num_subdomains"] = float(row["qty_dot_domain"]) if pd.notna(row["qty_dot_domain"]) else 0.0
        if "qty_slash_directory" in row.index:
            features["path_depth"] = float(row["qty_slash_directory"]) if pd.notna(row["qty_slash_directory"]) else 0.0
        if "qty_params" in row.index:
            features["num_params"] = float(row["qty_params"]) if pd.notna(row["qty_params"]) else 0.0
        if "url_shortened" in row.index:
            features["is_shortener"] = float(row["url_shortened"]) if pd.notna(row["url_shortened"]) else 0.0

        digits = features.get("url_length", 0) * 0.15
        features["num_digits"] = digits
        features["digit_ratio"] = 0.15
        features["num_special"] = features["num_dots"] + features["num_hyphens"] + features["num_underscores"]
        features["special_ratio"] = features["num_special"] / max(features["url_length"], 1)
        features["query_length"] = features["num_params"] * 8
        features["hostname_entropy"] = 3.2 + (features["hostname_length"] * 0.02)
        features["path_entropy"] = 2.5 + (features["path_depth"] * 0.3)
        features["url_entropy"] = 3.5 + (features["url_length"] * 0.005)
        features["domain_length"] = max(features["hostname_length"] - features["num_subdomains"] * 4 - 4, 3)
        features["path_length"] = features["path_depth"] * 12
        features["has_https"] = 1.0
        features["has_suspicious_tld"] = 0.0
        features["has_brand_keyword"] = 0.0
        features["has_login_keyword"] = 0.0
        features["has_redirect"] = 0.0
        features["has_data_uri"] = 0.0
        features["has_double_slash_redirect"] = 0.0
        features["has_ip_address"] = 0.0

        features["label"] = int(row["phishing"])
        mapped_rows.append(features)

    return pd.DataFrame(mapped_rows)


def train_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)

    print("=" * 60)
    print("PhishGuard MY - Model Training Pipeline")
    print("=" * 60)

    all_features = []

    ext_df = load_preextracted_dataset()
    if ext_df is not None:
        print(f"\nLoaded external dataset: {len(ext_df)} samples")
        print(f"  Phishing: {len(ext_df[ext_df['label'] == 1])}")
        print(f"  Legitimate: {len(ext_df[ext_df['label'] == 0])}")
        all_features.append(ext_df)

    print("\nProcessing Malaysian phishing samples...")
    my_phishing = generate_features_from_urls(MALAYSIAN_PHISHING_SAMPLES, label=1)
    print(f"  {len(my_phishing)} Malaysian phishing URLs")

    print("Processing Malaysian legitimate samples...")
    my_legit = generate_features_from_urls(LEGITIMATE_MY_SAMPLES, label=0)
    print(f"  {len(my_legit)} Malaysian legitimate URLs")

    all_features.extend([my_phishing, my_legit])

    df = pd.concat(all_features, ignore_index=True)
    df = df.fillna(0)
    print(f"\nTotal dataset: {len(df)} samples")
    print(f"  Phishing: {len(df[df['label'] == 1])}")
    print(f"  Legitimate: {len(df[df['label'] == 0])}")

    X = df[FEATURE_NAMES].values
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"\nTraining set: {len(X_train)} | Test set: {len(X_test)}")

    print("\nTraining Gradient Boosting model...")
    model = GradientBoostingClassifier(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.1,
        min_samples_split=10,
        min_samples_leaf=5,
        subsample=0.8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("\n" + "=" * 60)
    print("Model Evaluation:")
    print("=" * 60)
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    importances = sorted(
        zip(FEATURE_NAMES, model.feature_importances_),
        key=lambda x: x[1],
        reverse=True,
    )
    print("\nTop 10 Features:")
    for name, imp in importances[:10]:
        print(f"  {name}: {imp:.4f}")

    model_path = os.path.join(MODEL_DIR, "phishing_model.joblib")
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")

    accuracy = float((y_pred == y_test).mean())
    metadata = {
        "feature_names": FEATURE_NAMES,
        "n_features": len(FEATURE_NAMES),
        "n_training_samples": int(len(X_train)),
        "n_test_samples": int(len(X_test)),
        "accuracy": accuracy,
        "model_type": "GradientBoostingClassifier",
        "n_estimators": 300,
        "max_depth": 8,
        "top_features": [{"name": n, "importance": float(i)} for n, i in importances[:10]],
    }
    meta_path = os.path.join(MODEL_DIR, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to {meta_path}")

    print("\nTraining complete!")
    return model


if __name__ == "__main__":
    train_model()
