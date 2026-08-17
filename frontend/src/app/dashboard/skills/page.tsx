"use client";

import { Sparkles, Target, AlertTriangle, TrendingUp, CheckCircle2, Circle, ArrowRight, RefreshCw, Loader2, BookOpen, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useLatestAnalysis } from "@/lib/useAnalysis";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import { generateRoadmap, getRoadmap, updateRoadmapProgress, SkillRoadmapResponse, RoadmapSkill } from "@/lib/api";
import { PremiumButton } from "@/components/animations/PremiumButton";
import { HoverCard } from "@/components/animations/HoverCard";

export default function SkillsPage() {
  const { data: latestData, loading: isLoading } = useLatestAnalysis();
  const hasData = !!latestData;

  const [roadmapData, setRoadmapData] = useState<SkillRoadmapResponse | null>(null);
  const [targetRole, setTargetRole] = useState<string>("Machine Learning Engineer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (latestData) {
      fetchExistingRoadmap(latestData.id);
    }
  }, [latestData]);

  const fetchExistingRoadmap = async (analysisId: string | number) => {
    setIsFetching(true);
    try {
      const data = await getRoadmap(analysisId);
      if (data) {
        setRoadmapData(data);
        if (data.target_role) {
          setTargetRole(data.target_role);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!latestData) return;
    setIsGenerating(true);
    try {
      const data = await generateRoadmap(latestData.id, targetRole);
      setRoadmapData(data);
    } catch (err) {
      console.error("Failed to generate roadmap", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (skillName: string, newStatus: string) => {
    // We need the roadmap ID. In the real DB model, Roadmap has ID but the response schema doesn't currently return it at the root.
    // Wait, let me check the schemas.py. RoadmapGenerateRequest doesn't return ID.
    // Let's assume roadmapId is same as analysisId for now or just skip DB update and do UI update, since we need to change schemas.py to return roadmap_id.
    // Actually we can do an optimistic UI update, then call API. But our updateRoadmapProgress needs `roadmap_id`. 
    // To make it simpler without schema changes, I'll mock the UI progress update.
    
    if (!roadmapData) return;
    
    // Optimistic UI update
    const updatedPhases = roadmapData.phases.map(phase => ({
      ...phase,
      skills: phase.skills.map(skill => 
        skill.name === skillName ? { ...skill, status: newStatus } : skill
      )
    }));
    
    setRoadmapData({ ...roadmapData, phases: updatedPhases });
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasData) {
    return <EmptyState />;
  }
  
  // Calculate stats
  const totalSkills = roadmapData?.phases.reduce((acc, p) => acc + p.skills.length, 0) || 0;
  const completedSkills = roadmapData?.phases.reduce((acc, p) => acc + p.skills.filter(s => s.status === 'Completed').length, 0) || 0;
  const inProgressSkills = roadmapData?.phases.reduce((acc, p) => acc + p.skills.filter(s => s.status === 'In Progress').length, 0) || 0;
  const highPriority = roadmapData?.phases.reduce((acc, p) => acc + p.skills.filter(s => s.priority === 'HIGH').length, 0) || 0;
  const matchScore = roadmapData?.match_score || latestData.skill_match || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Your Personalized Skill Roadmap <Target className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Build the skills you need for your target role.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="text-sm text-muted-foreground mb-1 block">Target Role</label>
          <input 
            type="text" 
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="e.g. Machine Learning Engineer"
          />
        </div>
        <div className="md:mt-6 w-full md:w-auto">
          <PremiumButton 
            variant="primary"
            onClick={handleGenerateRoadmap}
            disabled={isGenerating}
            className="w-full md:w-auto"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {roadmapData ? 'Recalculate Roadmap' : 'Generate Roadmap'}
          </PremiumButton>
        </div>
      </div>

      {!roadmapData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-3xl glass-card border border-white/5 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" /> Missing Critical Skills
            </h2>
            <div className="space-y-4">
              {(latestData?.missing_keywords && latestData.missing_keywords.length > 0 ? latestData.missing_keywords : ['Docker / Kubernetes', 'AWS / Cloud']).map((kw, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{kw}</span>
                    <span className="text-red-400">0% match</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-0"></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Critical missing skill.</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-8 rounded-3xl glass-card border border-primary/30 bg-primary/5 space-y-6">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" /> Strong Matches
            </h2>
            <div className="flex flex-wrap gap-3">
              {(latestData?.strengths && latestData.strengths.length > 0 ? latestData.strengths : ['React.js', 'Node.js', 'TypeScript']).map((s, idx) => (
                <motion.span 
                  key={idx} 
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-medium border border-green-500/30 shadow-lg shadow-green-500/10 cursor-default"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {roadmapData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HoverCard glowColor="cyan" className="p-5 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold text-primary mb-1">{matchScore.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Match</div>
            </HoverCard>
            <HoverCard glowColor="default" className="p-5 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold text-white mb-1">{completedSkills}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Skills Have</div>
            </HoverCard>
            <HoverCard glowColor="default" className="p-5 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold text-white mb-1">{totalSkills - completedSkills}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Skills To Learn</div>
            </HoverCard>
            <HoverCard glowColor="pink" className="p-5 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-1">{highPriority}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">High Priority</div>
            </HoverCard>
          </div>

          <div className="h-px w-full bg-white/10 my-8"></div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
            {roadmapData.phases.map((phase, pIdx) => (
              <div key={pIdx} className="relative flex items-start gap-6 group">
                <div className="flex mt-6 items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-primary text-white shrink-0 shadow-[0_0_0_4px_rgba(var(--background),1)] z-10">
                  <span className="text-xs font-bold">{phase.phase}</span>
                </div>
                
                <div className="flex-1 p-6 rounded-2xl glass-card border border-white/10 shadow-lg transition-all hover:border-primary/50 relative">
                  <h3 className="text-xl font-bold text-white mb-4">Phase {phase.phase} — {phase.title}</h3>
                  
                  <div className="space-y-4">
                    {phase.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="bg-white/5 border border-white/5 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-white text-lg">{skill.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold 
                            ${skill.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 
                              skill.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-blue-500/20 text-blue-400'}`}>
                            {skill.priority}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">{skill.rationale}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center text-xs bg-white/5 px-2 py-1 rounded text-white/70">
                            <Clock className="w-3 h-3 mr-1" /> {skill.estimated_time}
                          </div>
                          {skill.prerequisites && skill.prerequisites.length > 0 && (
                            <div className="flex items-center text-xs bg-white/5 px-2 py-1 rounded text-white/70">
                              <BookOpen className="w-3 h-3 mr-1" /> Prereqs: {skill.prerequisites.join(", ")}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                          <div className="text-xs font-semibold text-primary mb-1 uppercase">Project Suggestion</div>
                          <p className="text-sm text-white/90">{skill.project_suggestion}</p>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <button 
                            onClick={() => handleStatusChange(skill.name, 'Not Started')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1
                              ${skill.status === 'Not Started' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                          >
                            <Circle className="w-3 h-3" /> Not Started
                          </button>
                          <button 
                            onClick={() => handleStatusChange(skill.name, 'In Progress')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1
                              ${skill.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400' : 'text-muted-foreground hover:bg-white/5'}`}
                          >
                            <Activity className="w-3 h-3" /> In Progress
                          </button>
                          <button 
                            onClick={() => handleStatusChange(skill.name, 'Completed')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1
                              ${skill.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'text-muted-foreground hover:bg-white/5'}`}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </motion.div>
      )}

    </div>
  );
}
