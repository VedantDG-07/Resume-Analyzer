export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
  id: string | number;
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

export const getHeaders = (isFormData: boolean = false) => {
  const token = typeof window !== "undefined" ? (localStorage.getItem("authToken") || "mock_admin_token") : "mock_admin_token";
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export async function uploadResume(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: getHeaders(true),
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to upload resume");
  }

  return response.json();
}

export async function getRecentAnalyses(): Promise<AnalysisResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/analyses?limit=5`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch analyses");
  }
  return response.json();
}

export async function getLatestAnalysis(): Promise<AnalysisResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyses?limit=1`, {
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

export async function deleteAnalysis(analysisId: string | number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/analyses/${analysisId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete analysis");
  }
}

export interface RoadmapSkill {
  name: string;
  priority: string;
  status: string;
  rationale: string;
  prerequisites: string[];
  estimated_time: string;
  project_suggestion: string;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  skills: RoadmapSkill[];
}

export interface SkillRoadmapResponse {
  id?: string;
  target_role: string;
  match_score: number;
  phases: RoadmapPhase[];
}

export async function generateRoadmap(analysisId: string | number, targetRole?: string): Promise<SkillRoadmapResponse> {
  const body = {
    analysis_id: analysisId,
    target_role: targetRole,
  };
  const response = await fetch(`${API_BASE_URL}/api/roadmap/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to generate roadmap");
  }

  return response.json();
}

export async function getRoadmap(analysisId: string | number): Promise<SkillRoadmapResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/roadmap/${analysisId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error("Error fetching roadmap", err);
    return null;
  }
}

export async function updateRoadmapProgress(roadmapId: string | number, skillName: string, newStatus: string): Promise<SkillRoadmapResponse> {
  const body = {
    roadmap_id: roadmapId,
    skill_name: skillName,
    new_status: newStatus,
  };
  const response = await fetch(`${API_BASE_URL}/api/roadmap/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to update roadmap progress");
  }

  return response.json();
}

// ---- Interview Prep ----

export interface QuestionItem {
  type: string;
  question: string;
  reason: string;
}

export interface InterviewPrepResponse {
  questions: QuestionItem[];
}

export async function generateInterviewQuestions(analysisId: string | number): Promise<InterviewPrepResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interview/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify({ analysis_id: analysisId }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    throw new Error(errData?.detail || "Failed to generate interview questions");
  }

  return response.json();
}

// ---- Job Description Match ----

export interface JDMatchItem {
  skill: string;
  locations: string[];
  evidence: string[];
}

export interface JDMatchResponse {
  match_score: number;
  summary: string;
  strong_matches: JDMatchItem[];
  matches: JDMatchItem[];
  weak_matches: JDMatchItem[];
  missing_keywords: string[];
  recommendations: string[];
}

export async function matchJobDescription(
  jobTitle: string,
  jobDescription: string,
  analysisId?: string | number
): Promise<JDMatchResponse> {
  const body = {
    job_title: jobTitle,
    job_description: jobDescription,
    analysis_id: analysisId,
  };
  const response = await fetch(`${API_BASE_URL}/api/job-match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to match job description");
  }

  return response.json();
}
