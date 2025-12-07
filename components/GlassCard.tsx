import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  noPadding = false,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay, ease: [0.23, 1, 0.32, 1] }} // ios-like easing
      whileHover={onClick ? { scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.03)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-zinc-900/40 backdrop-blur-2xl
        border border-white/[0.08]
        rounded-[32px]
        shadow-2xl shadow-black/50
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
    >
      {/* Glossy reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;