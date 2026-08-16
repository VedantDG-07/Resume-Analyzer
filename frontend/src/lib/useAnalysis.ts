import { useState, useEffect } from "react";
import { getLatestAnalysis, AnalysisResult } from "./api";

export function useLatestAnalysis() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const result = await getLatestAnalysis();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load analysis data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalysis();
  }, []);

  return { data, loading, error };
}
