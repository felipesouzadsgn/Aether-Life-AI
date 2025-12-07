import React, { useEffect, useState } from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';
import GlassCard from '../GlassCard';
import { generateDailyBriefing } from '../../services/geminiService';

const GeminiInsight: React.FC = () => {
  const [briefing, setBriefing] = useState<string>("Analyzing neural patterns...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching then call AI
    const fetchData = async () => {
      // In a real app, these come from props or store
      const tasks = ["Finish Dashboard UI", "Email Client"];
      const events = ["Product Review 10AM", "Gym 5PM"];
      
      // Delay slightly for effect
      await new Promise(r => setTimeout(r, 1500));
      
      const result = await generateDailyBriefing(tasks, events);
      setBriefing(result);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <GlassCard className="col-span-1 md:col-span-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20" delay={0.4}>
        <div className="flex items-start gap-4">
            <div className="mt-1 p-2 rounded-xl bg-white/5 border border-white/10">
                <BrainCircuit size={20} className="text-indigo-400" />
            </div>
            <div className="flex-1">
                <h3 className="text-xs uppercase tracking-widest text-indigo-300 mb-1 flex items-center gap-2">
                    <Sparkles size={10} /> 
                    System Insight
                </h3>
                {loading ? (
                    <div className="animate-pulse space-y-2 mt-2">
                        <div className="h-2 bg-white/10 rounded w-3/4"></div>
                        <div className="h-2 bg-white/10 rounded w-1/2"></div>
                    </div>
                ) : (
                    <p className="text-sm text-zinc-200 leading-relaxed font-light">
                        {briefing}
                    </p>
                )}
            </div>
        </div>
    </GlassCard>
  );
};

export default GeminiInsight;