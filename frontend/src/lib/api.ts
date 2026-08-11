export interface AnalysisResult {
  id: number;
  filename: string;
  overall_score: number;
  ats_score: number;
  skill_match: number;
  issues_found: number;
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

  const response = await fetch("http://localhost:8000/api/analyze", {
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
  const response = await fetch("http://localhost:8000/api/analyses?limit=5", {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch analyses");
  }
  return response.json();
}
