import { FileText, UploadCloud } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({ 
  title = "No Resume Data Found", 
  message = "Please upload a resume to view this page's content." 
}: EmptyStateProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center h-[60vh]">
      <div className="p-12 rounded-3xl glass-card border border-white/5 text-center space-y-6 max-w-xl w-full">
        <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <Link href="/dashboard/upload" className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
          <UploadCloud className="w-5 h-5" />
          Upload Resume
        </Link>
      </div>
    </div>
  );
}
