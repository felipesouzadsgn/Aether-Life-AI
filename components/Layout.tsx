import React from 'react';
import { LayoutGrid, CheckSquare, Wallet, Brain, Settings, Command } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Hub' },
    { id: 'calendar', icon: CheckSquare, label: 'Tasks' },
    { id: 'finance', icon: Wallet, label: 'Assets' },
    { id: 'brain', icon: Brain, label: 'Brain' },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-white/20">
      
      {/* Desktop Sidebar / Mobile Bottom Nav */}
      <nav className="
        fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0
        md:static md:w-24 md:h-screen md:flex md:flex-col md:items-center md:justify-between md:py-8
        z-50
      ">
        {/* Mobile Container */}
        <div className="
          flex md:flex-col items-center gap-2 p-2 
          bg-zinc-900/80 backdrop-blur-2xl 
          border border-white/10 rounded-full md:rounded-2xl
          shadow-2xl shadow-black
        ">
          
          <div className="hidden md:flex items-center justify-center w-12 h-12 mb-4 text-white">
            <Command size={24} />
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewState)}
              className={`
                relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300
                ${currentView === item.id 
                  ? 'bg-white text-black shadow-lg shadow-white/20' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}
              `}
            >
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
              
              {/* Tooltip (Desktop only usually, mostly for screen readers here) */}
              <span className="sr-only">{item.label}</span>
            </button>
          ))}
          
          <div className="w-px h-8 bg-white/10 mx-2 md:hidden"></div>
          
          {/* Settings separate on desktop */}
          <button className="w-12 h-12 flex items-center justify-center rounded-full text-zinc-500 hover:bg-white/5 md:mt-auto">
             <Settings size={20} />
          </button>
        </div>
      </nav>

      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
         {/* Ambient Background Glows */}
         <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
         <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
         
         <div className="relative z-10 pb-24 md:pb-0">
           {children}
         </div>
      </main>
    </div>
  );
};

export default Layout;