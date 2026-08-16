"use client";

import { useState, useEffect } from "react";
import { Sparkles, ScanLine, CheckCircle2, XCircle, Search, UploadCloud, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLatestAnalysis } from "@/lib/useAnalysis";

const atsFields = [
  { field: "First Name", status: "found", value: "Rahul" },
  { field: "Last Name", status: "found", value: "Sharma" },
  { field: "Email", status: "found", value: "rahul.s@example.com" },
  { field: "Phone", status: "found", value: "+91 98765 43210" },
  { field: "LinkedIn URL", status: "not_found", value: "Missing" },
  { field: "Education (Degree)", status: "found", value: "B.Tech Computer Science" },
  { field: "Graduation Year", status: "found", value: "2023" },
  { field: "Work Experience 1", status: "found", value: "Software Engineer at TechCorp" },
  { field: "Work Experience 2", status: "not_found", value: "Unclear formatting" },
];

export default function ATSPage() {
  const { data: latestData, loading: isLoading } = useLatestAnalysis();
  const hasData = !!latestData;

  const handleRemoveResume = () => {
    // sessionStorage.removeItem("latestAnalysis");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center h-[60vh]">
        <div className="p-12 rounded-3xl glass-card border border-white/5 text-center space-y-6 max-w-xl w-full">
          <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center">
            <ScanLine className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">No Resume Data Found</h2>
            <p className="text-muted-foreground">You haven't uploaded a resume yet, or the data was cleared. Please upload a resume to see your ATS score.</p>
          </div>
          <Link href="/dashboard/upload" className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
            <UploadCloud className="w-5 h-5" />
            Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            ATS Scanner <ScanLine className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">See exactly how recruiting software reads your resume.</p>
        </div>
        <button
          onClick={handleRemoveResume}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Remove Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-3xl glass-card border border-white/5 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" /> Parsed Data
            </h2>
            <div className="text-sm px-3 py-1 bg-white/5 rounded-full text-muted-foreground border border-white/10">
              Confidence Score: <span className="text-white font-bold">78%</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {(latestData?.parsed_ats_data || atsFields).map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="font-medium text-white/80">{item.field}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${item.status === 'found' ? 'text-white' : 'text-red-400 font-medium'}`}>
                    {item.value}
                  </span>
                  {item.status === 'found' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl glass-card border border-white/5 bg-primary/5">
            <h3 className="text-lg font-bold text-white mb-4">ATS Optimization Tips</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p>Avoid using tables, columns, or complex layouts. Keep it single-column.</p>
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p>Use standard section headers like "Experience" instead of "My Work History".</p>
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p>Save your resume as a standard PDF or DOCX file.</p>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
