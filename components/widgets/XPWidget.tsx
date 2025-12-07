import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';
import GlassCard from '../GlassCard';
import { UserXP } from '../../types';

const XPWidget: React.FC = () => {
  const [xp, setXp] = useState<UserXP>({
    current: 650,
    total: 1000,
    level: 42,
    streak: 12
  });

  const progress = (xp.current / xp.total) * 100;

  return (
    <GlassCard className="col-span-1 h-full" delay={0.3}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <Zap size={14} className="text-amber-400" />
           <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Daily XP</h3>
        </div>
        <div className="flex items-center gap-1 text-amber-400/80">
            <Trophy size={12} />
            <span className="text-[10px] font-bold">Lvl {xp.level}</span>
        </div>
      </div>

      <div className="flex flex-col h-32 justify-center">
        <div className="flex justify-between items-end mb-2">
           <span className="text-3xl font-thin text-white">{xp.current}</span>
           <span className="text-xs text-zinc-500 mb-1">/ {xp.total} XP</span>
        </div>

        {/* Custom Progress Bar */}
        <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-zinc-500 via-white to-zinc-500 opacity-90"
            />
            {/* Glow effect on the leading edge */}
            <motion.div 
                initial={{ left: 0 }}
                animate={{ left: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-0 h-full w-4 bg-white blur-md -translate-x-1/2"
            />
        </div>

        <p className="mt-4 text-[10px] text-zinc-400 text-center">
            {1000 - xp.current} XP to reach Level {xp.level + 1}
        </p>
      </div>
    </GlassCard>
  );
};

export default XPWidget;