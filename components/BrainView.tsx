
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Hash, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';
import { Note } from '../types';
import { quickCaptureProcess } from '../services/geminiService';

const BrainView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('aether_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', content: 'Design concept for the neural interface: use synaptic web patterns.', category: 'Idea', action: 'Sketch', createdAt: 'Oct 20' },
      { id: '2', content: 'Renew domain name before Friday.', category: 'Task', action: 'Pay', createdAt: 'Oct 21' },
    ];
  });
  
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    localStorage.setItem('aether_notes', JSON.stringify(notes));
  }, [notes]);

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    
    // AI Processing
    const aiResult = await quickCaptureProcess(input);
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: input,
      category: aiResult.category || 'General',
      action: aiResult.suggestedAction || 'Review',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    setNotes([newNote, ...notes]);
    setInput('');
    setIsProcessing(false);
  };

  const filteredNotes = notes.filter(n => n.content.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 h-full flex flex-col">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <Brain size={32} className="text-purple-400" />
            <h1 className="text-4xl font-thin text-white tracking-tight">Cortex</h1>
        </div>
        <p className="text-sm text-zinc-500">Externalized Memory Bank • AI Enhanced</p>
      </header>

      {/* Input Area */}
      <div className="mb-10 max-w-2xl">
        <GlassCard className="bg-zinc-900/60" noPadding>
            <form onSubmit={handleCapture} className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCapture(e);
                        }
                    }}
                    placeholder="Inject thought into the system..."
                    className="
                        w-full bg-transparent text-zinc-200 p-6 pr-16
                        focus:outline-none resize-none min-h-[100px]
                        placeholder:text-zinc-600 font-light text-lg
                    "
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {isProcessing && (
                        <div className="flex items-center gap-1 text-xs text-purple-400 animate-pulse">
                            <Sparkles size={12} />
                            Processing
                        </div>
                    )}
                    <button
                        disabled={isProcessing || !input.trim()}
                        type="submit"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                    </button>
                </div>
            </form>
        </GlassCard>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-2 mb-6 text-zinc-500 border-b border-white/5 pb-2 max-w-md">
        <Search size={14} />
        <input 
            type="text" 
            placeholder="Filter memory..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm w-full text-zinc-300"
        />
      </div>

      {/* Masonry Grid of Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
        <AnimatePresence mode='popLayout'>
            {filteredNotes.map((note) => (
                <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                >
                    <GlassCard 
                        className="h-full flex flex-col justify-between hover:border-purple-500/30 transition-colors group"
                        delay={0}
                    >
                        <p className="text-zinc-300 font-light leading-relaxed mb-4 text-sm">
                            {note.content}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500">{note.createdAt}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="
                                    px-2 py-0.5 rounded text-[10px] uppercase tracking-wider
                                    bg-purple-500/10 text-purple-400 border border-purple-500/20
                                ">
                                    {note.category}
                                </span>
                                <span className="
                                    px-2 py-0.5 rounded text-[10px] uppercase tracking-wider
                                    bg-zinc-800 text-zinc-400 border border-white/5
                                ">
                                    {note.action}
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BrainView;
