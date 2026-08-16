import { FileText, UploadCloud } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PremiumButton } from "@/components/animations/PremiumButton";

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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Link href="/dashboard/upload" className="inline-block">
            <PremiumButton variant="primary">
              <UploadCloud className="w-5 h-5" />
              Upload Resume
            </PremiumButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
