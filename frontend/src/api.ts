const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.detail || `Request failed (${res.status})`);
    }
    return res.json();
  } catch (error) {
    if (error instanceof TypeError) {
      const fallback = FALLBACKS[path];
      if (fallback) return fallback as T;
      throw new Error('Backend unavailable — showing local practice responses where possible.');
    }
    throw error;
  }
}

const FALLBACK_STATS = {
  total_analyses: 1247,
  threats_detected: 891,
  reports_submitted: 234,
  threat_categories: [
    { category: 'phishing', count: 412 },
    { category: 'sms_scam', count: 298 },
    { category: 'malware', count: 89 },
    { category: 'fraud', count: 92 },
  ],
  malaysia_stats: {
    total_incidents_2025: 7782,
    fraud_percentage: 73,
    total_losses_rm_billion: 1.58,
    top_attack_types: [
      { type: 'Fraud', percentage: 73, count: 5681 },
      { type: 'Intrusion', percentage: 12, count: 934 },
      { type: 'Malware', percentage: 7, count: 545 },
      { type: 'Content', percentage: 4, count: 311 },
      { type: 'Intrusion Attempt', percentage: 3, count: 233 },
      { type: 'Other', percentage: 1, count: 78 },
    ],
    top_targeted_sectors: [
      { sector: 'Banking & Finance', percentage: 38 },
      { sector: 'Government', percentage: 22 },
      { sector: 'Telecommunications', percentage: 15 },
      { sector: 'E-commerce', percentage: 12 },
      { sector: 'Education', percentage: 8 },
      { sector: 'Healthcare', percentage: 5 },
    ],
    monthly_trend: [
      { month: 'Jan', incidents: 612 },
      { month: 'Feb', incidents: 589 },
      { month: 'Mar', incidents: 634 },
      { month: 'Apr', incidents: 701 },
      { month: 'May', incidents: 678 },
      { month: 'Jun', incidents: 723 },
      { month: 'Jul', incidents: 756 },
      { month: 'Aug', incidents: 698 },
      { month: 'Sep', incidents: 645 },
      { month: 'Oct', incidents: 712 },
      { month: 'Nov', incidents: 589 },
      { month: 'Dec', incidents: 445 },
    ],
  },
};

const FALLBACK_THREATS = {
  threats: [
    { id: 'T001', type: 'phishing', severity: 'critical', title: 'Maybank TAC Reset Phishing', description: 'Fake Maybank login page stealing TAC codes via SMS link', target: 'Banking customers', vector: 'SMS + URL', timestamp: '2025-06-28T14:30:00Z', status: 'active', reports: 847 },
    { id: 'T002', type: 'sms_scam', severity: 'high', title: 'PDRM Traffic Summons Scam', description: 'Fake PDRM SMS demanding immediate fine payment via suspicious link', target: 'Malaysian drivers', vector: 'SMS', timestamp: '2025-06-27T09:15:00Z', status: 'active', reports: 623 },
    { id: 'T003', type: 'phishing', severity: 'critical', title: 'LHDN Tax Refund Phishing', description: 'Fake LHDN website promising tax refunds to harvest banking credentials', target: 'Taxpayers', vector: 'Email + URL', timestamp: '2025-06-26T11:45:00Z', status: 'active', reports: 534 },
    { id: 'T004', type: 'ewallet', severity: 'high', title: 'Touch n Go eWallet Cashback Fraud', description: 'Fake TNG promotion offering cashback to steal eWallet login', target: 'TNG users', vector: 'SMS + URL', timestamp: '2025-06-25T16:20:00Z', status: 'active', reports: 412 },
    { id: 'T005', type: 'phishing', severity: 'medium', title: 'Pos Malaysia Delivery Notification', description: 'Fake parcel tracking link redirecting to credential harvesting page', target: 'Online shoppers', vector: 'SMS', timestamp: '2025-06-24T08:30:00Z', status: 'monitoring', reports: 298 },
    { id: 'T006', type: 'investment', severity: 'high', title: 'Crypto Investment WhatsApp Scam', description: 'Guaranteed returns forex/crypto scheme promoted via WhatsApp groups', target: 'Young adults', vector: 'Social media', timestamp: '2025-06-23T13:00:00Z', status: 'active', reports: 345 },
    { id: 'T007', type: 'qr_phishing', severity: 'high', title: 'DuitNow QR Code Tampering', description: 'Tampered QR codes at food stalls redirecting payments to scammer accounts', target: 'F&B customers', vector: 'QR code', timestamp: '2025-06-22T10:45:00Z', status: 'monitoring', reports: 189 },
    { id: 'T008', type: 'job_scam', severity: 'medium', title: 'Work-From-Home Job Scam', description: 'Fake job offers requiring upfront deposit for training materials', target: 'Job seekers', vector: 'Social media + SMS', timestamp: '2025-06-21T15:30:00Z', status: 'active', reports: 267 },
  ],
  total: 8,
};

const FALLBACK_PATTERNS = {
  patterns: [
    { name: 'traffic_summons', description: 'Fake PDRM/JPJ traffic fine payment scams', severity: 'high', keyword_count: 18, sample_keywords: ['saman', 'PDRM', 'JPJ', 'denda', 'bayar segera'] },
    { name: 'bank_impersonation', description: 'Fake Maybank, CIMB, RHB, Public Bank alerts', severity: 'critical', keyword_count: 24, sample_keywords: ['Maybank', 'CIMB', 'TAC', 'akaun digantung'] },
    { name: 'ewallet_fraud', description: 'Touch n Go, GrabPay, Boost cashback scams', severity: 'high', keyword_count: 15, sample_keywords: ['Touch n Go', 'cashback', 'eWallet', 'tuntut'] },
    { name: 'government_impersonation', description: 'Fake LHDN, KWSP, MCMC messages', severity: 'critical', keyword_count: 20, sample_keywords: ['LHDN', 'KWSP', 'bayaran balik', 'cukai'] },
    { name: 'delivery_scam', description: 'Fake Pos Malaysia, J&T delivery notifications', severity: 'medium', keyword_count: 12, sample_keywords: ['Pos Malaysia', 'J&T', 'penghantaran', 'tracking'] },
    { name: 'investment_scam', description: 'Crypto/forex/MLM guaranteed returns fraud', severity: 'high', keyword_count: 16, sample_keywords: ['guaranteed returns', 'forex', 'crypto', 'pelaburan'] },
    { name: 'romance_scam', description: 'Love scam / dating fraud targeting lonely individuals', severity: 'medium', keyword_count: 10, sample_keywords: ['love', 'sayang', 'transfer', 'emergency'] },
    { name: 'job_scam', description: 'Fake work-from-home and easy money schemes', severity: 'high', keyword_count: 14, sample_keywords: ['kerja rumah', 'income mudah', 'part time', 'commission'] },
    { name: 'qr_phishing', description: 'Malicious QR codes redirecting to phishing sites', severity: 'high', keyword_count: 8, sample_keywords: ['QR', 'DuitNow', 'scan', 'payment redirect'] },
  ],
};

const FALLBACK_LEADERBOARD = {
  hunters: [
    { rank: 1, handle: 'ph1sh_slayer', university: 'UM', xp: 14200, badge: 'guardian', scams_caught: 156 },
    { rank: 2, handle: 'cyber_hawk', university: 'UTM', xp: 11800, badge: 'sentinel', scams_caught: 134 },
    { rank: 3, handle: 'scam_hunter_MY', university: 'USM', xp: 9400, badge: 'sentinel', scams_caught: 112 },
    { rank: 4, handle: 'digital_shield', university: 'UKM', xp: 7200, badge: 'sentinel', scams_caught: 89 },
    { rank: 5, handle: 'net_guardian', university: 'UPM', xp: 5600, badge: 'hunter', scams_caught: 67 },
    { rank: 6, handle: 'threat_nexus', university: 'UiTM', xp: 4100, badge: 'hunter', scams_caught: 52 },
    { rank: 7, handle: 'byte_patrol', university: 'IIUM', xp: 2800, badge: 'analyst', scams_caught: 38 },
    { rank: 8, handle: 'zero_click', university: 'MMU', xp: 1500, badge: 'analyst', scams_caught: 24 },
  ],
  universities: [
    { name: 'Universiti Malaya', code: 'UM', city: 'Kuala Lumpur', members: 342, scams_reported: 1847, challenges_completed: 4521, rank: 1 },
    { name: 'Universiti Teknologi Malaysia', code: 'UTM', city: 'Johor Bahru', members: 298, scams_reported: 1623, challenges_completed: 3987, rank: 2 },
    { name: 'Universiti Sains Malaysia', code: 'USM', city: 'Penang', members: 267, scams_reported: 1456, challenges_completed: 3654, rank: 3 },
    { name: 'Universiti Kebangsaan Malaysia', code: 'UKM', city: 'Bangi', members: 234, scams_reported: 1289, challenges_completed: 3210, rank: 4 },
    { name: 'Universiti Putra Malaysia', code: 'UPM', city: 'Serdang', members: 201, scams_reported: 1098, challenges_completed: 2876, rank: 5 },
    { name: 'Universiti Teknologi MARA', code: 'UiTM', city: 'Shah Alam', members: 189, scams_reported: 967, challenges_completed: 2543, rank: 6 },
    { name: 'Universiti Islam Antarabangsa', code: 'IIUM', city: 'Gombak', members: 156, scams_reported: 834, challenges_completed: 2109, rank: 7 },
    { name: 'Multimedia University', code: 'MMU', city: 'Cyberjaya', members: 134, scams_reported: 712, challenges_completed: 1876, rank: 8 },
  ],
  total_members: 1821,
  total_scams_reported: 9826,
  total_challenges: 24776,
};

const FALLBACK_CHALLENGES = {
  challenges: [
    { id: 'c1', type: 'url', content: 'http://maybank2u-login.tk/verify-account', is_scam: true, explanation: 'Uses .tk TLD and hyphenated domain impersonating Maybank. Real Maybank uses maybank2u.com.my.' },
    { id: 'c2', type: 'sms', content: 'PDRM: Anda mempunyai saman trafik RM300. Bayar segera di http://pdrm-saman.tk/bayar sebelum akaun digantung.', is_scam: true, explanation: 'PDRM does not send fine payment links via SMS. Uses urgency and a fake .tk domain.' },
    { id: 'c3', type: 'url', content: 'https://www.maybank2u.com.my/m2u/common/login.do', is_scam: false, explanation: 'This is the legitimate Maybank2u login page on the official .com.my domain with HTTPS.' },
    { id: 'c4', type: 'sms', content: 'Your Grab ride to Mid Valley is confirmed. Driver Ahmad arriving in 3 mins. Track: https://grab.com/my/track/R8X2K', is_scam: false, explanation: 'Standard Grab ride confirmation with official grab.com domain. No urgency or financial requests.' },
    { id: 'c5', type: 'url', content: 'http://192.168.1.1/cimb/login.php?redirect=account', is_scam: true, explanation: 'Uses raw IP address instead of domain name. Legitimate banks never host login pages on IP addresses.' },
  ],
  total: 5,
  time_limit_seconds: 60,
};

const FALLBACKS: Record<string, unknown> = {
  '/stats': FALLBACK_STATS,
  '/threats/feed': FALLBACK_THREATS,
  '/threats/patterns': FALLBACK_PATTERNS,
  '/cybersquad/leaderboard': FALLBACK_LEADERBOARD,
  '/cybersquad/challenge': FALLBACK_CHALLENGES,
  '/health': { status: 'demo', model_loaded: true, version: '1.0.0-demo' },
};

export interface URLAnalysis {
  url: string;
  is_phishing: boolean;
  confidence: number;
  risk_level: string;
  risk_factors: string[];
  features: Record<string, number>;
}

export interface TextAnalysis {
  is_suspicious: boolean;
  risk_score: number;
  risk_level: string;
  matched_patterns: {
    pattern: string;
    description: string;
    severity: string;
    matched_keywords: string[];
  }[];
  urgency_detected: boolean;
  suspicious_actions: string[];
  manglish_detected: boolean;
  details: string[];
  embedded_urls: URLAnalysis[];
}

export interface Threat {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  target: string;
  vector: string;
  timestamp: string;
  status: string;
  reports: number;
}

export interface Stats {
  total_analyses: number;
  threats_detected: number;
  reports_submitted: number;
  threat_categories: { category: string; count: number }[];
  malaysia_stats: {
    total_incidents_2025: number;
    fraud_percentage: number;
    total_losses_rm_billion: number;
    top_attack_types: { type: string; percentage: number; count: number }[];
    top_targeted_sectors: { sector: string; percentage: number }[];
    monthly_trend: { month: string; incidents: number }[];
  };
}

export interface ReportResponse {
  report_id: string;
  status: string;
  message: string;
}

export const api = {
  analyzeURL: async (url: string): Promise<URLAnalysis> => {
    try {
      return await request<URLAnalysis>('/analyze/url', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Backend unavailable')) return demoURLAnalysis(url);
      throw error;
    }
  },

  analyzeText: async (text: string): Promise<TextAnalysis> => {
    try {
      return await request<TextAnalysis>('/analyze/text', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Backend unavailable')) return demoTextAnalysis(text);
      throw error;
    }
  },

  getStats: () => request<Stats>('/stats'),

  getThreats: () =>
    request<{ threats: Threat[]; total: number }>('/threats/feed'),

  getPatterns: () =>
    request<{
      patterns: {
        name: string;
        description: string;
        severity: string;
        keyword_count: number;
        sample_keywords: string[];
      }[];
    }>('/threats/patterns'),

  submitReport: async (data: {
    type: string;
    content: string;
    reporter_email?: string;
    description?: string;
  }): Promise<ReportResponse> => {
    try {
      return await request<ReportResponse>('/report', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.startsWith('Backend unavailable')) throw error;
      return {
        report_id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
        status: 'demo',
        message: 'Report recorded in demo mode only. It was not forwarded to an agency. Use the official action pathways for urgent or formal reporting.',
      };
    }
  },

  health: () => request<{ status: string; model_loaded: boolean; version: string }>('/health'),

  getCyberSquadChallenge: () =>
    request<{
      challenges: {
        id: string;
        type: string;
        content: string;
        is_scam: boolean;
        explanation: string;
      }[];
      total: number;
      time_limit_seconds: number;
    }>('/cybersquad/challenge'),

  getCyberSquadLeaderboard: () =>
    request<{
      hunters: {
        rank: number;
        handle: string;
        university: string;
        xp: number;
        badge: string;
        scams_caught: number;
      }[];
      universities: {
        name: string;
        code: string;
        city: string;
        members: number;
        scams_reported: number;
        challenges_completed: number;
        rank: number;
      }[];
      total_members: number;
      total_scams_reported: number;
      total_challenges: number;
    }>('/cybersquad/leaderboard'),
};

const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.buzz', '.click', '.link', '.info'];
const BRAND_KEYWORDS = ['maybank', 'cimb', 'rhb', 'pdrm', 'lhdn', 'kwsp', 'grab', 'shopee', 'lazada', 'touch', 'tng', 'boost', 'duitnow', 'pos malaysia'];

function demoURLAnalysis(url: string): URLAnalysis {
  const lower = url.toLowerCase();
  const factors: string[] = [];
  let score = 0;

  if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url)) { score += 0.3; factors.push('URL uses raw IP address instead of domain name'); }
  if (SUSPICIOUS_TLDS.some(tld => lower.includes(tld))) { score += 0.3; factors.push('Uses suspicious top-level domain commonly associated with phishing'); }
  if (BRAND_KEYWORDS.some(b => lower.includes(b)) && !lower.includes('.com.my') && !lower.includes('.my')) { score += 0.25; factors.push('Possible brand impersonation — domain does not use official Malaysian TLD'); }
  if (lower.includes('login') || lower.includes('verify') || lower.includes('secure') || lower.includes('account')) { score += 0.1; factors.push('URL path contains credential-harvesting keywords'); }
  if ((lower.match(/-/g) || []).length > 2) { score += 0.1; factors.push('Excessive hyphens in domain — common phishing technique'); }
  if (!lower.startsWith('https://')) { score += 0.1; factors.push('Does not use HTTPS encryption'); }
  if (url.length > 75) { score += 0.05; factors.push('Unusually long URL'); }

  score = Math.min(score, 1);
  const is_phishing = score >= 0.4;
  const risk_level = score >= 0.7 ? 'critical' : score >= 0.5 ? 'high' : score >= 0.3 ? 'medium' : 'low';

  return { url, is_phishing, confidence: score, risk_level, risk_factors: factors, features: {} };
}

function demoTextAnalysis(text: string): TextAnalysis {
  const lower = text.toLowerCase();
  const patterns: TextAnalysis['matched_patterns'] = [];
  let score = 0;

  const urgency = /segera|immediately|suspend|gantung|block|urgent|sekarang|expired/i.test(text);
  const manglish = /lah|wei|bro|oi|boleh|tak|dah|punya|macam/i.test(text);
  const actions: string[] = [];

  if (/saman|pdrm|jpj|denda|trafik/i.test(text)) { patterns.push({ pattern: 'traffic_summons', description: 'Fake PDRM/JPJ traffic fine payment scam', severity: 'high', matched_keywords: lower.match(/saman|pdrm|jpj|denda|trafik/gi) || [] }); score += 0.3; }
  if (/maybank|cimb|rhb|public bank|akaun.*gantung|tac/i.test(text)) { patterns.push({ pattern: 'bank_impersonation', description: 'Fake bank alert attempting to steal credentials', severity: 'critical', matched_keywords: lower.match(/maybank|cimb|rhb|public bank|tac/gi) || [] }); score += 0.35; }
  if (/touch.?n.?go|grabpay|boost|ewallet|cashback|tuntut/i.test(text)) { patterns.push({ pattern: 'ewallet_fraud', description: 'Fake e-wallet promotion or cashback scam', severity: 'high', matched_keywords: lower.match(/touch.?n.?go|grabpay|boost|cashback|tuntut/gi) || [] }); score += 0.3; }
  if (/lhdn|kwsp|cukai|tax.*refund|bayaran.?balik/i.test(text)) { patterns.push({ pattern: 'government_impersonation', description: 'Fake government agency message', severity: 'critical', matched_keywords: lower.match(/lhdn|kwsp|cukai|tax|bayaran.?balik/gi) || [] }); score += 0.35; }

  if (urgency) { score += 0.1; actions.push('Creates false urgency'); }
  if (/http|https|www\.|\.com|\.tk|\.xyz/i.test(text)) { score += 0.1; actions.push('Contains embedded URL'); }
  if (/rm\s?\d|rm\d|ringgit/i.test(text)) { actions.push('References monetary amount'); }

  score = Math.min(score, 1);
  const urls = text.match(/https?:\/\/[^\s]+/gi) || [];

  return {
    is_suspicious: score >= 0.3,
    risk_score: score,
    risk_level: score >= 0.7 ? 'critical' : score >= 0.5 ? 'high' : score >= 0.3 ? 'medium' : 'low',
    matched_patterns: patterns,
    urgency_detected: urgency,
    suspicious_actions: actions,
    manglish_detected: manglish,
    details: patterns.map(p => p.description),
    embedded_urls: urls.map(u => demoURLAnalysis(u)),
  };
}
