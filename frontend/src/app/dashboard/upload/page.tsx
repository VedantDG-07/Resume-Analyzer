"use client";

import { useState, useRef } from "react";
import { Sparkles, UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
      setError("Please upload a valid PDF or DOCX file.");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed. Make sure the backend server (port 8000) is running!");
      }
      
      const data = await response.json();
      sessionStorage.setItem("latestAnalysis", JSON.stringify(data));
      router.push("/dashboard/analyze");
      
    } catch (err) {
      console.error(err);
      if (err instanceof TypeError && (err.message.includes("Failed to fetch") || err.message.includes("fetch"))) {
        setError("Backend server is offline! Please start the FastAPI backend on http://localhost:8000 (see instructions below).");
      } else {
        setError(err instanceof Error ? err.message : "Backend connection error");
      }
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans text-slate-100">
      <div className="p-8 sm:p-10 rounded-3xl glass-card relative overflow-hidden border border-white/10 glow-purple">
        
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-purple-600/30 to-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono-tech">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI SCANNER INPUT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Upload Resume File <Sparkles className="w-7 h-7 text-purple-400" />
            </h1>
            <p className="text-sm text-slate-300">
              Select your resume (.pdf or .docx) to initiate automated keyword extraction, ATS scoring, and bullet optimization.
            </p>
          </div>

          <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="relative">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleChange}
              className="hidden"
            />
            
            <motion.div
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => inputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden
                ${dragActive ? "border-cyan-400 bg-cyan-500/10 glow-cyan" : "border-white/15 bg-slate-900/60 hover:bg-slate-900/80 hover:border-purple-500/40"}
                ${file ? "border-emerald-500/50 bg-emerald-500/10" : ""}
              `}
            >
              {/* Laser Scanning Beam when file selected or dragging */}
              {(dragActive || isUploading) && <div className="scanner-beam" />}

              <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                {file ? (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 glow-cyan">
                      <FileText className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-white font-bold text-lg font-mono-tech">{file.name}</p>
                    <p className="text-slate-400 text-xs font-mono-tech mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex items-center gap-2 text-emerald-300 mt-4 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-xs font-mono-tech">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ready for AI Processing</span>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${dragActive ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-slate-400 border border-white/10"}`}>
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-white">
                        Click to select file or drag & drop here
                      </p>
                      <p className="text-xs text-slate-400 font-mono-tech">
                        Supports <span className="text-cyan-400 font-bold">PDF</span> and <span className="text-purple-400 font-bold">DOCX</span> (up to 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
            
            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-red-300 bg-red-500/20 p-3 rounded-xl border border-red-500/30 text-xs font-mono-tech">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p>{error}</p>
              </motion.div>
            )}

            {file && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={isUploading}
                  className="py-3.5 px-8 rounded-2xl gradient-btn-primary text-white font-mono-tech font-bold text-sm shadow-xl flex items-center gap-3 glow-purple disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Running AI Heuristics...</span>
                    </>
                  ) : (
                    <>
                      <span>Start AI Analysis</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
