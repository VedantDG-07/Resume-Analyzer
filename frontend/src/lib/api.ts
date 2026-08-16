export interface BulletSuggestion {
  original: string;
  improved: string;
  reason: string;
}

export interface ATSParsedField {
  field: string;
  status: string;
  value: string;
}

export interface AnalysisResult {
  id: number;
  filename: string;
  overall_score: number;
  ats_score: number;
  skill_match: number;
  issues_found: number;
  ai_summary?: string;
  ats_feedback?: string;
  action_verb_feedback?: string;
  bullet_suggestions?: BulletSuggestion[];
  missing_keywords?: string[];
  strengths?: string[];
  improvements?: string[];
  parsed_ats_data?: ATSParsedField[];
  created_at: string;
}

const getHeaders = (isFormData: boolean = false) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export async function uploadResume(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:8000/api/analyze", {
    method: "POST",
    headers: getHeaders(true),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload resume");
  }

  return response.json();
}

export async function getRecentAnalyses(): Promise<AnalysisResult[]> {
  const response = await fetch("http://127.0.0.1:8000/api/analyses?limit=5", {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch analyses");
  }
  return response.json();
}

export async function getLatestAnalysis(): Promise<AnalysisResult | null> {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/analyses?limit=1", {
      headers: getHeaders(),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error("Error fetching latest analysis", err);
    return null;
  }
}

