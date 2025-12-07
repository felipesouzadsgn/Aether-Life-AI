import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, Wallet } from 'lucide-react';
import GlassCard from '../GlassCard';
import { FinanceMetric } from '../../types';

const data: FinanceMetric[] = [
  { date: 'Mon', balance: 4000, spent: 200, income: 0 },
  { date: 'Tue', balance: 3800, spent: 300, income: 0 },
  { date: 'Wed', balance: 4200, spent: 100, income: 500 },
  { date: 'Thu', balance: 4100, spent: 150, income: 0 },
  { date: 'Fri', balance: 3900, spent: 250, income: 0 },
  { date: 'Sat', balance: 5200, spent: 400, income: 1700 },
  { date: 'Sun', balance: 5000, spent: 300, income: 0 },
];

const FinanceWidget: React.FC = () => {
  return (
    <GlassCard className="col-span-1 md:col-span-2 h-full flex flex-col justify-between group" delay={0.1}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800/50 rounded-full border border-white/5 text-zinc-400">
            <Wallet size={18} />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Total Balance</h3>
            <p className="text-2xl font-light text-white mt-1 font-mono tracking-tighter">
              $5,024<span className="text-zinc-500">.00</span>
            </p>
          </div>
        </div>
        <div className="flex items-center text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
          <ArrowUpRight size={12} className="mr-1" />
          <span>+12.5%</span>
        </div>
      </div>

      <div className="h-32 w-full -mx-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#e4e4e7" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorBalance)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default FinanceWidget;