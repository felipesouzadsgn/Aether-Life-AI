import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, ArrowRight, Loader2, Sparkles, LayoutGrid, Network, X, Calendar, DollarSign, FileText, CheckSquare, Clock, Plus, Trash2, Play, Pause, RotateCcw } from 'lucide-react';
import GlassCard from './GlassCard';
import { Note, Task, Transaction, ViewState, CheckItem } from '../types';
import { quickCaptureProcess } from '../services/geminiService';
import NeuralGraph, { GraphNode } from './NeuralGraph';

interface BrainViewProps {
  onViewChange?: (view: ViewState) => void;
}

const BrainView: React.FC<BrainViewProps> = ({ onViewChange }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('aether_notes');
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        content: 'Design concept for the neural interface: use synaptic web patterns.', 
        category: 'Idea', 
        action: 'Sketch', 
        createdAt: 'Oct 20',
        checklist: [
          { id: 'c1', text: 'Research WebGL', done: true },
          { id: 'c2', text: 'Draft wireframes', done: false }
        ]
      },
      { id: '2', content: 'Renew domain name before Friday.', category: 'Task', action: 'Pay', createdAt: 'Oct 21' },
    ];
  });
  
  // Data for Graph View
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'graph'>('grid');
  
  // Detail Modal State
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Checklist Input State
  const [newCheckItem, setNewCheckItem] = useState('');

  // Timer Ref for cleanup
  const timerRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('aether_notes', JSON.stringify(notes));
    
    // Fetch other data for the graph context
    const savedTasks = localStorage.getItem('aether_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedFinance = localStorage.getItem('aether_finance');
    if (savedFinance) setTransactions(JSON.parse(savedFinance));

  }, [notes]);

  // Timer Logic
  useEffect(() => {
    if (selectedNote && selectedNote.pomodoro?.isActive) {
      timerRef.current = setInterval(() => {
        setNotes(prevNotes => prevNotes.map(n => {
          if (n.id === selectedNote.id && n.pomodoro?.isActive) {
             const newTime = Math.max(0, n.pomodoro.timeLeft - 1);
             if (newTime === 0) {
               // Timer finished
               return { ...n, pomodoro: { ...n.pomodoro, isActive: false, timeLeft: 0 } };
             }
             return { ...n, pomodoro: { ...n.pomodoro, timeLeft: newTime } };
          }
          return n;
        }));
        
        // Update local selected note state to reflect changes immediately in UI
        setSelectedNote(prev => {
           if (!prev || !prev.pomodoro) return prev;
           const newTime = Math.max(0, prev.pomodoro.timeLeft - 1);
           return { ...prev, pomodoro: { ...prev.pomodoro, timeLeft: newTime, isActive: newTime > 0 } };
        });

      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedNote?.pomodoro?.isActive, selectedNote?.id]);


  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    
    const aiResult = await quickCaptureProcess(input);
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: input,
      category: aiResult.category || 'General',
      action: aiResult.suggestedAction || 'Review',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      checklist: []
    };

    setNotes([newNote, ...notes]);
    setInput('');
    setIsProcessing(false);
  };

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === 'task' && onViewChange) {
      onViewChange('calendar'); 
    } else if (node.type === 'finance' && onViewChange) {
      onViewChange('finance');
    } else if (node.type === 'note') {
      const foundNote = notes.find(n => `n-${n.id}` === node.id);
      if (foundNote) setSelectedNote(foundNote);
    }
  };

  // --- Checklist Actions ---
  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote || !newCheckItem.trim()) return;

    const newItem: CheckItem = {
      id: Date.now().toString(),
      text: newCheckItem,
      done: false
    };

    const updatedNote = {
      ...selectedNote,
      checklist: [...(selectedNote.checklist || []), newItem]
    };

    updateNote(updatedNote);
    setNewCheckItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!selectedNote) return;
    const updatedNote = {
      ...selectedNote,
      checklist: selectedNote.checklist?.map(item => 
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    };
    updateNote(updatedNote);
  };

  const deleteChecklistItem = (itemId: string) => {
    if (!selectedNote) return;
    const updatedNote = {
        ...selectedNote,
        checklist: selectedNote.checklist?.filter(item => item.id !== itemId)
    };
    updateNote(updatedNote);
  };

  // --- Pomodoro Actions ---
  const toggleTimer = () => {
    if (!selectedNote) return;
    const defaultDuration = 25 * 60;
    
    const currentPomodoro = selectedNote.pomodoro || { duration: defaultDuration, timeLeft: defaultDuration, isActive: false };
    
    const updatedNote = {
        ...selectedNote,
        pomodoro: {
            ...currentPomodoro,
            isActive: !currentPomodoro.isActive
        }
    };
    updateNote(updatedNote);
  };

  const resetTimer = () => {
    if (!selectedNote) return;
    const defaultDuration = 25 * 60;
    const updatedNote = {
        ...selectedNote,
        pomodoro: {
            duration: defaultDuration,
            timeLeft: defaultDuration,
            isActive: false
        }
    };
    updateNote(updatedNote);
  };

  // --- Schedule Action ---
  const handleDateChange = (date: string) => {
      if(!selectedNote) return;
      updateNote({ ...selectedNote, scheduledFor: date });
  }

  const updateNote = (updated: Note) => {
    setSelectedNote(updated);
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredNotes = notes.filter(n => n.content.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 h-full flex flex-col relative">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <Brain size={32} className="text-purple-400" />
                <h1 className="text-4xl font-thin text-white tracking-tight">Cortex</h1>
            </div>
            <p className="text-sm text-zinc-500">Externalized Memory Bank • AI Enhanced</p>
        </div>
        
        <div className="bg-zinc-900/50 p-1 rounded-xl border border-white/5 flex gap-1">
            <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-2 rounded-lg transition-all
                  ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}
                `}
                title="Grid View"
            >
                <LayoutGrid size={18} />
            </button>
            <button
                onClick={() => setViewMode('graph')}
                className={`
                  p-2 rounded-lg transition-all
                  ${viewMode === 'graph' ? 'bg-purple-500/20 text-purple-400 shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}
                `}
                title="Neural Net View"
            >
                <Network size={18} />
            </button>
        </div>
      </header>

      {/* Input Area */}
      <div className="mb-8 max-w-2xl">
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
                        focus:outline-none resize-none min-h-[80px]
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

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
            <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
            >
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
                                    className="h-full flex flex-col justify-between hover:border-purple-500/30 transition-colors group cursor-pointer"
                                    delay={0}
                                    onClick={() => setSelectedNote(note)}
                                >
                                    <div>
                                        <p className="text-zinc-300 font-light leading-relaxed mb-4 text-sm line-clamp-4">
                                            {note.content}
                                        </p>
                                        
                                        {/* Preview Badges */}
                                        <div className="flex gap-2 mb-2">
                                            {note.checklist && note.checklist.length > 0 && (
                                                <div className="flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                                                    <CheckSquare size={10} />
                                                    <span>{note.checklist.filter(i => i.done).length}/{note.checklist.length}</span>
                                                </div>
                                            )}
                                            {note.pomodoro && note.pomodoro.isActive && (
                                                <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded animate-pulse">
                                                    <Clock size={10} />
                                                    <span>Active</span>
                                                </div>
                                            )}
                                            {note.scheduledFor && (
                                                 <div className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                                                    <Calendar size={10} />
                                                    <span>{note.scheduledFor}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
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
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        ) : (
            <motion.div
                key="graph"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-h-[500px] pb-24"
            >
                <NeuralGraph 
                  notes={notes} 
                  tasks={tasks} 
                  transactions={transactions} 
                  onNodeClick={handleNodeClick}
                />
            </motion.div>
        )}
      </AnimatePresence>

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedNote(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto"
                >
                    <GlassCard className="bg-zinc-900 border-zinc-700 shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-500/10 rounded-full">
                                    <Brain size={16} className="text-purple-400" />
                                </div>
                                <span className="text-xs uppercase tracking-widest text-zinc-500">{selectedNote.category}</span>
                            </div>
                            <button 
                                onClick={() => setSelectedNote(null)}
                                className="p-2 text-zinc-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="prose prose-invert max-w-none mb-8">
                            <textarea 
                                value={selectedNote.content}
                                onChange={(e) => updateNote({...selectedNote, content: e.target.value})}
                                className="w-full bg-transparent text-lg text-zinc-100 font-light leading-relaxed resize-none focus:outline-none h-auto min-h-[100px]"
                            />
                        </div>

                        {/* --- EXTENDED MODULES --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                            
                            {/* LEFT COLUMN: Checklist */}
                            <div className="space-y-4">
                                <h4 className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                    <CheckSquare size={12} /> Checklist
                                </h4>
                                
                                <form onSubmit={addChecklistItem} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newCheckItem}
                                        onChange={(e) => setNewCheckItem(e.target.value)}
                                        placeholder="Add sub-task..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50"
                                    />
                                    <button type="submit" className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </form>

                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                    {selectedNote.checklist?.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 group">
                                            <button 
                                                onClick={() => toggleChecklistItem(item.id)}
                                                className={`
                                                    w-4 h-4 rounded border flex items-center justify-center transition-colors
                                                    ${item.done ? 'bg-purple-500 border-purple-500' : 'border-zinc-600 hover:border-zinc-400'}
                                                `}
                                            >
                                                {item.done && <CheckSquare size={10} className="text-white" />}
                                            </button>
                                            <span className={`text-sm flex-1 truncate ${item.done ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                                                {item.text}
                                            </span>
                                            <button onClick={() => deleteChecklistItem(item.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!selectedNote.checklist || selectedNote.checklist.length === 0) && (
                                        <p className="text-[10px] text-zinc-600 italic">No items yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Focus & Schedule */}
                            <div className="space-y-6">
                                {/* Focus Timer */}
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-3">
                                        <Clock size={12} /> Focus Session
                                    </h4>
                                    <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                                        <div className="relative w-16 h-16 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <path
                                                    className="text-zinc-800"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    className={`${selectedNote.pomodoro?.isActive ? 'text-amber-400' : 'text-zinc-500'} transition-all duration-500`}
                                                    strokeDasharray={`${((selectedNote.pomodoro?.timeLeft || 0) / (selectedNote.pomodoro?.duration || 1)) * 100}, 100`}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                 <span className="text-xs font-mono text-zinc-300">
                                                    {formatTime(selectedNote.pomodoro?.timeLeft || 25 * 60)}
                                                 </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={toggleTimer}
                                                className={`p-3 rounded-xl transition-colors ${selectedNote.pomodoro?.isActive ? 'bg-amber-400/20 text-amber-400' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
                                            >
                                                {selectedNote.pomodoro?.isActive ? <Pause size={18} /> : <Play size={18} />}
                                            </button>
                                            <button 
                                                onClick={resetTimer}
                                                className="p-3 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule / Agenda */}
                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2 mb-2">
                                        <Calendar size={12} /> Schedule
                                    </h4>
                                    <input 
                                        type="date" 
                                        value={selectedNote.scheduledFor || ''}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/30 scheme-dark"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Metadata */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-zinc-600">Captured</span>
                                <span className="text-sm text-zinc-400">{selectedNote.createdAt}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase text-zinc-600">Next Action</span>
                                <span className="text-sm text-purple-300">{selectedNote.action}</span>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrainView;