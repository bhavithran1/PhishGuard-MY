const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

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
  analyzeURL: (url: string) =>
    request<URLAnalysis>('/analyze/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),

  analyzeText: (text: string) =>
    request<TextAnalysis>('/analyze/text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

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

  submitReport: (data: {
    type: string;
    content: string;
    reporter_email?: string;
    description?: string;
  }) =>
    request<ReportResponse>('/report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

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
