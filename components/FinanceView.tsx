import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Coffee, Car, ShoppingBag, Plus, Mic, X, Loader2, FileSpreadsheet, Mail } from 'lucide-react';
import GlassCard from './GlassCard';
import { Transaction } from '../types';
import { parseFinanceInput } from '../services/geminiService';

const FinanceView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('aether_finance');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Freelance Payout', amount: 2400, type: 'income', date: 'Today', category: 'Work' },
      { id: '2', title: 'Server Costs', amount: 45, type: 'expense', date: 'Yesterday', category: 'Tech' },
    ];
  });

  const [totalBalance, setTotalBalance] = useState(0);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    amount: string;
    type: 'income' | 'expense';
    category: string;
  }>({
    title: '',
    amount: '',
    type: 'expense',
    category: 'General'
  });

  // Voice Recognition Ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('aether_finance', JSON.stringify(transactions));
    const total = transactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 5024); // Starting base balance from dummy data
    setTotalBalance(total);
  }, [transactions]);

  // Add Transaction Logic
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      type: formData.type,
      date: 'Just now',
      category: formData.category
    };
    setTransactions([newTx, ...transactions]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', amount: '', type: 'expense', category: 'General' });
  };

  const addQuickTransaction = (amount: number, title: string, category: string) => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      title,
      amount,
      type: 'expense',
      date: 'Just now',
      category
    };
    setTransactions([newTx, ...transactions]);
  };

  // Voice Logic
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input not supported in this browser environment.");
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'pt-BR'; // Default to Portuguese per user language context or 'en-US'

    recognitionRef.current.onstart = () => setIsListening(true);
    
    recognitionRef.current.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setIsProcessingAI(true);
      
      // Call Gemini
      const result = await parseFinanceInput(transcript);
      
      setFormData({
        title: result.title,
        amount: result.amount.toString(),
        type: result.type,
        category: result.category
      });
      
      setIsProcessingAI(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      setIsProcessingAI(false);
    };

    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const quickActions = [
    { icon: Coffee, label: 'Coffee', amount: 5 },
    { icon: Car, label: 'Transport', amount: 15 },
    { icon: ShoppingBag, label: 'Groceries', amount: 80 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 h-full flex flex-col relative">
      <header className="mb-8 flex justify-between items-start">
        <div>
            <p className="text-sm text-zinc-500 mb-1">Net Ledger</p>
            <div className="flex items-baseline gap-1">
            <span className="text-5xl md:text-7xl font-thin text-white tracking-tighter">
                ${totalBalance.toLocaleString()}
            </span>
            <span className="text-xl text-zinc-600 font-light">.00</span>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="p-3 rounded-full bg-zinc-900 border border-white/10 text-zinc-500 hover:text-green-400 hover:border-green-400/30 transition-all" title="Sync Google Sheets (Coming Soon)">
                <FileSpreadsheet size={18} />
            </button>
            <button className="p-3 rounded-full bg-zinc-900 border border-white/10 text-zinc-500 hover:text-blue-400 hover:border-blue-400/30 transition-all" title="Email Report (Coming Soon)">
                <Mail size={18} />
            </button>
        </div>
      </header>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Add Button */}
        <div className="md:col-span-1">
             <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="
                    w-full h-full min-h-[140px] relative overflow-hidden group
                    bg-gradient-to-br from-zinc-800 to-zinc-900
                    border border-white/10 rounded-[32px]
                    flex flex-col items-center justify-center gap-3
                    hover:scale-[1.02] transition-transform duration-300
                    shadow-xl
                "
             >
                <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                    <Plus size={32} className="text-zinc-400 group-hover:text-white" />
                </div>
                <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium group-hover:text-zinc-300">Add Transaction</span>
             </button>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-4 h-full">
                {quickActions.map((action, idx) => (
                    <GlassCard 
                        key={idx} 
                        onClick={() => addQuickTransaction(action.amount, action.label, 'Life')}
                        className="flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-red-500/5 transition-colors h-full"
                        noPadding
                    >
                        <div className="p-4 flex flex-col items-center">
                            <action.icon size={24} className="text-zinc-400 group-hover:text-red-400 transition-colors mb-2" />
                            <span className="text-xs text-zinc-300">-${action.amount}</span>
                            <span className="text-[10px] text-zinc-600 uppercase tracking-wide">{action.label}</span>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="flex-1">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Recent Activity</h3>
        <div className="space-y-2 pb-24">
            <AnimatePresence mode='popLayout'>
                {transactions.map((tx) => (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                    >
                        <GlassCard noPadding className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                </div>
                                <div>
                                    <h4 className="text-zinc-200 text-sm font-medium">{tx.title}</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase">{tx.category} • {tx.date}</p>
                                </div>
                            </div>
                            <span className={`font-mono text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                {tx.type === 'income' ? '+' : '-'}${tx.amount}
                            </span>
                        </GlassCard>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>

      {/* ADD TRANSACTION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsModalOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md z-10"
                >
                    <GlassCard className="bg-zinc-900 border-zinc-700 shadow-2xl overflow-visible">
                        <button 
                             onClick={() => setIsModalOpen(false)}
                             className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white"
                        >
                             <X size={20} />
                        </button>

                        <h2 className="text-center text-xs uppercase tracking-widest text-zinc-500 mb-6">New Entry</h2>

                        {/* Amount Input (Centerpiece) */}
                        <div className="flex justify-center items-center mb-8 relative">
                            <span className="text-3xl text-zinc-500 font-light mr-1">$</span>
                            <input 
                                type="number" 
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                                autoFocus
                                className="
                                    bg-transparent text-5xl font-thin text-white text-center w-full 
                                    focus:outline-none placeholder:text-zinc-700
                                "
                            />
                        </div>

                        {/* Voice Button */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`
                                    relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isListening ? 'bg-red-500/20 text-red-500 scale-110' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}
                                `}
                            >
                                {isProcessingAI ? (
                                    <Loader2 size={24} className="animate-spin text-blue-400" />
                                ) : (
                                    <Mic size={24} />
                                )}
                                {/* Pulse Effect */}
                                {isListening && (
                                    <span className="absolute inset-0 rounded-full border border-red-500/50 animate-ping"></span>
                                )}
                            </button>
                            {isListening && <p className="absolute mt-16 text-xs text-red-400 animate-pulse">Listening...</p>}
                            {isProcessingAI && <p className="absolute mt-16 text-xs text-blue-400 animate-pulse">AI Processing...</p>}
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Type Toggle */}
                            <div className="bg-black/40 p-1 rounded-xl flex">
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'expense'})}
                                    className={`flex-1 py-2 rounded-lg text-xs uppercase tracking-wider transition-all ${formData.type === 'expense' ? 'bg-red-500/20 text-red-400 shadow-lg' : 'text-zinc-600'}`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type: 'income'})}
                                    className={`flex-1 py-2 rounded-lg text-xs uppercase tracking-wider transition-all ${formData.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-lg' : 'text-zinc-600'}`}
                                >
                                    Income
                                </button>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Description (e.g. Salary, Sushi)"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-white/20"
                                />
                                <div className="relative">
                                    <select 
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-white/20"
                                    >
                                        <option value="General">General</option>
                                        <option value="Food">Food</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Tech">Tech</option>
                                        <option value="Health">Health</option>
                                        <option value="Work">Work</option>
                                        <option value="Entertainment">Entertainment</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                        <TrendingDown size={14} />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-2 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                Confirm Transaction
                            </button>
                        </form>
                    </GlassCard>
                </motion.div>
             </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceView;