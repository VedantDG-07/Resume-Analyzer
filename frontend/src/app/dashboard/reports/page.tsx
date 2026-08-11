"use client";

import { Sparkles, FileBarChart, Download, FileJson } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";

export default function ReportsPage() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("latestAnalysis");
    if (data) {
      setHasData(true);
    }
    setIsLoading(false);
  }, []);

  const handleExportPDF = async () => {
    const dataStr = sessionStorage.getItem("latestAnalysis");
    if (!dataStr) return;
    
    try {
      const data = JSON.parse(dataStr);
      
      // Dynamically import jsPDF and autoTable to avoid SSR core-js errors in Next.js
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;
      
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(41, 128, 185);
      doc.text("AI Resume Analysis Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("Executive Summary", 14, 45);
      
      const tableData = [
        ["Metric", "Score / Value", "Status"],
        ["Overall Score", `${data.overall_score || 0}/100`, (data.overall_score || 0) > 70 ? 'Good' : 'Needs Work'],
        ["ATS Compatibility", `${data.ats_score || 0}/100`, (data.ats_score || 0) > 70 ? 'Good' : 'Needs Work'],
        ["Skill Match", `${data.skill_match || 0}/100`, (data.skill_match || 0) > 70 ? 'Good' : 'Needs Work'],
        ["Issues Found", `${data.issues_found || 0}`, (data.issues_found || 0) < 3 ? 'Good' : 'Review Needed']
      ];
      
      autoTable(doc, {
        startY: 50,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 12, cellPadding: 5 }
      });
      
      doc.save("resume_analysis_report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  const handleExportJSON = () => {
    const data = sessionStorage.getItem("latestAnalysis");
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume_analysis.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Detailed Reports <FileBarChart className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Download comprehensive analysis reports to share with mentors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl glass-card border border-white/5 group hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6">
            <FileBarChart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Executive Summary (PDF)</h3>
          <p className="text-sm text-muted-foreground mb-6">A beautifully formatted 2-page PDF summarizing your ATS score, skill gaps, and top improvements.</p>
          <button onClick={handleExportPDF} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-3xl glass-card border border-white/5 group hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
            <FileJson className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Raw ATS Data (JSON)</h3>
          <p className="text-sm text-muted-foreground mb-6">The raw structured data exactly as an ATS parser would see it. Useful for developers and testing.</p>
          <button onClick={handleExportJSON} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </motion.div>
      </div>
    </div>
  );
}

