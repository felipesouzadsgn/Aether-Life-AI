
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Briefcase, User, Activity, Edit2, X, Calendar, AlignLeft, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { Task } from '../types';

const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('aether_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Deploy Neural Net V2', description: 'Ensure all unit tests pass before deployment.', completed: false, priority: 'high', category: 'work', dueDate: '2023-10-25' },
      { id: '2', title: 'Meditation Cycle', completed: false, priority: 'medium', category: 'health' },
      { id: '3', title: 'Review Crypto Assets', completed: false, priority: 'low', category: 'personal' },
    ];
  });
  
  const [activeTab, setActiveTab] = useState<'all' | 'work' | 'personal'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    dueDate: ''
  });

  useEffect(() => {
    localStorage.setItem('aether_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Open modal for creation
  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: activeTab === 'all' ? 'personal' : activeTab,
      dueDate: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    if (editingTask) {
      // Update existing
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } as Task : t));
    } else {
      // Create new
      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title,
        completed: false,
        description: formData.description,
        priority: formData.priority as 'low' | 'medium' | 'high',
        category: formData.category as 'work' | 'personal' | 'health',
        dueDate: formData.dueDate
      };
      setTasks([newTask, ...tasks]);
    }
    setIsModalOpen(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'all') return !t.completed;
    return t.category === activeTab && !t.completed;
  });

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'work': return <Briefcase size={12} />;
      case 'health': return <Activity size={12} />;
      default: return <User size={12} />;
    }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col relative">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-thin text-white tracking-tight mb-1">Protocol</h1>
          <p className="text-sm text-zinc-500">Task Management & Execution</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
          {['all', 'work', 'personal'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                px-4 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-all
                ${activeTab === tab 
                  ? 'bg-white/10 text-white shadow-lg backdrop-blur-md' 
                  : 'text-zinc-600 hover:text-zinc-300'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Quick Add Button Area */}
      <div className="mb-8">
        <button 
          onClick={handleOpenCreate}
          className="
            w-full group relative overflow-hidden
            bg-zinc-900/30 backdrop-blur-xl text-zinc-400 
            border border-dashed border-zinc-700 hover:border-zinc-500 hover:text-zinc-200
            rounded-2xl py-4 flex items-center justify-center gap-2
            transition-all duration-300
          "
        >
            <Plus size={18} />
            <span className="font-light tracking-wide">Initialize new directive...</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-24">
        <AnimatePresence mode='popLayout'>
          {filteredTasks.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="text-center text-zinc-700 mt-20 font-light"
             >
               All systems nominal. No pending tasks.
             </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="group relative"
              >
                <GlassCard 
                  noPadding 
                  className="flex items-start p-4 hover:border-white/20 transition-colors"
                >
                  {/* Custom Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="
                      mt-1
                      w-5 h-5 rounded-full border border-zinc-600 
                      flex items-center justify-center mr-4 shrink-0
                      group-hover:border-blue-400 transition-colors
                      relative overflow-hidden
                    "
                  >
                    <div className="absolute inset-0 bg-blue-500 opacity-0 hover:opacity-20 transition-opacity" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <h3 className="text-zinc-200 font-light text-lg truncate pr-2">{task.title}</h3>
                        {task.dueDate && (
                           <span className="text-[10px] text-zinc-500 font-mono shrink-0 pt-1 flex items-center gap-1">
                               <Calendar size={10} />
                               {task.dueDate}
                           </span>
                        )}
                    </div>
                    
                    {task.description && (
                        <p className="text-zinc-500 text-xs mt-1 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                       <span className={`
                         flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-transparent
                         ${task.category === 'work' ? 'bg-blue-900/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'}
                       `}>
                         {getCategoryIcon(task.category)}
                         {task.category}
                       </span>
                       
                       <span className={`
                         text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border
                         ${getPriorityColor(task.priority)}
                       `}>
                         {task.priority}
                       </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(task)}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg z-10"
                >
                    <GlassCard className="bg-zinc-900/90 border-zinc-700/50 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-light text-white">
                                {editingTask ? 'Edit Directive' : 'New Directive'}
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Title */}
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest text-zinc-500">Title</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Task objective"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                                    <AlignLeft size={10} /> Details
                                </label>
                                <textarea 
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Additional context..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Priority */}
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                                        <AlertCircle size={10} /> Priority
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={formData.priority}
                                            onChange={e => setFormData({...formData, priority: e.target.value as any})}
                                            className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-blue-500/50"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="space-y-1">
                                    <label className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                                        <Briefcase size={10} /> Category
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value as any})}
                                            className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-blue-500/50"
                                        >
                                            <option value="work">Work</option>
                                            <option value="personal">Personal</option>
                                            <option value="health">Health</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                                    <Calendar size={10} /> Deadline
                                </label>
                                <input 
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-blue-500/50 scheme-dark"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    {editingTask ? 'Update System' : 'Execute'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksView;
