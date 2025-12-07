import React from 'react';
import FinanceWidget from './widgets/FinanceWidget';
import AgendaWidget from './widgets/AgendaWidget';
import XPWidget from './widgets/XPWidget';
import GeminiInsight from './widgets/GeminiInsight';

const Dashboard: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-light text-white mb-2 tracking-tight">
              Good Morning, <span className="text-zinc-500">Pilot.</span>
            </h1>
            <p className="text-sm text-zinc-500">
              System operational. Tuesday, Oct 24.
            </p>
        </div>
        <div className="hidden md:block">
            <div className="text-right">
                <span className="text-xs text-zinc-600 uppercase tracking-widest border border-zinc-800 px-3 py-1 rounded-full">
                    Focus Mode: On
                </span>
            </div>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
        {/* Row 1 */}
        <GeminiInsight />
        
        {/* Row 2 */}
        <FinanceWidget />
        <AgendaWidget />
        <XPWidget />
        
        {/* Placeholder for future widgets to demonstrate grid capability */}
        <div className="col-span-1 md:col-span-2 h-48 rounded-[32px] border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-xs tracking-widest uppercase">
            Quick Capture (Coming Soon)
        </div>
        <div className="col-span-1 md:col-span-2 h-48 rounded-[32px] border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-xs tracking-widest uppercase">
            Habit Matrix (Coming Soon)
        </div>
      </div>
    </div>
  );
};

export default Dashboard;