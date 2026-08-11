"use client";

import { useState, useRef } from "react";
import { Sparkles, UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
      setError("Please upload a PDF or DOCX file.");
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
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed. Please try again.");
      }
      
      const data = await response.json();
      
      // Store result temporarily to show on analyze page
      sessionStorage.setItem("latestAnalysis", JSON.stringify(data));
      
      router.push("/dashboard/analyze");
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="p-8 rounded-3xl glass-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="space-y-4 max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              Upload Resume <Sparkles className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your resume in PDF or DOCX format for an AI-powered analysis.
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
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => inputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                ${dragActive ? "border-primary bg-primary/10" : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"}
                ${file ? "border-green-500/50 bg-green-500/5" : ""}
              `}
            >
              <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                {file ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                      <FileText className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-white font-medium text-lg">{file.name}</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex items-center gap-2 text-green-400 mt-4 bg-green-500/10 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Ready to analyze</span>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300 ${dragActive ? "bg-primary/20" : "bg-white/5"}`}>
                      <UploadCloud className={`w-10 h-10 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-medium text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-muted-foreground">
                        PDF or DOCX (max. 5MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
            
            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
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
                  className="py-3 px-8 rounded-xl bg-primary text-white font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Resume
                      <Sparkles className="w-5 h-5" />
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
