# PhishGuard MY
## AI-Powered Malaysian Phishing & Scam Detection Platform

**Submission to:** NACSA, CyberSecurity Malaysia, MCMC
**Date:** July 2026
**Version:** 1.0

---

## 1. Executive Summary

PhishGuard MY is an AI-powered cybersecurity platform purpose-built to combat Malaysia's #1 cyber threat: **phishing and online scams**. With RM1.58 billion lost to cyber fraud in 2024 and phishing accounting for 66-75% of all incidents reported to MyCERT, Malaysia urgently needs accessible, localized threat detection tools.

PhishGuard MY fills a critical gap — no publicly available tool exists that specifically detects Malaysian phishing patterns including Bahasa Melayu social engineering, local brand impersonation (Maybank, CIMB, Touch 'n Go, LHDN), and emerging threats like QR code phishing (quishing).

**Key capabilities:**
- Real-time URL phishing detection using a machine learning model trained on 20,000+ real-world samples
- Malaysian-specific scam text analysis detecting 9 categories of local scam patterns
- Bahasa Melayu / Manglish social engineering detection
- Threat intelligence dashboard with real-time Malaysian cyber statistics
- Citizen-facing reporting system integrated with MyCERT/Cyber999 workflow
- CyberSquad MY: gamified student-led initiative mobilizing university networks to crowdsource scam intelligence

---

## 2. Problem Statement

### The Scale of the Problem
- **7,782 cyber incidents** reported to MyCERT in 2025
- **RM1.58 billion** lost to online scams in 2024 (RM1.12B in H1 2025 alone)
- **66-75%** of all incidents are phishing/fraud
- **35,368 scam cases** recorded by PDRM in 2024
- **67% of SMEs** hit by ransomware in 2025
- **29% increase** in data breaches in Q1 2025

### Why Existing Solutions Fall Short
| Gap | Current State | PhishGuard MY Solution |
|-----|---------------|----------------------|
| No Malaysia-specific tool | Generic phishing checkers don't understand BM/Manglish or local brands | 9 specialized Malaysian scam pattern detectors |
| Language barrier | Most tools only detect English phishing | Detects BM, Manglish, and English threats |
| SME accessibility | Enterprise tools cost RM50K+ annually | Free, web-based, zero installation |
| Emerging threats | No quishing (QR phishing) detection | QR code phishing pattern recognition |
| Reactive approach | Citizens only report after being scammed | Real-time detection before clicking |
| No centralized reporting | Fragmented reporting across agencies | One-click reporting to MyCERT, NACSA, MCMC |

---

## 3. Technical Architecture

### System Overview
```
+------------------+     +-------------------+     +------------------+
|   React Frontend |---->|  FastAPI Backend   |---->|   ML Engine      |
|   (Dashboard UI) |<----|  (REST API)        |<----|  (GBM Classifier)|
+------------------+     +-------------------+     +------------------+
                                |                          |
                          +-----+------+            +------+-------+
                          | Statistics |            | Malaysian    |
                          | Engine     |            | Pattern DB   |
                          +------------+            +--------------+
```

### ML Model
- **Algorithm:** Gradient Boosting Classifier (300 estimators, depth 8)
- **Training data:** 20,081 samples (10,040 phishing + 10,041 legitimate)
  - 20,000 from GregaVrbancic/Phishing-Dataset (real-world URLs)
  - 81 Malaysian-specific samples (local phishing + legitimate sites)
- **Features:** 30 engineered features including URL structure, entropy, TLD analysis, brand detection
- **Accuracy:** 91% on held-out test set (4,017 samples)
- **Key features by importance:** path_length, path_entropy, special_ratio, url_entropy, num_subdomains

### Malaysian Pattern Detection Engine
9 specialized scam pattern detectors with 150+ keyword triggers:

| Pattern | Severity | Description |
|---------|----------|-------------|
| Traffic Summons | High | Fake PDRM/JPJ fine payment messages |
| Bank Impersonation | Critical | Maybank, CIMB, RHB, Public Bank fake alerts |
| E-wallet Fraud | High | Touch 'n Go, GrabPay, Boost scams |
| Government Impersonation | Critical | Fake LHDN, KWSP, MCMC messages |
| Delivery Scam | Medium | Fake Pos Malaysia, J&T notifications |
| Investment Scam | High | Crypto/forex/MLM fraud |
| Romance Scam | Medium | Love scam / dating fraud |
| Job Scam | High | Fake work-from-home schemes |
| QR Phishing | High | Malicious QR code detection |

### Technology Stack
- **Backend:** Python 3.13, FastAPI, scikit-learn, pandas, NumPy
- **Frontend:** React 19, TypeScript, Tailwind CSS, Recharts
- **ML:** Gradient Boosting (scikit-learn), NLP pattern matching
- **Deployment:** Docker-ready, deployable on any cloud infrastructure

---

## 4. Features

### 4.1 URL Phishing Analyzer
- Paste any URL for instant AI-powered analysis
- 30-feature extraction including domain analysis, entropy measurement, TLD classification
- Confidence score (0-100%) with risk level (Low / Medium / High / Critical)
- Detailed risk factors explaining why a URL is suspicious
- Recognizes brand impersonation for 30+ Malaysian brands

### 4.2 SMS/Email Scam Detector
- Paste suspicious SMS or email content for analysis
- Detects urgency language patterns in BM and English
- Identifies Manglish social engineering indicators
- Extracts and analyzes embedded URLs
- Detects monetary amounts in MYR
- Recognizes Malaysian phone number patterns

### 4.3 Threat Intelligence Dashboard
- Real-time statistics based on MyCERT quarterly reports
- Attack type distribution (pie chart)
- Monthly incident trend analysis
- Most targeted sectors breakdown
- Incident count by category

### 4.4 Live Threat Feed
- Active phishing and scam campaigns targeting Malaysia
- Severity-classified threat alerts
- Target audience and attack vector information
- Report count per threat
- Malaysian scam pattern encyclopedia

### 4.5 Citizen Reporting System
- Report phishing URLs, SMS scams, email scams, and QR phishing
- Auto-generated report IDs for tracking
- Designed for forwarding to MyCERT (Cyber999), NACSA, and MCMC
- Optional email for follow-up

### 4.6 REST API for Integration
SMEs and organizations can integrate PhishGuard MY into their existing systems:

```
POST /api/analyze/url    - Analyze a URL for phishing
POST /api/analyze/text   - Analyze text for scam patterns
POST /api/report         - Submit a threat report
GET  /api/stats          - Dashboard statistics
GET  /api/threats/feed   - Live threat feed
GET  /api/threats/patterns - Malaysian scam patterns
GET  /api/health         - Service health check
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Current - Completed)
- [x] ML model trained on 20K+ real-world samples
- [x] 9 Malaysian-specific scam pattern detectors
- [x] Web dashboard with analyzer, dashboard, threat feed, and reporting
- [x] REST API for third-party integration
- [x] BM/Manglish language detection

### Phase 2: Enhancement (Months 1-3)
- [ ] Integration with MyCERT Cyber999 API for direct incident reporting
- [ ] Real-time phishing feed from OpenPhish / PhishTank
- [ ] Mobile app (React Native) for on-the-go scanning
- [ ] QR code camera scanning for quishing detection
- [ ] Browser extension for real-time URL blocking
- [ ] Model retraining pipeline with Malaysian phishing data from MyCERT

### Phase 3: Scale (Months 3-6)
- [ ] Integration with NACSA NC4 for threat intelligence sharing
- [ ] MCMC integration for telecommunications-related scam reporting
- [ ] Malaysian ISP partnership for network-level blocking
- [ ] SMS gateway integration for proactive scam detection
- [ ] Public API for Malaysian banks and e-wallet providers
- [ ] Malay language NLP model fine-tuned on local phishing corpus

### Phase 4: National Deployment (Months 6-12)
- [ ] Multi-agency dashboard for NACSA, CyberSecurity Malaysia, MCMC
- [ ] National phishing intelligence database
- [ ] Integration with Malaysian banking sector (BNM coordination)
- [ ] Public awareness campaign integration
- [ ] Schools and university cybersecurity training module

---

## 6. CyberSquad MY — Student-Led Initiative

### Vision
CyberSquad MY transforms cybersecurity from a passive topic into an interactive, gamified movement led by university students. Instead of waiting for scams to happen, students actively hunt, report, and educate — turning every campus into a cybersecurity sentinel node.

### Why Students?
- **2.04 million** students enrolled in Malaysian higher education (2025)
- Students are digitally native but still among the most targeted demographics
- University networks are natural distribution channels for national campaigns
- Student involvement creates a sustainable, self-replenishing volunteer workforce
- Peer-to-peer education is more effective than top-down government campaigns

### How It Works

**1. Spot the Phish — Interactive Challenge Game**
Students play timed classification challenges: they're shown real Malaysian phishing URLs, scam SMS messages, and legitimate content. They must classify each as SCAM or LEGIT within 60 seconds.

- 5 challenges per round, drawn from a pool of real Malaysian scam samples
- Earn 100+ XP per correct answer, with streak bonuses
- Immediate educational feedback — every answer explains WHY something is/isn't a scam
- This builds pattern recognition skills that transfer to real-world scam encounters

**2. Scam Reporting — Crowdsourced Intelligence**
Students submit scams they encounter in daily life (suspicious SMS, phishing emails, QR code tampering). Every verified report:
- Feeds into PhishGuard MY's detection engine, improving the AI model
- Generates real-time threat intelligence for NACSA/MyCERT
- Earns the student XP toward their rank progression

**3. University Network — Campus Sentinel Nodes**
Each participating university operates as a sentinel node:

| University | Code | City |
|------------|------|------|
| Universiti Malaya | UM | Kuala Lumpur |
| Universiti Teknologi Malaysia | UTM | Johor Bahru |
| Universiti Kebangsaan Malaysia | UKM | Bangi |
| Universiti Sains Malaysia | USM | Penang |
| Universiti Putra Malaysia | UPM | Serdang |
| Universiti Teknologi MARA | UiTM | Shah Alam |
| Universiti Islam Antarabangsa | IIUM | Gombak |
| Multimedia University | MMU | Cyberjaya |

**4. Rank Progression — Gamified Career Path**

| Rank | XP Required | Description |
|------|-------------|-------------|
| Recruit | 0+ | New member, learning the basics |
| Analyst | 1,000+ | Can identify common scam patterns |
| Hunter | 3,000+ | Active scam reporter, challenge veteran |
| Sentinel | 7,000+ | Campus cybersecurity advocate, mentors recruits |
| Guardian | 12,000+ | Elite status, eligible for CyberSecurity Malaysia internship referrals |

**5. Competitive Leaderboard**
- University-vs-university rankings drive inter-campus competition
- Individual hunter rankings showcase top performers
- Monthly recognition from PhishGuard MY and partner agencies

### CyberSquad Ambassador Program
Top-ranking students (Sentinel and Guardian ranks) become CyberSquad Ambassadors:
- Receive official recognition from participating agencies
- Lead cybersecurity awareness workshops in secondary schools
- Present findings at national cybersecurity events
- Priority consideration for government cybersecurity internships

### Scaling Strategy
- **Pilot (Month 1-2):** Launch at 3 universities, refine the platform
- **Expand (Month 3-4):** Scale to 8 universities, establish ambassador program
- **National (Month 5-8):** Open to all Malaysian universities, IPTS included
- **Regional (Month 9-12):** Explore expansion to ASEAN university networks

---

## 7. Impact Assessment

### Projected Impact (12-month deployment)
- **Detection:** Identify 50,000+ phishing attempts per month
- **Prevention:** Potential to prevent RM100M+ in fraud losses annually
- **Awareness:** Educate 1M+ Malaysian citizens on phishing recognition
- **Reporting:** Streamline incident reporting to NACSA/MyCERT/MCMC
- **SME Protection:** Provide free tool to 97% of Malaysian businesses

### Key Performance Indicators
| Metric | Target (Year 1) |
|--------|-----------------|
| URLs analyzed per month | 100,000+ |
| Phishing detection accuracy | >95% |
| False positive rate | <5% |
| Citizen reports submitted | 10,000+ |
| API integrations (SMEs) | 100+ |
| Response time per analysis | <500ms |

---

## 8. Data Sources & Attribution

- **Training Data:** GregaVrbancic Phishing Dataset (88,647 samples, CC BY 4.0)
- **Malaysian Statistics:** MyCERT Quarterly Reports Q1-Q4 2025
- **Threat Intelligence:** NACSA NC4 Advisories, CyberSecurity Malaysia
- **Scam Patterns:** PDRM Commercial Crime Division, MCMC advisories
- **Architecture Inspiration:** knock-knock (djkurlander/knock-knock, MIT License)

---

## 9. About

PhishGuard MY is an open-source cybersecurity initiative designed to strengthen Malaysia's digital resilience. The platform is built to be deployed nationally and integrated with existing government cybersecurity infrastructure.

**Contact:** For technical inquiries and deployment discussions.

---

*PhishGuard MY v1.0 — Protecting Malaysia's Digital Future*
